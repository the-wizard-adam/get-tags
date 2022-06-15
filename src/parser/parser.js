var		href 		= window.location.href,
		origin 		= window.location.origin;

chrome.runtime.onMessage.addListener(

/**
 * Main loop of the parser.
 * The following code is executed everytime the
 * gettab command is invoked for the current tab. 
 */ 

	(request, sender, sendResponse) => {

		if(request.type === "serviceworker_index_ready") {

			// Semaphore to control access to the index page
			indexReady();

		} else {

/**
 * Begin parsing.
 */ 

			return new Promise( (resolve) => { 

				let imgs = [];

				chrome.storage.sync.get([
					'imageThreshold',
					'minimumWidth',
					'minimumHeight',

				], function(opt) {	

					$('img').each( function() {

						let	imgObj = {
							src:		$(this).attr('src'),
							alt:		$(this).attr('alt') || '',
							ext:		"",
							fn:			"",
							size:		"",
							element:	this,
							state:		0
						}, 
						checkWidth = this.width,
						checkHeight = this.height;

						if(!(imgObj.src.includes('https:'))) { imgObj.src = `https:${imgObj.src}`; }

						/**
						 * Threshold for image size. To be made settable by the user.
						 * Meant to filter out icons/other undesirable elements.
						 */
						if((checkWidth >= opt.minimumWidth && checkHeight >= opt.minimumHeight) || !opt.imageThreshold) {

							extensions.forEach( (e) => {

								if(imgObj.src.includes(e)) {

									imgObj.ext = e;

									if(request.message === 'gettab' || request.message === imgObj.src) { imgs.push(imgObj); }			
								}
							});
						}
					});

					/**
					 * If the tab is the image itself
					 */ 
					if(imgs.length === 0) {

						extensions.forEach( (e) => {

							if(href.includes(e)) {

								imgs.push({
									src: href,
									alt: "",
									ext: e,
									fn: "",
									size: "",
									element: null,
									state:	0
								});
							}
						});
					}

					resolve(imgs);
				});

/**
* Begin processing image data.
*/ 					

			}).then(async function(data) {

				let filename = (function() {

					let 	begin = href.lastIndexOf('//')+2,
							i = href.indexOf('/', begin)+1, 
							end = href.length;

					extensions.forEach( (e) => {

						if(href.includes(e)) {

							end = href.indexOf(e);
						}
					});

					return `${origin.substring(origin.indexOf('.')+1, origin.lastIndexOf('.'))}-${fnFormat(href.substring(i, end))}`;

				})();

				for(let i = 0; i < data.length; i++) {

					if(data.length > 1) { i === 0 ? data[i].state = 1 : data[i].state = 2; }

					/**
					 * If image element is a link, try to find a larger source.
					 * May try a recursive version of this some day, but most
					 * images should link to their largest source.
					 */
					if($(data[i].element).parent().is('a')) {

						data[i].src = await new Promise( (resolve) => {

							chrome.storage.sync.get(['getLargeSource'], function(opt) {

								if(opt.getLargeSource) {

									var xhr 		= new XMLHttpRequest(),
										src 		= $(data[i].element).attr('src'),
										parent 		= $(data[i].element).parent(),
										parentHref 	= $(parent).attr('href') || '',
										isImage 	= false;

									xhr.onload = function() {

										if(this.status >= 400) { 

											resolve(src);

										} else { 
							 
											if(isImage) { 

												resolve(this.responseURL);

											} else { 

												/**
												 * Parse the parent element's href. Assume the largest image is
												 * what we are looking for.
												 */ 
												let parser = new DOMParser(),
													dom = parser.parseFromString(this.responseText, "text/html"),
													largestImg = dom.querySelector('img') || undefined,
													largestSize = 0;

												dom.querySelectorAll('img').forEach(function(img) {

													let	imgSize = img.width * img.height;

													if(imgSize >= largestSize) {
														largestImg = img; 
														largestSize = imgSize; 
													}
												});

												if($(largestImg).parent().is('a') && $(largestImg).parent().attr('href')) {

													resolve($(largestImg).parent().attr('href'));

												} else {

													resolve(src);
												}
											}	
										}
									}

									xhr.onreadystatechange = function() {

										if(this.readyState == this.HEADERS_RECEIVED) {
											
											if(xhr.getResponseHeader("Content-Type").includes("image")) {

												isImage = true;
											}
										}
									}

									xhr.open('GET', parentHref, true);

									xhr.send();

								} else { resolve(data[i].src); }
							});
						})
						.then(function (res) {

							return res;
						});						 
					} 

					if(!data[i].src.includes('https:')) { data[i].src = `https:${data[i].src}`; }

					data[i].fn = await new Promise( (resolve) => {

						chrome.storage.sync.get(['useOriginalFilename'], function(opt) {

							if(opt.useOriginalFilename) {

								resolve(fnFormat(data[i].src.substring(data[i].src.lastIndexOf('/')+1, data[i].src.lastIndexOf(data[i].ext))));

							} else {

								if(data.length > 1) { resolve(filename + i); }
								else { resolve(filename); }
							}
						});
					});

					/**
					 * Load a new instance of the image or video 
					 * to get it's dimensions. Will slow down for larger
					 * sources, but is the easiest way to get the size 
					 * during parsing. Perhaps do this in a separate 
					 * synchronous loop?
					 */
					data[i].size = await new Promise( (resolve) => { 

						if(data[i].ext === '.mp4' || data[i].ext === '.webm') {

							var element = document.createElement('video');

							element.onloadedmetadata = () => { 

								resolve(`${element.videoWidth} x ${element.videoHeight}`);

							}

						} else {

							var element = new Image();

							element.onload = () => {

								resolve(`${element.width} x ${element.height}`);
							}
						}

						element.src = data[i].src;
					});

/**
* Send image data to the index. Await ready signal
* from the index before continuing.
*/ 

					chrome.runtime.sendMessage({

						"type" : "open_update_page",
						"url": "index.html"

					})
					.then( () => {

						chrome.storage.local.set({
							image: data[i].src, 
							alttext: data[i].alt,
							filename: data[i].fn,
							extension: data[i].ext,
							size: data[i].size,
							post: href,
							state: data[i].state				
						});
					});

					await new Promise( (resolve) => { 

						indexReady = () => { resolve(true); }
					});
				}

/**
* Once all images are sent, allow a new tab to be parsed.
*/ 

				chrome.runtime.sendMessage({"type" : "reset_tabId"});					
			});
		}

		sendResponse({status: 'ok'});
	}
);
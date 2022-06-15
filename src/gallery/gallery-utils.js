import downloadButtonHandler from '../index/index.js';

export function idNum(id) { return id.substring(id.lastIndexOf('-')+1, id.length); }

export function getExt(src) {

	let 	i = src.lastIndexOf('.'),
			ext = "";

	while(i !== src.length) {

		if(src[i] == '?') { return ext; }

		ext += src[i]; 

		i++;
	} 

	return ext;
}

export function getItemData(id) {

	let 	aux = [],
			allData = getAllData();

	allData.forEach( (index) => {

		if(index.num == id) {

			aux = index;
		}
	});

	return aux;		
}

async function galleryShowImage(element) {

	let promise = new Promise( (resolve, reject) => { 
		$(element).resizeImg(true);
		resolve(1);
	});

	await promise;

	if($(element).addClass('loaded') && $(element).addClass('current')) { 

		$(element).css('display', 'initial'); 

		if($(element).is('video')) { $(element).trigger('play'); }
	}

	$(element).removeClass('loading');

	$('.gallery-media-progress').css('display', 'none');
}

function galleryLoad(url, element) {

    let     xmlHTTP = new XMLHttpRequest(),
            imageCompletedPercentage,
            progress = $('.gallery-media-progress');

    xmlHTTP.open('GET', url,true);
    xmlHTTP.responseType = 'arraybuffer';

    xmlHTTP.onprogress = (e) => {

        imageCompletedPercentage = parseInt((e.loaded / e.total) * 100);

        if($(element).hasClass('current')) { progress.css('width', `${imageCompletedPercentage}%`); }
    };

    xmlHTTP.onloadstart = () => {

        imageCompletedPercentage = 0;

        if($(element).hasClass('loaded')) { $(element).removeClass('loaded'); }

        $(element).addClass('loading');

        progress.css('display', 'block');

        progress.css('width', `${imageCompletedPercentage}%`);
    };

    xmlHTTP.onloadend = () => { 

    	if($(element).is('video')) {

			setTimeout( () => {  galleryShowImage(element); }, 100);  

    	} else if($(element).width() == 0) {
			
			setTimeout( () => { galleryShowImage(element); }, 100);

		} else {  galleryShowImage(element); }
    };

    xmlHTTP.send();        
}

function galleryUpdate(data) {

	let 	count = parseInt(idNum($(`#gallery-media-${data.num}`).parent().attr('id'))),
			cardTotal = parseInt(window.localStorage.getItem('cardTotal')),
			element = `#gallery-media-${data.num}`;

	$('.gt-counter').html(`${count+1} / ${cardTotal}`);

	$('.gt-info-filename').html(`${data.filename}${data.extension}`);

	$('#gt-info-post').on('click', () => { chrome.runtime.sendMessage({"type" : "open_post", "post" : data.post}); });

	$('#gt-icon-open').on('click', () => { chrome.runtime.sendMessage({"type" : "open_image", "imgsrc" : data.image}); });

	$('#gt-icon-download').on('click', () => { 

		downloadButtonHandler(true, data.num); 

		$('.gallery-container').remove();

		jQuery(window).unbind('keyup');

		jQuery(window).unbind('keydown');		
	});

	$('#gallery-post-link').attr('href', `${data.post}`);

	$(element).addClass('current');

	$(element).removeClass('hidden');

	if($(element).hasClass('loaded')) {

		$(element).css('display', 'initial');

		$('.gallery-media-progress').css('display', 'none');

	} else if($(element).hasClass('loading')) {

		$('.gallery-media-progress').css('display', 'block');

	} else {

		galleryLoad(data.image, element); 
	}
}

function galleryNavigate(right) {

	let 	thisId = $('.current').attr('id'),
		 	currentData = getItemData(idNum(thisId)),
		 	newData = [];

	if(right) {

		if(currentData.nextnum != null) {

			newData = getItemData(currentData.nextnum);

		} else { return; }

	} else {

		if(currentData.prevnum != null) {

			newData = getItemData(currentData.prevnum);

		} else { return; }

	}

	$(`#gallery-media-${currentData.num}`).removeClass('current');

	$(`#gallery-media-${currentData.num}`).addClass('hidden');

	$('#gt-info-post').unbind('click');

	$('#gt-icon-open').unbind('click');

	$('#gt-icon-download').unbind('click');

	if(currentData.isVideo) { $(`#gallery-media-${currentData.num}`).trigger('pause'); }
	
	galleryUpdate(newData);
}

export { galleryNavigate, galleryLoad };
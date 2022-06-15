import { galleryNavigate, galleryLoad } from './gallery-utils.js';
import galleryPanelOpenHandler from './gallery-panel.js';
import downloadButtonHandler from '../index/index.js';

function galleryOpenHandler(db) {

	var 	toolbarTimer = 0,
			cardTotal = parseInt(window.localStorage.getItem('cardTotal')),
			allData = getAllData();

	$('body').css('overflow', 'hidden');				

	$(document.body).append(`
		<div class="gallery-container">
			<div class="gallery-toolbar" style="display: none;">
				<div class="gt-counter"></div>
				<div class="gt-info">
					<h3 class="gt-info-filename"></h3>
					<p><a id="gt-info-post" href="#" tabindex="-1">Original post</a></p>
				</div>
				<span id="gt-icon-close" class="material-symbols-outlined gt-icon">close</span>
				<span id="gt-icon-download" class="material-symbols-outlined gt-icon">file_download</span>
				<span id="gt-icon-open" class="material-symbols-outlined gt-icon">open_in_new</span>			
			</div>
			<button class="gp-open" tabindex="-1">&#9776;</button>
			<div class="gallery-panel"></div>
			<div class="gallery-media-progress"></div>
		</div>`);

	allData.forEach( (index, i) => {

		if(allData.length === 1) {

			index.nextnum = null;

			index.prevnum = null;

		} else {

			if(i === 0) {

				index.nextnum = allData[i+1].num;

				index.prevnum = null;

			} else if(i === (allData.length-1)) {

				index.nextnum = null;

				index.prevnum = allData[i-1].num;

			} else {	

				index.nextnum = allData[i+1].num;

				index.prevnum = allData[i-1].num;
			}		
		}

		if(index.isVideo) {

			$('.gallery-container').prepend(`
				<div id="gallery-item-${i}">
					<video class="gallery-media" id="gallery-media-${index.num}" src="${index.image}" loop controls tabindex="-1" style="display: none;">
				</div>`);

		} else {

			$('.gallery-container').prepend(`
				<div id="gallery-item-${i}">
					<img class="gallery-media" id="gallery-media-${index.num}" src="${index.image}" style="display: none;">
				</div>`);
		}

		if(index.num === db.num) {

			$('.gt-counter').html(`${i+1} / ${cardTotal}`);

			$('.gt-info-filename').html(`${index.filename}${index.extension}`);

			$('#gt-info-post').on('click', () => { chrome.runtime.sendMessage({"type" : "open_post", "post" : index.post}); });

			$('#gt-icon-open').on('click', () => { chrome.runtime.sendMessage({"type" : "open_image", "imgsrc" : index.image}); });

			$('#gt-icon-download').on('click', () => { 
				
				downloadButtonHandler(true, index.num);

				$('.gallery-container').remove();

				jQuery(window).unbind('keyup');

				jQuery(window).unbind('keydown');
			});

			galleryLoad(index.image, `#gallery-media-${index.num}`);

			$(`#gallery-media-${db.num}`).addClass('current');

		} else {

			$(`#gallery-media-${index.num}`).addClass('hidden');
		}
	});

	window.localStorage.setItem('allData', JSON.stringify(allData));

	jQuery(window).keydown( (e) => {

		e.preventDefault();
	});

	jQuery(window).keyup( (e)=> {

		if($(document).ready()) {

			e.preventDefault();

			let 	panelOpen = $('.gallery-panel').hasClass('panel-open'); 

			if(e.which == 27) {			/*console.log('jQuery(window).keyup == ESC')*/;

				if(panelOpen) {			

					$('.gallery-panel').removeClass('panel-open');

					$('.gallery-panel').children().each( function() {
						$(this).fadeOut(100);
						$(this).remove();
					});

				} else {

					$('.gallery-container').remove();

					jQuery(window).unbind('keyup');

					jQuery(window).unbind('keydown');

					$('body').css('overflow', 'auto');			
				}

			} else if(e.which == 39 && !panelOpen) {	/*console.log('jQuery(window).keyup == ARROW RIGHT');*/

				galleryNavigate(true);

			} else if(e.which == 37 && !panelOpen) { /*console.log('jQuery(window).keyup == ARROW LEFT');*/

				galleryNavigate(false);

			} else if(e.which == 9 && !panelOpen) {
			
				jQuery(window).unbind('keydown');

				galleryPanelOpenHandler();
			}
		}
	});

	$('.gallery-container').on('mousemove', ()=> {

		clearTimeout(toolbarTimer);

		if( !($('.gallery-toolbar').hasClass('hidden')) ) {

			$('.gallery-toolbar').fadeIn(100);

			toolbarTimer = setTimeout( () => {

				$('.gallery-toolbar').fadeOut(100);

			}, 2000);
		}
	});

	$('#gt-info-post').on('click', () => {

	});

	$('#gt-icon-close').on('click', () => {

		$('.gallery-container').remove();

		jQuery(window).unbind('keyup');

		jQuery(window).unbind('keydown');

		$('body').css('overflow', 'auto');	
	});

	$('.gp-open').on('click', () => {

		galleryPanelOpenHandler();
	});
}

export default galleryOpenHandler;

import { getItemData, idNum, getExt } from './gallery-utils.js';

function checkImage(url) { 

	return new Promise( (resolve, reject) => {		
		let img = new Image();
		img.onload = () => { resolve(`${img.width} x ${img.height}`); }
		img.onerror = () => { reject(); }
		img.src = url;
	});
}

function galleryPanelSaveHandler(data) {

	let 	allData 	= getAllData(),
			newFilename = $('#gp-filename-num').val(),
			newImage 	= $('#gp-source').val(),
			textarea 	= $('.gp-tags > textarea').val().replace(/\s/g, ""),
			alt 		= textarea.split(',');

	$(`#filename-el-${data.num}`).html(`${newFilename}${data.extension}`);
	
	$('.gt-info-filename').html(`${newFilename}${data.extension}`);

	for(let i = 0; i < allData.length; i++) {

		if(allData[i].num === data.num) {

			allData[i].filename = newFilename;
			allData[i].alttext = alt;
			if(allData[i].image != newImage) {

				checkImage(newImage)
				.then((size) => {
					allData[i].image = newImage;
					allData[i].extension = getExt(newImage);
					allData[i].size = size;
					location.reload();
					window.localStorage.setItem('allData', JSON.stringify(allData));
					return true;
				})
				.catch(() => {
					$('#gp-source').css('background-color', '#c44');
					return false;	
				});
			}
		}
	};		
}

function galleryPanelOpenHandler() {

	let 	panel = 'gallery-panel',
			closeButton = 'gp-close',
			thisId = $('.current').attr('id'),
		 	currentData = getItemData(idNum(thisId)),
		 	alt = "", options ="";

	$(`.${panel}`).addClass('panel-open');

	$(`.${panel}`).append(`
		<button class="gp-close" style="display: none;" tabindex="-1">&times;</button>
		<div class="gp-filename" style="display: none;">
			<div style="width: 70%; display: inline-block;">
				<label>Filename:</label>
				<input id="gp-filename-num" style="width: 80%;" value=${currentData.filename}>						
			</div>
			<div style="width: 20%; display: inline-block;">
				<label>Extension:</label>
				<label style="color: #eee; font-style: normal">${currentData.extension}</label>
			</div>
		</div>
		<div class="gp-source" style="display: none;">
			<label>Image source:</label>
			<input type="text" id="gp-source" style="width: 90%;" value=${currentData.image}>
		</div>
		<div class="gp-tags" style="display: none;">
			<label>Alt text:</label>
			<textarea spellcheck="false">${currentData.alttext}</textarea>
		</div>
		<div class="gp-save" style="display: none;">
			<button>Save</button>
		</div>`);

	$(`.${panel}`).children().each( function() { $(this).fadeIn(1000); });

	$(`.${closeButton}`).on('click', () => {		

		$(`.${panel}`).removeClass('panel-open');
		$(`.${panel}`).children().each( function() {
			$(this).fadeOut(100);
			$(this).remove();
		});
	});

	$('.gp-save > button').on('click', () => {

		if(galleryPanelSaveHandler(currentData)) {

			$(`.${panel}`).removeClass('panel-open');
			$(`.${panel}`).html('');			
		}
	});
}

export default galleryPanelOpenHandler;
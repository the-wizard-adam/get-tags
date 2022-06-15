import { getItemData, idNum, getExt } from './gallery-utils.js';

function checkImage(url) {

	let 	img = new Image();

	img.onload = () => { if(this.width > 0) { return true; } }
	img.onerror = () => { return false; }

	img.src = url;
}

function galleryPanelSaveHandler(data) {

	let 	allData 	= getAllData(),
			newFilename = $('#gp-filename-num').val(),
			newImage 	= $('#gp-source').val(),
			textarea 	= $('.gp-tags > textarea').val().replace(/\s/g, ""),
			tags 		= textarea.split(',');

	$(`#filename-el-${data.num}`).html(`${newFilename}${data.extension}`);
	
	$('.gt-info-filename').html(`${newFilename}${data.extension}`);			

	allData.forEach( (index) => {

		if(index.num === data.num) {

			index.filename = newFilename;

			index.alttext = alt;

			if(index.image != newImage) {

				if(checkImage(newImage)) {

					index.image = newImage;

					index.extension = getExt(newImage);

					location.reload();

				} else {

					$('#gp-source').css('background-color', '#c44');
				}
			}
		}
	});

	window.localStorage.setItem('allData', JSON.stringify(allData));
}

function galleryPanelOpenHandler() {

	let 	panel = 'gallery-panel',
			closeButton = 'gp-close',
			thisId = $('.current').attr('id'),
		 	currentData = getItemData(idNum(thisId)),
		 	alt = "", options ="";
	
	// for(let i = 0; i < currentData.imgtags.length; i++) {
	// 	tags += currentData.imgtags[i];
	// 	if(i != (currentData.imgtags.length) - 1)
	// 		tags += ',';
	// } 	

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

		galleryPanelSaveHandler(currentData);

		$(`.${panel}`).removeClass('panel-open');

		$(`.${panel}`).html('');
	});
}

export default galleryPanelOpenHandler;
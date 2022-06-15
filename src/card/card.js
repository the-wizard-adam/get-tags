import overlayRemoveHandler from './card-utils.js';
import galleryOpenHandler from '../gallery/gallery.js';

function generateCard(db) {

	let 	state_array = ["", "P", "C"];

	$('#content').append(`
		<span class="cardcontainer" id="cardcontainer-${db.num}">
			<span class="card" id="hover" style="background-color: ${db.cardcolor};">
				<div class="media-container" id="media-container-${db.num}">
					<div class="overlay"><span class="overlay-button" id="overlay-remove-${db.num}"></span></div>
					<div class="media-progress" id="media-progress-${db.num}"></div>	
				</div>
				<div class="container">
					<p id="filename-el-${db.num}">${db.filename}${db.extension}</p>
				</div>
				<div class="container">
					<p id="info_p-${db.num}">
						<span id="card-state" class="card-state-${db.state}">${state_array[db.state]}</span>
					</p>
				</div>
				<div class="select-layer"></div>
			</span>
		</span>`);

	if(db.isVideo) {

		$(`#media-container-${db.num}`).prepend(`
			<video class="card-media" id="media-element-${db.num}" style="display: none;">`);	

		$(`#media-element-${db.num}`).on("loadeddata", function() {
			$(this).resizeImg(false);
			$(this).fadeIn(500);
			// $('.container').css('width', $(this).width());
			$(`#filename-el-${db.num}`).css('width', $(this).width());
			updateExportSize(db.num, true);		
		});

	} else {

		$(`#media-container-${db.num}`).prepend(`
			<img class="card-media" id="media-element-${db.num}" style="display: none;">`);

		$(`#media-element-${db.num}`).on("load", function() {
			$(this).resizeImg(false);
			$(this).fadeIn(500);
			// $('.container').css('width', $(this).width());
			$(`#filename-el-${db.num}`).css('width', $(this).width());
			updateExportSize(db.num, true);
		});
	}

	$(`#overlay-remove-${db.num}`).click( () => { overlayRemoveHandler(db.num); });

	$(`#media-element-${db.num}`).click( () => { galleryOpenHandler(db); });
	
	$(document).ready(function() {

		imageLoad(db.image, db.num, `#media-element-${db.num}`, `#media-progress-${db.num}`);
	});
}

export default generateCard;
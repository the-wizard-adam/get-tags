import optionsDefaults from '/src/defaults.js';

$(document).on('DOMContentLoaded', () => {
	chrome.storage.sync.get([
		'imageThreshold',
		'minimumWidth',
		'minimumHeight',
		'useOriginalFilename',
		'getLargeSource',
		'exportAltText',
		'disableDownloadShelf'
	], (options) => {
		$('#options-filter').attr('checked', options.imageThreshold);
		$('#filter-width').attr('value', options.minimumWidth);
		$('#filter-height').attr('value', options.minimumHeight);
		$('#options-filename').attr('checked', options.useOriginalFilename);
		$('#options-largesource').attr('checked', options.getLargeSource);
		$('#options-alttext').attr('checked', options.exportAltText);
		$('#options-downloadshelf').attr('checked', options.disableDownloadShelf);
	});
});

$(document).ready( () => {

	// Save changes
	$('#options-save').on('click', () => {
		chrome.storage.sync.set({
			'imageThreshold': $('#options-filter').is(":checked"),
			'minimumWidth': $('#filter-width').val(),
			'minimumHeight': $('#filter-height').val(),
			'useOriginalFilename': $('#options-filename').is(":checked"),
			'getLargeSource': $('#options-largesource').is(":checked"),
			'exportAltText': $('#options-alttext').is(":checked"),
			'disableDownloadShelf': $('#options-downloadshelf').is(":checked")
		});
		$('#save-status').css('display', 'initial');
		setTimeout( () => { $('#save-status').fadeOut(500); }, 500);
	});

	// Reset options to default
	$('#options-reset').on('click', () => {
		$('#options-save').css('display', 'none'); 
		$('#options-reset').css('display', 'none');
		$('#reset-confirm').css('display', 'initial');
	});

	// Confirm reset
	$('#confirm-yes').on('click', () => {
		chrome.storage.sync.set(optionsDefaults, function() {
			location.reload(); 
		});	
	});

	// Cancel reset
	$('#confirm-cancel').on('click', () => {
		$('#options-save').css('display', 'initial'); 
		$('#options-reset').css('display', 'initial');
		$('#reset-confirm').css('display', 'none');
	});

	// Disable filter options when unchecked
	$('#options-filter').change( function() {
		if(!this.checked) {
			$('.filter-disableable').addClass('disabled');
			$('.filter-disableable > input').attr('disabled', true);		
		} else { 
			$('.filter-disableable').removeClass('disabled');
			$('.filter-disableable > input').attr('disabled', false);
		}
	});
});
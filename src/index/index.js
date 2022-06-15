import { updatePage, loadPage } from './updatePage.js';

var		currentDownloadUrl;

function clearPage() {

	$(".cardcontainer").each(function() {
		$(this).remove();
	});

	$(".page-info").html('');

	$(".page-info").addClass('empty');

	$('#toolbar-download').removeClass('disabled');

	$('.download-progress').css('width', '0%');

	$('.download-progress').css('background-color', '#fff');

	$('.download-info').html('');

	document.title = 'Get Tags';

	chrome.runtime.sendMessage({"type" : "is_zipping", "state" : false});

	chrome.storage.local.remove([	'image', 'filename', 'extension', 'size',
									'post', 'state', 'alttext'], function() {
		var error = chrome.runtime.lastError;
		if(error) {
			console.error(error);
		}
	});

	let 	keysToRemove = ['allData', 'newcardcount'],
			keysToReset = ['num', 'groupnum', 'exportsize', 'cardTotal'];

	for (let key of keysToRemove)
		window.localStorage.removeItem(key);

	for(let key of keysToReset)
		setLocalData(key, 0);

}

window.addEventListener('load', (event) => {

	chrome.runtime.sendMessage({"type" : "is_zipping", "state" : false});

	$(window).on('contextmenu', e => { e.preventDefault(); });

	$('#index-dialog').dialog({	
		autoOpen: 		false,
		resizable: 		false,
		draggable: 		false,
		modal:			true,
		dialogClass: 	"no-close"
	});

	let		num = getNumData('num'),
			groupnum = getNumData('groupnum'),
			cardTotal = getNumData('cardTotal');

	if(isNaN(num)) { num = 0; }
	if(isNaN(groupnum)) { groupnum = 0; }
	if(isNaN(cardTotal)) { cardTotal = 0; }

	setLocalData('num', num);
	setLocalData('groupnum', groupnum);
	setLocalData('cardTotal', cardTotal);
	setLocalData('exportsize', 0);

	loadPage();

	updatePage();

	let 	tb_clear = $('#toolbar-clear'),
			tb_download = $('#toolbar-download');

	tb_clear.on('click', () => {

		if(!tb_clear.hasClass('disabled')) {

			$('#index-dialog').dialog('open');

			$('#index-dialog').html('All items will be erased');

			$('#index-dialog').dialog({
				title:	"Clear Page?",
				buttons: [
					{
						text: "Clear",
						class: "index-dialog-clear",
						click: function() {
							$(this).dialog('close');
							clearPage();
						}
					},
					{
						text: "Cancel",
						click: function() {
							$(this).dialog('close');
						}
					}
				]
			});
		}
	});

	tb_download.on('click', () => {
		
		if(!tb_download.hasClass('disabled')) { downloadButtonHandler(false, undefined); }
	});

	tb_clear.onfocus = () => { tb_clear.blur(); }

	tb_download.onfocus = () => { tb_download.blur(); }
});

chrome.downloads.onCreated.addListener( (downloadItem) => { currentDownloadUrl = downloadItem.url; });

chrome.downloads.onChanged.addListener( (delta) => {

	if(delta.state && delta.state.current == 'complete' && currentDownloadUrl.includes(window.location.origin)){

		$('#toolbar-clear').removeClass('disabled');

		$('.download-progress').css('background-color', 'green');

		$('.download-info').html('Done.');
	}

});

chrome.storage.onChanged.addListener(updatePage); 

chrome.runtime.onMessage.addListener(

	function(request, sender, sendResponse) {

		if(request.message === "resettitle") {

			setTimeout( () => { updateTitle(true, false); }, 100);

			window.localStorage.setItem('newcardcount', JSON.stringify(0));

			sendResponse({status: 'ok'});
		}
	}
);


export default downloadButtonHandler;

import optionsDefaults from '/src/defaults.js';

var 	commandFired = false,
		isZipping = false,
		currentTabId = null;

chrome.runtime.onInstalled.addListener( () => {
	chrome.contextMenus.create({ title: 'Get Tags', id: 'getimage', contexts: ['image', 'video'] });
	chrome.storage.sync.set(optionsDefaults);
});

chrome.action.onClicked.addListener(tab =>  { openPage("index.html") });

chrome.commands.onCommand.addListener( function(command) {
	if(!commandFired) {
		gettab(command);
		commandFired = true;
		setTimeout(() => { commandFired = false; }, 1000);	
	}
});

function contextClick(info, tab) {
	const { menuItemId } = info;
	if(menuItemId === 'getimage') { gettab(info.srcUrl); }
}

chrome.contextMenus.onClicked.addListener(contextClick);

function gettab(command) {
	if(!isZipping && currentTabId === null) {
		chrome.tabs.query({active: true, currentWindow: true}, (tabs) => { 
			var activeTab = tabs[0];
			currentTabId = activeTab.id;
			chrome.tabs.sendMessage(currentTabId, {"message": command});	
		});
	}
}

chrome.runtime.onMessage.addListener(
	(message, sender, sendResponse) => {
		if(message.type === "open_update_page") {	
			openPage(message.url);
		} else if(message.type === "download_image") {
			chrome.downloads.download({
				url:message.imgsrc,
				filename:message.imgfname,
				saveAs: true
			});
		} else if(message.type === "open_image") {
			chrome.tabs.create({"url": message.imgsrc, "active": true});
		} else if(message.type === "open_post") {
			chrome.tabs.create({"url": message.post, "active": false});
		} else if(message.type === "is_zipping") {
			isZipping = message.state; 
		} else if(message.type === "updatePage_index_ready") {
			chrome.tabs.sendMessage(currentTabId, {"type" : "serviceworker_index_ready"});
		} else if(message.type === "reset_tabId") {
			currentTabId = null;
		}
		sendResponse({status: 'ok'});
	}
);

async function openPage(url) {
	chrome.tabs.query({currentWindow: true}, (tabs) => {
		const tab = tabs.find(tab => tab.url.includes(url));
		if(tab) {
			chrome.tabs.update(tab.id, {active: false});
		} else {
			chrome.tabs.create({url, active: false, index: 0});
		}	
	});
}

chrome.tabs.onActivated.addListener( (info) => {
	var tab = chrome.tabs.get(info.tabId, function(tab) {
		if(tab.url.includes("index.html")) {
			setTimeout(() => { chrome.tabs.sendMessage(info.tabId, {"message": "resettitle"}); }, 100);
		}
	});
});

chrome.downloads.onCreated.addListener( (item) => {
	chrome.storage.sync.get(['disableDownloadShelf'], function(opt) {
		if(opt.disableDownloadShelf && item.url.includes(chrome.runtime.getURL(''))) {
			chrome.downloads.setShelfEnabled(false);
		} else { chrome.downloads.setShelfEnabled(true); }
	});
});

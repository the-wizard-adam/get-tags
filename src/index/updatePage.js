import generateCard from '../card/card.js';

function updatePage() {

	chrome.storage.local.get([	'image', 'filename', 'extension', 'size',
								'post', 'state', 'alttext'], function(data) {

		if(data.image === undefined) { return; }

		let 	num = getNumData('num') + 1,
				cardTotal = getNumData('cardTotal') + 1,
				newcardcount = getNumData('newcardcount'),
				currentcolor = getNumData('currentcolor');

		// update page with new data
		var 	db = {
			image: 				data.image,
			filename: 			data.filename,
			extension:  		data.extension,
			size: 				data.size,
			post: 				data.post,
			state: 				data.state,
			alttext: 			data.alttext,
			isVideo: 			false,
			cardcolor: 			"",
			num: 				num,
			prevnum:   			null,
			nextnum: 			null,
			groupnum:   		0,
			filesize: 			0, 
		};

		const	cardcolors = [
			'#996666', '#666699', '#669966',
			'#996699', '#999966', '#668099'
		];

		if(isNaN(newcardcount)) { newcardcount = 1; } else { newcardcount++; }
		if(isNaN(currentcolor)) { currentcolor = 0; }

		if(	db.extension.includes('.mp4') || db.extension.includes('.webm')) { db.isVideo = true; }
		db.cardcolor = "#2F2F2F";

		if(Number(db.state) == 1) {
			currentcolor++;
			if(currentcolor === 6) { currentcolor = 0; }
			db.cardcolor = cardcolors[currentcolor];
			db.groupnum = getNumData('groupnum');
		}
		else if(Number(db.state) == 2) {
			db.cardcolor = cardcolors[currentcolor];
			db.groupnum = getNumData('groupnum');
		}

		generateCard(db);

		//push new data to arrays
		pushToDB(db);

		setLocalData('num', num);
		setLocalData('cardTotal', cardTotal);
		setLocalData('newcardcount', newcardcount);
		setLocalData('currentcolor', currentcolor);
		setLocalData('groupnum', db.groupnum);

		chrome.storage.local.remove([	'image', 'filename', 'extension', 'size',
										'post', 'state', 'alttext'], function() {

			var error = chrome.runtime.lastError;
			if(error) {
				console.error(error);
			}

			chrome.runtime.sendMessage({"type" : "updatePage_index_ready"});
		});		
	});
}

function pushToDB(db)  {

	let allData = getAllData();

	if(allData === null) { allData = []; }

	allData.push(db);

	setLocalData('allData', allData);
}

function loadPage() {

	let allData = getAllData();

	if(allData === null) { return; }

	allData.forEach(function(row, i){

		if(row === null)
			return;

		generateCard(row);
	});
}

export {updatePage, loadPage};
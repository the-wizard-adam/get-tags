const extensions = [
	".jpg",
	".JPG",
	".jpeg",
	".JPEG",
	".png",
	".PNG",
	".gif",
	".GIF",
	".mp4",
	".MP4",
	".webm",
	".WEBM"
];

function fnFormat(fn) { return fn.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''); }

function nextChar(char) {
	if(char === 'f')
		return 'a';
	else if(char === '9')
		return '0';
	return String.fromCharCode(char.charCodeAt(0) + 1);
}

function tagFormat(tag) {
	tag = tag.split(' ').join('_');
	tag = tag.split('-').join('_');
	tag = tag.split('/').join('_');
	tag = tag.split(';').join('');
	tag = tag.split("&amp").join('&');
	tag = tag.split("&lt").join('<');
	tag = tag.split("&gt").join('>');
	tag = tag.split("&nbsp").join('_');
	return tag;
}

function incrementFn(fn) {
	// fn = artist-[0][1][2][3][4].ext
	var index = 4;
	if(fn[4] === '9') {									
		index--; // = 3
		if(fn[3] === '9' || fn[3] === 'f') {				
			index--; // =  2
			if(fn[2] === '9' || fn[2] === 'f') {			
				index--; // =  1
				if(fn[1] === '9' || fn[1] === 'f') {		
					index--; // = 0			
				}					
			}		
		}
	}
	for(var i = 4; i > index; i--) {
		fn = fn.replaceAt(i-1,nextChar(fn[i-1]));
	}
	return fn.replaceAt(4,nextChar(fn[4]));
}

function stateToInt(state) {
	if(state === "getparent")
		return 1;
	else if(state === "getchild")
		return 2;
	else if(state === "openimage")
		return 3;
	else
		return 0;
}
function getAllData() { return JSON.parse(window.localStorage.getItem('allData')); }
function getNumData(key) { return parseInt(window.localStorage.getItem(key)); }
function setLocalData(key, data) { window.localStorage.setItem(key, JSON.stringify(data)); }

$.fn.resizeImg = function (gallery) {
    var maxWidth = 1700,
        maxHeight = 300,
        ratio = 0,
        width = $(this).width(),
        height = $(this).height();

    if(!gallery) {

		if(height >= (2 * width)) { maxHeight = 600; }

		if(height >= (3 * width)) { maxHeight = 900; } 

    } else { maxWidth = window.innerWidth; maxHeight = window.innerHeight; }

    if(width > maxWidth){
        ratio = maxWidth / width;  
        $(this).css("width", maxWidth); 
        $(this).css("height", height * ratio);
        height = height * ratio;
        width = width * ratio;   
    }

    if(height > maxHeight){
        ratio = maxHeight / height;
        $(this).css("height", maxHeight);
        $(this).css("width", width * ratio);
        width = width * ratio;
        height = height * ratio;
    }
}

// https://stackoverflow.com/questions/14218607/javascript-loading-progress-of-an-image/22593907#22593907
function imageLoad(url, num, element, progress) {

    var     xmlHTTP = new XMLHttpRequest(),
            imageCompletedPercentage, title = document.title;

    xmlHTTP.open('GET', url,true);
    xmlHTTP.responseType = 'arraybuffer';

    xmlHTTP.onload = (e) => {

        let     allData = getAllData();

        allData.forEach( (index) => {

            if(index.num === num) {

                index.filesize = e.total;

                let info_size = e.total < 1000000 ?     (e.total/1000).toFixed(2) + ' KB'  :
                                                        (e.total/1000000).toFixed(2) + ' MB';

                $(`#info_p-${num}`).prepend(`${index.size} - ${info_size}`);
            }
        });

        setLocalData('allData', allData);
    };

    xmlHTTP.onprogress = (e) => {
        imageCompletedPercentage = parseInt((e.loaded / e.total) * 100);
        $(progress).css('width', `${imageCompletedPercentage}%`);
        updateTitle(false, true);
    };

    xmlHTTP.onloadstart = () => {
        imageCompletedPercentage = 0;
        $(progress).css('width', `${imageCompletedPercentage}%`);
    };

    xmlHTTP.onloadend = () => {
        $(element).attr('src', url);
        $(progress).css('display', 'none');
    };

    xmlHTTP.send();
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function urlToPromise(url) {

    return new Promise(function(resolve, reject) {

        JSZipUtils.getBinaryContent(url, function (err, data) {

            if(err) { reject(err); } else { resolve(data); }
        });
    });
}

function downloadButtonHandler(gallery, num) {

    let     allData = getAllData(),
            date = new Date(),
            exportTime = getExportTime(date),
            zip = new JSZip(),
            csv = "Filename,Tags\n",
            progress = $('.download-progress'),
            info = $('.download-info');

    if( allData === null ) { chrome.runtime.sendMessage({"type" : "is_zipping", "state" : false}); return; }

    chrome.runtime.sendMessage({"type" : "is_zipping", "state" : true});

    $('#toolbar-download').addClass('disabled');

    $('#toolbar-clear').addClass('disabled');

    info.html(`Zipping ...`);

    allData.forEach( (index) => {

        if(!gallery || index.num === num) {

            let     filename = index.filename + index.extension,
                    url = index.image, row = '';

            if((!index.isVideo) && (index.extension != '.gif')) {

                if(index.alttext != '') {

                    row = `${filename},${index.alttext}`;

                    csv += (row + '\n');
                }

            } else {

                if(index.alttext != '') {

                    row = index.alttext;

                    zip.file(`${index.filename}.txt`, row);
                }

            }

            zip.file(filename, urlToPromise(url), {binary: true});
        }
    });

    chrome.storage.sync.get(['exportAltText'], function(opt) {

        if(opt.exportAltText && (csv != 'Filename,Tags\n')) {

            zip.file("exported_" + exportTime + ".csv", csv);
        }

        zip.generateAsync({type:"blob"}, function updateCallback(metadata) {

            progress.css('width', `${metadata.percent}%`);

            if(metadata.currentFile) 
                info.html(`${metadata.currentFile} zipped ...`);

            if(metadata.percent === 100)
                info.html(`Downloading...`);

        }).then(function callback(blob) {

            saveAs(blob, "exported_" + exportTime);
        }); 
    });
}

function getExportTime(date) {

    var ye = date.getFullYear(),
        mo = date.getMonth() + 1,
        da = date.getDate(),
        ho = date.getHours(),
        mi = date.getMinutes(),
        se = date.getSeconds();

    var exportTime = ye.toString();
        exportTime += (mo < 10) ? '0' + mo.toString() : mo.toString();
        exportTime += (da < 10) ? '0' + da.toString() : da.toString();
        exportTime += '_';
        exportTime += (ho < 10) ? '0' + ho.toString() : ho.toString();
        exportTime += (mi < 10) ? '0' + mi.toString() : mi.toString();
        exportTime += (se < 10) ? '0' + se.toString() : se.toString();

    return exportTime;      
}

function updateExportSize(num, add) {

    let     allData = getAllData(),
            exportsize = parseInt(window.localStorage.getItem('exportsize')),
            page_info = $('#page-info');

    allData.forEach(function(index) {

        if(index.num === num)

            add ? exportsize += index.filesize : exportsize -= index.filesize;
    });

    if(exportsize > 0) {

        page_info.removeClass('empty');

        if(exportsize < 1000)
            page_info.html(`${exportsize.toFixed(2)} B`);
        else if(exportsize < 1000000)
            page_info.html(`${(exportsize / 1000).toFixed(2)} KB`);
        else
            page_info.html(`${(exportsize / 1000000).toFixed(2)} MB`);

    } else { 

        page_info.html('');
        page_info.addClass('empty'); 
    }

    window.localStorage.setItem('exportsize', JSON.stringify(exportsize));

    updateTitle(false, false);
}

function updateTitle(reset, loading) {

    setTimeout( () => {

        let     exportsize = $('#page-info').html(),
                newcardcount = parseInt(window.localStorage.getItem('newcardcount'));

        if(exportsize == `0.00 B` || exportsize == '') {

            loading ? document.title = `...` : document.title = `Get Tags`;

            if(reset) { document.title = `Get Tags`; }

            return;
        }

        if(reset) {

            document.title = `${exportsize}`;

        } else { 

            if(loading) { 

                newcardcount == 0 ? document.title = `${exportsize}`
                    : document.title = `${exportsize} ... (${newcardcount})`; 

            } else {

                newcardcount == 0 ? document.title = `${exportsize}`
                    : document.title = `${exportsize} (${newcardcount})`;                 
            }
        }
    }, 100);
}
function overlayRemoveHandler(num) {

    let     oldData = getAllData(),
            newData = [],
            cardTotal = parseInt(window.localStorage.getItem('cardTotal')) - 1;

    oldData.forEach( (index) => {

        if(index.num != num) {

            newData.push(index);
        }
    });

    updateExportSize(num, false);

    window.localStorage.setItem('allData', JSON.stringify(newData));

    window.localStorage.setItem('cardTotal', JSON.stringify(cardTotal));

    $(`#cardcontainer-${num}`).remove();
}

export default overlayRemoveHandler;
"use strict"
let chartDrawer;

window.onload = () => {
    const params = {
        firstLayer: "firstLayer",
        secondLayer: "secondLayer",
        thirdLayer: "thirdLayer",
        baseColor: "rgb(0, 0, 0)",
        colors: ["blue", "red", "yellow", "pink", "green", "brown", "orange", "coral", "purple"],
        visibleLines: 100, //max: 1308
        popUpSize: 90,
        leftBorder: 100,
        oneLetterWidth: 8,
        marginTop: 100,
        stepLine: 100,
        neighbourhood: 3
    };

    initChart(params);
}

function initChart(params) {
    parser(data, params);
    chartDrawer = new ChartDrawer(params);
    chartDrawer.draw(0);
}

function removeEmpty() {
    chartDrawer.clean = (chartDrawer.clean) ? false : true;
    let lastPage = chartDrawer.currentPage;

    chartDrawer.draw(lastPage);
}

function paginator(direction) {
    let { visibleLines } = chartDrawer.params;
    let currentPage = chartDrawer.currentPage;
    let clean = chartDrawer.clean;
    let nextPage = (direction) ? currentPage + visibleLines :
    (currentPage > visibleLines) ? currentPage - visibleLines : 0;

    chartDrawer.draw(nextPage, clean);
}

function segmentsShow() {
    let checkbox = document.getElementById("checkbox");
    let checkboxComplementary = document.getElementById("checkboxComplementary");
    let checks = {};

    if (checkbox.checked) {
        checks.checkbox = true;
    } else {
        checks.checkbox = false;
    }

    if (checkboxComplementary.checked) {
        checks.checkboxComplementary = true;
    } else {
        checks.checkboxComplementary = false;
    }

    chartDrawer.chooseShowSegments(checks.checkbox, checks.checkboxComplementary);
}
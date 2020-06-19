"use strict"
let chartDrawer;

window.onload = () => {
    const params = {
        firstLayer: "firstLayer",
        secondLayer: "secondLayer",
        baseColor: "rgb(0, 0, 0)",
        colors: ["blue", "red", "yellow", "pink", "green", "brown", "orange", "coral", "purple"],
        visibleLines: 101, //max: 1308
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

    chartDrawer.draw(lastPage, chartDrawer.clean);
}

function paginator(direction) {
    let { visibleLines } = chartDrawer.params;
    let currentPage = chartDrawer.currentPage;
    let clean = chartDrawer.clean;
    let nextPage = (direction) ? currentPage + visibleLines :
    (currentPage > visibleLines) ? currentPage - visibleLines : 0;

    chartDrawer.draw(nextPage, clean);
}

function lineShow() {
    let checkbox = document.getElementById("checkbox");
    let checkboxComplementary = document.getElementById("checkboxComplementary");
}
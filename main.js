"use strict"
let chartDrawer;

window.onload = () => {
    canvas.height = 0;
    let params = {
        canvas: "canvas",
        baseColor: "rgb(0, 0, 0)",
        colors: ["blue", "red", "yellow", "pink", "green", "brown", "orange", "coral", "purple"],
        visibleLines: 10, //max: 1308
        popUpSize: 90,
        leftBorder: 100,
        lineWidth: 1000,
        marginTop: 100,
        stepLine: 50,
    };

    initChart(params);
}

function initChart(params) {
    parser(data, params);
    chartDrawer = new ChartDrawer(params);
    //chartDrawer.draw(102);
}
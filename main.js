"use strict"
window.onload = function () {
    canvas.height = 0;
    let params = {
        canvas: "canvas",
        baseColor: "rgb(0, 0, 0)",
        colors: ["blue", "red", "yellow", "pink", "green", "brown", "orange", "coral", "purple"],
        visibleLine: 1000, //max: 1308
        popUpSize: 90,
        leftBorder: 100,
        lineWidth: 1000,
        marginTop: 100,
        stepLine: 50,
        minSizeRect: 20
    };

    initChart(params);
}

function initChart(params) {
    parser(data, params);
    let chartDrawer = new ChartDrawer(params);
    chartDrawer.draw();
}
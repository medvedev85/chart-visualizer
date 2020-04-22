"use strict"

let params = {
    input: document.getElementById("json_input_id"),
    canvas: document.getElementById("canvas"),
    ctx: canvas.getContext("2d"),
    motifColors: ["blue", "red", "yellow", "pink", "green"],
    leftBorder: 100,
    lineWidth: 1000,
    marginTop: 100,
    stepLine: 50,
    rectHeight: 15,
    minSizeRect: 20
}


let chartDrawer = new ChartDrawer(params);

//chartDrawer.input.onpaste


chartDrawer.canvas.onmousemove = function (e) {
    chartDrawer.coordinate.x = e.offsetX;
    chartDrawer.coordinate.y = e.offsetY;
    chartDrawer.focusOnRect();
}
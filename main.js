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
    rectHeight: 10,
    minSizeRect: 20
}


let chartDrawer = new ChartDrawer(params);

//chartDrawer.input.onpaste
chartDrawer.input.oninput = function () {
    chartDrawer.addChart();
}

chartDrawer.canvas.onmousemove = function (e) {
    chartDrawer.coordinate.x = e.offsetX;
    chartDrawer.coordinate.y = e.offsetY;
}

function setLineDescription() {
    let str = "";
    for (let i = 0; i < chartDrawer.names.length; i++) {
        str += i + 1 + '. ' + chartDrawer.names[i] + ' ' + '\n'
    }
    document.getElementById('line_name').innerHTML = str;
}
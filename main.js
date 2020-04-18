"use strict"

let params = {
    input: document.getElementById("json_input_id"),
    canvas: document.getElementById("canvas"),
    ctx: canvas.getContext("2d"),
    motifColors: ["blue", "red", "yellow", "pink", "green"],
    sizeWidth: window.innerWidth / 100,
    sizeHeight: window.innerHeight / 100
}

let chartDrawer = new ChartDrawer(params);

chartDrawer.input.oninput = function () {
    
   // params.ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);
    chartDrawer.json = JSON.parse(chartDrawer.input.value);

    chartDrawer.nameSequence();
    chartDrawer.fillRangesFullData();
    getHeight();
    createHeader();
    chartDrawer.paintLine();
    chartDrawer.setLineDescription();
    chartDrawer.createChart();

    if (typeof chartDrawer.input == "object") {
        document.getElementById('result').innerHTML = "";
    } else {
        document.getElementById('result').innerHTML = " Поместите данные в формате JSON!";
    }
}

chartDrawer.canvas.onmousemove = function (e) {
    chartDrawer.coordinate.x = e.offsetX;
    chartDrawer.coordinate.y = e.offsetY;
   // chartDrawer.ctx.clearRect(0, 0, chartDrawer.canvas.width, chartDrawer.canvas.height);
}

canvas.width = window.innerWidth;
canvas.height = 0;

function getHeight() { //рассчитываем оптимальный размер
    canvas.height = (chartDrawer.json.sequences) ? (1130 + (chartDrawer.json.sequences.length - 1) * 40) : 0;
    return canvas.height;
}

function createHeader() {
    chartDrawer.ctx.fillStyle = "rgb(0, 0, 0)";
    chartDrawer.ctx.font = "bold 10pt Arial";
    chartDrawer.ctx.fillText('Name', params.sizeWidth * 5, params.sizeHeight * 9, params.sizeWidth * 5);
    chartDrawer.ctx.fillText('Motif Locations', params.sizeWidth * 17, params.sizeHeight * 9, params.sizeWidth * 15);
}
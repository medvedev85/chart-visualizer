"use strict"

let input = document.getElementById("json_input_id");
let params = {
    canvasElementId: "canvas",
    motifColors: ["blue", "red", "yellow", "pink", "green"],
    //lineLeftBorder: 17,
    //lineRightBorder: 90
    params.sizeWidth: window.innerWidth / 100,
    params.sizeHeight: window.innerHeight / 100
}

import {ChartDrawer} from './chart_modules/ChartDrawer.js';

let chartDrawer = new ChartDrawer(params);

input.oninput = function () {
    //chartDrawer.ctx.clearRect(0, 0, chartDrawer.canvas.width, chartDrawer.canvas.height);
    chartDrawer.json = JSON.parse(input.value);
    chartDrawer.nameSequence();
    chartDrawer.fillRangesFullData();
    getHeight();
    createHeader();
    chartDrawer.linePaint();
    chartDrawer.setLineDescription();
    chartDrawer.createChart();

    if (typeof input == "object") {
        document.getElementById('result').innerHTML = "";
    } else {
        document.getElementById('result').innerHTML = " Поместите данные в формате JSON!";
    }
}


chartDrawer.canvas.onmousemove = function (e) {
    chartDrawer.coordinate.x = e.offsetX;
    chartDrawer.coordinate.y = e.offsetY;
    //chartDrawer.ctx.clearRect(0, 0, chartDrawer.canvas.width, chartDrawer.canvas.height);
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
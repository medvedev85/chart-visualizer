"use strict"
let sizeWidth = window.innerWidth / 100;
let sizeHeight = window.innerHeight / 100;
let input = document.getElementById("json_input_id");

class ChartDrawer {
    constructor(canvasElementId) {
        this.canvas = document.getElementById(canvasElementId);
        this.ctx = canvas.getContext("2d");
        this.rects = [];
        this.coordinate = {};
        this.input = input;
        this.json = null;

    }
    nameSequence() {
        this.sequences = this.json.sequences;
        this.motifs = this.json.motifs;
        this.names = [];
        for (let i = 0; i < this.json.sequences.length; i++) {
            this.names[i] = this.json.sequences[i].name;
        }
    }
    setData() {

        if (typeof this.json == "object") {
            document.getElementById('result').innerHTML = "";
        } else {
            document.getElementById('result').innerHTML = " Поместите данные в формате JSON!";
        }
    }
}

let chartDrawer = new ChartDrawer("canvas");

input.oninput = function () { //берем данные из JSON для отрисовки графиков
    chartDrawer.json = JSON.parse(chartDrawer.input.value);
    chartDrawer.nameSequence();
    chartDrawer.setData();
    getHeight();
    topic();
    chartDrawer.nameData();
    chartDrawer.linePaint();
};

chartDrawer.canvas.width = window.innerWidth;
chartDrawer.canvas.height = 0;

function getHeight() { //рассчитываем оптимальный размер
    canvas.height = (chartDrawer.json.sequences) ? (1130 + (chartDrawer.json.sequences.length - 1) * 40) : 0;
    return canvas.height;
}

chartDrawer.canvas.onmousemove = function (e) { //координаты курсора по отношению к канвасу
    chartDrawer.coordinate.x = e.offsetX;
    chartDrawer.coordinate.y = e.offsetY;
    //chartDrawer.ctx.clearRect(0, 0, chartDrawer.canvas.width, chartDrawer.canvas.height);
}

chartDrawer.rectsPaint = function () {
    ctx.fillStyle = "blue";
    let long = (sizeWidth * 90 - sizeWidth * 17) / json.sequences[sequences].sequence.length;
    for (let i = 0; i < this.names.length; i++) {
        
    }
}

chartDrawer.linePaint = function () {
    for (let i = 0; i < this.names.length; i++) {
        chartDrawer.ctx.fillStyle = "rgb(0, 0, 0)";
        chartDrawer.ctx.beginPath();
        chartDrawer.ctx.moveTo(sizeWidth * 17, sizeHeight * 16 + sizeHeight * 9 * i);
        chartDrawer.ctx.lineTo(sizeWidth * 90, sizeHeight * 16 + sizeHeight * 9 * i);
        chartDrawer.ctx.stroke();
    }
}

chartDrawer.nameData = function () {
    for (let i = 0; i < this.names.length; i++) {
        chartDrawer.ctx.fillStyle = "rgb(0, 0, 0)";
        chartDrawer.ctx.font = "10pt Arial";
        chartDrawer.ctx.fillText(i + 1 + '.', sizeWidth * 5, sizeHeight * 16 + sizeHeight * 9 * i, sizeWidth * 5);
        chartDrawer.ctx.fillText(this.names[i], sizeWidth * 6, sizeHeight * 16 + sizeHeight * 9 * i, sizeWidth * 5);
    }
}

function topic() {
    chartDrawer.ctx.fillStyle = "rgb(0, 0, 0)";
    chartDrawer.ctx.font = "bold 10pt Arial";
    chartDrawer.ctx.fillText('Name', sizeWidth * 5, sizeHeight * 9, sizeWidth * 5);
    chartDrawer.ctx.fillText('Motif Locations', sizeWidth * 17, sizeHeight * 9, sizeWidth * 15);
}
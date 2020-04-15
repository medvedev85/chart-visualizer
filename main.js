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
        this.rangesFullData = [];
        this.color = ["#0000FF", "#FF00FF", "#32CD32", "#008080", "#FF4500", "#FFD700", "#BDB76B"];
    }
    nameSequence() {
        this.sequences = this.json.sequences;
        this.motifs = this.json.motifs;
        this.names = [];
        for (let i = 0; i < this.json.sequences.length; i++) {
            this.names[i] = this.json.sequences[i].name;
        }
    }
    getRangesFullData () {
        for (let i = 0; i < this.motifs.length; i++) {
            for (let j = 0; j < this.motifs[i].occurences.length; j++) {
                for (let k = 0; k < this.motifs[i].occurences[j].ranges.length; k++) {
                    this.motifs[i].occurences[j].ranges[k].motif = this.motifs[i].motif;
                    this.motifs[i].occurences[j].ranges[k].sequence_name = this.motifs[i].occurences[j].sequence_name;
                    this.rangesFullData.push(this.motifs[i].occurences[j].ranges[k]);
                }
            }
        } 
    }
}

let chartDrawer = new ChartDrawer("canvas");



input.oninput = function () { //берем данные из JSON для отрисовки графиков
    chartDrawer.json = JSON.parse(chartDrawer.input.value);
    chartDrawer.nameSequence();
    //setData();
    getHeight();
    topic();
    chartDrawer.nameData();
    chartDrawer.linePaint();
    chartDrawer.getRangesFullData();
    chartDrawer.rectsPaint();
    if (typeof input == "object") {
        document.getElementById('result').innerHTML = "";
    } else {
        document.getElementById('result').innerHTML = " Поместите данные в формате JSON!";
    }

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
    let long = Null;
    for (let i = 0; i < this.rangesFullData.length; i++) {
        long = (sizeWidth * 90 - sizeWidth * 17) / this.sequences.sequence.length; // ПОПРАВИТЬ!!!
        this.rects[i].x = Math.ceil(this.rangesFullData[i].start * long + sizeWidth * 17);;
        this.rects[i].w = Math.floor((this.rangesFullData[i].end * long + sizeWidth * 17) - rects[rectNumber].x);
        this.rects[i].w = this.rects[i].w >= sizeWidth * 3 ? this.rects[i].w : sizeWidth * 3;
        this.rects[i].h = sizeHeight * 2;
        this.rects[i].y = sizeHeight * 14 + this.names.indexOf(this.rangesFullData[i].sequence_name);
        this.ctx.rect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);
        this.ctx.fill();
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
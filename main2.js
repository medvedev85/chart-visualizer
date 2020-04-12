"use strict"
let sizeWidth = window.innerWidth / 100;
let sizeHeight = window.innerHeight / 100;

class ChartDrawer {
    constructor(canvasElementId) {
        this.canvas = document.getElementById(canvasElementId);
        this.ctx = canvas.getContext("2d");
        this.rects = [];
        this.coordinate = {};
        this.input = document.getElementById("json_input_id");
        this.json = null;
        
    }
    nameSequence() {
        this.sequences = this.json.sequences;
        this.motifs = this.json.motifs;
        this.name = [];
        for (let i = 0; i < this.json.sequences.length; i++) {
            this.name[i] = this.json.sequences[i].name;
        }
    }
    setData() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (typeof this.json == "object") {
            console.log("321312321321");
            document.getElementById('result').innerHTML = "";
        } else {
            document.getElementById('result').innerHTML = " Поместите данные в формате JSON!";
        }
    }
}

let chartDrawer = new ChartDrawer("canvas");
chartDrawer.input.oninput = function () { //берем данные из JSON для отрисовки графиков
    chartDrawer.json = JSON.parse(chartDrawer.input.value);
    chartDrawer.nameSequence();
    console.log(chartDrawer.motifs);
    size();
    
};

chartDrawer.canvas.width = window.innerWidth;
chartDrawer.canvas.height = 0;

function size() { //рассчитываем оптимальный размер
    canvas.height = (chartDrawer.json.sequences) ? (1130 + (chartDrawer.json.sequences.length - 1) * 40) : 0;
    return canvas.height;
}

chartDrawer.canvas.onmousemove = function (e) { //координаты курсора по отношению к канвасу
    chartDrawer.coordinate.x = e.offsetX;
    chartDrawer.coordinate.y = e.offsetY;
}

setInterval(chartDrawer.setData(), 200);






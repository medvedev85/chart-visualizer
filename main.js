"use strict"

let params = {
    input: document.getElementById("json_input_id"),
    canvas: document.getElementById("canvas"),
    ctx: canvas.getContext("2d"),
    motifColors: ["blue", "red", "yellow", "pink", "green"],
    leftBorder: 100,
    rightBorder: 1000,
    marginTop: 100,
    stepLine: 50,
    rectHeight: 10,
    minSizeRect: 20
}

let chartDrawer = new ChartDrawer(params);

chartDrawer.input.oninput = function () {
    if (typeof chartDrawer.json == "object") {
        document.getElementById('result').innerHTML = "";
        
    } else {
        document.getElementById('result').innerHTML = " Поместите данные в формате JSON!";
    }
    
    chartDrawer.ctx.clearRect(0, 0, chartDrawer.canvas.width, chartDrawer.canvas.height);
    chartDrawer.json = JSON.parse(chartDrawer.input.value);

    chartDrawer.nameSequence();
    chartDrawer.fillRangesFullData();
    getHeight();
    createHeader();
    chartDrawer.paintLine();
    chartDrawer.setLineDescription();
    chartDrawer.createChart();

    
}

chartDrawer.canvas.onmousemove = function (e) {
    chartDrawer.coordinate.x = e.offsetX;
    chartDrawer.coordinate.y = e.offsetY;
   // chartDrawer.ctx.clearRect(0, 0, chartDrawer.canvas.width, chartDrawer.canvas.height);
}

canvas.width = chartDrawer.leftBorder + chartDrawer.rightBorder;
canvas.height = 0;

function getHeight() {
    canvas.height = (chartDrawer.json.sequences) ? chartDrawer.marginTop + chartDrawer.stepLine * chartDrawer.names.length : 0;
    return canvas.height;
}

function createHeader() { // будет переписана (элемент HTML)
    chartDrawer.ctx.fillStyle = "rgb(0, 0, 0)";
    chartDrawer.ctx.font = "bold 10pt Arial";
    chartDrawer.ctx.fillText('Name', 10, 60, 100);
    chartDrawer.ctx.fillText('Motif Locations', 100, 60, 100);
}
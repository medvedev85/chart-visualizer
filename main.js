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

//chartDrawer.input.onpaste
chartDrawer.input.oninput = function () {
    chartDrawer.ctx.clearRect(0, 0, chartDrawer.canvas.width, chartDrawer.canvas.height);
    chartDrawer.json = JSON.parse(chartDrawer.input.value);

    chartDrawer.nameSequence();
    chartDrawer.fillRangesFullData();
    getHeight();
    chartDrawer.paintLine();
    setLineDescription();
    chartDrawer.createChart();
    document.getElementById('hederCanvas').style.display = 'block';

    if (typeof chartDrawer.json == "object") {
        document.getElementById('result').innerHTML = "";
        
    } else {
        document.getElementById('result').innerHTML = " Поместите данные в формате JSON!";
    }
}

//document.getElementById('space').innerHTML = chartDrawer.leftBorder;

chartDrawer.canvas.onmousemove = function (e) {
    chartDrawer.coordinate.x = e.offsetX;
    chartDrawer.coordinate.y = e.offsetY;
   // chartDrawer.ctx.clearRect(0, 0, chartDrawer.canvas.width, chartDrawer.canvas.height);
}

canvas.width = chartDrawer.leftBorder + chartDrawer.rightBorder;
canvas.height = 0;

function getHeight() {
    if (chartDrawer.json.sequences) {
        canvas.height = chartDrawer.marginTop + chartDrawer.stepLine * (chartDrawer.names.length + 1);

    } 
    return canvas.height;
}

function setLineDescription() {
    let str = "";
    for (let i = 0; i < chartDrawer.names.length; i++) {
        str += i + 1 + '. ' + chartDrawer.names[i] + ' ' + '\n'
    }
    document.getElementById('line_name').innerHTML = str;
}
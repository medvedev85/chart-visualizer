"use strict"
window.onload = function () {
    let input = document.getElementById("json_input_id");
    let result = document.getElementById('result');
    let params = {
        canvas: "canvas",
        motifColors: ["blue", "red", "yellow", "pink", "green"],
        leftBorder: 100,
        lineWidth: 1000,
        marginTop: 100,
        stepLine: 50,
        rectHeight: 15,
        minSizeRect: 20
    };
    initChart(input, params, result);
}

function initChart(input, params, result, chartDrawer) {
    input.oninput = () => {
        try {
            let json = JSON.parse(input.value);
            parser(json, params);
            result.innerHTML = "";
        } catch (error) {
            result.innerHTML = " Поместите данные в формате JSON!";
        }
    }
}

/*
let chartDrawer = new ChartDrawer(params);

chartDrawer.canvas.onmousemove = function (e) {
    chartDrawer.coordinate.x = e.offsetX;
    chartDrawer.coordinate.y = e.offsetY;
    chartDrawer.focusOnRect();
}*/
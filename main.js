"use strict"
window.onload = function () {
    canvas.height = 0;
    let input = document.getElementById("jsonInputId");
    let result = document.getElementById('result');
    let params = {
        canvas: "canvas",
        baseColor: "rgb(0, 0, 0)",
        colors: ["blue", "red", "yellow", "pink", "green"],
        popUpSize: 90,
        leftBorder: 100,
        lineWidth: 1000,
        marginTop: 100,
        stepLine: 50,
        rectHeight: 15,
        minSizeRect: 20
    };
    initChart(input, params, result);

    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'data.json', false);
    xhr.send();
    parser(json, params);
    let chartDrawer = new ChartDrawer(params);
    chartDrawer.draw();
}

function initChart(input, params, result) {
    input.oninput = () => {
        try {
            let json = JSON.parse(input.value);
            parser(json, params);
            let chartDrawer = new ChartDrawer(params);
            chartDrawer.draw();
            result.innerHTML = "";
        } catch {
            result.innerHTML = " Поместите данные в формате JSON!";
        }
    }
}
"use strict"
window.onload = function () {
    canvas.height = 0;
    let input = document.getElementById("jsonInputId");
    let result = document.getElementById('result');
    let params = {
        canvas: "canvas",
        baseColor: "rgb(0, 0, 0)",
        colors: ["blue", "red", "yellow", "pink", "green", "brown", "orange", "coral", "purple"],
        popUpSize: 90,
        leftBorder: 100,
        lineWidth: 1000,
        marginTop: 100,
        stepLine: 50,
        minSizeRect: 20
    };
    initChart(input, params, result);
/*
    let xhr = new XMLHttpRequest();
    let chartDrawer = new ChartDrawer(params);

    xhr.open('GET', 'data.json');
    xhr.send();

    xhr.onload = () => {
        let json = JSON.parse(xhr.responseText);
        parser(json, params);
        chartDrawer.draw();
    }
*/
}

function initChart(input, params, result) {
    input.oninput = () => {
        //try {
            let json = JSON.parse(input.value);
            parser(json, params);
            let chartDrawer = new ChartDrawer(params);
            chartDrawer.draw();
            result.innerHTML = "";
        /*} catch {
            result.innerHTML = " Поместите данные в формате JSON!";
        }*/
    }
}
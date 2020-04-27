"use strict"
let input = document.getElementById("json_input_id");
input.oninput = setData;

let params = {
    canvas: document.getElementById("canvas"),
    ctx: canvas.getContext("2d"),
    motifColors: ["blue", "red", "yellow", "pink", "green"],
    leftBorder: 100,
    lineWidth: 1000,
    marginTop: 100,
    stepLine: 50,
    rectHeight: 15,
    minSizeRect: 20
};

function parser(inputData) {
    let rects = [];
    for (let i = 0; i < inputData.motifs.length; i++) {
        for (let j = 0; j < inputData.motifs[i].occurences.length; j++) {
            for (let k = 0; k < inputData.motifs[i].occurences[j].ranges.length; k++) {
                inputData.motifs[i].occurences[j].ranges[k].motif = inputData.motifs[i].motif;
                inputData.motifs[i].occurences[j].ranges[k].sequenceName = inputData.motifs[i].occurences[j].sequence_name;
                rects.push(inputData.motifs[i].occurences[j].ranges[k]);
            }
        }
    }
    for (let i = 0; i < inputData.sequences.length; i++) {
        inputData.sequences[i].rects = [];
        for (let j = 0; j < rects.length; j++) {
            if (inputData.sequences[i].name == rects[j].sequenceName) {
                inputData.sequences[i].rects.push(rects[j]);
            }
        }
    }
    params.segments = inputData.sequences;
}

function setData() {
    let json = JSON.parse(input.value);
    try {
        parser(json);
        document.getElementById('result').innerHTML = "";
    } catch (error) {
        document.getElementById('result').innerHTML = " Поместите данные в формате JSON!";
    }
}

let chartDrawer = new ChartDrawer(params);

chartDrawer.canvas.onmousemove = function (e) {
    chartDrawer.coordinate.x = e.offsetX;
    chartDrawer.coordinate.y = e.offsetY;
    chartDrawer.focusOnRect();
}
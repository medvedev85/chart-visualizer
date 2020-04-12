"use strict"
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let rects = [];
let coordinate = {};
let json;
let sizeWidth = window.innerWidth / 100;
let sizeHeight = window.innerHeight / 100;
let input = document.getElementById("json_input_id");

input.oninput = function () { //берем данные из JSON для отрисовки графиков
    json = input.value;
    json = JSON.parse(json);
    document.getElementById("canvas").innerHTML = size();
};

canvas.width = window.innerWidth;
canvas.height = 0;

function size() { //рассчитываем оптимальный размер
    canvas.height = (json.sequences) ? (1130 + (json.sequences.length - 1) * 40) : 0;
    return canvas.height;
}

canvas.onmousemove = function (e) { //координаты курсора по отношению к канвасу
    coordinate.x = e.offsetX == undefined ? e.layerX : e.offsetX;
    coordinate.y = e.offsetY == undefined ? e.layerY : e.offsetY;
}

setInterval(function drow() { //перерисовываем холст для учета изменений
    sizeWidth = window.innerWidth / 100;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (typeof json == "object") {
        topic();
        RectPaint(0, 0, 0, 0, 0, 65);
        titleWhithFocus();
        document.getElementById('result').innerHTML = "";
    } else {
        document.getElementById('result').innerHTML = " Поместите данные в формате JSON!";
    }
}, 200);

class JsonData {
    constructor (name) {
        this.name = name;
        this.json = JSON.parse(json);
        this.
    }
}

function draw() { //отрисовать весь холст

}

function TitleText(motifs, sequences, occurences, ranges) { //создаем текст подсказки
    let motif = json[motifs].motif;
    let value = json.occurences[i]['p-value'];
    let sequence = json.motifs[motifs].occurences[occurences].ranges[ranges].complementary == 0 ? json.sequences[sequences].sequence : json.sequences[sequences].sequence;

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.font = "10pt Arial";
    ctx.fillText('motif:' + ' ' + motif, x + 6, y + 17, sizeWidth * 9);
    ctx.fillText('p-value:' + ' ' + value, x + 6, y + 32, sizeWidth * 9);
    ctx.fillText('sequences:' + ' ' + sequence, x + 6, y + 32, sizeWidth * 9);
}

function titleWhithFocus() { //проверяем попадание мыши в мотив и рисуем подсказку
    for (let i = 0; i < rects.length; i++) {
        if (coordinate.x + 5 >= rects[i].x && coordinate.x - 15 < rects[i].w + rects[i].x
            && coordinate.y + 5 >= rects[i].y && coordinate.y - 5 <= rects[i].h + rects[i].y) {
            let titleCenter = rects[i].w / 2 + rects[i].x,
                x = titleCenter - sizeWidth * 10,
                w = (titleCenter + sizeWidth * 10) - x,
                y = rects[i].y + sizeHeight * 4,
                h = sizeHeight * 25;

            ctx.strokeRect(x, y, w, h);
            ctx.clearRect(x, y, w, h);
            TitleText(i, x, y);
        }
    }
}

function RectPaint(sequences, rectNumber, motifs, occurences, ranges, position) { //отрисовать прямоугольники (мотив)
    linePaint(position);
    nameData(motifs, occurences, position);
    ctx.fillStyle = "blue";
    let long = (sizeWidth * 90 - sizeWidth * 17) / json.sequences[sequences].sequence.length;
    rects[rectNumber] = {};
    rects[rectNumber].x = Math.ceil(json.motifs[motifs].occurences[occurences].ranges[ranges].start * long + sizeWidth * 17);
    rects[rectNumber].w = Math.floor((json.motifs[motifs].occurences[occurences].ranges[ranges].end * long + sizeWidth * 17) - rects[rectNumber].x);
    rects[rectNumber].w < sizeWidth * 3 ? rects[rectNumber].w = sizeWidth * 3 : rects[rectNumber].w = rects[rectNumber].w;
    rects[rectNumber].h = sizeHeight * 2;
    rects[rectNumber].y = json.motifs[motifs].occurences[occurences].ranges[ranges].complementary == 0 ? sizeHeight * 14 : sizeHeight * 16;
    ctx.rect(rects[rectNumber].x, rects[rectNumber].y, rects[rectNumber].w, rects[rectNumber].h);
    ctx.fill();
}

function linePaint(position) { //отрисовать линию 
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.beginPath();
    ctx.moveTo(sizeWidth * 17, sizeHeight * 16);
    ctx.lineTo(sizeWidth * 90, sizeHeight * 16);
    ctx.stroke();
}

function nameData(motifs, occurences, position) { //текст перед линией (порядковый номер, название последовательности, p-value)
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.font = "10pt Arial";
    ctx.fillText(motifs + 1 + '.', sizeWidth * 5, sizeHeight * 16, sizeWidth * 5);
    ctx.fillText(json.motifs[motifs].occurences[occurences].sequence_name, sizeWidth * 6, sizeHeight * 16, sizeWidth * 5);
    
}

function topic() { //создаем заголовок
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.font = "bold 10pt Arial";
    ctx.fillText('Name', sizeWidth * 5, sizeHeight * 9, sizeWidth * 5);
    ctx.fillText('Motif Locations', sizeWidth * 17, sizeHeight * 9, sizeWidth * 15);
}
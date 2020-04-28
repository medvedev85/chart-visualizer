class ChartDrawer {
    constructor(params) {
        this.canvas = document.getElementById(params.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.ctx = params.ctx;
        this.motifColors = params.motifColors;
        this.leftBorder = params.leftBorder;
        this.lineWidth = params.lineWidth;
        this.marginTop = params.marginTop;
        this.stepLine = params.stepLine;
        this.rectHeight = params.rectHeight;
        this.minSizeRect = params.minSizeRect;
        this.rightBorder = this.lineWidth + this.leftBorder;
        this.segments = params.segments;
        this.coordinate = {};
    }
    
    addChart() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        try {
            this.json = JSON.parse(this.input.value);
            document.getElementById('result').innerHTML = "";
            canvas.width = this.leftBorder + this.rightBorder;
            canvas.height = 0;

            this.fillRangesFullData();
            canvas.height = this.getHeight();
            this.createChart();
            document.getElementById('headerCanvas').style.display = 'block';
        } catch (error) {
            document.getElementById('result').innerHTML = " Поместите данные в формате JSON!";
        }


    }
    nameSequence() {
        this.sequences = this.json.sequences;
        this.motifs = this.json.motifs;
        for (let i = 0; i < this.json.sequences.length; i++) {
            this.names[i] = this.json.sequences[i].name;
        }
    }
    createChart() {
        this.paintLine();
        this.setLineDescription();
        for (let i = 0; i < this.rangesFullData.length; i++) {
            for (let j = 0; j < this.names.length; j++) {
                if (this.rangesFullData[i].sequenceName == this.names[j]) {
                    this.name = this.names[j];
                    this.long = (this.rightBorder - this.leftBorder) / this.rangesFullData[i].sequenceLenght;

                    if (this.rangesFullData[i].complementary == 1) {
                        this.long = (this.rightBorder - this.leftBorder) / this.rangesFullData[i].complementarySequenceLenght;
                    }

                    this.rects[i] = {};
                    this.rects[i].x = Math.ceil(this.rangesFullData[i].start * this.long + this.leftBorder);
                    this.rects[i].w = Math.floor((this.rangesFullData[i].end * this.long + this.leftBorder) - this.rects[i].x);
                    this.rects[i].w = this.rects[i].w >= this.minSizeRect ? this.rects[i].w : this.minSizeRect;
                    this.rects[i].h = this.rectHeight;
                    this.rects[i].y = this.marginTop - this.rectHeight + this.stepLine * this.name;
                    this.rects[i].abrr = this.rangesFullData[i].color;
                    this.ctx.fillStyle = this.rangesFullData[i].color;
                    this.ctx.fillRect(this.rects[i].x, this.rects[i].y, this.rects[i].w, this.rects[i].h);
                }
            }
        }
    }

    paintLine() {
        for (let i = 0; i < this.names.length; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.leftBorder, this.marginTop + this.stepLine * i);
            this.ctx.lineTo(this.rightBorder, this.marginTop + this.stepLine * i);
            this.ctx.stroke();
        }
    }
    setLineDescription() {
        let str = "";
        for (let i = 0; i < this.names.length; i++) {
            str += i + 1 + '. ' + this.names[i] + ' ' + '\n'
        }
        document.getElementById('line_name').innerHTML = str;
    }
    chooseColor(id) {
        if (id < this.motifColors.length) {
            return this.motifColors[id];
        } else if (id / this.motifColors.length < this.motifColors.length) {
            return this.motifColors[Math.floor(id / this.motifColors.length)];
        } else {
            this.chooseColor(Math.floor(id / this.motifColors.length));
        }
    }
    getHeight() {
        if (this.json.sequences) {
            return this.marginTop + this.stepLine * (this.names.length + 1);
        }
    }
    /* titleText(i, x, y) { //создаем текст подсказки
         let motif = json.motif,
             value = json.occurences[i]['p-value'];
 
         ctx.fillStyle = "rgb(0, 0, 0)";
         ctx.font = "10pt Arial";
         ctx.fillText('motif:' + ' ' + motif, x + 6, y + 17, sizeWidth * 9);
         ctx.fillText('p-value:' + ' ' + value, x + 6, y + 32, sizeWidth * 9);
     }*/

    focusOnRect() {
        for (let i = 0; i < this.rects.length; i++) {
            if (this.coordinate.x + 5 >= this.rects[i].x && this.coordinate.x - 15 < this.rects[i].w + this.rects[i].x
                && this.coordinate.y + 5 >= this.rects[i].y && this.coordinate.y - 5 <= this.rects[i].h + this.rects[i].y) {
                let titleCenter = this.rects[i].w / 2 + this.rects[i].x;
                let x = titleCenter - 50;
                let w = (titleCenter + 50) - x;
                let y = this.rects[i].y + 20;
                let h = 40;

                this.ctx.strokeRect(x, y, w, h);
                this.ctx.clearRect(x, y, w, h);
                //TitleText(i, x, y);
            }
        }
    }
}

function parser(inputData, params) {
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
    console.log(params);
    return params.segments = inputData.sequences;
}
class ChartDrawer {
    constructor(params) {
        this.input = params.input;
        this.canvas = params.canvas;
        this.ctx = params.ctx;
        this.motifColors = params.motifColors;
        this.leftBorder = params.leftBorder;
        this.lineWidth = params.lineWidth;
        this.marginTop = params.marginTop;
        this.stepLine = params.stepLine;
        this.rectHeight = params.rectHeight;
        this.minSizeRect = params.minSizeRect;
        this.rightBorder = this.lineWidth + this.leftBorder;
        this.rects = [];
        this.json = null;
        this.coordinate = {};
        this.names = [];

    }
    nameSequence() {
        this.sequences = this.json.sequences;
        this.motifs = this.json.motifs;
        for (let i = 0; i < this.json.sequences.length; i++) {
            this.names[i] = this.json.sequences[i].name;
        }
    }
    fillRangesFullData() {
        this.rangesFullData = [];
        for (let i = 0; i < this.motifs.length; i++) {
            for (let j = 0; j < this.motifs[i].occurences.length; j++) {
                for (let k = 0; k < this.motifs[i].occurences[j].ranges.length; k++) {
                    this.motifs[i].occurences[j].ranges[k].motif = this.motifs[i].motif;
                    this.motifs[i].occurences[j].ranges[k].sequenceName = this.motifs[i].occurences[j].sequence_name;
                    this.rangesFullData.push(this.motifs[i].occurences[j].ranges[k]);
                }
            }
        }
        for (let i = 0; i < this.rangesFullData.length; i++) {
            for (let j = 0; j < this.sequences.length; j++) {
                if (this.rangesFullData[i].sequenceName == this.sequences[j].name) {
                    this.rangesFullData[i].index = j;
                    this.rangesFullData[i].sequenceLenght = this.sequences[j].sequence.length;
                    this.rangesFullData[i].complementarySequenceLenght = this.sequences[j].complementary_sequence.length;
                }
            }
        }
    }
    getHeight() {
        if (this.json.sequences) {
            canvas.height = this.marginTop + this.stepLine * (this.names.length + 1);

        }
        return canvas.height;
    }
    createChart() {
        for (let i = 0; i < this.rangesFullData.length; i++) {
            for (let j = 0; j < this.names.length; j++) {
                if (this.rangesFullData[i].sequenceName == this.names[j]) {
                    this.name = this.names[j];


                    this.long = (this.rightBorder - this.leftBorder) / this.rangesFullData[i].sequenceLenght;
                    if (this.rangesFullData[i].complementary == 1) {
                        this.long = (this.rightBorder - this.leftBorder) / this.rangesFullData[i].complementarySequenceLenght;
                    }
                    this.ctx.fillStyle = "blue";
                    this.rects[i] = {};
                    this.rects[i].x = Math.ceil(this.rangesFullData[i].start * this.long + this.leftBorder);
                    this.rects[i].w = Math.floor((this.rangesFullData[i].end * this.long + this.leftBorder) - this.rects[i].x);
                    this.rects[i].w = this.rects[i].w >= this.minSizeRect ? this.rects[i].w : this.minSizeRect;
                    this.rects[i].h = this.rectHeight;
                    this.rects[i].y = this.marginTop - this.rectHeight + this.stepLine * this.name;
                    this.ctx.rect(this.rects[i].x, this.rects[i].y, this.rects[i].w, this.rects[i].h);
                    this.ctx.fill();
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
    addChart() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.json = JSON.parse(this.input.value);
        canvas.width = this.leftBorder + this.rightBorder;
        canvas.height = 0;
        this.nameSequence();
        this.fillRangesFullData();
        this.getHeight();
        this.paintLine();
        setLineDescription();
        this.createChart();
        document.getElementById('headerCanvas').style.display = 'block';

        if (typeof this.json == "object") {
            document.getElementById('result').innerHTML = "";

        } else {
            document.getElementById('result').innerHTML = " Поместите данные в формате JSON!";
        }
    }
}

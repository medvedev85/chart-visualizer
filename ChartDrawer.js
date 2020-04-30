class ChartDrawer {
    constructor(params) {
        this.canvas = document.getElementById(params.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.colors = params.colors;
        this.leftBorder = params.leftBorder;
        this.lineWidth = params.lineWidth;
        this.marginTop = params.marginTop;
        this.stepLine = params.stepLine;
        this.rectHeight = params.rectHeight;
        this.minSizeRect = params.minSizeRect;
        this.rightBorder = this.lineWidth + this.leftBorder;
        this.segments = params.segments;
        this.coordinate = {};
        this.motifColors = {};
    }
    awayChart() {
        this.canvas.width = this.leftBorder + this.rightBorder;
        this.canvas.height = this.getHeight();
        this.chooseColor();
        for (let i = 0; i < this.segments.length; i++) {
            this.drawOneSegment(i);
        }        
    }
    drawOneSegment(idSegment) {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.beginPath();
        this.ctx.moveTo(this.leftBorder, this.marginTop + this.stepLine * idSegment);
        this.ctx.lineTo(this.rightBorder, this.marginTop + this.stepLine * idSegment);
        this.ctx.stroke();

        for (let i = 0; i < this.segments[idSegment].rects.length; i++) {
            this.long = (this.rightBorder - this.leftBorder) / this.segments[idSegment].sequence.length;

            this.x = Math.ceil(this.segments[idSegment].rects[i].start * this.long + this.leftBorder);
            this.w = Math.floor((this.segments[idSegment].rects[i].end * this.long + this.leftBorder) - this.x);
            this.w = this.w >= this.minSizeRect ? this.w : this.minSizeRect;
            this.h = this.rectHeight;
            this.y = this.marginTop - this.rectHeight + this.stepLine * idSegment;
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillStyle = this.motifColors[this.segments[idSegment].rects[i].motif];
            this.ctx.fillRect(this.x, this.y, this.w, this.h);
        }
    }
    chooseColor() {
        for (let i = 0; i < this.segments.motifs.length; i++) {
            if (i <= this.colors.length) {
                this.motifColors[this.segments.motifs[i]] = this.colors[i];
            } else {
                this.motifColors[this.segments.motifs.i] = this.colors[i % this.colors.length];
            }
        }
    }
    getHeight() {
        if (this.segments) {
            return this.marginTop + this.stepLine * (this.segments.length + 1);
        }
    }
}

function parser(inputData, params) {
    let rects = [];
    inputData.sequences.motifs = [];
    for (let i = 0; i < inputData.motifs.length; i++) {
        for (let j = 0; j < inputData.motifs[i].occurences.length; j++) {
            for (let k = 0; k < inputData.motifs[i].occurences[j].ranges.length; k++) {
                inputData.motifs[i].occurences[j].ranges[k].motif = inputData.motifs[i].motif;
                inputData.motifs[i].occurences[j].ranges[k].sequenceName = inputData.motifs[i].occurences[j].sequence_name;
                rects.push(inputData.motifs[i].occurences[j].ranges[k]);
            }
        }
        inputData.sequences.motifs.push(inputData.motifs[i].motif);
    }
    for (let i = 0; i < inputData.sequences.length; i++) {
        inputData.sequences[i].rects = [];
        for (let j = 0; j < rects.length; j++) {
            if (inputData.sequences[i].name == rects[j].sequenceName) {
                inputData.sequences[i].rects.push(rects[j]);
            }
        }
    }
    return params.segments = inputData.sequences;
    console.log(params);
}
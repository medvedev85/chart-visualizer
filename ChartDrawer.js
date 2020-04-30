class ChartDrawer {
    constructor(params) {
        this.canvas = document.getElementById(params.canvas);
        this.ctx = this.canvas.getContext("2d");
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
    drawOneSegment(idSegment) {
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.beginPath();
        this.ctx.moveTo(this.leftBorder, this.marginTop + this.stepLine * idSegment);
        this.ctx.lineTo(this.rightBorder, this.marginTop + this.stepLine * idSegment);
        this.ctx.stroke();


    }
    getHeight() {
        if (this.segments) {
            return this.marginTop + this.stepLine * (this.segments.length + 1);
        }
    }
    tester() { //временный метод
        console.log(this.canvas);
        this.canvas.width = this.leftBorder + this.rightBorder;
        this.canvas.height = this.getHeight();
        this.drawOneSegment(0);
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
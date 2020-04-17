export class ChartDrawer {
    constructor(params) {
        this.canvas = document.getElementById(params.canvasElementId);
        this.ctx = canvas.getContext("2d");
        this.rects = [];
        this.json = {};
        this.coordinate = {};
        this.sequences = this.json.sequences;
        this.motifs = this.json.motifs;
    }
    nameSequence() {
        this.sequences = this.json.sequences;
        this.motifs = this.json.motifs;
        this.names = [];
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
    createChart() {
        for (let i = 0; i < this.rangesFullData.length; i++) {
            for (let j = 0; j < this.names.length; j++) {
                if (this.rangesFullData[i].sequenceName == this.names[j]) {
                    this.name = this.names[j];
                }

                this.long = (params.sizeWidth * 90 - params.sizeWidth * 17) / this.rangesFullData[i].sequenceLenght;
                if (this.rangesFullData[i].complementary == 1) {
                    this.long = (params.sizeWidth * 90 - params.sizeWidth * 17) / this.rangesFullData[i].complementarySequenceLenght;
                }
                this.ctx.fillStyle = "blue";
                this.rects[i] = {};
                this.rects[i].x = Math.ceil(this.rangesFullData[i].start * this.long + params.sizeWidth * 17);
                this.rects[i].w = Math.floor((this.rangesFullData[i].end * this.long + params.sizeWidth * 17) - this.rects[i].x);
                this.rects[i].w = this.rects[i].w >= params.sizeWidth * 3 ? this.rects[i].w : params.sizeWidth * 3;
                this.rects[i].h = params.sizeHeight * 2;
                this.rects[i].y = params.sizeHeight * 14 + params.sizeHeight * 9 * this.name;
                this.ctx.rect(this.rects[i].x, this.rects[i].y, this.rects[i].w, this.rects[i].h);
                this.ctx.fill();
            }
        }
    }
    setLineDescription() {
        for (let i = 0; i < this.names.length; i++) {
            chartDrawer.ctx.fillStyle = "rgb(0, 0, 0)";
            chartDrawer.ctx.font = "10pt Arial";
            chartDrawer.ctx.fillText(i + 1 + '.', params.sizeWidth * 5, params.sizeHeight * 16 + params.sizeHeight * 9 * i, params.sizeWidth * 5);
            chartDrawer.ctx.fillText(this.names[i], params.sizeWidth * 6, params.sizeHeight * 16 + params.sizeHeight * 9 * i, params.sizeWidth * 5);
        }
    }
    linePaint() {
        for (let i = 0; i < this.names.length; i++) {
            chartDrawer.ctx.fillStyle = "rgb(0, 0, 0)";
            chartDrawer.ctx.beginPath();
            chartDrawer.ctx.moveTo(params.sizeWidth * 17, params.sizeHeight * 16 + params.sizeHeight * 9 * i);
            chartDrawer.ctx.lineTo(params.sizeWidth * 90, params.sizeHeight * 16 + params.sizeHeight * 9 * i);
            chartDrawer.ctx.stroke();
        }
    }
}

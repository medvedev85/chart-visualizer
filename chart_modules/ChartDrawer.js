export class ChartDrawer {
    constructor(params) {
        this.canvas = params.canvas;
        this.ctx = params.ctx;
        this.rects = [];
        this.json = {};
        this.coordinate = {};
        this.sequences = this.json.sequences;
        this.motifs = this.json.motifs;
        this.sizeWidth = params.sizeWidth;
        this.sizeHeight = params.sizeHeight;
        this.rangesFullData = [];
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

                this.long = (this.sizeWidth * 90 - this.sizeWidth * 17) / this.rangesFullData[i].sequenceLenght;
                if (this.rangesFullData[i].complementary == 1) {
                    this.long = (this.sizeWidth * 90 - this.sizeWidth * 17) / this.rangesFullData[i].complementarySequenceLenght;
                }
                this.ctx.fillStyle = "blue";
                this.rects[i] = {};
                this.rects[i].x = Math.ceil(this.rangesFullData[i].start * this.long + this.sizeWidth * 17);
                this.rects[i].w = Math.floor((this.rangesFullData[i].end * this.long + this.sizeWidth * 17) - this.rects[i].x);
                this.rects[i].w = this.rects[i].w >= this.sizeWidth * 3 ? this.rects[i].w : this.sizeWidth * 3;
                this.rects[i].h = this.sizeHeight * 2;
                this.rects[i].y = this.sizeHeight * 14 + this.sizeHeight * 9 * this.name;
                this.ctx.rect(this.rects[i].x, this.rects[i].y, this.rects[i].w, this.rects[i].h);
                this.ctx.fill();
            }
        }
    }
    setLineDescription() {
        for (let i = 0; i < this.names.length; i++) {
            this.ctx.fillText(i + 1 + '.', this.sizeWidth * 5, this.sizeHeight * 16 + this.sizeHeight * 9 * i, this.sizeWidth * 5);
            this.ctx.fillText(this.names[i], this.sizeWidth * 6, this.sizeHeight * 16 + this.sizeHeight * 9 * i, this.sizeWidth * 5);
        }
    }
    paintLine() {
        for (let i = 0; i < this.names.length; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.sizeWidth * 17, this.sizeHeight * 16 + this.sizeHeight * 9 * i);
            this.ctx.lineTo(this.sizeWidth * 90, this.sizeHeight * 16 + this.sizeHeight * 9 * i);
            this.ctx.stroke();
        }
    }
}

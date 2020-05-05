class ChartDrawer {
    constructor(params) {
        const self = this;
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
        this.rects = [];
        this.motifColors = {};
        this.allRects = [];
        this.canvas.onmousemove = function (e) {
            self.coordinate.x = e.offsetX;
            self.coordinate.y = e.offsetY;
            self.focusOnRect();
        }
    }
    draw() {
        this.canvas.width = this.leftBorder + this.rightBorder;
        this.canvas.height = this.getHeight();
        this.setLineDescription();
        this.selectColor();
        document.getElementById('headerCanvas').style.display = 'block';
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
            let long = (this.rightBorder - this.leftBorder) / this.segments[idSegment].sequence.length;
            let x = Math.ceil(this.segments[idSegment].rects[i].start * long + this.leftBorder);
            let w = Math.floor((this.segments[idSegment].rects[i].end * long + this.leftBorder) - x);
            w = Math.max(w, this.minSizeRect);
            let h = this.rectHeight;
            let y = this.marginTop - this.rectHeight + this.stepLine * idSegment;
            if (this.segments[idSegment].rects[i].complementary != 1) {
                y += this.rectHeight;
            }
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillStyle = this.motifColors[this.segments[idSegment].rects[i].motif];
            this.rects.push({ idSegment, x, y, w, h });
            this.rects = unique(this.rects);
            this.ctx.fillRect(x, y, w, h);
        }

        function unique(arr) {
            return Array.from(new Set(arr));
        }
        console.log(this.rects);
    }
    setLineDescription() {
        let str = "";
        for (let i = 0; i < this.segments.length; i++) {
            str += i + 1 + '. ' + this.segments[i].name + ' ' + '\n'
        }
        document.getElementById('line_name').innerHTML = str;
    }

    selectColor() {
        for (let i = 0; i < this.segments.motifs.length; i++) {
            let motif = this.segments.motifs[i];
            let colorId = i % this.colors.length;
            this.motifColors[motif] = this.colors[colorId];
        }
    }
    getHeight() {
        if (this.segments) {
            return this.marginTop + this.stepLine * (this.segments.length + 1);
        }
    }
    focusOnRect() {
        for (let i = 0; i < this.rects.length; i++) {
            let mouseInRect = checkIntersected(this.coordinate, this.rects[i]);
            let mouseInsideRect = {};
            let focus = false;
            if (!focus && mouseInRect) {
                let titleCenter = this.rects[i].w / 2 + this.rects[i].x;
                let x = titleCenter - 80;
                let w = (titleCenter + 80) - x;
                let y = this.rects[i].y + 20;
                let h = 100;
                this.ctx.strokeRect(x, y, w, h);
                this.ctx.clearRect(x + 1, y, w - 1, h);
                focus = true;
                onFocusRect = {i, x, y, w, h};
            } 
            if (focus && onFocusRect) {
                this.ctx.clearRect(0, this.marginTop - this.rectHeight + this.stepLine * this.rects[i].idSegment, this.rightBorder + this.leftBorder, this.stepLine * 2);
                this.drawOneSegment(this.rects[i].idSegment);
                this.drawOneSegment(this.rects[i].idSegment + 1);
                focus = false;
            }
        }

        function checkIntersected(point, rect, margin = 5) {
            let intersectedByX = point.x >= rect.x - margin &&
                point.x < rect.x + rect.w + margin;

            let intersectedByY = point.y >= rect.y - margin &&
                point.y < rect.y + rect.h + margin;

            return intersectedByX && intersectedByY;
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

}
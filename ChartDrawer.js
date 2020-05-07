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
        this.focus = false;
        this.myRect;
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
        this.setRects();
        this.selectColor();
        document.getElementById('headerCanvas').style.display = 'block';
        for (let i = 0; i < this.segments.length; i++) {
            this.drawOneSegment(i);
        }
    }

    drawOneSegment(idSegment) {
        let ctx = this.ctx;
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.beginPath();
        ctx.moveTo(this.leftBorder, this.marginTop + this.stepLine * idSegment);
        ctx.lineTo(this.rightBorder, this.marginTop + this.stepLine * idSegment);
        ctx.stroke();

        let rectsSegment = this.rects.filter(function (item) {
            if (item.idSegment == idSegment) {
                return item;
            }
        });

        for (let i = 0; i < rectsSegment.length; i++) {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = this.motifColors[rectsSegment[i].motif];
            ctx.fillRect(rectsSegment[i].x, rectsSegment[i].y, rectsSegment[i].w, rectsSegment[i].h);
        }
    }

    setRects() {
        let segments = this.segments;

        for (let idSegment = 0; idSegment < segments.length; idSegment++) {
            let { rects, sequence } = segments[idSegment];

            for (let j = 0; j < rects.length; j++) {
                let { start, end, motif, complementary } = rects[j];
                let long = (this.rightBorder - this.leftBorder) / sequence.length;
                let x = Math.ceil(start * long + this.leftBorder);
                let w = Math.floor((end * long + this.leftBorder) - x);
                let h = this.rectHeight;
                let y = this.marginTop - this.rectHeight + this.stepLine * idSegment;

                w = Math.max(w, this.minSizeRect);

                if (complementary != 1) {
                    y += this.rectHeight;
                }

                this.rects.push({ idSegment, motif, x, y, w, h });
            }
        }
    }

    setLineDescription() {
        let segments = this.segments;
        let str = "";

        for (let i = 0; i < segments.length; i++) {
            str += i + 1 + '. ' + segments[i].name + ' ' + '\n';
        }

        document.getElementById('line_name').innerHTML = str;
    }

    selectColor() {
        let motifs = this.segments.motifs;
        for (let i = 0; i < motifs.length; i++) {
            let motif = motifs[i];
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
        this.focus = false;
        for (let i = 0; i < this.rects.length; i++) {
            let mouseInRect = checkIntersected(this.coordinate, this.rects[i]);
            if (!this.focus && mouseInRect) {
                let titleCenter = this.rects[i].w / 2 + this.rects[i].x;
                let x = titleCenter - 80;
                let w = (titleCenter + 80) - x;
                let y = this.rects[i].y + 20;
                let h = 100;
                this.ctx.strokeRect(this.rects[i].x, this.rects[i].y, this.rects[i].w, this.rects[i].h);
                this.ctx.fillStyle = this.motifColors[this.rects[i].motif];
                this.ctx.fillRect(this.rects[i].x, this.rects[i].y, this.rects[i].w, this.rects[i].h);
                this.ctx.strokeRect(x, y, w, h);
                this.ctx.clearRect(x + 1, y, w - 1, h);
                this.myRect = this.rects[i];
                console.log(this.myRect);
                this.focus = true;
            }
            if (this.focus && this.coordinate.x + 5 < this.myRect.x || this.coordinate.x - 15 > this.myRect.w + this.myRect.x
                || this.coordinate.y + 5 < this.myRect.y || this.coordinate.y - 5 > this.myRect.h + this.myRect.y) {
                this.ctx.clearRect(0, this.marginTop - this.rectHeight + this.stepLine * this.rects[i].idSegment, this.rightBorder + this.leftBorder, this.stepLine * 1);
                this.drawOneSegment(this.rects[i].idSegment);
                this.drawOneSegment(this.rects[i].idSegment + 1);
                this.focus = false;
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
        let occurences = inputData.motifs[i].occurences;

        for (let j = 0; j < occurences.length; j++) {
            let ranges = occurences[j].ranges;

            for (let k = 0; k < ranges.length; k++) {
                //let {motifs, sequenceName} = inputData.motifs[i].occurences[j].ranges[k];

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
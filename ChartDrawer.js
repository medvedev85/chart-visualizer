"use strict"
class ChartDrawer {
    constructor(params) {
        const self = this;
        this.rectCluster = 5;
        this.canvas = document.getElementById(params.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.params = params;
        this.rectHeight = params.stepLine / this.rectCluster++;
        this.coordinate = {};
        this.motifColors = {};
        this.clean = false;

        this.canvas.onmousemove = function (e) {
            self.coordinate.x = e.offsetX;
            self.coordinate.y = e.offsetY;
            self.focusOnSegments();
        }
    }

    draw(idSegment) {
        let { lineWidth, leftBorder, visibleLines, segments } = this.params;
        this.catalogue = [];
        this.motifsOnPage = [];
        this.currentPage = idSegment;
        let rightBorder = lineWidth + leftBorder;
        let end = idSegment + visibleLines;
        let turn = 0;
        let filledLines = segments.filledLines;
        this.canvas.width = leftBorder + rightBorder;
        this.canvas.height = this.getHeight();

        this.selectColor();

        document.getElementById('headerCanvas').style.display = 'block';

        if (this.clean) {
            for (; idSegment < end; idSegment++, turn++) {
                this.catalogue.push(filledLines[idSegment]);
                this.drawOneSegment(filledLines[idSegment], turn);
            }
        } else {
            for (; idSegment < end; idSegment++, turn++) {
                this.catalogue.push(idSegment);
                this.drawOneSegment(idSegment, turn);
            }
        }
    }

    drawOneSegment(idSegment, turn) {
        let { baseColor, leftBorder, lineWidth, marginTop, stepLine } = this.params;
        let { rects, sequence, complementary_sequence } = this.params.segments[idSegment];
        let rightBorder = lineWidth + leftBorder;
        let ctx = this.ctx;

        this.setLineDescription();

        this.breakRects(idSegment);

        this.ctx.translate(0.5, 0.5);

        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(leftBorder, marginTop + stepLine * turn);
        ctx.lineTo(rightBorder, marginTop + stepLine * turn);
        ctx.stroke();

        for (let i = 0; i < rects.length; i++) {
            let { start, end, motif, complementary, currentHeight } = rects[i];
            let long = (rightBorder - leftBorder) / sequence.length;
            let x = Math.ceil(start * long + leftBorder);
            let w = Math.floor((end * long + leftBorder) - x);
            let h = this.rectHeight + this.rectHeight * currentHeight * 0.5;
            let y = (complementary == 1) ? marginTop - this.rectHeight + stepLine * turn : marginTop - h + stepLine * turn;

            if (complementary == 1) {
                y += this.rectHeight;
            }

            rects[i].x = x;
            rects[i].w = w;
            rects[i].h = h;
            rects[i].y = y;

            let strSequence = (complementary == 1) ? complementary_sequence : sequence;

            let startMotif = (start > 3) ? strSequence.slice(start - 3, start) : //не лишнее!
                (start == 2) ? strSequence.slice(start - 2, start) :
                    (start == 1) ? strSequence.slice(start - 1, start) : "";

            let endMotif = (strSequence.length > end + 3) ? strSequence.slice(end, end + 3) :
                (strSequence.length - end == 2) ? strSequence.slice(strSequence.length - 2, strSequence) :
                    (strSequence.length - end == 1) ? strSequence.slice(strSequence.length - 1, strSequence) : "";

            strSequence = startMotif + "<mark>" + sequence.slice(start, end) + "</mark>" + endMotif;

            let rect = rects[i];
            this.motifsOnPage.push({ motif, rect });

            ctx.fillStyle = this.motifColors[motif];
            ctx.globalAlpha = 0.8;
            ctx.fillRect(x, y, w, h);
            ctx.globalAlpha = 1;
        }

        for (let j = 0; j < rects.length; j++) {
            let { x, y, w, h } = rects[j];

            ctx.strokeRect(x, y, w, h);
            ctx.lineWidth = 1;
        }

        this.ctx.translate(-0.5, -0.5);
    }

    breakRects(idSegment) {
        let { rects } = this.params.segments[idSegment];

        rects.sort((a, b) => a.start > b.start ? 1 : -1);

        for (let i = 0; i < rects.length; i++) {
            let { start, end, complementary } = rects[i];
            let currentHeight = 0;

            for (let j = 0; j < rects.length; j++) {
                if (start < rects[j].start && end >= rects[j].start && complementary == rects[j].complementary) {
                    currentHeight++;
                }
            }
            rects[i].currentHeight = currentHeight;
        }
    }

    cleaner(id) {
        let { marginTop, stepLine } = this.params;
        let segmentHeight = marginTop - stepLine / 2 + stepLine * id;

        this.ctx.clearRect(0, segmentHeight, this.canvas.width, stepLine);
    }

    setLineDescription() {
        let { segments } = this.params;
        let str = "";
        for (let i = 0; i < this.catalogue.length; i++) {
            let idSegment = this.catalogue[i];

            str += segments[idSegment].name + ' ' + '\n';
        }

        document.getElementById('lineName').innerHTML = str;
    }

    selectColor() {
        let { segments, colors } = this.params;
        let motifs = segments.motifs;

        for (let i = 0; i < motifs.length; i++) {
            let motif = motifs[i];
            let colorId = i % colors.length;

            this.motifColors[motif] = colors[colorId];
        }
    }

    getHeight() {
        let { segments, marginTop, stepLine, visibleLines } = this.params;

        if (segments) {
            return (segments.length < visibleLines) ? marginTop + stepLine * (segments.length) :
                marginTop + stepLine * visibleLines;
        }
    }

    focusOnRect(id) {
        this.focusRectList = [];
        let { segments, leftBorder, lineWidth, popUpSize } = this.params;
        let idSegment = this.catalogue[id];
        let rects = segments[idSegment].rects

        for (let i = 0; i < rects.length; i++) {

            let mouseInRect = checkIntersected(this.coordinate, rects[i]);

            if (mouseInRect) {
                this.focusRectList.push(rects[i]);
            }

            if (!mouseInRect) {
                this.cleaner(id);
                this.drawOneSegment(idSegment, id);
                document.getElementById('popUp').style.display = 'none';
            }
        }

        if (this.focusRectList.length) {
            let ctx = this.ctx;

            for (let i = 0; i < this.focusRectList.length; i++) {
                let { x, y, w, h, motif } = this.focusRectList[i];

                ctx.fillStyle = this.motifColors[motif];
                ctx.fillRect(x, y, w, h);
            }

            for (let i = 0; i < this.focusRectList.length; i++) {
                let { x, y, w, h } = this.focusRectList[i];

                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, w, h);
                ctx.lineWidth = 1;
            }
        }

        function checkIntersected(point, rect) {
            let intersectedByX = point.x >= rect.x &&
                point.x < rect.x + rect.w;

            let intersectedByY = point.y >= rect.y &&
                point.y < rect.y + rect.h;

            return intersectedByX && intersectedByY;
        }
    }

    focusOnSegments() {
        let { leftBorder, lineWidth, marginTop, stepLine } = this.params;
        let { x, y } = this.coordinate;

        for (let i = 0; i < this.catalogue.length; i++) {
            let _y = marginTop - stepLine / 2 + stepLine * i;

            let intersectedByX = x >= leftBorder &&
                x < leftBorder + lineWidth;

            let intersectedByY = y >= _y &&
                y < _y + stepLine;

            if (intersectedByX && intersectedByY) {
                this.focusOnRect(i);
            }
        }
    }
}

function parser(inputData, params) {
    let rects = [];
    let { motifs, sequences } = inputData;

    sequences.motifs = [];

    for (let i = 0; i < motifs.length; i++) {
        let { occurrences, motif, chi2 } = motifs[i];

        for (let j = 0; j < occurrences.length; j++) {
            let { ranges, complementary_ranges, sequence_name } = occurrences[j];
            let fullRanges = ranges ? ranges : complementary_ranges;
            fullRanges.sort((a, b) => a.start > b.start ? 1 : -1);

            for (let k = 0; k < fullRanges.length; k++) {
                fullRanges[k].complementary = ranges ? 1 : 0;
                fullRanges[k].motif = motif;
                fullRanges[k].chi2 = chi2;
                fullRanges[k].sequenceName = sequence_name;
                rects.push(fullRanges[k]);
            }
        }

        sequences.motifs.push(motifs[i].motif);
    }

    let filledLines = new Set();

    for (let i = 0; i < sequences.length; i++) {
        sequences[i].rects = [];

        for (let j = 0; j < rects.length; j++) {
            if (sequences[i].name == rects[j].sequenceName) {
                sequences[i].rects.push(rects[j]);
                filledLines.add(sequences[i].name);
            }
        }
    }
    sequences.filledLines = Array.from(filledLines);
    console.log(sequences);
    return params.segments = sequences;
}
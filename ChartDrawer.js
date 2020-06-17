"use strict"
class ChartDrawer {
    constructor(params) {
        const self = this;
        this.rectCluster = 7;
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
        let { oneLiterWidth, leftBorder, visibleLines, segments } = this.params;
        let { sequence } = this.params.segments[idSegment];
        let lineWidth = oneLiterWidth * sequence.length;
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
        let { baseColor, leftBorder, oneLiterWidth, marginTop, stepLine, neighbourhood } = this.params;
        let { rects, sequence, complementary_sequence } = this.params.segments[idSegment];
        let lineWidth = oneLiterWidth * sequence.length;
        let rightBorder = lineWidth + leftBorder;
        let ctx = this.ctx;

        this.setLineDescription();

        this.breakRects(idSegment);

        this.ctx.translate(0.5, 0.5);

        let a = ctx.measureText(sequence).width;
        console.log(a);

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
            let startMotif = strSequence.slice(Math.max(start - neighbourhood, 0), start);
            let endMotif = strSequence.slice(end, Math.min(strSequence.length, end + neighbourhood));

            rects[i].strSequence = startMotif + "<mark>" + sequence.slice(start, end) + "</mark>" + endMotif;

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
        this.showSegments(idSegment, turn);
        this.ctx.translate(-0.5, -0.5);
    }

    breakRects(idSegment) {
        let { rects } = this.params.segments[idSegment];

        rects.sort((a, b) => a.start >= b.start ? 1 : -1);

        for (let i = 0; i < rects.length; i++) {
            let { start, end, complementary } = rects[i];
            let currentHeight = 0;

            for (let j = 0; j < rects.length; j++) {
                if (start <= rects[j].start && end >= rects[j].start && complementary == rects[j].complementary) {
                    currentHeight++;
                }
            }
            rects[i].currentHeight = currentHeight;
        }
    }

    showSegments(idSegment, turn) {
        let { oneLiterWidth, baseColor, leftBorder, marginTop, stepLine } = this.params;
        let { sequence, complementary_sequence } = this.params.segments[idSegment];
        let maxWidth = sequence.length * oneLiterWidth;
        let ctx = this.ctx;

        ctx.fillStyle = baseColor;
        
        for (let i = 0; i < sequence.length; i++) {
            ctx.fillText(sequence[i], leftBorder + i * oneLiterWidth, marginTop + stepLine * turn);
            ctx.fillText(complementary_sequence[i], leftBorder + i * oneLiterWidth, 7 + marginTop + stepLine * turn);  
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

    showMotifs(motif) {
        let catalogue = this.catalogue;
        let ctx = this.ctx;

        for (let i = 0; i < catalogue.length; i++) {
            let idSegment = catalogue[i];
            let rects = this.params.segments[idSegment].rects;

            for (let j = 0; j < rects.length; j++) {
                let segmentMotif = rects[j].motif;

                if (motif == segmentMotif) {
                    let { x, y, w, h } = this.params.segments[idSegment].rects[j];
                    this.params.segments[idSegment].rects[j].motifOnFocus = true;

                    ctx.fillStyle = this.motifColors[motif];
                    ctx.fillRect(x, y, w, h);

                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, w, h);
                    ctx.lineWidth = 1;
                }
            }
        }
    }

    deleteShowMotifs() {
        let catalogue = this.catalogue;

        for (let i = 0; i < catalogue.length; i++) {
            let idSegment = catalogue[i];
            let rects = this.params.segments[idSegment].rects;

            for (let j = 0; j < rects.length; j++) {
                let motifOnFocus = (this.params.segments[idSegment].rects[j].motifOnFocus) ?
                    this.params.segments[idSegment].rects[j].motifOnFocus : false;

                if (motifOnFocus) {
                    this.cleaner(i);
                    this.drawOneSegment(idSegment, i);
                }
            }
        }
    }

    drawPopUp() {
        const indent = 20;
        let rectList = this.focusRectList;
        let { x, y } = this.coordinate;
        let popUpSize = this.params.popUpSize;
        let motif = rectList.map(rect => rect.motif);
        let chi2 = rectList.map(rect => rect.chi2);
        let strSequence = rectList.map(rect => rect.strSequence);
        let element = document.getElementById('popUp');
        let fontLeft = x - popUpSize + 'px';
        let fontTop = indent + y + 'px';
        let str = '';

        element.style.width = popUpSize * 2 + 'px';

        for (let i = 0; i < motif.length; i++) {
            let endStr = (i < motif.length) ? '<br>' : '';
            str = str + '<b>' + motif[i] + '</b>' + '<br>' + strSequence[i] + '<br>' + 'chi2:' + chi2[i] + endStr;
        }

        element.style.display = 'block';
        element.style.marginTop = fontTop;
        element.style.marginLeft = fontLeft;

        element.innerHTML = str;
    }

    focusOnRect(id) {
        this.focusRectList = [];
        let { segments } = this.params;
        let idSegment = this.catalogue[id];
        let rects = segments[idSegment].rects;
        let ctx = this.ctx;

        for (let i = 0; i < rects.length; i++) {

            let mouseInRect = checkIntersected(this.coordinate, rects[i]);

            if (mouseInRect) {
                this.focusRectList.push(rects[i]);
                rects[i].focus = true;
                this.drawPopUp();
            }

            if (!mouseInRect && rects[i].focus) {
                this.cleaner(id);
                this.drawOneSegment(idSegment, id);
                document.getElementById('popUp').style.display = 'none';
                console.log("jk");
                rects[i].focus = false;
                this.deleteShowMotifs();
            }
        }

        if (this.focusRectList.length) {
            for (let i = 0; i < this.focusRectList.length; i++) {
                let { x, y, w, h, motif } = this.focusRectList[i];

                ctx.fillStyle = this.motifColors[motif];
                ctx.fillRect(x, y, w, h);

                this.showMotifs(motif);
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
        let { leftBorder, oneLiterWidth, marginTop, stepLine } = this.params;
        let { x, y } = this.coordinate;

        for (let i = 0; i < this.catalogue.length; i++) {
            let idSegment = this.catalogue[i];
            let { sequence } = this.params.segments[idSegment];
            let lineWidth = oneLiterWidth * sequence.length;

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

        sequences.motifs.push(motifs[i].motif);

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
    return params.segments = sequences;
}
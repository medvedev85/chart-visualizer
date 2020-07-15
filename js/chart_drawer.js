"use strict"
class ChartDrawer {
    constructor(params) {
        const self = this;
        this.rectCluster = 10;
        this.firstLayer = document.getElementById(params.firstLayer);
        this.secondLayer = document.getElementById(params.secondLayer);
        this.thirdLayer = document.getElementById(params.thirdLayer);
        this.firstCtx = this.firstLayer.getContext("2d");
        this.secondCtx = this.secondLayer.getContext("2d");
        this.thirdCtx = this.thirdLayer.getContext("2d");
        this.params = params;
        this.rectHeight = params.stepLine / this.rectCluster++;
        this.coordinate = {};
        this.motifColors = {};
        this.clean = false;

        window.onmousemove = function (e) {
            self.coordinate.x = e.offsetX;
            self.coordinate.y = e.offsetY;
            self.focusOnSegments();
        }
    }

    draw(idSegment) {
        let { oneLetterWidth, leftBorder, visibleLines, segments } = this.params;
        let { sequence } = this.params.segments[idSegment];
        let lineWidth = oneLetterWidth * sequence.length;
        this.catalogue = [];
        this.motifsOnPage = [];
        this.currentPage = idSegment;
        let rightBorder = lineWidth + leftBorder;
        let end = idSegment + visibleLines;
        let turn = 0;
        let filledLines = segments.filledLines;
        this.firstLayer.width = leftBorder + rightBorder;
        this.firstLayer.height = this.getHeight();
        this.secondLayer.width = leftBorder + rightBorder;
        this.secondLayer.height = this.getHeight();
        this.thirdLayer.width = leftBorder + rightBorder;
        this.thirdLayer.height = this.getHeight();

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
        let { baseColor, leftBorder, oneLetterWidth, marginTop, stepLine, neighbourhood } = this.params;
        let { rects, sequence, complementary_sequence } = this.params.segments[idSegment];
        let lineWidth = oneLetterWidth * sequence.length;
        let rightBorder = lineWidth + leftBorder;
        let firstCtx = this.firstCtx;

        this.setLineDescription();

        this.breakRects(idSegment);

        this.firstCtx.translate(0.5, 0.5);

        firstCtx.fillStyle = baseColor;
        firstCtx.beginPath();
        firstCtx.moveTo(leftBorder, marginTop + stepLine * turn);
        firstCtx.lineTo(rightBorder, marginTop + stepLine * turn);
        firstCtx.stroke();

        for (let i = 0; i < rects.length; i++) {
            let { start, end, motif, complementary, currentHeight } = rects[i];
            let long = (rightBorder - leftBorder) / sequence.length;
            let x = Math.ceil(start * long + leftBorder) - 0.6;
            let w = Math.floor((end * long + leftBorder) - x);
            let h = this.rectHeight + 4 + this.rectHeight * currentHeight * 0.7;
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

            rects[i].strSequence = '<span style="color: ' + this.motifColors[motif] + '"><b>' + motif + '</b></span>' + '<br>' + startMotif + '<span style="color: ' + this.motifColors[motif] + '"><b>' + sequence.slice(start, end) + '</b></span>' + endMotif;

            let rect = rects[i];
            this.motifsOnPage.push({ motif, rect });

            firstCtx.fillStyle = this.motifColors[motif];
            firstCtx.globalAlpha = 0.8;
            firstCtx.fillRect(x, y, w, h);
            firstCtx.globalAlpha = 1;

        }

        for (let j = 0; j < rects.length; j++) {
            let { x, y, w, h } = rects[j];

            firstCtx.strokeRect(x, y, w, h);
            firstCtx.lineWidth = 1;
        }
        this.firstCtx.translate(-0.5, -0.5);
        this.showSegments(idSegment, turn, false);
        this.showSegments(idSegment, turn, true);
    }

    breakRects(idSegment) {
        let { rects } = this.params.segments[idSegment];

        rects.sort((a, b) => a.start >= b.start ? 1 : -1);

        for (let i = 0; i < rects.length; i++) {
            let { start, end, complementary } = rects[i];
            let currentHeight = 0;
            let j = i + 1

            rects[i].currentHeight = 0;

            for (; j < rects.length; j++) {
                if (start <= rects[j].start && end >= rects[j].start) {
                    if (complementary == rects[j].complementary) {
                        currentHeight++;
                    } else {
                        break;
                    }
                    rects[j].currentHeight = currentHeight;
                } else {
                    break;
                }
            }
            i = j;
        }
        rects.sort((a, b) => a.start <= b.start ? 1 : -1);
    }

    chooseShowSegments(checkbox, checkboxComplementary) {
        let thirdCtx = this.thirdCtx;
        let catalogue = this.catalogue;
        thirdCtx.clearRect(0, 0, this.thirdLayer.width, this.thirdLayer.height);

        if (checkbox) {
            for (let i = 0; i < catalogue.length; i++) {
                let idSegment = catalogue[i];

                this.showSegments(idSegment, i, false);
            }
        }

        if (checkboxComplementary) {
            for (let i = 0; i < catalogue.length; i++) {
                let idSegment = catalogue[i];

                this.showSegments(idSegment, i, true);
            }
        }
    }

    showSegments(idSegment, turn, complementary) {
        let { oneLetterWidth, baseColor, leftBorder, marginTop, stepLine } = this.params;
        let { sequence, complementary_sequence } = this.params.segments[idSegment];

        let thirdCtx = this.thirdCtx;

        thirdCtx.font = '9px vcr-osd-mono';
        thirdCtx.shadowBlur = 0.05;
        thirdCtx.shadowColor = baseColor;
        thirdCtx.fillStyle = baseColor;

        for (let i = 0; i < sequence.length; i++) {
            if (complementary) {
                thirdCtx.fillText(complementary_sequence[i], leftBorder + i * oneLetterWidth, 9 + marginTop + stepLine * turn);
            } else {
                thirdCtx.fillText(sequence[i], leftBorder + i * oneLetterWidth, marginTop - 1 + stepLine * turn);
            }
        }
    }

    deleteSegments() {
        this.thirdCtx.clearRect(0, 0, this.thirdLayer.width, this.thirdLayer.height);
    }

    cleaner(id) {
        let { marginTop, stepLine } = this.params;
        let segmentHeight = marginTop - stepLine / 2 + stepLine * id;

        this.secondCtx.clearRect(0, segmentHeight, this.secondLayer.width, stepLine);
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
        let secondCtx = this.secondCtx;

        for (let i = 0; i < catalogue.length; i++) {
            let idSegment = catalogue[i];
            let rects = this.params.segments[idSegment].rects;

            for (let j = 0; j < rects.length; j++) {
                let segmentMotif = rects[j].motif;

                if (motif == segmentMotif) {
                    let { x, y, w, h } = this.params.segments[idSegment].rects[j];
                    this.params.segments[idSegment].rects[j].motifOnFocus = true;

                    secondCtx.fillStyle = this.motifColors[motif];
                    secondCtx.fillRect(x, y, w, h);

                    secondCtx.lineWidth = 2;
                    secondCtx.strokeRect(x, y, w, h);
                    secondCtx.lineWidth = 1;
                }
            }
        }
    }

    deleteShowMotifs() {
        this.secondCtx.clearRect(0, 0, this.secondLayer.width, this.secondLayer.height);
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
            let endStr = (i != motif.length - 1) ? '<hr>' : '';

            str = str + strSequence[i] + '<br>' + 'chi2: ' + chi2[i] + endStr;
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
        let secondCtx = this.secondCtx;

        for (let i = 0; i < rects.length; i++) {

            let mouseInRect = checkIntersected(this.coordinate, rects[i]);

            if (mouseInRect) {
                this.focusRectList.push(rects[i]);
                rects[i].focus = true;
                this.drawPopUp();
            }

            if (!mouseInRect && rects[i].focus) {
                this.cleaner(id);
                document.getElementById('popUp').style.display = 'none';
                rects[i].focus = false;
                this.deleteShowMotifs();
            }
        }

        if (this.focusRectList.length) {
            for (let i = 0; i < this.focusRectList.length; i++) {
                let { x, y, w, h, motif } = this.focusRectList[i];

                secondCtx.fillStyle = this.motifColors[motif];
                secondCtx.fillRect(x, y, w, h);

                if (this.focusRectList.length <= 1) {
                    this.showMotifs(motif);
                }
            }

            for (let i = 0; i < this.focusRectList.length; i++) {
                let { x, y, w, h } = this.focusRectList[i];

                secondCtx.lineWidth = 2;
                secondCtx.strokeRect(x, y, w, h);
                secondCtx.lineWidth = 1;
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
        let { leftBorder, oneLetterWidth, marginTop, stepLine } = this.params;
        let { x, y } = this.coordinate;

        for (let i = 0; i < this.catalogue.length; i++) {
            let idSegment = this.catalogue[i];
            let { sequence } = this.params.segments[idSegment];
            let lineWidth = oneLetterWidth * sequence.length;

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
    params.visibleLines = Math.min(params.visibleLines, sequences.length - 1);

    for (let i = 0; i < motifs.length; i++) {
        let { occurrences, motif, chi2 } = motifs[i];

        sequences.motifs.push(motifs[i].motif);

        for (let j = 0; j < occurrences.length; j++) {
            let { ranges, complementary_ranges, sequence_name } = occurrences[j];

            let fullRanges = ranges ? ranges : complementary_ranges;
            fullRanges.sort((a, b) => a.start > b.start ? 1 : -1);

            for (let k = 0; k < fullRanges.length; k++) {

                if (!fullRanges.length) {
                    fullRanges.splise(k, 1);
                }

                fullRanges[k].complementary = ranges ? 0 : 1;
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
                filledLines.add(i);
            }
        }
    }
    sequences.filledLines = Array.from(filledLines);
    return params.segments = sequences;
}
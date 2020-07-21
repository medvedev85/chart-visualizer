"use strict"
class ChartDrawer {
    constructor(params) {
        const self = this;
        this.params = params;
        this.coordinate = {};
        this.motifColors = {};
        this.clean = false;

        window.onmousemove = function (e) {
            self.coordinate.x = e.offsetX;
            self.coordinate.y = e.offsetY;
            self.focusOnSegments();
        }
    }

    get layers() {
        let { firstLayer, secondLayer, thirdLayer } = this.params;

        return {
            firstLayer: document.getElementById(firstLayer),
            secondLayer: document.getElementById(secondLayer),
            thirdLayer: document.getElementById(thirdLayer)
        };
    }

    get contexts() {
        let { firstLayer, secondLayer, thirdLayer } = this.layers;

        return {
            firstCtx: firstLayer.getContext("2d"),
            secondCtx: secondLayer.getContext("2d"),
            thirdCtx: thirdLayer.getContext("2d")
        };
    }

    draw(idSegment) {
        let { oneLetterWidth, leftBorder, visibleLines, segments } = this.params;
        let { sequence } = this.params.segments[idSegment];
        let lineWidth = oneLetterWidth * sequence.length;
        let rightBorder = lineWidth + leftBorder;
        let end = idSegment + visibleLines;
        let turn = 0;
        let filledLines = segments.filledLines;

        this.catalogue = [];
        this.motifsOnPage = [];
        this.currentPage = idSegment;

        this.layers.firstLayer.width = leftBorder + rightBorder;
        this.layers.firstLayer.height = this.getHeight();
        this.layers.secondLayer.width = leftBorder + rightBorder;
        this.layers.secondLayer.height = this.getHeight();
        this.layers.thirdLayer.width = leftBorder + rightBorder;
        this.layers.thirdLayer.height = this.getHeight();

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
        let { baseColor, leftBorder, oneLetterWidth, marginTop, stepLine } = this.params;
        let { rects, rectsCompl, sequence } = this.params.segments[idSegment];
        let lineWidth = oneLetterWidth * sequence.length;
        let rightBorder = lineWidth + leftBorder;
        let firstCtx = this.contexts.firstCtx;

        this.breakRects(rects);
        this.breakRects(rectsCompl);

        this.createNameContainer(idSegment, turn, stepLine);

        this.contexts.firstCtx.translate(0.5, 0.5);

        firstCtx.fillStyle = baseColor;
        firstCtx.beginPath();
        firstCtx.moveTo(leftBorder, marginTop + stepLine * turn);
        firstCtx.lineTo(rightBorder, marginTop + stepLine * turn);
        firstCtx.stroke();

        this.rectsDraw(rects, idSegment, turn);
        this.rectsDraw(rectsCompl, idSegment, turn);

        this.contexts.firstCtx.translate(-0.5, -0.5);
        this.showSegments(idSegment, turn, false);
        //this.showSegments(idSegment, turn, true);
    }

    createNameContainer(idSegment, turn, heightStep) {
        const FIRST_HEIGHT = 70;
        let { segments } = this.params;
        let oldDiv = document.getElementById(`${idSegment}`);
        let div = document.createElement("segment");
        let canvasContainer = document.getElementById("canvasContainer");
        let height = FIRST_HEIGHT + turn * heightStep;

        div.style.position = 'absolute';
        div.style.marginTop = turn == 0 ? FIRST_HEIGHT + 'px' : height + 'px';
        div.id = idSegment;

        if(oldDiv) {
            oldDiv.remove();
        }

        div.innerHTML = segments[idSegment].name;
        canvasContainer.append(div);
    }

    rectsDraw(rects, idSegment, turn) {
        const FIT_LETTER = 0.6;
        const RECT_HEIGHT = 10;
        const OUTGROWTH = 3;
        let { leftBorder, oneLetterWidth, marginTop, stepLine, neighbourhood } = this.params;
        let { sequence, complementary_sequence } = this.params.segments[idSegment];
        let lineWidth = oneLetterWidth * sequence.length;
        let rightBorder = lineWidth + leftBorder;
        let firstCtx = this.contexts.firstCtx;

        for (let i = 0; i < rects.length; i++) {
            let { start, end, motif, complementary, currentHeight } = rects[i];
            let long = (rightBorder - leftBorder) / sequence.length;
            let x = Math.ceil(start * long + leftBorder) - FIT_LETTER;
            let w = Math.floor((end * long + leftBorder) - x);
            let h = RECT_HEIGHT + currentHeight * OUTGROWTH;
            let y = (complementary == 1) ? marginTop + stepLine * turn : marginTop - h + stepLine * turn;

            rects[i].x = x;
            rects[i].w = w;
            rects[i].h = h;
            rects[i].y = y;

            let strSequence = (complementary == 1) ? complementary_sequence : sequence;
            let startMotif = strSequence.slice(Math.max(start - neighbourhood, 0), start);
            let endMotif = strSequence.slice(end, Math.min(strSequence.length, end + neighbourhood));

            rects[i].strSequence = '<span style="color: ' + this.motifColors[motif] + '"><b>' + motif + '</b></span>' + '<br>' + startMotif + '<span style="color: ' + this.motifColors[motif] + '"><b>' + strSequence.slice(start, end) + '</b></span>' + endMotif;

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
    }

    breakRects(rects) {
        const DISCHARGE = 9;
        let currentHeight = 0;

        rects.sort((a, b) => a.start >= b.start ? 1 : -1);

        for (let i = 0; i < rects.length - 1; i++) {
            let { start, end } = rects[i];

            rects[i].currentHeight = currentHeight;

            if (start <= rects[i + 1].start && end >= rects[i + 1].start && currentHeight < DISCHARGE) {
                currentHeight++;
                rects[i + 1].currentHeight = currentHeight;
            } else {
                currentHeight = 0;
            }
        }

        rects.sort((a, b) => a.start <= b.start ? 1 : -1);
    }

    chooseShowSegments(checkbox, checkboxComplementary) {
        let thirdCtx = this.contexts.thirdCtx;
        let catalogue = this.catalogue;
        thirdCtx.clearRect(0, 0, this.layers.thirdLayer.width, this.layers.thirdLayer.height);

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
        const DISPLACEMENT = 9;
        let { oneLetterWidth, baseColor, leftBorder, marginTop, stepLine } = this.params;
        let { sequence, complementary_sequence } = this.params.segments[idSegment];

        let thirdCtx = this.contexts.thirdCtx;

        thirdCtx.font = '9px vcr-osd-mono';
        thirdCtx.shadowBlur = 0.05;
        thirdCtx.shadowColor = baseColor;
        thirdCtx.fillStyle = baseColor;

        for (let i = 0; i < sequence.length; i++) {
            if (complementary && complementary_sequence) {
                thirdCtx.fillText(complementary_sequence[i], leftBorder + i * oneLetterWidth, DISPLACEMENT + marginTop + stepLine * turn);
            } else {
                thirdCtx.fillText(sequence[i], leftBorder + i * oneLetterWidth, marginTop - 1 + stepLine * turn);
            }
        }
    }

    deleteSegments() {
        this.contexts.thirdCtx.clearRect(0, 0, this.layers.thirdLayer.width, this.layers.thirdLayer.height);
    }

    cleaner(id) {
        let { marginTop, stepLine } = this.params;
        let segmentHeight = marginTop - stepLine / 2 + stepLine * id;

        this.contexts.secondCtx.clearRect(0, segmentHeight, this.layers.secondLayer.width, stepLine);
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
        let secondCtx = this.contexts.secondCtx;

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
        this.contexts.secondCtx.clearRect(0, 0, this.layers.secondLayer.width, this.layers.secondLayer.height);
    }

    drawPopUp() {
        const INDENT = 20;
        let rectList = this.focusRectList;
        let { x, y } = this.coordinate;
        let popUpSize = this.params.popUpSize;
        let motif = rectList.map(rect => rect.motif);
        let chi2 = rectList.map(rect => rect.chi2);
        let strSequence = rectList.map(rect => rect.strSequence);
        let element = document.getElementById('popUp');
        let fontLeft = x - popUpSize + 'px';
        let fontTop = INDENT + y + 'px';
        let str = '';

        element.style.width = popUpSize * 2 + 'px';

        for (let i = 0; i < motif.length; i++) {
            let endStr = (i != motif.length - 1) ? '<hr>' : '';

            str = str + strSequence[i] + '<br>' + '&#967;' + '&#178;' + ': ' + chi2[i] + endStr;
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
        let rects = segments[idSegment].rects.concat(segments[idSegment].rectsCompl);
        let secondCtx = this.contexts.secondCtx;

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
            let fullRanges = [];

            if (ranges && complementary_ranges) {
                fullRanges = ranges.concat(complementary_ranges);
            } else if (ranges) {
                fullRanges = ranges;
            } else if (complementary_ranges) {
                fullRanges = complementary_ranges;
            }

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
        sequences[i].rectsCompl = [];

        for (let j = 0; j < rects.length; j++) {
            if (sequences[i].name == rects[j].sequenceName && rects[j].complementary == 0) {
                sequences[i].rects.push(rects[j]);
                filledLines.add(i);
            } else if (sequences[i].name == rects[j].sequenceName && rects[j].complementary == 1) {
                sequences[i].rectsCompl.push(rects[j]);
                filledLines.add(i);
            }
        }
    }
    sequences.filledLines = Array.from(filledLines);
    return params.segments = sequences;
}
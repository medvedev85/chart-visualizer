class ChartDrawer {
    constructor(params) {
        const self = this;
        this.canvas = document.getElementById(params.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.params = params;
        this.coordinate = {};
        this.rects = [];
        this.motifColors = {};
        this.canvas.onmousemove = function (e) {
            self.coordinate.x = e.offsetX;
            self.coordinate.y = e.offsetY;
            self.focusOnRect();
        }
    }

    draw() {
        let { lineWidth, leftBorder, segments } = this.params;
        let rightBorder = lineWidth + leftBorder;

        this.canvas.width = leftBorder + rightBorder;
        this.canvas.height = this.getHeight();
        this.setLineDescription();
        this.setRects();
        this.selectColor();
        document.getElementById('headerCanvas').style.display = 'block';
        for (let i = 0; i < segments.length; i++) {
            this.drawOneSegment(i);
        }
    }

    drawOneSegment(idSegment) {
        let { baseColor, leftBorder, lineWidth, marginTop, stepLine } = this.params;
        let rightBorder = lineWidth + leftBorder;
        let ctx = this.ctx;

        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(leftBorder, marginTop + stepLine * idSegment);
        ctx.lineTo(rightBorder, marginTop + stepLine * idSegment);
        ctx.stroke();

        let rectsSegment = this.rects.filter(function (item) {
            if (item.idSegment == idSegment) {
                return item;
            }
        });

        for (let i = 0; i < rectsSegment.length; i++) {
            let { motif, x, y, w, h } = rectsSegment[i];
            ctx.fillStyle = this.motifColors[motif];
            ctx.fillRect(x, y, w, h);
        }
    }

    setRects() {
        let { segments, lineWidth, leftBorder, rectHeight, marginTop, stepLine, minSizeRect } = this.params;
        let rightBorder = lineWidth + leftBorder;

        for (let idSegment = 0; idSegment < segments.length; idSegment++) {
            let { rects, sequence } = segments[idSegment];

            for (let j = 0; j < rects.length; j++) {
                let { start, end, motif, complementary } = rects[j];
                let long = (rightBorder - leftBorder) / sequence.length;
                let x = Math.ceil(start * long + leftBorder);
                let w = Math.floor((end * long + leftBorder) - x);
                let h = rectHeight;
                let y = marginTop - rectHeight + stepLine * idSegment;
                let focus = false;

                w = Math.max(w, minSizeRect);

                if (complementary != 1) {
                    y += rectHeight;
                }

                this.rects.push({ idSegment, motif, x, y, w, h, focus });
            }
        }

        sortByLong(this.rects);

        function sortByLong(arr) {
            arr.sort((a, b) => a.w < b.w ? 1 : -1);
        }
    }

    setPopUpText(rect) {
        let {y, titleCenter, h, w} = rect;
        let popUpSize = this.params.popUpSize;
        let element = document.getElementById('popUp');
        let fontLeft = titleCenter - popUpSize + 'px';
        let fontTop = y + h + 'px';

        element.innerHTML = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco...";
        element.style.display = 'block';
        element.style.marginTop = fontTop;
        element.style.marginLeft = fontLeft;
        element.style.width = popUpSize * 2 + 'px';
    }

    setLineDescription() {
        let segments = this.params.segments;
        let str = "";

        for (let idSegment = 0; idSegment < segments.length; idSegment++) {
            str += idSegment + 1 + '. ' + segments[idSegment].name + ' ' + '\n';
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
        let { segments, marginTop, stepLine } = this.params;

        if (segments) {
            return marginTop + stepLine * (segments.length + 1.7);
        }
    }

    drawPopUp(rect) {
        let { segments, lineWidth, marginTop, rectHeight, stepLine, leftBorder } = this.params;
        let { popUpX, popUpY, popUpW, popUpH, x, y, w, h, idSegment, motif } = rect;
        let rightBorder = lineWidth + leftBorder;
        let ctx = this.ctx;

        ctx.clearRect(0, marginTop - 5 - rectHeight + stepLine * idSegment, rightBorder + leftBorder, stepLine * 3);
        for (let j = 0; j < 3; j++) {
            if (idSegment + j < segments.length) {
                this.drawOneSegment(idSegment + j);
            }
        }

        if (motif.length > 1) {
            let shift = 3;

            ctx.clearRect(x, y, w, h);

            ctx.strokeRect(x + shift, y + shift, w, h);
            ctx.fillStyle = this.motifColors[motif[0]];
            ctx.fillRect(x + shift, y + shift, w, h);

            for (let i = 1; i < motif.length; i++) {
                ctx.strokeRect(x - shift, y - shift, w, h);
                ctx.fillStyle = this.motifColors[motif[i]];
                ctx.fillRect(x - shift, y - shift, w, h);
            }

        } else {
            ctx.strokeRect(x, y, w, h);
            ctx.fillStyle = this.motifColors[motif];
            ctx.fillRect(x, y, w, h);
        }

        ctx.strokeRect(popUpX, popUpY, popUpW, popUpH);
        ctx.clearRect(popUpX + 1, popUpY, popUpW - 1, popUpH);

        this.setPopUpText(rect);
    }

    mergeRects() {
        let { popUpSize, stepLine } = this.params;
        let rectList = this.focusRectList;
        let completeRect = {};

        rectList.sort((a, b) => a.x < b.x ? 1 : -1);
        completeRect.x = rectList[0].x;

        rectList.sort((a, b) => a.x + a.w > b.x + b.w ? 1 : -1);
        completeRect.w = rectList[0].x + rectList[0].w - completeRect.x;

        completeRect.y = rectList[0].y;
        completeRect.h = rectList[0].h;

        completeRect.idSegment = rectList[0].idSegment;
        completeRect.complementary = rectList[0].complementary;

        completeRect.motif = rectList.map(rect => rect.motif);

        let { x, w, y } = completeRect;
        let titleCenter = w / 2 + x;

        completeRect.popUpX = Math.floor(titleCenter - popUpSize);
        completeRect.popUpW = Math.floor((titleCenter + popUpSize) - completeRect.popUpX);
        completeRect.popUpY = Math.floor(y + stepLine / 2);
        completeRect.popUpH = stepLine * 2;
        completeRect.titleCenter = titleCenter;

        this.drawPopUp(completeRect);
    }

    focusOnRect() {
        this.focusRectList = [];
        let { segments, lineWidth, marginTop, rectHeight, stepLine, leftBorder } = this.params;
        let rightBorder = lineWidth + leftBorder;
        let ctx = this.ctx;

        for (let i = 0; i < this.rects.length; i++) {
            let { idSegment, focus } = this.rects[i];
            let mouseInRect = checkIntersected(this.coordinate, this.rects[i]);

            if (mouseInRect) {
                this.focusRectList.push(this.rects[i]);
                this.rects[i].focus = true;

            }

            if (focus && !mouseInRect) {
                ctx.clearRect(0, marginTop - 5 - rectHeight + stepLine * idSegment, rightBorder + leftBorder, stepLine * 3);
                for (let j = 0; j < 3; j++) {
                    if (idSegment + j < segments.length) {
                        this.drawOneSegment(idSegment + j);
                    }
                }
                document.getElementById('popUp').style.display = 'none';

                this.rects[i].focus = false;
            }
        }

        if (this.focusRectList.length) {
            this.mergeRects();
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
    let { motifs, sequences } = inputData;

    sequences.motifs = [];

    for (let i = 0; i < motifs.length; i++) {
        let occurences = motifs[i].occurences;

        for (let j = 0; j < occurences.length; j++) {
            let ranges = occurences[j].ranges;

            for (let k = 0; k < ranges.length; k++) {
                ranges[k].motif = motifs[i].motif;
                ranges[k].sequenceName = motifs[i].occurences[j].sequence_name;
                rects.push(ranges[k]);
            }
        }

        sequences.motifs.push(motifs[i].motif);
    }

    for (let i = 0; i < sequences.length; i++) {
        sequences[i].rects = [];

        for (let j = 0; j < rects.length; j++) {
            if (sequences[i].name == rects[j].sequenceName) {
                sequences[i].rects.push(rects[j]);
            }
        }
    }

    return params.segments = sequences;
}
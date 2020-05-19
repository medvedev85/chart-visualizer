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
            let { rects, sequence, complementary_sequence } = segments[idSegment];

            for (let j = 0; j < rects.length; j++) {
                let { start, end, motif, complementary, p_value } = rects[j];
                let long = (rightBorder - leftBorder) / sequence.length;
                let x = Math.ceil(start * long + leftBorder);
                let w = Math.floor((end * long + leftBorder) - x);
                let h = rectHeight;
                let y = marginTop - rectHeight + stepLine * idSegment;
                let focus = false;

                let strSequence = (complementary == 1) ? complementary_sequence : sequence;

                let startMotif = (start > 3) ? strSequence.slice(start - 3, start) :
                    (start == 2) ? strSequence.slice(start - 2, start) :
                        (start == 1) ? strSequence.slice(start - 1, start) : "";

                let endMotif = (strSequence.length > end + 3) ? strSequence.slice(end, end + 3) :
                    (strSequence.length - end == 2) ? strSequence.slice(strSequence.length - 2, strSequence) :
                        (strSequence.length - end == 1) ? strSequence.slice(strSequence.length - 1, strSequence) : "";

                strSequence = startMotif + "<mark>" + sequence.slice(start, end) + "</mark>" + endMotif;

                w = Math.max(w, minSizeRect);

                if (complementary != 1) {
                    y += rectHeight;
                }

                this.rects.push({
                    idSegment, motif, x, y, w, h, focus, strSequence,
                    complementary, p_value
                });
            }
        }

        sortByLong(this.rects);

        function sortByLong(arr) {
            arr.sort((a, b) => a.w < b.w ? 1 : -1);
        }
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
            return marginTop + stepLine * (segments.length);
        }
    }

    setPopUpText(rect) {
        let indent = 5;
        let { y, titleCenter, h, motif, strSequence, p_value, } = rect;
        let popUpSize = this.params.popUpSize;
        let element = document.getElementById('popUp');
        let fontLeft = titleCenter - popUpSize + 'px';
        let fontTop = indent + y + h + 'px';
        let str = '';

        if (motif.length < 2) {
            element.style.width = popUpSize * 2 + 'px';
            str = '<b>' + motif + '</b>' + '<br>' + strSequence + '<br>' + 'p_value:' + p_value;
        } else {
            element.style.width = popUpSize * 4 + 'px';
            for (let i = 0; i < motif.length; i++) {
                let endStr = (i < motif.length) ? '<br>' : '';
                str = str + '<b>' + motif[i] + '</b>' + '<br>' + strSequence[i] + '<br>' + 'p_value:' + p_value[i] + endStr;
            }
        }

        element.style.display = 'block';
        element.style.marginTop = fontTop;
        element.style.marginLeft = fontLeft;

        element.innerHTML = str;



    }

    drawPopUp(rect) {
        let { lineWidth, marginTop, rectHeight, stepLine, leftBorder } = this.params;
        let { x, y, w, h, idSegment, motif } = rect;
        let rightBorder = lineWidth + leftBorder;
        let ctx = this.ctx;
        let bitsRect = 5;

        ctx.clearRect(0, marginTop - bitsRect - rectHeight + stepLine * idSegment, rightBorder + leftBorder, stepLine);
        this.drawOneSegment(idSegment);

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

        this.setPopUpText(rect);
    }

    mergeRects() {
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
        completeRect.p_value = rectList.map(rect => rect.p_value);
        completeRect.strSequence = rectList.map(rect => rect.strSequence);

        let { x, w } = completeRect;
        let titleCenter = w / 2 + x;

        completeRect.titleCenter = titleCenter;

        this.drawPopUp(completeRect);
        
    }

    focusOnRect() {
        this.focusRectList = [];
        let { lineWidth, marginTop, rectHeight, stepLine, leftBorder } = this.params;
        let rightBorder = lineWidth + leftBorder;
        let ctx = this.ctx;

        for (let i = 0; i < this.rects.length; i++) {
            let { idSegment } = this.rects[i];
            let mouseInRect = checkIntersected(this.coordinate, this.rects[i]);

            if (mouseInRect) {
                this.focusRectList.push(this.rects[i]);
            }

            if (!mouseInRect) {
                let bitsRect = 5;

                ctx.clearRect(0, marginTop - bitsRect - rectHeight + stepLine * idSegment, rightBorder + leftBorder, stepLine);
                this.drawOneSegment(idSegment);
                document.getElementById('popUp').style.display = 'none';
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
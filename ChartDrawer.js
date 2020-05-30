class ChartDrawer {
    constructor(params) {
        const self = this;
        this.rectCluster = 10;
        this.canvas = document.getElementById(params.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.params = params;
        this.rectHeight = params.stepLine / this.rectCluster++;
        this.coordinate = {};
        this.rects = [];
        this.motifColors = {};
        this.focusRectList = [];
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
            ctx.strokeRect(x, y, w, h);
        }
    }

    setRects() {
        let { segments, lineWidth, leftBorder, marginTop, stepLine, minSizeRect } = this.params;
        let rightBorder = lineWidth + leftBorder;

        for (let idSegment = 0; idSegment < segments.length; idSegment++) {
            let { rects, sequence, complementary_sequence } = segments[idSegment];

            for (let j = 0; j < rects.length; j++) {
                let { start, end, motif, complementary } = rects[j];
                let long = (rightBorder - leftBorder) / sequence.length;
                let x = Math.ceil(start * long + leftBorder);
                let w = Math.floor((end * long + leftBorder) - x);
                let h = this.rectHeight;
                let y = marginTop - h + stepLine * idSegment;
                let focus = false;
                let id = j;

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
                    y += this.rectHeight;
                }

                this.rects.push({ id, idSegment, motif, x, y, w, h, focus, strSequence, complementary });
            }
        }

        sortByLong(this.rects);

        this.changeSizeRects();


        function sortByLong(arr) {
            arr.sort((a, b) => a.w < b.w ? 1 : -1);
        }
    }

    changeSizeRects() {
        let rectHeight = this.rectHeight;
        let rects = this.rects;

        for (let i = 0; i < rects.length; i++) {
            for (let j = 0; j < rects.length; j++) {
                let intersection = checkIntersected(rects[i], rects[j]);

                if (intersection) {
                    rects[i].h = rects[j].h + rectHeight / 2;
                    rects[i].y = rects[i].complementary == 1 ? rects[j].y - rectHeight / 2 : rects[i].y;
                }
            }
        }

        function checkIntersected(rect1, rect2) {
            let intersectedByLine = rect1.idSegment == rect2.idSegment &&
                rect1.complementary == rect2.complementary;

            let intersectedByX = rect1.x >= rect2.x &&
                rect1.x <= rect2.x + rect2.w ||
                rect1.x < rect2.x + rect2.w;

            let intersectedByW = rect1.x < rect2.x + rect2.w ||
                rect1.x + rect1.w > rect2.x && rect1.w < rect2.x + rect2.w;

            return intersectedByLine && intersectedByX && intersectedByW;
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
        let { y, titleCenter, h, motif, strSequence } = rect;
        let popUpSize = this.params.popUpSize;
        let element = document.getElementById('popUp');
        let fontLeft = titleCenter - popUpSize + 'px';
        let fontTop = indent + y + h + 'px';
        let str = '';

        if (motif.length < 2) {
            element.style.width = popUpSize * 2 + 'px';
            str = '<b>' + motif + '</b>' + '<br>' + strSequence;
        } else {
            element.style.width = popUpSize * 4 + 'px';
            for (let i = 0; i < motif.length; i++) {
                let endStr = (i < motif.length) ? '<br>' : '';
                str = str + '<b>' + motif[i] + '</b>' + '<br>' + strSequence[i] + endStr;
            }
        }

        element.style.display = 'block';
        element.style.marginTop = fontTop;
        element.style.marginLeft = fontLeft;

        element.innerHTML = str;
    }

    cleaner(idSegment) {
        let { lineWidth, marginTop, stepLine, leftBorder } = this.params;
        let rightBorder = lineWidth + leftBorder;
        let ctx = this.ctx;

        ctx.clearRect(0, marginTop + stepLine * idSegment - stepLine / 2, rightBorder + leftBorder, stepLine);
    }

    drawPopUp(rect) {
        let { x, y, w, h, motif } = rect;
        let ctx = this.ctx;

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
        completeRect.strSequence = rectList.map(rect => rect.strSequence);

        let { x, w } = completeRect;
        let titleCenter = w / 2 + x;

        completeRect.titleCenter = titleCenter;

        this.drawPopUp(completeRect);
    }

    focusOnRect() {

        for (let i = 0; i < this.rects.length; i++) {

            let mouseInRect = checkIntersected(this.coordinate, this.rects[i]);
            let unique = this.focusRectList.lenght ? checkUnique(this.rects[i]) : true;

            if (mouseInRect && unique) {
                this.focusRectList.push(this.rects[i]);
            }

            /* if (!mouseInRect) {
                 this.cleaner(idSegment);
                 this.drawOneSegment(idSegment);
                 document.getElementById('popUp').style.display = 'none';
 
                 for (let j = 0; j < 1; j++) {
                     if (idSegment + j < segments.length) {
                         this.drawOneSegment(idSegment + j);
                     }
                 }
                 //this.rectFocus.focus = false;
             }*/
        }
        for (let j = 0; j < this.focusRectList.length; j++) {
            let mouseInRect = checkIntersected(this.coordinate, this.focusRectList[j]);
            let { idSegment } = this.focusRectList[j];

            if (!mouseInRect) {
                this.cleaner(idSegment);
                this.drawOneSegment(idSegment);
                document.getElementById('popUp').style.display = 'none';
                this.drawOneSegment(idSegment)
            }
        }

        if (this.focusRectList.length) {
            this.mergeRects();
        }

        function checkUnique(rect) {
            let unique = true;

            for (let k = 0; k < this.focusRectList.length; k++) {
                
                if (this.focusRectList[k].id == rect.id) {
                    unique = false;
                }
                
            }
            return unique;
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
        let { occurrences, motif } = motifs[i];

        for (let j = 0; j < occurrences.length; j++) {
            let { ranges, complementary_ranges, sequence_name } = occurrences[j];
            let fullRanges = ranges ? ranges : complementary_ranges;

            for (let k = 0; k < fullRanges.length; k++) {
                fullRanges[k].complementary = ranges ? 1 : 0;
                fullRanges[k].motif = motif;
                fullRanges[k].sequenceName = sequence_name;
                rects.push(fullRanges[k]);
                // console.log(fullRanges[k]);
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
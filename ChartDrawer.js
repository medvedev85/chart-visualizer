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
        this.canvas.onmousemove = function (e) {
            self.coordinate.x = e.offsetX;
            self.coordinate.y = e.offsetY;
            //self.focusOnRect();
        }
    }

    draw() {
        let { lineWidth, leftBorder, visibleLine } = this.params;
        let rightBorder = lineWidth + leftBorder;

        this.canvas.width = leftBorder + rightBorder;
        this.canvas.height = this.getHeight();

        this.selectColor();

        document.getElementById('headerCanvas').style.display = 'block';

        for (let i = 0; i < visibleLine; i++) {
            this.drawOneSegment(i);
            console.log(this.params.segments[i]);
        }
        
    }

    drawOneSegment(idSegment) {
        let { baseColor, leftBorder, lineWidth, marginTop, stepLine } = this.params;
        let { rects, sequence, complementary_sequence } = this.params.segments[idSegment];
        let rightBorder = lineWidth + leftBorder;
        let ctx = this.ctx;

        this.params.segments[idSegment].intersectedRects = [];
        this.setLineDescription(idSegment);
        this.breakRects(idSegment);
        
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(leftBorder, marginTop + stepLine * idSegment);
        ctx.lineTo(rightBorder, marginTop + stepLine * idSegment);
        ctx.stroke();

        sortByLong(rects);

        for (let i = 0; i < rects.length; i++) {
            let { start, end, motif, complementary, inter } = rects[i];
            let long = (rightBorder - leftBorder) / sequence.length;
            let x = Math.ceil(start * long + leftBorder);
            let w = Math.floor((end * long + leftBorder) - x);
            let h = this.rectHeight + this.rectHeight * inter.length / 2;
            let y = (complementary == 1) ? marginTop - this.rectHeight + stepLine * idSegment : marginTop - h + stepLine * idSegment;
            let strSequence = (complementary == 1) ? complementary_sequence : sequence;

            let startMotif = (start > 3) ? strSequence.slice(start - 3, start) :
                (start == 2) ? strSequence.slice(start - 2, start) :
                    (start == 1) ? strSequence.slice(start - 1, start) : "";

            let endMotif = (strSequence.length > end + 3) ? strSequence.slice(end, end + 3) :
                (strSequence.length - end == 2) ? strSequence.slice(strSequence.length - 2, strSequence) :
                    (strSequence.length - end == 1) ? strSequence.slice(strSequence.length - 1, strSequence) : "";

            strSequence = startMotif + "<mark>" + sequence.slice(start, end) + "</mark>" + endMotif;

            if (complementary == 1) {
                y += this.rectHeight;
            }

            ctx.fillStyle = this.motifColors[motif];
            ctx.fillRect(x, y, w, h);
            
        }
        for (let j = 0; j < rects.length; j++) {
            let { start, end, complementary, inter } = rects[j];
            let long = (rightBorder - leftBorder) / sequence.length;
            let x = Math.ceil(start * long + leftBorder);
            let w = Math.floor((end * long + leftBorder) - x);
            let h = this.rectHeight + this.rectHeight * inter.length / 2;
            let y = (complementary == 1) ? marginTop - this.rectHeight + stepLine * idSegment : marginTop - h + stepLine * idSegment;

            if (complementary == 1) {
                y += this.rectHeight;
            }
            
            ctx.strokeRect(x, y, w, h);
        }

        function sortByLong(arr) {
            arr.sort((a, b) => a.w < b.w ? 1 : -1);
        }
    }

    breakRects(idSegment) {
        let { rects, intersectedRects } = this.params.segments[idSegment];

        for (let i = 0; i < rects.length; i++) {
            rects[i].inter = [];

            for (let j = 0; j < rects.length; j++) {
                let intersection = findIntersections(rects[i], rects[j]);
                let start;
                let end;

                switch (intersection) {
                    case 1:
                        start = rects[i].start;
                        end = rects[j].end
                        intersectedRects.push({ start, end });
                        rects[i].startFocus = end;
                        rects[j].endFocus = start;
                        rects[i].inter.push(j);
                        break;
                    case 2:
                        start = rects[j].start;
                        end = rects[i].end
                        intersectedRects.push({ start, end });
                        rects[j].startFocus = end;
                        rects[i].endFocus = start;
                        break;
                    case 3:
                        start = rects[i].start;
                        end = rects[i].end
                        intersectedRects.push({ start, end });
                        break;
                    case 4:
                        start = rects[j].start;
                        end = rects[j].end
                        intersectedRects.push({ start, end });
                }
                //this.params.segments[idSegment].rects.push(IntersectedRects);
            }
        }

        function findIntersections(rect1, rect2) {
            let layer = rect1.complementary == rect2.complementary;

            if (layer && rect1.start > rect2.start && rect1.start < rect2.end) { //rect1 пересекает rect2 и уходит вправо
                return 1;
            } else if (layer && rect1.start < rect2.start && rect1.end > rect2.start) { //rect1 пересекает rect2 и уходит влево
                return 2;
            } else if (layer && rect1.start > rect2.start && rect1.end < rect2.end) { //rect1 находится внутри rect2
                return 3;
            } else if (layer && rect1.start < rect2.start && rect1.end > rect2.end) { //rect1 включает в себя rect2
                return 4;
            } else { //не пересекаются
                return false;
            }
        }
    }

    setLineDescription(idSegment) {
        let segments = this.params.segments;
        let str = "";

        for (let i = 0; i <= idSegment; i++) {
            str += i + 1 + '. ' + segments[i].name + ' ' + '\n';
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

    getHeight2() {
        let { segments, marginTop, stepLine } = this.params;

        if (segments) {
            return marginTop + stepLine * (segments.length);
        }
    }
    getHeight() {
        let { segments, marginTop, stepLine, visibleLine } = this.params;

        if (segments) {
            return (segments.length < visibleLine) ? marginTop + stepLine * (segments.length) :
                marginTop + stepLine * visibleLine;
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
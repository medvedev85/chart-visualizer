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
        this.currentPage = 0;
        this.clean = false;

        this.canvas.onmousemove = function (e) {
            self.coordinate.x = e.offsetX;
            self.coordinate.y = e.offsetY;
            self.focusOnRect();
        }
    }

    draw(idSegment) {
        let { lineWidth, leftBorder, visibleLines, segments } = this.params;
        this.catalogue = [];
        this.currentPage = idSegment;
        let rightBorder = lineWidth + leftBorder;
        let end = idSegment + visibleLines;
        let turn = 0;
        let filledLines = segments.filledLines;
        this.canvas.width = leftBorder + rightBorder;
        this.canvas.height = this.getHeight();

        this.selectColor();

        document.getElementById('headerCanvas').style.display = 'block';

        this.ctx.translate(0.5, 0.5);

        if (this.clean) {
            
            
            for (; idSegment < end; idSegment++, turn++) {
                this.catalogue.push(filledLines[idSegment]);
                this.drawOneSegment(filledLines[idSegment], turn);
                console.log(this.filledLines);
            }
        } else {
            for (; idSegment < end; idSegment++, turn++) {
                this.catalogue.push(idSegment);
                this.drawOneSegment(idSegment, turn);
            }
        }

        
        this.ctx.translate(-0.5, -0.5);
        
    }

    cleaner() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawOneSegment(idSegment, turn) {
        //console.log(this.catalogue[idSegment]);
        let { baseColor, leftBorder, lineWidth, marginTop, stepLine } = this.params;
        let { rects, sequence, complementary_sequence } = this.params.segments[idSegment];
        let rightBorder = lineWidth + leftBorder;
        let ctx = this.ctx;

        this.params.segments[idSegment].intersectedRects = [];
        this.setLineDescription();
        this.breakRects(idSegment);

        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(leftBorder, marginTop + stepLine * turn);
        ctx.lineTo(rightBorder, marginTop + stepLine * turn);
        ctx.stroke();

        sortByLong(rects);

        for (let i = 0; i < rects.length; i++) {
            let { start, end, motif, complementary, inter } = rects[i];

            inter.sort();
            let position = (inter.indexOf(i) + 1) / 2;
            //console.log(inter, position)

            let long = (rightBorder - leftBorder) / sequence.length;
            let x = Math.ceil(start * long + leftBorder);
            let w = Math.floor((end * long + leftBorder) - x);
            let h = this.rectHeight + this.rectHeight * position;
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

            ctx.fillStyle = this.motifColors[motif];
            ctx.fillRect(x, y, w, h);
        }

        for (let j = 0; j < rects.length; j++) {
            let { x, y, w, h } = rects[j];

            ctx.strokeRect(x, y, w, h);
        }

        function sortByLong(arr) {
            arr.sort((a, b) => a.h < b.h ? 1 : -1);
        }
    }

    breakRects(idSegment) {
        let { rects, intersectedRects } = this.params.segments[idSegment];
        for (let i = 0; i < rects.length; i++) {
            rects[i].inter = [];
        }

        for (let i = 0; i < rects.length; i++) {

            for (let j = 0; j < rects.length; j++) {
                let intersection = findIntersections(rects[i], rects[j]);
                let start;
                let end;

                switch (intersection) {
                    case "right":
                        start = rects[i].start;
                        end = rects[j].end
                        intersectedRects.push({ start, end });
                        rects[i].inter.push(j, i);
                        rects[j].inter.push(i, j);
                        break;
                    case "inside":
                        start = rects[i].start;
                        end = rects[i].end
                        intersectedRects.push({ start, end });
                        break;
                    case "outside":
                        start = rects[j].start;
                        end = rects[j].end
                        intersectedRects.push({ start, end });
                }
                //this.params.segments[idSegment].rects.push(IntersectedRects);
            }
        }

        function findIntersections(rect1, rect2) {
            let layer = rect1.complementary == rect2.complementary;

            if (layer && rect1.start > rect2.start && rect1.start < rect2.end) {
                return "right";
            } else if (layer && rect1.start > rect2.start && rect1.end < rect2.end) {
                return "inside";
            } else if (layer && rect1.start < rect2.start && rect1.end > rect2.end) {
                return "outside";
            } else {
                return false;
            }
        }
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

    focusOnRect() {
        this.focusRectList = [];
        let { segments } = this.params;

        for (let id = 0; id < this.catalogue.length; id++) {
            let idSegment = this.catalogue[id];

            for (let i = 0; i < segments[idSegment].rects.length; i++) {
                let mouseInRect = checkIntersected(this.coordinate, segments[idSegment].rects[i]);

                if (mouseInRect) {
                    
                    //console.log("jhgfcghjk");
                }

                if (!mouseInRect) {
                    
                }
            }
        }

        if (this.focusRectList.length) {
            //this.mergeRects();
        }

        function checkIntersected(point, rect) {
            let intersectedByX = point.x >= rect.x &&
                point.x < rect.x + rect.w;

            let intersectedByY = point.y >= rect.y &&
                point.y < rect.y + rect.h;

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
                //console.log(fullRanges[k]);
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
    return params.segments = sequences;
}
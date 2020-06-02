class ChartDrawer {
    constructor(params) {
        const self = this;
        this.rectCluster = 10;
        this.canvas = document.getElementById(params.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.params = params;
        this.rectHeight = params.stepLine / this.rectCluster++;
        this.coordinate = {};
        this.motifColors = {};
        this.canvas.onmousemove = function (e) {
            self.coordinate.x = e.offsetX;
            self.coordinate.y = e.offsetY;
            self.focusOnRect();
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
        }
    }

    drawOneSegment(idSegment) {
        let { baseColor, leftBorder, lineWidth, marginTop, stepLine } = this.params;
        let { rects, sequence, complementary_sequence } = this.params.segments[idSegment];
        let rightBorder = lineWidth + leftBorder;
        let ctx = this.ctx;

        this.setLineDescription(idSegment);

        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(leftBorder, marginTop + stepLine * idSegment);
        ctx.lineTo(rightBorder, marginTop + stepLine * idSegment);
        ctx.stroke();

        sortByLong(rects);

        for (let i = 0; i < rects.length; i++) {
            let { start, end, motif, complementary } = rects[i];
            let long = (rightBorder - leftBorder) / sequence.length;
            let x = Math.ceil(start * long + leftBorder);
            let w = Math.floor((end * long + leftBorder) - x);
            let h = this.rectHeight;
            let y = marginTop - h + stepLine * idSegment;
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
            ctx.strokeRect(x, y, w, h);
        }
        
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
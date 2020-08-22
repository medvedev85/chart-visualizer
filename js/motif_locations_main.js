export let seqFile;

export function perc2color(perc) { //создаем цвет для мотива
    var r, g, b = 0;
    if (perc < 50) {
        r = 255;
        g = Math.round(5.1 * perc);
    }
    else {
        g = 255;
        r = Math.round(510 - 5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}

export function genColorsList(data) {
    let { motifs } = data;
    let res = [];

    for (let i = 0; i < motifs.length; i++) {
        let { motif } = motifs[i];
        res.push(motifsColor[motif]);
    }

    return res;
}

export function changeVisible() {
    let pageVisible = document.getElementById("visibleSequences")

    if (pageVisible > currentSeq) {
        currentSeq = 0;
    }

    recalculate();
}

export function getfilter() {
    let sequence = document.getElementById("checkboxSequence").checked;
    let complSeq = document.getElementById("checkboxComplementary").checked;
    let removeEmpty = document.getElementById("remove").checked;

    if (removeEmpty) {
        chartDrawer.clean = true;
        chartDrawer.draw(0);
    } else {
        chartDrawer.clean = false;
        chartDrawer.draw(0);
    }

    chartDrawer.chooseShowSegments(sequence, complSeq);
}

export function createNewPageContainer() {
    let container = document.getElementById("pageContainer");
    let paginator = document.getElementById("paginator");

    if (container) {
        container.remove();
    }

    сontainer = document.createElement("div");
    сontainer.id = "pageContainer";
    paginator.append(сontainer);
}

export function setNewButtonPaging(id, value, page, _visibleSequences) {
    let input = document.createElement("input");
    let container = document.getElementById(id);

    input.type = "button";
    input.value = value;

    input.setAttribute('class', 'pure-button');
    input.addEventListener('click', () => pageClick(page, _visibleSequences));
    input.disabled = currentSeq / _visibleSequences == page ? true : false;

    container.append(input);
    return input;
}

export function pageClick(nextSeq, _visibleSequences) {
    currentSeq = nextSeq * _visibleSequences;
    recalculate();
}

export function paginator(allSeq, _visibleSequences) {
    createNewPageContainer();
    let over = Math.ceil(allSeq / _visibleSequences);
    let page = Math.ceil(currentSeq / _visibleSequences);

    if (over > 1) {
        let previous = setNewButtonPaging("pageContainer", "<", (currentSeq - _visibleSequences) / _visibleSequences, _visibleSequences);
        previous.disabled = currentSeq < _visibleSequences ? true : false;
    }

    let nextPage;

    if (over > 1 && over < 10) {
        for (let i = 0; i < over; i++) {
            setNewButtonPaging("pageContainer", `${i + 1}`, i, _visibleSequences);
        }
    }

    if (over > 10 && page < 8) {
        setNewButtonPaging("pageContainer", "1", 0, _visibleSequences);

        for (let i = 1; i < 8; i++) {
            setNewButtonPaging("pageContainer", `${i + 1}`, i, _visibleSequences);
            nextPage = i + 1;
        }

        setNewButtonPaging("pageContainer", "...", nextPage, _visibleSequences);
        setNewButtonPaging("pageContainer", `${over}`, over - 1, _visibleSequences);
    }

    if (over > 10 && page > 7 && over - page > 6) {

        setNewButtonPaging("pageContainer", "1", 0, _visibleSequences);
        setNewButtonPaging("pageContainer", "...", page - 1, _visibleSequences);

        for (let i = page; i < page + 6; i++) {
            setNewButtonPaging("pageContainer", `${i + 1}`, i, _visibleSequences);
            nextPage = i;
        }

        setNewButtonPaging("pageContainer", "...", nextPage, _visibleSequences);
        setNewButtonPaging("pageContainer", `${over}`, over - 1, _visibleSequences);
    }

    if (over > 10 && page > 7 && over - page <= 6) {
        setNewButtonPaging("pageContainer", "1", 0, _visibleSequences);
        setNewButtonPaging("pageContainer", "...", page - 1, _visibleSequences);

        for (let i = over - 7; i < over; i++) {
            setNewButtonPaging("pageContainer", `${i + 1}`, i, _visibleSequences);
        }
    }

    if (over > 1) {
        let next = setNewButtonPaging("pageContainer", ">", page + 1, _visibleSequences);
        next.disabled = currentSeq / _visibleSequences == over - 1 ? true : false;
    }
}





export function setInputValue(id, text) { //устанавливаем значение text элементу id через .value
    let element = document.getElementById(id);
    element.value = text;
}

export function setElementText(id, text) { //помещаем данные на страницу через innerHTML
    let element = document.getElementById(id);
    element.innerHTML = text;
}

///////// Motif list begin

export function splitMotifs(motifsStr) { //создаем массив с мотивами
    let motifs = motifsStr.toUpperCase().split(" ").join(",").split(",");
    let res = [];
    for (let i = 0; i < motifs.length; i++) {
        let m = motifs[i].trim();
        if (m) {
            res.push(m);
        }
    }
    return res;
}

export function createCheckBox(id) {
    let elem = document.getElementById(`row_${id}`);
    let tableSector = document.createElement("td");
    let box = document.createElement("input");
    box.type = "checkbox";
    box.checked = true;
    box.id = id;
    elem.append(tableSector);
    tableSector.append(box);
}

export function createAllCheckBoxes(motifs) {
    for (let i = 0; i < motifs.length; i++) {
        createCheckBox(motifs[i]);
    }
}

export function setMotifs(motifsStr) { //при получении массивов задаем им цвет, распологаем списком слева, перезапускаем работу всего приложения (перезаписываем дату)	
    let motifs = splitMotifs(motifsStr);
    let html = "";

    if (motifs.length > 1) {
        html += `<tr id="row_all">	
                    <td colspan="2"><a href="javascript:void(0)" id="motifSelecter" onclick="selectCheckAllBox()" >Unselect all motifs</a></td>
                 </tr>`;
    }

    for (let i = 0; i < motifs.length; i++) {
        let motif = motifs[i];
        let color = perc2color(100.0 * i / motifs.length + 0.5);
        motifsColor[motif] = color;

        html += `<tr id="row_${motif}">	
                    <td><a style="color: ${color};" href="javascript:void(0)" onclick="changeMotif('${motif}');" >${motif} </a></td>	
                 </tr>`;
    }

    setElementText("motifsTableBody", html);
    createAllCheckBoxes(motifs);
    recalculate();
}

//////// Motif List end

export function getSequences() { // получаем sequences из формы на странице
    let sequences = seqFile || document.getElementById("fstSequencesInline").value.toUpperCase();
    return sequences;
}

export function getVisibleSequences() {
    return document.getElementById("visibleSequences").value;
}

export function getMotifs() { //получаем мотивы из формы на странице
    let motifs = getMotifsOnChecksBoxes();
    return splitMotifs(motifs);
}

export function changeMotif(id) {
    let table = document.getElementById("motifsTableBody");
    let checkBoxes = table.getElementsByTagName("input");

    for (let i = 0; i < checkBoxes.length; i++) {
        if (checkBoxes[i].id == id) {
            checkBoxes[i].checked = true;
        } else {
            checkBoxes[i].checked = false;
        }
    }
    recalculate();
}

export function selectCheckAllBox() {
    let table = document.getElementById("motifsTableBody");
    let motifSelecter = document.getElementById("motifSelecter");
    let checkBoxes = table.getElementsByTagName("input");

    if (motifSelecter.innerText === "Unselect all motifs") {
        for (let i = 0; i < checkBoxes.length; i++) {
            checkBoxes[i].checked = false;
        }
        motifSelecter.innerText = "Select all motifs";
    } else {
        for (let i = 0; i < checkBoxes.length; i++) {
            checkBoxes[i].checked = true;
        }
        motifSelecter.innerText = "Unselect all motifs";
    }
    recalculate();
}

export function getMotifsOnChecksBoxes() {
    let table = document.getElementById("motifsTableBody");
    let motifSelecter = document.getElementById("motifSelecter");
    let checkBoxes = table.getElementsByTagName("input");
    let motifs = "";

    if (!checkBoxes.length) {
        return "";
    }

    for (let i = 0; i < checkBoxes.length; i++) {

        if (checkBoxes[i].checked) {
            motifs += checkBoxes[i].id + ",";
        }
        if (checkBoxes[i].checked == false && checkBoxes.length > 1) {
            motifSelecter.innerText = "Select all motifs";
        }
    }

    return motifs;
}

export function getComplementary() { //выясняем, надо ли показывать комплиментарную последовательность
    let complementary = document.getElementById("complementary").value;
    let checkbox = document.getElementById("checkboxComplementary");

    if (complementary == 0) {
        checkbox.checked = false;
        checkbox.disabled = true;
    } else {
        checkbox.disabled = false;
    }

    return document.getElementById("complementary").value == 1;
}

export function countProbs(motif, splitted, curMatches, ratios) {
    let seqLen = splitted[0][1].length;
    let seqCount = splitted.length; //it count
    let prob1 = probInPos(motif, ratios);
    let prob2 = probInSec(prob1, seqLen);
    let chi2 = calcChi2Double(prob2, curMatches, seqCount);//seqcount - infos.count
    //let binomCoeffLogs = getBinomCoeffLogs(seqCount);
    //console.log(binomByHash(prob2, curMatches, binomCoeffLogs, seqCount));
    return chi2;
}

export function getBinomCoeffLogs(seqCount) {
    let n = seqCount;
    let binomCoeffLogs = [];
    let logs = [];

    logs.length = n + 1;
    logs.fill(0);

    for (let i = 0; i <= n; i++) {
        if (i > 0) {
            logs[i] -= Math.log(i);
        }

        logs[i] += Math.log(n - i + 1);
    }

    binomCoeffLogs.length = n + 1;
    binomCoeffLogs.fill(0);

    for (let i = 1; i <= n; i++) {
        binomCoeffLogs[i] = logs[i] + binomCoeffLogs[i - 1];
    }

    return binomCoeffLogs;
}

export function binomByHash(prob2, curMatches, binomCoeffLogs, seqCount) {
    let weight = curMatches;

    if (weight == 0) {
        return 0;
    }

    let p = prob2;
    let q = 1 - p;
    let lp = Math.log(p);
    let lq = Math.log(q);
    let pq = p / q;
    let prev = Math.exp(binomCoeffLogs[weight - 1] + (weight - 1) * lp + (seqCount - weight + 1) * lq);
    let res = 0;

    for (let i = weight; i <= seqCount; i++) {
        prev *= pq * (seqCount - i + 1) / i;
        res += prev;
    }

    return Math.log10(res) * (-1);
}

export function prepareData(_visibleSequences) //создаем объект, который можно скормить парсеру и чартдроверу
{
    let t0 = performance.now();
    let result = {
        "sequences": [],
        "motifs": []
    };
    let sequences = getSequences();
    let txt = sequences;
    let motifs = getMotifs();

    if (!sequences.length) {
        return result;
    }

    let complementary = getComplementary();

    sequences = splitSequences(sequences);
    sequences.splice(0, currentSeq);

    let compl_sequences = [];
    let sequences_count = Math.min(sequences.length, _visibleSequences);//конец последовательности
    if (complementary) {
        for (let i = 0; i < sequences_count; i++) {
            compl_sequences.push(makeComplementarySequence(sequences[i][1]));
        }
    }

    for (let i = 0; i < sequences_count; i++) {
        let [name, sequence] = sequences[i];
        let seq = { name, sequence };
        if (complementary) {
            seq["complementary_sequence"] = compl_sequences[i];
        }
        result.sequences.push(seq);
    }

    if (motifs.length) {
        let ratios = calcRatios(txt);

        for (let mi = 0; mi < motifs.length; mi++) {
            let motif = motifs[mi];
            let occurrences = [];
            let counter = 0;
            let complCounter = 0;

            for (let i = 0; i < sequences_count; i++) {
                let found = false;
                let [name, sequence] = sequences[i];
                let ranges = [];
                let index = firstMotifOccurrence(sequence, motif, 0, false);

                while (index >= 0) {
                    ranges.push({
                        start: index,
                        end: index + motif.length
                    });
                    found = true;
                    index += 1;
                    index = firstMotifOccurrence(sequence, motif, index, false);
                }
                let occ = {
                    sequence_name: name,
                };

                if (ranges) {
                    occ.ranges = ranges;
                    occurrences.push(occ);
                }

                if (complementary) {
                    let occ = {
                        sequence_name: name,
                    };
                    let compl_seq = compl_sequences[i];

                    let compl_ranges = [];
                    let index = firstMotifOccurrence(compl_seq, motif, 0, false);

                    while (index >= 0) {
                        compl_ranges.push({
                            start: index,
                            end: index + motif.length
                        });
                        found = true;
                        index += 1;
                        index = firstMotifOccurrence(compl_seq, motif, index, false);
                    }

                    if (compl_ranges) {
                        occ.complementary_ranges = compl_ranges;
                        occurrences.push(occ);
                    }
                }

                if (found) {
                    complCounter++;
                }

            } // sequences
            curMatches = complCounter ? complCounter : counter;
            let chi2 = countProbs(motif, sequences, curMatches, ratios);

            if (occurrences.length) {
                result.motifs.push({
                    chi2,
                    motif,
                    occurrences
                });
            }
        } // motifs
    }

    let t1 = performance.now();
    console.log("prepareData: " + (t1 - t0) + " milliseconds.");
    return result;
}

///\\\\///\\\\//\\////\///find motifs.js/////\\\/////\\///\////\\\////\\\///\\//

export function firstMotifOccurrence(sequence, motif, offset, complementary) { //определяем старт рейнджей
    let fwdIdx = -1;
    for (let i = offset; i < sequence.length - motif.length + 1; i++) {
        if (motifCompare(sequence, i, motif, false)) {
            fwdIdx = i;
            break;
        }
    }

    let complIdx = -1;
    if (complementary) {
        for (let i = offset; i < sequence.length - motif.length + 1; i++) {
            if (motifCompare(sequence, i, motif, true)) {
                complIdx = i;
                break;
            }
        }
    }
    if (fwdIdx == -1) {
        return complIdx;
    }
    if (complIdx == -1) {
        return fwdIdx;
    }

    let idx = fwdIdx < complIdx ? fwdIdx : complIdx;
    return idx;
}

const motifsMap = {
            'A': 'A',
            'T': 'T',
            'G': 'G',
            'C': 'C',
            'W': 'AT',
            'R': 'AG',
            'K': 'TG',
            'D': 'ATG',
            'M': 'AC',
            'Y': 'CT',
            'H': 'ATC',
            'S': 'CG',
            'V': 'AGC',
            'B': 'CGT',
            'N': 'ACGT'};

const complMotifsMap  = {
            'A': 'T',
            'T': 'A',
            'G': 'C',
            'C': 'G',
            'W': 'TA',
            'R': 'TC',
            'K': 'AC',
            'D': 'TAC',
            'M': 'TG',
            'Y': 'GA',
            'H': 'TAG',
            'S': 'GC',
            'V': 'TCG',
            'B': 'GCA',
            'N': 'ACGT'};

export function motifCompare(sequence, offset, motif, complementary) { //находим соответствие мотивов с последовательностями
    for (let i = 0; i < motif.length; i++) {
        let strIdx = complementary ? offset + (motif.length-1-i) : i+offset;
        let sequenceSymbol = sequence[strIdx];
        if ("ACGT".indexOf(sequenceSymbol) == -1) {
            return false;
        }

        let motifSymbol = motif[i];
        if (!complementary && sequenceSymbol === motifSymbol) continue;
        if ("ATGCWRKDMYHSVBN".indexOf(motifSymbol) == -1) {
            return false;
        }
        let curMotifsMap = complementary ? complMotifsMap[motifSymbol] : motifsMap[motifSymbol];
        if (curMotifsMap.indexOf(sequenceSymbol) == -1) {
            return false;
        }
    }
    return true;
}

export function splitSequences(text) { // получаем sequences из текстовых данных
    let sequences = text.split(">").filter(s => s);

    sequences = sequences.map(s => "> " + s.trim())
    let i = 1;
    sequences = sequences.map(s => {
        let lines = s.split("\n");
        let name = lines[0]
        if (!name.endsWith(i)) {
            name += ", " + i ;
        }
        i += 1;
        return [name, lines.splice(1).join("")]
    });
    return sequences;
}

export function makeComplementarySequence(sequence) { // получаем complementary_sequences
    let complementary  = "";
    for (let i = sequence.length - 1; i >= 0; i--) {
        complementary += complMotifsMap[sequence[i]];
    }
    return complementary;
}

export function calcFrequencies(text) {
    let splitted = splitSequences(text);
    let counts = { 'A': 0, 'T': 0, 'G': 0, 'C': 0 };

    let total = 0;
    for (let i = 0; i < splitted.length; i++) {
        let seq = splitted[i][1];
        total += seq.length;
        seq.split('').forEach(function (s) {
            counts[s] ? counts[s]++ : counts[s] = 1;
        });
    }
    return counts;
}

export function countTotalLen(text) {
    let splitted = splitSequences(text);
    let total = 0;
    for (let i = 0; i < splitted.length; i++)
        total += splitted[i][1].trim().length;
    return total;
}

export function calcRatios(text) {
    let t0 = performance.now();
    let counts = calcFrequencies(text);
    let total = countTotalLen(text);

    for (var l in counts) {
        counts[l] /= total;
    }
    let t1 = performance.now();
    console.log("calcRatios: " + (t1 - t0) + " milliseconds.");
    return counts
}

export function probInPos(motif, ratios) {
    var prob1 = 1.0;
    motif.toUpperCase().split("").forEach(function (s) {
        let symbols = motifsMap[s];
        let curP = 0.0;
        symbols.split("").forEach(function (symb) {
            curP += ratios[symb];
        });
        prob1 *= curP;
    });
    return prob1;
}

export function probInSec(prob1, seq_len) {
    var prob2 = 1.0 - Math.exp(-prob1 * (seq_len - 7) * 2);
    return prob2;
}

export function calcChi2Double(prob_pos, matches, seq_count) {
    var expected = prob_pos * seq_count;
    var x = expected - matches;
    var chi2 = x * x / (expected);
    return chi2;
}
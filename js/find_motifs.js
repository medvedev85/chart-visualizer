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

function motifCompare(sequence, offset, motif, complementary) { //находим соответствие мотивов с последовательностями
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

function calcFrequencies(text) {
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

function countTotalLen(text) {
    let splitted = splitSequences(text);
    let total = 0;
    for (let i = 0; i < splitted.length; i++)
        total += splitted[i][1].trim().length;
    return total;
}

export function calcRatios(text) {
    let counts = calcFrequencies(text);
    let total = countTotalLen(text);

    for (var l in counts) {
        counts[l] /= total;
    }
    let t1 = performance.now();
    return counts
}

function probInPos(motif, ratios) {
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

function probInSec(prob1, seq_len) {
    var prob2 = 1.0 - Math.exp(-prob1 * (seq_len - 7) * 2);
    return prob2;
}

function calcChi2Double(prob_pos, matches, seq_count) {
    var expected = prob_pos * seq_count;
    var x = expected - matches;
    var chi2 = x * x / (expected);
    return chi2;
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

function getBinomCoeffLogs(seqCount) {
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

function binomByHash(prob2, curMatches, binomCoeffLogs, seqCount) {
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
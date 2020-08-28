import { makeComplementarySequence, calcRatios, countProbs, firstMotifOccurrence, splitSequences } from "./find_motifs.js";

function prepareData(entries) {
    let { currentSeq, _visibleSequences, entrySequences, entryMotifs, entryComplementary } = entries;
    let t0 = performance.now();
    let result = {
        "sequences": [],
        "motifs": []
    };
    let sequences = entrySequences;
    let txt = sequences;
    let motifs = entryMotifs;

    if (!sequences.length) {
        return result;
    }

    let complementary = entryComplementary;

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
            let curMatches = complCounter ? complCounter : counter;
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


self.onmessage = function (e) {
    let data = prepareData(e.data);

    self.postMessage(data);
}
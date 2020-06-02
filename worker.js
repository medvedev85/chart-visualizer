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
    console.log("готово");
    return params.segments = sequences;
}

self.addEventListener('message', function(e) {
    let data = e.data;
    let result = parser(data.json, data.params);
    
    self.postMessage(result);
  }, false);
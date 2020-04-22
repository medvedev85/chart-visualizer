"use strict"
class GetDataInTextarea {
    constructor(inputData) {
        const self = this;
        this.input = document.getElementById(inputData);
        this.input.oninput = function () {
            self.setDataBeforeParsing();
        }
    }
    setDataBeforeParsing() {
        try {
            this.json = JSON.parse(this.input.value);
            document.getElementById('result').innerHTML = "";
        } catch (error) {
            document.getElementById('result').innerHTML = " Поместите данные в формате JSON!";
        }
    }
}

class ParserJSON {
    constructor(dataBeforeParsing) {
        this.dataBeforeParsing = dataBeforeParsing;
    }
    nameSequence() {
        this.sequences = this.dataBeforeParsing.sequences;
        this.motifs = this.dataBeforeParsing.motifs;
        for (let i = 0; i < this.dataBeforeParsing.sequences.length; i++) {
            this.names[i] = this.dataBeforeParsing.sequences[i].name;
        }
    }
    setDataAfterParsing() {
        this.nameSequence();
        this.dataAfterParsing = [];
        for (let i = 0; i < this.motifs.length; i++) {
            for (let j = 0; j < this.motifs[i].occurences.length; j++) {
                for (let k = 0; k < this.motifs[i].occurences[j].ranges.length; k++) {
                    this.motifs[i].occurences[j].ranges[k].motif = this.motifs[i].motif;
                    this.motifs[i].occurences[j].ranges[k].sequenceName = this.motifs[i].occurences[j].sequence_name;
                    this.dataAfterParsing.push(this.motifs[i].occurences[j].ranges[k]);
                }
            }
        }
        for (let i = 0; i < this.dataAfterParsing.length; i++) {
            for (let j = 0; j < this.sequences.length; j++) {
                if (this.dataAfterParsing[i].sequenceName == this.sequences[j].name) {
                    this.dataAfterParsing[i].index = j;
                    this.dataAfterParsing[i].sequenceLenght = this.sequences[j].sequence.length;
                    this.dataAfterParsing[i].complementarySequenceLenght = this.sequences[j].complementary_sequence.length;
                }
            }
        }
    }
}

let getDataInTextarea = new GetDataInTextarea ("json_input_id");
let dataBeforeParsing = getDataInTextarea.json;
let parserJSON = new ParserJSON (dataBeforeParsing);
//parserJSON.setDataAfterParsing();

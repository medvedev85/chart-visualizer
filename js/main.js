import * as motifLocations from "./motif_locations_main.js";

window.addEventListener('load', initFindMotifs);

let motifsColor = {};
let currentSeq = 0;
let seqSplited;

let chartDrawer;

function addChangeListener(id, callback) { //для отслеживания всякого
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener('input', callback);
    }
}

function initListeners() { //ждем изменений в формочке
    addChangeListener("motifs", (e) => setMotifs(e.target.value));
    addChangeListener("complementary", () => recalculate());
    addChangeListener("visibleSequences", () => changeVisible());
    addChangeListener("fstSequences", () => readFile());
    addChangeListener("fstSequencesInline", () => recalculate());
    addChangeListener("motifsTableBody", () => recalculate());
    addChangeListener("checkZone", () => getfilter());
}

async function initFindMotifs() { //перезапускаем логику если есть изменения
    initListeners();
    await parseUrlParams();
    recalculate();
}

async function parseUrlParams() { //подставляет значения в урл 
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // 1. Motif	
    const motif = urlParams.get('motif') || "";
    if (motif) {
        setInputValue("motifs", motif);
        setMotifs(motif);
    }

    // 2. Sequence_url
    const sequences_url = urlParams.get('sequences_url') || "";
    if (sequences_url) {
        let response = await fetch(sequences_url);
        let text = await response.text();
        if (text) {
            setInputValue('fstSequencesInline', text);
        }
    }

    // 3. Complementary
    const complementary = urlParams.get('complementary') || "";
    if (complementary === "0") {
        setInputValue("complementary", complementary);
    }

    const visibleSequences = urlParams.get('visibleSequences');
    if (visibleSequences) {
        setInputValue("visibleSequences", visibleSequences);
    }
}

function readFile(input) {
    let file = input.files[0];
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function () {
        motifLocations.seqFile = reader.result.toUpperCase();
        recalculate();
    };
    reader.onerror = function () {
        motifLocations.seqFile = "";
    };
}







function reinitChartDrawer() { //обертка для запуска чартдровера
    let _visibleSequences = motifLocations.getVisibleSequences();
    let sequences = motifLocations.getSequences();
    seqSplited = motifLocations.splitSequences(sequences);
    let data;

    let worker = new Worker('../js/worker.js', { type: "module" });
    worker.postMessage(_visibleSequences);

    worker.onmessage = function (e) {
        data = e.data;
        console.log(e);
    }



    const params = {
        firstLayer: "firstLayer",
        secondLayer: "secondLayer",
        thirdLayer: "thirdLayer",
        baseColor: "rgb(0, 0, 0)",
        colors: motifLocations.genColorsList(data),//["blue", "red", "pink", "green", "brown", "orange", "coral", "purple"],
        visibleLines: Math.min(_visibleSequences, data.sequences.length), //max: 1308
        popUpSize: 100,
        leftBorder: 0,
        oneLetterWidth: 8,
        marginTop: 60,
        stepLine: 76,
        neighbourhood: 3
    };



    parser(data, params);
    chartDrawer = new ChartDrawer(params);
    getfilter();
    paginator(seqSplited.length, _visibleSequences);
}

function recalculate() { //перезапускаем работу, если в формочку внесли что-то новое и оно соответствует требованиям
    if (!motifLocations.seqFile && !document.getElementById("fstSequencesInline").value) {
        return;
    }

    let sequences = motifLocations.getSequences();
    let motifs = motifLocations.getMotifs();

    if (motifs.length && sequences.length) {
        let motif = motifs[0];
        let complementary = motifLocations.getComplementary();

        sequences = motifLocations.splitSequences(sequences);

        let foundSequences = [];
        let positionsFound = 0;
        let resultHtml = "";

        for (let i = 0; i < sequences.length; i++) {
            let matched = false;
            let index = -1;
            let [name, sequence] = sequences[i];

            index = firstMotifOccurrence(sequence, motif, 0, complementary);

            while (index >= 0) {
                matched = true;
                positionsFound++;
                sequence = sequence.substring(0, index) +
                    "<span class='highlight'>" +
                    sequence.substring(index, index + motif.length) +
                    "</span>" + sequence.substring(index + motif.length);
                index = sequence.lastIndexOf("span") + 5;
                index = firstMotifOccurrence(sequence, motif, index, complementary);
            }

            resultHtml += name + "\n" + sequence + "\n\n";
            if (matched) {
                foundSequences.push(i);
            }
        }

        //document.getElementById("counter").innerHTML = "Matches: " + foundSequences.length + ", " + foundSequences.length/sequences.length + ", positions: "  + positionsFound + " \n\n" + JSON.stringify(foundSequences);
        document.getElementById("result").innerHTML = resultHtml;
    }

    reinitChartDrawer();
}
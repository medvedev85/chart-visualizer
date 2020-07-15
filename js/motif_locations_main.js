window.addEventListener('load', initFindMotifs);

let _currentMotif = "";
let _visibleSequences = 200;

function addChangeListener(id, callback) { //для отслеживания всякого
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener('input', callback);
    }
}

function initListeners() { //ждем изменений в формочке
    addChangeListener("motifs", (e) => setMotifs(e.target.value) );
    addChangeListener("complementary", (e) => recalculate());
    addChangeListener("fstSequencesInline", (e) => recalculate());
}

async function initFindMotifs() { //перезапускаем логику если есть изменения
    setMaxExpandableHeight(400);
    initListeners();
    await parseUrlParams();
    recalculate();
    //toggleCollapsible(document.getElementById("collapseResults"));
}

function perc2color(perc) { //создаем цвет для мотива
	var r, g, b = 0;
	if(perc < 50) {
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

function genColorsList(count) { //задаем цвета всем мотивам
    let res = [];
    //console.log(count);
    for (let i = 0; i < count; i++) {
        let perc = 100.0 * i / count + 0.5;
        //console.log(perc);
        res.push(perc2color(perc));
    }
    return res;
}

function reinitChartDrawer(motifs) { //обертка для запуска чартдровера
    let data = prepareData(motifs);
    const params = {
        firstLayer: "firstLayer",
        secondLayer: "secondLayer",
        thirdLayer: "thirdLayer",
        baseColor: "rgb(0, 0, 0)",
        colors: genColorsList(getMotifs().length),//["blue", "red", "pink", "green", "brown", "orange", "coral", "purple"],
        visibleLines: Math.min(_visibleSequences, data.sequences.length), //max: 1308
        popUpSize: 90,
        leftBorder: 100,
        oneLetterWidth: 8,
        marginTop: 100,
        stepLine: 70,
        neighbourhood: 3
    };

    parser(data, params);
    let chartDrawer = new ChartDrawer(params);
    chartDrawer.draw(0);
}

async function parseUrlParams() { //магия какая то, вроде ждем изменений на страничке
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
}

function setInputValue(id, text) { //устанавливаем значение text элементу id через .value
    let element = document.getElementById(id);
    element.value = text;
}

function setElementText(id, text) { //помещаем данные на страницу через innerHTML
    let element = document.getElementById(id);
    element.innerHTML = text;
}

///////// Motif list begin

function splitMotifs(motifsStr) { //создаем массив с мотивами
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

function setMotifs(motifsStr) { //при получении массивов задаем им цвет, распологаем списком слева, перезапускаем работу всего приложения (перезаписываем дату)
    let motifs = splitMotifs(motifsStr);

    let html = "";
    if (motifs.length > 1) {
        html += `<tr id="row_all">
                    <td><a href="javascript:void(0)" onclick="recalculate();" >Select all motifs</a></td>
                 </tr>`;
    }
    for (let i = 0; i < motifs.length; i++) {
        let motif = motifs[i];
        let color = perc2color(100.0*i / motifs.length + 0.5);
        html += `<tr id="row_${motif}">
                    <td><a style="color: ${color};"     href="javascript:void(0)" onclick="recalculate('${motif}');" >${motif}</a></td>
                 </tr>`;
    }

    setElementText("motifsTableBody", html);
    recalculate();
}

//////// Motif List end

function getSequences() { // получаем sequences из формы на странице
    let sequences = document.getElementById("fstSequencesInline").value.toUpperCase();
    return sequences;
}

function getMotifs() { //получаем мотивы из формы на странице
    let motifs = document.getElementById("motifs").value;
    return splitMotifs(motifs);
}

function getComplementary() { //выясняем, надо ли показывать комплиментарную последовательность
    return document.getElementById("complementary").value === "1";
}

function prepareData(showMotifs=[]) //создаем объект, который можно скормить парсеру и чартдроверу
{
    let result = {
        "sequences": [],
        "motifs": []
    };
    let sequences = getSequences();
    let motifs = showMotifs
    if (showMotifs.length == 0) {
        motifs = getMotifs();
    }

    if (!sequences.length || !motifs.length) {
        return result;
    }
    let complementary = getComplementary();

    sequences = splitSequences(sequences);
    let compl_sequences = [];
    let sequences_count = Math.min(sequences.length, _visibleSequences);
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

    for (let mi = 0; mi < motifs.length; mi++) {
        let motif = motifs[mi];
        let occurrences = [];

        for (let i = 0; i < sequences_count; i++) {
            let [name, sequence] = sequences[i];
            let ranges = [];
            let index = firstMotifOccurrence(sequence, motif, 0, false);

            while (index >= 0) {
                ranges.push({
                    start: index,
                    end: index+motif.length
                });
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
                        end: index+motif.length
                    });
                    index += 1;
                    index = firstMotifOccurrence(compl_seq, motif, index, false);
                }
                if (compl_ranges) {
                    occ.complementary_ranges = compl_ranges;
                    occurrences.push(occ);
                }
            }
        } // sequences

        if (occurrences.length) {
            result.motifs.push( {
                chi2: "0",
                motif,
                occurrences
            });
        }
    } // motifs
    return result;
}

function recalculate(showMotif = "") { //перезапускаем работу, если в формочку внесли что-то новое и оно соответствует требованиям
    let sequences = getSequences();
    if (sequences.length === 0) {
        return;
    }
    let motifs = getMotifs();
    if (motifs.length === 0 ) {
        return;
    }
    motif = showMotif || _currentMotif || motifs[0];
    _currentMotif = motif;
    let complementary = getComplementary();

    sequences = splitSequences(sequences);
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

    reinitChartDrawer(showMotif ? [showMotif] : []);
}
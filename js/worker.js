import * as motifLocations from "./motif_locations_main.js";

self.onmessage = function (e) {
    let data = e.data;
    
    self.postMessage(motifLocations.prepareData(data));
}
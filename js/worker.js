import { prepareData } from "./motif_locations_main.js";

self.onmessage = function (e) {
    let data = prepareData(e.data);


    self.postMessage(data);
}
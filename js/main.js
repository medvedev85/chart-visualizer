window.addEventListener('load', initFromJs);

let _maxExpandableHeight = "200px";

function toggleCollapsible(element) {
    element.classList.toggle("active");
    let content = element.nextElementSibling;
    content.style.display = element.classList.contains("active") ? "block" : "none";
    content.style.maxHeight = content.style.maxHeight ? null : _maxExpandableHeight;
}

function initFromJs() {
    let collapsibles = document.getElementsByClassName("expand-section");

    for (let i = 0; i < collapsibles.length; i++) {
        let onClick = (e) => { toggleCollapsible(e.target); };
        collapsibles[i].addEventListener("click", onClick);
    }
}

function setMaxExpandableHeight(height) {
    _maxExpandableHeight = `${height}px`;
}
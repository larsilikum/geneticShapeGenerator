window.onload = function() {
    try {
        let url_string = (window.location.href).toLowerCase();
        let url = new URL(url_string);
        let geneCode = url.searchParams.get("gene");
        if(geneCode) pSketch.useNewGene(geneCode.toUpperCase())

    } catch (err) {
        console.log("Issues with Parsing URL Parameter's - " + err);
    }
}

let divideGene = () => {
    let c = pSketch.gene.code
    geneCode.classList.add('lab-mode')
    let template = document.getElementsByTagName('template')[0]
    let gene = {}

    gene.gridAmountX = c.slice(0, 2);
    gene.gridAmountY = c.slice(2, 4);

    gene.noiseSeed = c.slice(4, 6);
    gene.noiseSize =c.slice(6, 7);
    gene.noiseX = c.slice(7, 9);
    gene.noiseY = c.slice(9, 11);

    gene.integration = c.slice(11, 12);
    gene.shapeMode = c.slice(12, 13);
    gene.roundMode = c.slice(13, 14);
    gene.roundness = c.slice(14, 15);

    gene.shapeSeed = c.slice(15, 17);

    gene.color = c.slice(17, 23);

    for(let key in gene) {
        let clone = template.content.cloneNode(true)
        let cloneDiv =clone.children[0]
        console.log(clone.children[0].children)
        cloneDiv.children[1].innerText = key;
        cloneDiv.children[2].innerText = gene[key];

        geneCode.appendChild(clone)
    }

}

function openGeneLab() {
    buttonsTop.classList.add('inactive')
    geneCode.innerHTML = ''
    divideGene()
    geneCode.classList.add('active')
}

function createLink() {
    let url_string = (window.location.href);
    let url = new URL(url_string);
    url.searchParams.set('gene', pSketch.gene.code)
    navigator.clipboard.writeText(url);
}


function hideOnClickOutside(element) {
    const outsideClickListener = event => {
        if ((event.target.closest(element.id) === null && event.target.id !== element.id && event.target.tagName !== 'BUTTON') && element.classList.contains('active')) { // or use: event.target.closest(selector) === null
            element.classList.remove('active')
            console.log(event.target.closest(element.id))
            if(element.id === 'mutation-container') {
                for(let i = 0; i < mutationContainer.childNodes.length; i++) {
                    pS[i].remove();
                }
                element.innerHTML = "";
            } else if(element.id === 'info') {
                buttonsSide.classList.remove('inactive')
            }

        }
    }

    document.addEventListener('click', outsideClickListener)
}
function openInfo() {
    info.classList.add('active')
    buttonsSide.classList.add('inactive')
}
mutationContainer.oncontextmenu = (e) => e.preventDefault()

info.addEventListener('click', openInfo)


hideOnClickOutside(mutationContainer)
hideOnClickOutside(info)


mutationContainer.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    mutationContainer.scrollLeft += evt.deltaY;
});
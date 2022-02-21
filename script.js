//     genetic shape generator (generating shapes with p5.js)
//     Copyright (C) 2022  lars hembacher
//
//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
//
//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
//
//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <https://www.gnu.org/licenses/>.



window.onload = function () {
    try {
        let url_string = (window.location.href).toLowerCase();
        let url = new URL(url_string);
        let geneCode = url.searchParams.get("gene");
        if (geneCode) pSketch.useNewGene(geneCode.toUpperCase())

    } catch (err) {
        console.log("Issues with Parsing URL Parameter's - " + err);
    }
}


let decodeGene = (c) => {
    let gene = {}
    gene.gridAmountX = c.slice(0, 2);
    gene.gridAmountY = c.slice(2, 4);

    gene.noiseSeed = c.slice(4, 6);
    gene.noiseSize = c.slice(6, 7);
    gene.noiseX = c.slice(7, 9);
    gene.noiseY = c.slice(9, 11);

    gene.integration = c.slice(11, 12);
    gene.shapeMode = c.slice(12, 13);
    gene.roundMode = c.slice(13, 14);
    gene.roundness = c.slice(14, 15);

    gene.shapeSeed = c.slice(15, 17);

    gene.color = c.slice(17, 23);
    return gene
}
let encodeGene = (g) => {
    let c = ''
    for (let key in g) {
        c += g[key].toString()
    }
    pSketch.useNewGene(c)
    openGeneLab()
}

let increase = (element, gene, key) => {
    let increaseGene = () => {
        let num;
        if (gene[Object.keys(gene)[0]] === gene[key] || gene[Object.keys(gene)[1]] === gene[key]) {
            num = nf((parseInt(gene[key]) + 1) % 51, 2)
        } else if (gene[Object.keys(gene)[2]] === gene[key] || gene[Object.keys(gene)[4]] === gene[key] || gene[Object.keys(gene)[5]] === gene[key] || gene[Object.keys(gene)[10]] === gene[key]) {
            let n = parseInt(gene[key], 16)
            num = hex((n + 3) % 256, 2)
        } else if (gene[Object.keys(gene)[3]] === gene[key] || gene[Object.keys(gene)[6]] === gene[key] || gene[Object.keys(gene)[9]] === gene[key]) {
            let n = parseInt(gene[key], 16)
            num = hex((n + 1) % 16, 1)
        } else if (gene[Object.keys(gene)[7]] === gene[key]) {
            num = (parseInt(gene[key]) + 1) % 3;
        } else if (gene[Object.keys(gene)[8]] === gene[key]) {
            num = (parseInt(gene[key]) + 1) % 5;
        }
        gene[key] = num
        encodeGene(gene)
    }
    element.addEventListener('click', increaseGene)
}

let decrease = (element, gene, key) => {
    let decreaseGene = () => {
        let num;
        if (gene[Object.keys(gene)[0]] === gene[key] || gene[Object.keys(gene)[1]] === gene[key]) {
            num = nf(((parseInt(gene[key]) + 42) % 51) + 8, 2)
        } else if (gene[Object.keys(gene)[2]] === gene[key] || gene[Object.keys(gene)[4]] === gene[key] || gene[Object.keys(gene)[5]] === gene[key] || gene[Object.keys(gene)[10]] === gene[key]) {
            let n = parseInt(gene[key], 16)
            num = hex((n + 253) % 256, 2)
        } else if (gene[Object.keys(gene)[3]] === gene[key] || gene[Object.keys(gene)[6]] === gene[key] || gene[Object.keys(gene)[9]] === gene[key]) {
            let n = parseInt(gene[key], 16)
            num = hex((n + 15) % 16, 1)
        } else if (gene[Object.keys(gene)[7]] === gene[key]) {
            num = (parseInt(gene[key]) + 2) % 3;
        } else if (gene[Object.keys(gene)[8]] === gene[key]) {
            num = (parseInt(gene[key]) + 4) % 5;
        }
        gene[key] = num
        encodeGene(gene)
    }
    element.addEventListener('click', decreaseGene)
}

let submitCol = (element, gene, key) => {
    let sub = () => {
        if (event.keyCode === 13) {
            event.preventDefault()
            gene[key] = element.value
            encodeGene(gene)
        }
    }
    element.addEventListener('keyup', sub)
}

let divideGene = () => {
    let c = pSketch.gene.code
    let template = document.getElementsByTagName('template')[0]
    let templateColor = document.getElementsByTagName('template')[1]
    let gene = decodeGene(c)


    for (let key in gene) {
        if (key !== 'color') {
            let clone = template.content.cloneNode(true)
            let cloneDiv = clone.children[0]
            cloneDiv.children[1].innerText = key;
            cloneDiv.children[2].innerText = gene[key];

            increase(cloneDiv.children[0], gene, key)
            decrease(cloneDiv.children[3], gene, key)
            geneCode.appendChild(clone)
        } else {
            let clone = templateColor.content.cloneNode(true)
            let cloneDiv = clone.children[0]
            cloneDiv.children[0].innerText = key
            cloneDiv.children[1].value = gene[key]
            submitCol(cloneDiv.children[1], gene, key)
            geneCode.appendChild(clone)
        }

    }

}


function createLink() {
    let url_string = (window.location.href);
    let url = new URL(url_string);
    url.searchParams.set('gene', pSketch.gene.code)
    navigator.clipboard.writeText(url);
    alertLink.classList.add('active')
    setTimeout(() => {
        alertLink.classList.remove('active')
    }, 2000)
}

function hideOnClickOutside(element) {
    const outsideClickListener = event => {
        if ((!element.contains(event.target) && event.target.id !== element.id && event.target.tagName !== 'BUTTON') && element.classList.contains('active')) {

            element.classList.remove('active')
            if (element.id === 'mutation-container') {
                for (let i = 0; i < mutationContainer.childNodes.length; i++) {
                    pS[i].remove();
                }
                element.innerHTML = "";
            } else if (element.id === 'info') {
                buttonsSide.classList.remove('inactive')
            } else if (element.id === 'gene') {
                geneCode.classList.remove('lab-mode')
                geneCode.innerHTML = ''
                pSketch.gene.encode(true)
                geneCode.onclick = openGeneLab
                buttonsTop.classList.remove('inactive')
            }


        }
    }

        document.addEventListener('click', outsideClickListener)


}



function openGeneLab() {
    buttonsTop.classList.add('inactive')
    geneCode.innerHTML = ''
    geneCode.onclick = undefined
    divideGene()
    geneCode.classList.add('lab-mode')
    geneCode.classList.add('active')
    hideOnClickOutside(geneCode)
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
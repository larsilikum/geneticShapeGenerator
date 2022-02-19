let geneCode = document.getElementById('gene')
let container = document.getElementById('container')
let mutationContainer = document.getElementById('mutation-container');
let buttonsSide = document.getElementById('buttons-side')
let buttonsTop = document.getElementById('buttons-top')
let info = document.getElementById('info');
let conHeight, conWidth;
let record = false;
let originalGene;

function saveSVG() {
    record = true;
    pSketch.loop();
}

function realRandom(min, max) {
    return Math.random() * (max - min) + min
}

function randomNegPos() {
    return Math.round(Math.random()) * -2 + 1
}

function constrain(num, min, max) {
    return Math.min(Math.max(num, min), max)
}

function nf(input, digits) {
    return String("000" + input).slice(-digits);
}

function hex(num, digits) {
    return ("000" + num.toString(16).toUpperCase()).slice(-digits);
}

class Gene {

    constructor() {
        this.code = '';
        this.color = '000000';
    }

    useGene(c) {
        this.code = c;
        this.decode();
        this.encode(false);
    }

    changeColor(col) {
        if (col.slice(0, 1) == "#") this.color = col.slice(1, 8);
        else this.color = col.slice(0, 7);
        this.encode(true);
    }

    getColor() {
        return '#' + this.color;
    }

    generateRandom() {

        this.gridAmountX = Math.round(realRandom(8, 50));
        this.gridAmountY = Math.round(realRandom(8, 50));

        this.noiseSeed = Math.round(realRandom(0, 255));
        this.noiseSize = realRandom(-0.4, 1.5);
        this.noiseX = Math.round(realRandom(0, 255));
        this.noiseY = Math.round(realRandom(0, 255));

        this.integration = Math.round(realRandom(7.5, 24.5));
        this.shapeVectorGenerationMode = Math.round(realRandom(-0.4, 2.5));

        this.roundMode = Math.round(realRandom(-0.4, 4.5));
        this.roundness = realRandom(-0.4, 1.5);

        this.shapeSeed = Math.round(realRandom(0, 255));
        this.encode(true);
        this.decode();


    }

    newShape() {
        this.shapeSeed = Math.round(realRandom(0, 255));
        this.encode(true);
        this.decode();
    }

    mutate() {
        for (let i = 0; i < 4; i++) {
            let mutation = Math.floor(realRandom(0, 10));
            if(this.noiseSize === 0) {
                while(mutation === 2 || mutation === 4 || mutation === 5) {
                    mutation = Math.floor(realRandom(0, 10));
                }
            }
            let muSize = this.noiseSize===0 ? 2 : 1;

            switch (mutation) {
                case 0:
                    this.gridAmountX = constrain(this.gridAmountX + randomNegPos() * 2 * muSize, 8, 50);
                    break;

                case 1:
                    this.gridAmountY = constrain(this.gridAmountY + randomNegPos() * 2 * muSize, 8, 50);
                    break;

                case 2:
                    this.noiseSeed = constrain(this.noiseSeed + randomNegPos() * 5, 0, 255);
                    break;

                case 3:
                    this.noiseSize = constrain(this.noiseSize + randomNegPos() * 0.0625, 0, 1);
                    break;

                case 4:
                    this.noiseX = constrain(this.noiseX + randomNegPos() * 7, 0, 255);
                    break;

                case 5:
                    this.noiseY = constrain(this.noiseY + randomNegPos() * 7, 0, 255);
                    break;

                case 6:
                    this.integration = constrain(this.integration + randomNegPos() * muSize, 8, 24);
                    break;

                case 7:
                    this.shapeVectorGenerationMode = constrain(this.shapeVectorGenerationMode + randomNegPos(), 0, 2);
                    break;

                case 8:
                    this.roundMode = constrain(this.roundMode + randomNegPos(), 0, 4);
                    break;

                case 9:
                    this.roundness = constrain(this.roundness + randomNegPos() * 0.0625 * 2 * muSize, 0, 1);
                    break;


            }
        }
        this.encode(false);
    }

    decode() {
        this.gridAmountX = constrain(parseInt(this.code.slice(0, 2)), 8, 50);
        this.gridAmountY = constrain(parseInt(this.code.slice(2, 4)), 8, 50);

        this.noiseSeed = constrain(parseInt(this.code.slice(4, 6), 16), 0, 255);
        this.noiseSize = constrain(parseInt(this.code.slice(6, 7), 16) / 16, 0, 1);
        this.noiseX = constrain(parseInt(this.code.slice(7, 9), 16), 0, 255);
        this.noiseY = constrain(parseInt(this.code.slice(9, 11), 16), 0, 255);

        this.integration = constrain(parseInt(this.code.slice(11, 12), 16) + 8, 8, 24);
        this.shapeVectorGenerationMode = constrain(parseInt(this.code.slice(12, 13)), 0, 2);
        this.roundMode = constrain(parseInt(this.code.slice(13, 14)), 0, 4);
        this.roundness = constrain(parseInt(this.code.slice(14, 15), 16) / 16.0, 0, 1);

        this.shapeSeed = constrain(parseInt(this.code.slice(15, 17), 16), 0, 255);

        this.color = this.code.slice(17, 23);

        geneCode.innerText = this.code;
    }

    encode(changeView) {
        let gridX = nf(this.gridAmountX, 2);
        let gridY = nf(this.gridAmountY, 2);

        let noiseSeed = hex(this.noiseSeed, 2);
        let noiseSize = hex(Math.round(this.noiseSize * 16), 1);
        let nX = hex(this.noiseX, 2);
        let nY = hex(this.noiseY, 2);

        let integration = hex(this.integration - 8, 1);
        let sVGM = nf(this.shapeVectorGenerationMode, 1);

        let roundM = nf(this.roundMode, 1);
        let roundness = hex(Math.round(this.roundness * 16), 1);

        let shapeSeed = hex(this.shapeSeed, 2);

        this.code = gridX + gridY + noiseSeed + noiseSize + nX + nY + integration + sVGM + roundM + roundness + shapeSeed + this.color;
        if (changeView) geneCode.innerText = this.code;
    }
}

class Grid {


    constructor(g, w, h) {

        this.amt_x = g.gridAmountX;
        this.amt_y = g.gridAmountY;

        this.gridHeight = h;
        this.gridWidth = w;

        this.amt_noise_x = g.noiseX;
        this.amt_noise_y = g.noiseY;
        this.size_noise = g.noiseSize;

        this.vec = [];
    }

    generate(g, p) {


        p.noiseSeed(g.noiseSeed);
        let x_margin = this.gridWidth / this.amt_x;
        let y_margin = this.gridHeight / this.amt_y;

        for (let x = 0; x < this.amt_x; x++) {
            let x_vec = x_margin * x;
            this.vec[x] = [];
            for (let y = 0; y < this.amt_y; y++) {
                let y_vec = y_margin * y;

                let x_noise = x_vec + p.map(p.noise(x * this.size_noise, y * this.size_noise), 0, 1, -1, 1) * this.amt_noise_x;
                let y_noise = y_vec + p.map(p.noise(y * this.size_noise, x * this.size_noise), 0, 1, -1, 1) * this.amt_noise_y;

                this.vec[x][y] = p.createVector(x_noise, y_noise);


            }
        }
    }
}




let drawGridB = true;


function toggleGrid() {
    drawGridB = !drawGridB;
    pSketch.loop();
    let buttonGrid = document.getElementById('grid-button');
    if(drawGridB) buttonGrid.innerText = 'hide grid'
    else buttonGrid.innerText = 'show grid'

}


function sketch(p) {

    let width, height;
    let storeGene;
    p.gene = new Gene();

    p.grid;

    p.randomGene = function () {

        p.gene.generateRandom();
        p.grid = new Grid(p.gene, p.sWidth, p.sHeight);
        p.grid.generate(p.gene, p);
        p.loop();

    }

    p.newShape = function () {
        p.gene.newShape();
        p.grid = new Grid(p.gene, p.sWidth, p.sHeight);
        p.grid.generate(p.gene, p);
        p.loop();
    }

    p.useNewGene = function (c) {
        p.gene.useGene(c);
        p.grid = new Grid(p.gene, p.sWidth, p.sHeight);
        p.grid.generate(p.gene, p);
        p.loop();
    }


    p.setup = () => {
        p.createCanvas(p.sWidth, p.sHeight, p.SVG);
        width = p.sWidth;
        height = p.sHeight;
        p.gene.generateRandom()

        p.grid = new Grid(p.gene, p.sWidth, p.sHeight);
        p.grid.generate(p.gene, p);
        p.fill(p.gene.getColor());


        p.noStroke();

        if (p.bigView) p.strokeWeight(0.3);
        else p.strokeWeight(0.1);

    }

    p.draw = () => {
        p.clear();


        let scaleX = p.sWidth / (p.gene.noiseX * 2 + p.sWidth);
        let scaleY = p.sHeight / (p.gene.noiseY * 2 + p.sHeight);

        if (!p.bigView) {
            scaleX = p.sWidth * p.ratioP / (p.gene.noiseX * 2 + p.sWidth);
            scaleY = p.sHeight * p.ratioP / (p.gene.noiseY * 2 + p.sHeight);
        }

        p.scale(scaleX, scaleY);

        p.translate(p.gene.noiseX, p.gene.noiseY);


        p.background(200, 0);
        p.randomSeed(p.gene.shapeSeed);

        if (drawGridB) p.drawGrid();

        p.drawShape();
        if(record && p.bigView) {
            p.save(`${p.gene.code}.svg`);
            record = false;
        }
        p.noLoop();

    }




    p.drawGrid = function () {
        for (let i = 0; i < p.gene.gridAmountX; i++) {
            p.stroke(0);
            p.noFill();

            p.beginShape();
            for (let j = 0; j < p.gene.gridAmountY; j++) {
                p.vertex(p.grid.vec[i][j].x, p.grid.vec[i][j].y);

            }
            p.endShape();
        }

        for (let i = 0; i < p.gene.gridAmountY; i++) {
            p.stroke(0);
            p.noFill();

            p.beginShape();
            for (let j = 0; j < p.gene.gridAmountX; j++) {
                p.vertex(p.grid.vec[j][i].x, p.grid.vec[j][i].y);

            }
            p.endShape();
        }
    }


    p.drawShape = function () {
        let vec = [];
        let points = [];

        p.fill(p.gene.getColor());
        p.noStroke();

        //shape generation
        switch (p.gene.shapeVectorGenerationMode) {
            case 0:
                p.calculateGaussian(vec, points);
                break;

            case 1:
                p.calculateNoise(vec, points);
                break;

            case 2:
                p.calculateRandom(points);
                break;
        }


        //draw shape and calculate curves
        if (p.gene.roundMode === 0) {
            p.beginShape();
            for (let i = 0; i < points.length; i++) {

                let point = points[i];
                let pBefore;
                let pAfter;
                if (i !== points.length - 1) {
                    pAfter = points[i + 1];
                } else {
                    pAfter = points[0];
                }
                if (i !== 0) {
                    pBefore = points[i - 1];
                } else {
                    pBefore = [points.length - 1];
                }
                let r = (p.random(0, 1) < p.gene.roundness);
                if (r && i !== 0) p.bezierVertex(pBefore.x, pBefore.y, point.x, point.y, pAfter.x, pAfter.y);
                else p.vertex(point.x, point.y);
            }
            p.endShape();
        } else if (p.gene.roundMode === 1) {
            p.beginShape();
            for (let i = 0; i < points.length - 1; i += 2) {

                let point = points[i];
                let pBefore;
                let pAfter;
                if (i !== points.length - 1) {
                    pAfter = points[i + 1];
                } else {
                    pAfter = points[0];
                }
                if (i != 0) {
                    pBefore = points[i - 1];
                } else {
                    pBefore = points[points.length - 1];
                }
                let r = (p.random(0, 1) < p.gene.roundness);
                if (r && i !== 0) {
                    p.bezierVertex(pBefore.x, pBefore.y, point.x, point.y, pAfter.x, pAfter.y);
                    p.vertex(pAfter.x, pAfter.y);
                } else {
                    p.vertex(point.x, point.y);
                    p.vertex(pAfter.x, pAfter.y);
                }
            }
            p.endShape();
        } else if (p.gene.roundMode === 2) {
            p.beginShape();
            for (let i = 0; i < points.length; i++) {

                let point = points[i];
                let pBefore;
                let pRand = points[(p.abs(p.int(i + (p.random(-3, 3)))) % points.length)];
                if (i !== 0) {
                    pBefore = points[i - 1];
                } else {
                    pBefore = points[points.length - 1];
                }
                let r = (p.random(0, 1) < p.gene.roundness);
                if (r && i != 0) p.bezierVertex(pBefore.x, pBefore.y, pRand.x, pRand.y, point.x, point.y);
                else p.vertex(point.x, point.y);
            }
            p.endShape();

        } else if (p.gene.roundMode === 3) {
            p.beginShape();
            for (let i = 0; i < points.length; i++) {

                let point = points[i];
                let pBefore;

                if (i != 0) {
                    pBefore = points[i - 1];
                } else {
                    pBefore = points[points.length - 1];
                }
                let pRand = p.createVector(point.x + p.random(-point.x / 4, p.sWidth / 4 - point.x / 4), point.y + (p.int(p.random(-1, 1)) * pBefore.y / 4));
                let r = (p.random(0, 1) < p.gene.roundness);
                if (r && i != 0) p.bezierVertex(pBefore.x, pBefore.y, point.x, point.y, pRand.x, pRand.y);
                else p.vertex(point.x, point.y);
            }
            p.endShape();
        } else if (p.gene.roundMode == 4) {
            p.beginShape();
            for (let i = 0; i < points.length; i += 3) {

                let point = points[i];
                let pBefore;
                let pAfter;
                if (i != points.length - 1) {
                    pAfter = points[i + 1];
                } else {
                    pAfter = points[0];
                }

                if (i != 0) {
                    pBefore = points[i - 1];
                } else {
                    pBefore = points[points.length - 1];
                }

                let r = (p.random(0, 1) < p.gene.roundness);
                if (r && i != 0) {
                    p.curveVertex(pBefore.x, pBefore.y);
                    p.curveVertex(point.x, point.y);
                    p.curveVertex(pAfter.x, pAfter.y);
                } else if (r) {
                    p.curveVertex(point.x, point.y);
                    p.curveVertex(pAfter.x, pAfter.y);
                } else if (i != 0) {
                    p.vertex(pBefore.x, pBefore.y);
                    p.vertex(point.x, point.y);
                    p.vertex(pAfter.x, pAfter.y);
                } else {
                    p.vertex(point.x, point.y);
                    p.vertex(pAfter.x, pAfter.y);
                }
            }
            p.endShape();
        }
    }

    p.calculateGaussian = function (vec, points) {
        for (let x = 0; x < p.gene.gridAmountX; x++) {
            vec[x] = [];
            for (let y = 0; y < p.gene.gridAmountY; y++) {
                vec[x][y] = -1;
            }
        }


        for (let i = 0; i < p.gene.gridAmountX * p.gene.gridAmountY / 2; i++) {

            let x = p.int(p.constrain(p.randomGaussian() * p.gene.gridAmountX / p.gene.integration, -(p.gene.gridAmountX / 2), (p.gene.gridAmountX / 2) - 1) + p.gene.gridAmountX / 2);
            let y = p.int(p.constrain(p.randomGaussian() * p.gene.gridAmountY / p.gene.integration, -(p.gene.gridAmountY / 2), (p.gene.gridAmountY / 2) - 1) + p.gene.gridAmountY / 2);

            vec[x][y] = y;
        }


        for (let x = 0; x < p.gene.gridAmountX; x++) {
            let yP = p.max(vec[x]);
            if (yP >= 0) {
                points.unshift(p.grid.vec[x][yP]);
            }
        }

        for (let x = 0; x < p.gene.gridAmountX; x++) {
            for (let y = 0; y < p.gene.gridAmountY; y++) {
                if (vec[x][y] < 0) vec[x][y] = p.gene.gridAmountY;
            }
        }


        for (let x = p.gene.gridAmountX - 1; x > -1; x--) {
            let y = p.min(vec[x]);
            if (y < p.gene.gridAmountY) {
                points.unshift(p.grid.vec[x][y]);
            }
        }

    }

    p.calculateNoise = function (vec, points) {
        for (let x = 0; x < p.gene.gridAmountX; x++) {
            vec[x] = [];
            for (let y = 0; y < p.gene.gridAmountY; y++) {
                vec[x][y] = -1;
            }
        }

        p.noiseSeed(p.gene.shapeSeed);
        let yOffset = p.int(p.random(0, 20));
        for (let i = 0; i < p.gene.gridAmountX * p.gene.gridAmountY / 2; i++) {

            let x = p.int(p.constrain(p.map(p.noise(i * 0.01), 0, 1, -1, 1) * p.gene.gridAmountX * 8 / p.gene.integration, -(p.gene.gridAmountX / 2), (p.gene.gridAmountX / 2) - 1) + p.gene.gridAmountX / 2);
            let y = p.int(p.constrain(p.map(p.noise(yOffset + i * 0.01), 0, 1, -1, 1) * p.gene.gridAmountY * 8 / p.gene.integration, -(p.gene.gridAmountY / 2), (p.gene.gridAmountY / 2) - 1) + p.gene.gridAmountY / 2);

            vec[x][y] = y;
        }


        for (let x = 0; x < p.gene.gridAmountX; x++) {
            let y = p.max(vec[x]);
            if (y >= 0) {
                points.unshift(p.grid.vec[x][y]);
            }
        }

        for (let x = 0; x < p.gene.gridAmountX; x++) {
            for (let y = 0; y < p.gene.gridAmountY; y++) {
                if (vec[x][y] < 0) vec[x][y] = p.gene.gridAmountY;
            }
        }

        for (let x = p.gene.gridAmountX - 1; x > -1; x--) {
            let y = p.min(vec[x]);
            if (y < p.gene.gridAmountY) {
                points.unshift(p.grid.vec[x][y]);
            }
        }
    }


    p.calculateRandom = function (points) {

        let lastX = p.int(p.random(0, p.gene.gridAmountX / 2));
        let lastY = p.int(p.random(0, p.gene.gridAmountY));
        points.unshift(p.grid.vec[lastX][lastY]);
        for (let i = 0; i < p.gene.gridAmountX / 2; i++) {
            let x = p.constrain(lastX + p.round(p.random(-0.6, 1)), 0, p.int(p.gene.gridAmountX / 2));
            let y = p.constrain(lastY + p.round(p.random(-1, 0.6)), 0, p.int(p.gene.gridAmountY / 2));
            points.unshift(p.grid.vec[x][y]);
            lastX = x;
            lastY = y;
        }
        for (let i = 0; i < p.gene.gridAmountX / 2; i++) {
            let x = p.constrain(lastX + p.round(p.random(-0.6, 1)), p.int(p.gene.gridAmountX / 2), p.gene.gridAmountX - 1);
            let y = p.constrain(lastY + p.round(p.random(-0.6, 1)), 0, p.int(p.gene.gridAmountY / 2));
            points.unshift(p.grid.vec[x][y]);
            lastX = x;
            lastY = y;
        }
        for (let i = 0; i < p.gene.gridAmountX / 2; i++) {
            let x = p.constrain(lastX + p.round(p.random(-1, 0.6)), p.int(p.gene.gridAmountX / 2), p.gene.gridAmountX - 1);
            let y = p.constrain(lastY + p.round(p.random(-0.6, 1)), p.int(p.gene.gridAmountY / 2), p.gene.gridAmountY - 1);
            points.unshift(p.grid.vec[x][y]);
            lastX = x;
            lastY = y;
        }
        for (let i = 0; i < p.gene.gridAmountX / 2; i++) {
            let x = p.constrain(lastX + p.round(p.random(-1, 0.6)), 0, p.int(p.gene.gridAmountX / 2));
            let y = p.constrain(lastY + p.round(p.random(-1, 0.6)), p.int(p.gene.gridAmountY / 2), p.gene.gridAmountY - 1);
            points.unshift(p.grid.vec[x][y]);
            lastX = x;
            lastY = y;
        }

    }
}

let pSketch = new p5(sketch, 'container')
pSketch.sWidth = Math.round(container.clientWidth);
pSketch.sHeight = Math.round(container.clientHeight);
pSketch.bigView = true;

window.onresize = reloadSketch;

function reloadSketch() {

    conHeight = container.clientHeight;
    conWidth = container.clientWidth;


    pSketch.width = conWidth;
    pSketch.height = conHeight;
    pSketch.grid = new Grid(pSketch.gene, conWidth, conHeight);
    pSketch.grid.generate(pSketch.gene, pSketch);
    pSketch.resizeCanvas(conWidth, conHeight);

    pSketch.loop();


}

let pS = []
let eventListener = (element, i) => {

    let mutate = () => {
        pSketch.useNewGene(pS[i].gene.code);
        for (let i = 0; i < mutationContainer.childNodes.length; i++) {
            pS[i].remove();
        }
        mutationContainer.classList.remove('active');
        mutationContainer.innerHTML = "";
    }

    let enterMutation = () => {

        pSketch.useNewGene(pS[i].gene.code);
    }

    let leaveMutation = () => {
        pSketch.useNewGene(originalGene);
    }


    element.addEventListener('mouseleave', leaveMutation)
    element.addEventListener('mouseenter', enterMutation)
    element.addEventListener('click', mutate)

}

function mutations() {
    originalGene = pSketch.gene.code
    mutationContainer.classList.add('active');
    let widthC = Math.round(container.clientWidth);
    let heightC = Math.round(container.clientHeight);
    let ratio = widthC / heightC;
    let width = Math.round(mutationContainer.clientHeight * ratio);
    let height = Math.round(mutationContainer.clientHeight);
    let ratioP = width / widthC;
    let ratioPY = height / heightC;


    mutationContainer.innerHTML = "";
    pS = []

    for (let i = 0; i < 7; i++) {
        let child = document.createElement('div')
        child.id = `mutations-${i}`
        child.style.width = `${width}px`;
        child.style.height = `${height}px`;
        child.classList.add('mutations');


        mutationContainer.appendChild(child);

        pS[i] = new p5(sketch, `mutations-${i}`);
        pS[i].sWidth = widthC;
        pS[i].sHeight = heightC;
        pS[i].realWidth = width
        pS[i].realHeight= height
        pS[i].ratioP = ratioP;
        pS[i].ratioPY = ratioPY;

        pS[i].gene.useGene(pSketch.gene.code);
        pS[i].gene.mutate();

        pS[i].grid = new Grid(pS[i].gene, widthC, heightC);
        pS[i].grid.generate(pS[i].gene, pS[i]);
        pS[i].resizeCanvas(width, height);
        pS[i].loop();
        eventListener(child, i)
    }

}



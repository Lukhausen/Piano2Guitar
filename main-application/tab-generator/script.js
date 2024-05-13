/**
 * Represents a TabGenerator for creating guitar chord diagrams as SVG elements.
 * This class allows the configuration of various aspects of the diagram, including finger positions,
 * barre chords, string and note visualization, and color customization.
 */
class TabGenerator {
    /**
     * Creates an instance of TabGenerator.
     * @param {Array<number>} fingerPositions - Array representing finger positions on the frets, with 'x' for muted strings and '0' for open strings.
     * @param {Array<number>} fingerNumbers - Array representing the finger numbers to use on each string.
     * @param {number} [barreSize=null] - Size of the barre to be drawn across strings, null if no barre is used.
     * @param {string} [barre=null] - Specific fret where the barre is placed.
     * @param {string} [elementColor="#000"] - Color for the diagram elements such as strings, frets, and notes.
     * @param {string} [textColor="#fff"] - Color for the text used in the diagram.
     * @param {string} [numberPosition='onNote'] - Position of the numbers, 'onNote' to place them on the note, or any other value to place them separately.
     * @param {boolean} showOpenStrings - Whether to display open strings in the diagram.
     */
    constructor(fingerPositions, fingerNumbers, barreSize = null, barre = null, elementColor = "#000", textColor = "#fff", numberPosition = 'onNote', showOpenStrings) {

        if (!Array.isArray(fingerPositions) || fingerPositions.length !== 6) {
            console.error("Error: fingerPositions must be an array of length 6.");
        }
        if (fingerNumbers && (!Array.isArray(fingerNumbers) || fingerNumbers.length !== 6)) {
            console.error("Error: fingerNumbers must be an array of length 6 or null.");
        }
        if (barreSize !== null && (typeof barreSize !== 'number' || barreSize < 1 || barreSize > 6)) {
            console.error("Error: barreSize must be a number between 1 and 6 or null.");
        }
        if (barre !== null && (typeof barre !== 'number' || !/^\d+$/.test(barre))) {
            console.error("Error: barre must be a string representing a number or null.");
        }
        if (typeof elementColor !== 'string') {
            console.error("Error: elementColor must be a string.");
        }
        if (typeof textColor !== 'string') {
            console.error("Error: textColor must be a string.");
        }
        if (numberPosition !== 'onNote' && numberPosition !== 'belowString') {
            console.error("Error: numberPosition must be either 'onNote' or 'belowString'.");
        }
        if (typeof showOpenStrings !== 'boolean') {
            console.error("Error: showOpenStrings must be a boolean.");
        }

        this.fingerPositions = fingerPositions;
        this.fingerNumbers = fingerNumbers;
        this.barreSize = barreSize;
        this.barre = barre;
        this.numberPosition = numberPosition;
        this.showOpenStrings = showOpenStrings;
        this.topSpacing = 25;
        this.indicatorTopSpacing = 19;
        this.textTopSpacing = 190
        this.topBarHeight = 5
        this.color = elementColor
        this.textColor = textColor
    }

    generateChordSVG() {
        const svgAttributes = {
            width: '200',
            height: '200',
            viewBox: '0 0 200 200'  // This sets the viewBox attribute
        };
        const svg = this.createSVGElement('svg', svgAttributes);
        this.drawDiagramComponents(svg);
        return svg;
    }

    drawDiagramComponents(svg) {
        this.drawTopBar(svg);
        if (this.barreSize !== null) {
            this.drawBarre(svg);
        }
        this.drawStrings(svg);
        this.drawFrets(svg);
        if (this.showOpenStrings) {
            this.drawOpenStrings(svg);
        }
        this.drawNotes(svg);
        this.drawMuteIndicators(svg);
    }


    createSVGElement(tag, attributes) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const attr in attributes) {
            element.setAttribute(attr, attributes[attr]);
        }
        return element;
    }

    drawTopBar(svg) {
        const topBar = this.createSVGElement('rect', {
            x: "29.5",
            y: 14 + this.topSpacing,
            width: '125',
            height: this.topBarHeight,
            fill: this.color,
            stroke: this.color,
            'stroke-width': '2'
        });
        svg.appendChild(topBar);
    }

    drawStrings(svg) {
        for (let i = 0; i < 6; i++) {
            const line = this.createSVGElement('line', {
                x1: 30 + i * 25, y1: this.topSpacing + 13,
                x2: 30 + i * 25, y2: 140 + this.topSpacing,
                stroke: this.color, 'stroke-width': ((6 - i) / 3) + 1
            });
            svg.appendChild(line);
        }
    }

    drawFrets(svg) {
        for (let j = 0; j < 5; j++) {
            const line = this.createSVGElement('line', {
                x1: '30', y1: 20 + this.topSpacing + j * 25,
                x2: '155', y2: 20 + this.topSpacing + j * 25,
                stroke: this.color, 'stroke-width': '2'
            });
            svg.appendChild(line);
        }
    }

    drawNotes(svg) {
        const barreFret = this.barre ? parseInt(this.barre) : 1;
        for (let k = 0; k < 6; k++) {
            if (this.fingerPositions[k] !== 'x') {
                const fret = parseInt(this.fingerPositions[k]);
                if (fret > 0) {
                    const position = 40 + (fret - barreFret) * 25;
                    const circle = this.createSVGElement('circle', {
                        cx: 30 + k * 25, cy: position + this.topSpacing - 8,
                        r: '10', fill: this.color
                    });
                    svg.appendChild(circle);

                    if (this.fingerNumbers && this.fingerNumbers[k]) {
                        const textPositionY = this.numberPosition === 'onNote' ? position + this.topSpacing : this.textTopSpacing;
                        const text = this.createSVGElement('text', {
                            x: 30 + k * 25,
                            y: textPositionY,
                            'font-family': 'Arial',
                            'font-size': '20',
                            'font-weight': '500',
                            fill: this.numberPosition === 'onNote' ? this.textColor : this.color,
                            'text-anchor': 'middle'
                        });
                        text.textContent = this.fingerNumbers[k];
                        svg.appendChild(text);
                    }
                }
            }
        }
    }

    drawMuteIndicators(svg) {
        const ofsetX = 0;
        const ofsetY = -15 + this.indicatorTopSpacing;
        const strokeLength = 13;
        for (let i = 0; i < 6; i++) {
            if (this.fingerPositions[i] == -1) {
                const halfStroke = strokeLength / 2;
                const line1 = this.createSVGElement('line', {
                    x1: 30 + i * 25 - halfStroke + ofsetX,
                    y1: 10 + ofsetY,
                    x2: 30 + i * 25 + halfStroke + ofsetX,
                    y2: 10 + strokeLength + ofsetY,
                    stroke: this.color,
                    'stroke-width': '2'
                });
                const line2 = this.createSVGElement('line', {
                    x1: 30 + i * 25 + halfStroke + ofsetX,
                    y1: 10 + ofsetY,
                    x2: 30 + i * 25 - halfStroke + ofsetX,
                    y2: 10 + strokeLength + ofsetY,
                    stroke: this.color,
                    'stroke-width': '2'
                });
                svg.appendChild(line1);
                svg.appendChild(line2);
            }
        }
    }

    drawOpenStrings(svg) {
        for (let i = 0; i < 6; i++) {
            if (this.fingerPositions[i] === '0') {
                const circle = this.createSVGElement('circle', {
                    cx: 30 + i * 25,
                    cy: this.indicatorTopSpacing,
                    r: '7',
                    fill: 'none',
                    stroke: this.color,
                    'stroke-width': '2'
                });
                svg.appendChild(circle);
            }
        }
    }

    drawBarre(svg) {
        const index = 6 - this.barreSize;
        const barreWidth = this.barreSize * 25 - 15;
        const barreHeight = 10;
        const barreX = 25 + index * 25 - 5;
        const barreY = 25 + (7.5 - barreHeight / 2) + this.topSpacing;

        const rect = this.createSVGElement('rect', {
            x: barreX, y: barreY,
            width: barreWidth + 10, height: barreHeight,
            rx: '5', ry: '5',
            fill: this.color
        });
        svg.appendChild(rect);

        if (this.barre) {
            const text = this.createSVGElement('text', {
                x: barreX + barreWidth + 15, y: barreY + barreHeight,
                'font-family': 'Arial', 'font-size': '20', fill: this.color,
                'text-anchor': 'left'
            });
            text.textContent = this.barre + "fr";
            svg.appendChild(text);
        }
    }
}

export default TabGenerator;
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
    constructor(fingerPositions, fingerNumbers, minAboveZero = 0, barres = [], elementColor = "#000", textColor = "#fff", numberPosition = 'onNote', showOpenStrings) {

        if (!Array.isArray(fingerPositions) || fingerPositions.length !== 6) {
            console.error("Error: fingerPositions must be an array of length 6.");
        }
        if (fingerNumbers && (!Array.isArray(fingerNumbers) || fingerNumbers.length !== 6)) {
            console.error("Error: fingerNumbers must be an array of length 6 or null.");
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
        // Assign instance variables
        this.fingerPositions = fingerPositions;
        this.fingerNumbers = fingerNumbers;
        this.barres = barres;               // Specific fret where the barre is placed
        this.color = elementColor; // Color for diagram elements
        this.textColor = textColor;       // Color for the text
        this.numberPosition = numberPosition; // Position of the numbers
        this.showOpenStrings = showOpenStrings; // Whether to display open strings
        this.maxFret = Math.max(...fingerPositions)



        // Diagram layout constants
        this.topSpacing = 25;
        this.topBarHeight = 7;
        this.fretSpacing = 25;
        this.stringSpacing = 25;
        this.paddingLeft = 15;
        this.barreSidesOverflow = 10;
        this.stringOverflowBotom = 10;
        this.fretCount = 4;
        this.circleRadius = 10;
        this.infoPadding = 10;
        this.openStringRadius = 7;


        //Offset
        this.offset = 1
        if (this.maxFret > this.fretCount){
            this.offset = minAboveZero
        }

        //Global Framw Width
        this.width = 185;
        this.height = 175
    }

    generateChordSVG() {
        const svgAttributes = {
            width:  this.width,
            height: this.height,
            viewBox: "0 0 " +  this.width + " " +this.height  // This sets the viewBox attribute
        };
        const svg = this.createSVGElement('svg', svgAttributes);
        this.drawDiagramComponents(svg);
        return svg;
    }

    drawDiagramComponents(svg) {
        this.drawTopBar(svg);
        if (this.barres) {
            this.barres.forEach(element => {
                this.drawBarre(svg, element[0], element[1], element[2]);

            });
        }
        this.drawStrings(svg);
        this.drawFrets(svg);
        if (this.showOpenStrings) {
            this.drawOpenStrings(svg);
        }
        this.drawNotes(svg);
        this.drawMuteIndicators(svg);
        this.drawFretHeight(svg)
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
            x: this.paddingLeft,
            y: this.topSpacing,
            width: this.stringSpacing * 5,
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
                x1: this.paddingLeft + i * this.stringSpacing, y1: this.topSpacing,
                x2: this.paddingLeft + i * this.stringSpacing, y2: this.fretSpacing * this.fretCount + this.topSpacing + this.stringOverflowBotom + this.topBarHeight,
                stroke: this.color, 'stroke-width': ((6 - i) / 3) + 1
            });
            svg.appendChild(line);
        }
    }

    drawFrets(svg) {
        for (let j = 0; j < this.fretCount + 1; j++) {
            const line = this.createSVGElement('line', {
                x1: this.paddingLeft, y1: this.topSpacing + j * this.fretSpacing + this.topBarHeight,
                x2: this.paddingLeft + this.stringSpacing * 5, y2: this.topSpacing + j * this.fretSpacing + this.topBarHeight,
                stroke: this.color, 'stroke-width': '2'
            });
            svg.appendChild(line);
        }
    }

    drawNotes(svg) {
        for (let string = 0; string < 6; string++) {
            if (this.fingerPositions[string] > 0) {
                let fret = parseInt(this.fingerPositions[string]);
                if (fret > 0) {
                    let position = this.topSpacing + this.topBarHeight + ((fret) - this.offset) * this.fretSpacing - this.circleRadius / 2;
                    let circle = this.createSVGElement('circle', {
                        cx: this.paddingLeft + string * this.stringSpacing, cy: position + this.topSpacing - 8,
                        r: this.circleRadius, fill: this.color
                    });
                    svg.appendChild(circle);

                    if (this.fingerNumbers && this.fingerNumbers[string]) {
                        const textPositionY = this.numberPosition === 'onNote' ? position + this.topSpacing : this.topSpacing + this.topBarHeight + (this.fretCount + 1) * this.fretSpacing + this.stringOverflowBotom;
                        const text = this.createSVGElement('text', {
                            x: this.paddingLeft + string * this.stringSpacing,
                            y: textPositionY,
                            'font-family': 'Arial',
                            'font-size': '20',
                            'font-weight': '500',
                            fill: this.numberPosition === 'onNote' ? this.textColor : this.color,
                            'text-anchor': 'middle'
                        });
                        text.textContent = this.fingerNumbers[string];
                        svg.appendChild(text);
                    }
                }
            }
        }
    }

    drawMuteIndicators(svg) {
        const radius = 10
        const height = radius * Math.sqrt(2)

        for (let i = 0; i < 6; i++) {
            if (this.fingerPositions[i] == -1) {
                const line1 = this.createSVGElement('line', {
                    x1: this.paddingLeft + i * this.stringSpacing - height / 2,
                    y1: this.topSpacing - height - this.infoPadding,
                    x2: this.paddingLeft + i * this.stringSpacing + height / 2,
                    y2: this.topSpacing - this.infoPadding,
                    stroke: this.color,
                    'stroke-width': '2'
                });
                const line2 = this.createSVGElement('line', {
                    x1: this.paddingLeft + i * this.stringSpacing - height / 2,
                    y1: this.topSpacing - this.infoPadding,
                    x2: this.paddingLeft + i * this.stringSpacing + height / 2,
                    y2: this.topSpacing - height - this.infoPadding,
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
                    cx: this.paddingLeft + i * this.stringSpacing,
                    cy: this.topSpacing - this.infoPadding - this.openStringRadius,
                    r: this.openStringRadius,
                    fill: 'none',
                    stroke: this.color,
                    'stroke-width': '2'
                });
                svg.appendChild(circle);
            }
        }
    }

    drawBarre(svg, barreFret, barreStartString, barreEndString) {
        if (barreFret != 0) {
            barreFret = barreFret - this.offset 
            const barreWidth = barreEndString - barreStartString
            const barreHeight = 10;
            const barreX = this.paddingLeft - this.barreSidesOverflow + barreStartString * this.stringSpacing;
            const barreY = barreFret * this.fretSpacing + this.topSpacing + this.topBarHeight + (this.fretSpacing / 2) - barreHeight / 2;

            const rect = this.createSVGElement('rect', {
                x: barreX, y: barreY,
                width: barreWidth * this.stringSpacing + 2 * this.barreSidesOverflow, height: barreHeight,
                rx: '5', ry: '5',
                fill: this.color
            });
            svg.appendChild(rect);


        }
    }

    drawFretHeight(svg) {
        if (this.offset  > 1) {
            const text = this.createSVGElement('text', {
                x:this.paddingLeft + this.stringSpacing*5 + this.infoPadding, y: this.topSpacing + this.topBarHeight + this.fretSpacing * 0.5,
                'font-family': 'Arial', 'font-size': '20', fill: this.color,
                'text-anchor': 'left',
                "alignment-baseline": "central"
            });
            text.textContent = this.offset  + "fr";
            svg.appendChild(text);
        }
    }
}

export default TabGenerator;
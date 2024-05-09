 export default class TabGenerator {
    constructor(fingerPositions, fingerNumbers, barreSize = null, barre = null, elementColor = "#000", textColor= "#fff", numberPosition = 'onNote', showOpenStrings) {
        this.fingerPositions = fingerPositions;
        this.fingerNumbers = fingerNumbers;
        this.barreSize = barreSize;
        this.barre = barre;
        this.numberPosition = numberPosition;
        this.showOpenStrings = showOpenStrings;
        this.topSpacing = 25;
        this.indicatorTopSpacing = 19;
        this.textTopSpacing = 190
        this.color =elementColor
        this.textColor = textColor
    }

    generateChordDiagram() {
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
            x: '30',
            y: 14 + this.topSpacing,
            width: '125',
            height: '5',
            fill: this.color,
            stroke: this.color,
            'stroke-width': '2'
        });
        svg.appendChild(topBar);
    }

    drawStrings(svg) {
        for (let i = 0; i < 6; i++) {
            const line = this.createSVGElement('line', {
                x1: 30 + i * 25, y1: this.topSpacing + 20,
                x2: 30 + i * 25, y2: 140 + this.topSpacing,
                stroke: this.color, 'stroke-width': '2'
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
            if (this.fingerPositions[i] === 'x') {
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
        const barreY = 25+(7.5-barreHeight/2) + this.topSpacing;

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
            text.textContent = this.barre + "";
            svg.appendChild(text);
        }
    }
}


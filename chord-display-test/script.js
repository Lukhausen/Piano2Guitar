class ChordDiagram {
    constructor(fingerPositions, fingerNumbers, barreSize = null, barre = null, numberPosition = 'onNote', showOpenStrings) {
        this.fingerPositions = fingerPositions;
        this.fingerNumbers = fingerNumbers;
        this.barreSize = barreSize;
        this.barre = barre;
        this.numberPosition = numberPosition;
        this.showOpenStrings = showOpenStrings;
        this.topSpacing = 22;
        this.indicatorTopSpacing = 15;
    }

    generateChordDiagram() {
        if (!this.isValidChordString()) {
            throw new Error('Please provide valid finger positions (e.g., ["0", "2", "2", "1", "0", "0"]).');
        }

        const svg = this.createSVGElement('svg', { width: '200', height: '200' });
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

    isValidChordString() {
        return (
            Array.isArray(this.fingerPositions) &&
            this.fingerPositions.length === 6 &&
            this.fingerPositions.every(pos => /^[0-9x]$/.test(pos))
        );
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
            fill: '#fff',
            stroke: '#fff',
            'stroke-width': '2'
        });
        svg.appendChild(topBar);
    }

    drawStrings(svg) {
        for (let i = 0; i < 6; i++) {
            const line = this.createSVGElement('line', {
                x1: 30 + i * 25, y1: this.topSpacing + 20,
                x2: 30 + i * 25, y2: 140 + this.topSpacing,
                stroke: '#fff', 'stroke-width': '2'
            });
            svg.appendChild(line);
        }
    }

    drawFrets(svg) {
        for (let j = 0; j < 5; j++) {
            const line = this.createSVGElement('line', {
                x1: '30', y1: 20 + this.topSpacing + j * 25,
                x2: '155', y2: 20 + this.topSpacing + j * 25,
                stroke: '#fff', 'stroke-width': '2'
            });
            svg.appendChild(line);
        }
    }

    drawNotes(svg) {
        const barreFret = this.barre ? parseInt(this.barre) : 1;
        const commonYPosition = 185;
        for (let k = 0; k < 6; k++) {
            if (this.fingerPositions[k] !== 'x') {
                const fret = parseInt(this.fingerPositions[k]);
                if (fret > 0) {
                    const position = 40 + (fret - barreFret) * 25;
                    const circle = this.createSVGElement('circle', {
                        cx: 30 + k * 25, cy: position + this.topSpacing - 8,
                        r: '10', fill: color
                    });
                    svg.appendChild(circle);

                    if (this.fingerNumbers && this.fingerNumbers[k]) {
                        const textPositionY = this.numberPosition === 'onNote' ? position + this.topSpacing : commonYPosition;
                        const text = this.createSVGElement('text', {
                            x: 30 + k * 25,
                            y: textPositionY,
                            'font-family': 'Arial',
                            'font-size': '20',
                            'font-weight': '500',
                            fill: this.numberPosition === 'onNote' ? textColor : color,
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
                    stroke: color,
                    'stroke-width': '3'
                });
                const line2 = this.createSVGElement('line', {
                    x1: 30 + i * 25 + halfStroke + ofsetX,
                    y1: 10 + ofsetY,
                    x2: 30 + i * 25 - halfStroke + ofsetX,
                    y2: 10 + strokeLength + ofsetY,
                    stroke: color,
                    'stroke-width': '3'
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
                    stroke: color,
                    'stroke-width': '3'
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
        const barreY = 27 + this.topSpacing;

        const rect = this.createSVGElement('rect', {
            x: barreX, y: barreY,
            width: barreWidth + 10, height: barreHeight,
            rx: '5', ry: '5',
            fill: color
        });
        svg.appendChild(rect);

        if (this.barre) {
            const text = this.createSVGElement('text', {
                x: barreX + barreWidth + 15, y: barreY + barreHeight,
                'font-family': 'Arial', 'font-size': '20', fill: color,
                'text-anchor': 'left'
            });
            text.textContent = this.barre + "fr";
            svg.appendChild(text);
        }
    }
}

const fingerPositions = ['6', '5', 'x', '5', '0', '0'];
const fingerNumbers = ['9', '1', '2', '3', '', ''];
const barreSize = 3;
const barre = 10;
const color = "#fff";
const textColor = "#000";
const showOpenStrings = true;

try {
    const chordDiagram = new ChordDiagram(fingerPositions, fingerNumbers, barreSize, barre, 'belowString', showOpenStrings);
    const svg = chordDiagram.generateChordDiagram();
    document.getElementById('diagram').appendChild(svg);
} catch (error) {
    console.error('Error generating chord diagram:', error);
}
function generateChordDiagram() {
    const input = document.getElementById('chordInput').value.trim();
    const diagram = document.getElementById('diagram');
    diagram.innerHTML = '';

    if (!isValidChordString(input)) {
        diagram.textContent = 'Please enter a valid chord string (e.g., 555575).';
        return;
    }

    const svg = createSVGElement('svg', { width: '180', height: '180' });
    drawStrings(svg);
    drawFrets(svg);
    drawNotes(svg, input);
    drawMuteIndicators(svg, input);
    diagram.appendChild(svg);
}

function isValidChordString(input) {
    return input && input.length === 6 && /^[0-9x]{6}$/.test(input);
}

function createSVGElement(tag, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const attr in attributes) {
        element.setAttribute(attr, attributes[attr]);
    }
    return element;
}

function drawStrings(svg) {
    for (let i = 0; i < 6; i++) {
        const line = createSVGElement('line', {
            x1: 30 + i * 25, y1: '30',
            x2: 30 + i * 25, y2: '160',
            stroke: '#333', 'stroke-width': '3'
        });
        svg.appendChild(line);
    }
}

function drawFrets(svg) {
    for (let j = 0; j < 5; j++) {
        const line = createSVGElement('line', {
            x1: '30', y1: 50 + j * 25,
            x2: '155', y2: 50 + j * 25,
            stroke: '#888', 'stroke-width': '3'
        });
        svg.appendChild(line);
    }
}

function drawNotes(svg, input) {
    const barreFret = findBarreFret(input);
    if (barreFret) {
        drawBarre(svg, barreFret.index, barreFret.fret);
    }

    for (let k = 0; k < 6; k++) {
        if (input[k] !== 'x' && (!barreFret || k < barreFret.index || input[k] !== barreFret.fret.toString())) {
            const fret = parseInt(input[k]);
            if (fret > 0) {
                const position = barreFret ? 40 + (fret - parseInt(barreFret.fret)) * 25 : 40 + (fret - 1) * 25;
                const circle = createSVGElement('circle', {
                    cx: 30 + k * 25, cy: position,
                    r: '8', fill: '#007bff'
                });
                svg.appendChild(circle);
            }
        }
    }
}

function drawMuteIndicators(svg, input) {
    for (let i = 0; i < 6; i++) {
        if (input[i] === 'x') {
            const text = createSVGElement('text', {
                x: 30 + i * 25, y: '25',
                'font-family': 'Arial', 'font-size': '15', fill: 'red'
            });
            text.textContent = 'X';
            svg.appendChild(text);
        }
    }
}

function findBarreFret(input) {
    const counts = {};
    for (let char of input) {
        if (char !== 'x' && !isNaN(char)) {
            counts[char] = (counts[char] || 0) + 1;
        }
    }
    for (let fret in counts) {
        if (counts[fret] > 3) {
            return { fret, index: input.indexOf(fret) };
        }
    }
    return null;
}

function drawBarre(svg, index, fret) {
    const rect = createSVGElement('rect', {
        x: 30 + index * 25, y: '40',
        width: (5 - index) * 25, height: '10',
        fill: '#ccc'
    });
    svg.appendChild(rect);

    const text = createSVGElement('text', {
        x: 30 + index * 25 + 5, y: '35',
        'font-family': 'Arial', 'font-size': '12', fill: '#333'
    });
    text.textContent = fret;
    svg.appendChild(text);
}
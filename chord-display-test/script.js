function generateChordDiagram() {
    const input = document.getElementById('chordInput').value.trim();
    const diagram = document.getElementById('diagram');
    diagram.innerHTML = '';

    if (!isValidChordString(input)) {
        diagram.textContent = 'Please enter a valid chord string (e.g., 555575).';
        return;
    }

    const svg = createSVGElement('svg', { width: '180', height: '180' });
    drawTopBar(svg);
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

function drawTopBar(svg) {
    const topBar = createSVGElement('rect', {
        x: '30', 
        y: '22', // Adjusted to ensure the top bar does not interfere with the frets
        width: '125', 
        height: '8', // Ensure this represents the nut and not the first fret
        fill: '#000',
        stroke: '#000', 'stroke-width': '2'
    });
    svg.appendChild(topBar);
}


function drawStrings(svg) {
    for (let i = 0; i < 6; i++) {
        const line = createSVGElement('line', {
            x1: 30 + i * 25, y1: '30',
            x2: 30 + i * 25, y2: '160',
            stroke: '#000', 'stroke-width': '2'
        });
        svg.appendChild(line);
    }
}

function drawFrets(svg) {
    for (let j = 0; j < 5; j++) {
        const line = createSVGElement('line', {
            x1: '30', y1: 50 + j * 25,
            x2: '155', y2: 50 + j * 25,
            stroke: '#000', 'stroke-width': '2'
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
                    r: '8', fill: '#222'
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
                x: 30 + i * 25, 
                y: '15', // Adjust the y-coordinate so the 'X' appears above the top bar
                'font-family': 'Arial', 'font-size': '15', fill: '#000',
                'text-anchor': 'middle'
            });
            text.textContent = '✖';
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
    const barreWidth = (5 - index) * 25;
    const barreHeight = 10;
    const barreX = 30 + index * 25 - 5;
    const barreY = 35;

    const rect = createSVGElement('rect', {
        x: barreX, y: barreY,
        width: barreWidth + 10, height: barreHeight,
        rx: '5', ry: '5',
        fill: '#000'
    });
    svg.appendChild(rect);

    const text = createSVGElement('text', {
        x: barreX + 5, y: barreY - 5,
        'font-family': 'Arial', 'font-size': '12', fill: '#111'
    });
    text.textContent = fret;
    svg.appendChild(text);
}
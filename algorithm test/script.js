const standardTuning = ['E', 'A', 'D', 'G', 'B', 'E'];
const noteIndexMap = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
    'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9,
    'A#': 10, 'B': 11
};

function getValidFretPositionsForNote(noteIndex, stringIndex) {
    let baseFret = (noteIndex - stringIndex + 12) % 12;
    return [baseFret, baseFret + 12];
}

function parseNotes(input) {
    return input.toUpperCase()
        .replace(/B#/g, 'C').replace(/E#/g, 'F')
        .split(/[\s,]+/)
        .filter(note => noteIndexMap.hasOwnProperty(note));
}

function findValidFingerPlacement(chordNotes, tuningNotes) {
    let chordIndices = parseNotes(chordNotes).map(note => noteIndexMap[note]);
    let tuningIndices = tuningNotes.map(note => noteIndexMap[note]);

    let possiblePositions = tuningIndices.map(stringIndex => {
        return chordIndices.reduce((acc, chordIndex) => {
            acc.push(...getValidFretPositionsForNote(chordIndex, stringIndex));
            return acc;
        }, []);
    });

    return possiblePositions;
}

console.log(findValidFingerPlacement("C, E, G", standardTuning));

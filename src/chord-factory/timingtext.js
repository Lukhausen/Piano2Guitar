const MAX_FRETS = 12;

function generateFixedVoicing() {
    return [
        [0, 2, 2, 1, 0, 0],
        [3, 2, 0, 0, 3, 3],
        [0, 3, 2, 0, 1, 0],
        [-1, -1, 0, 2, 3, 2],
        [3, 2, 0, 0, 1, 0]
    ];
}

function generateFixedChords(numChords) {
    const fixedVoicing = generateFixedVoicing();
    const chords = [];
    for (let i = 0; i < numChords; i++) {
        chords.push(fixedVoicing[i % fixedVoicing.length]);
    }
    return chords;
}

function filterPlayableChordsWithSet(allChordsCopy) {
    const startTime = performance.now();

    allChordsCopy.forEach(voicing => {
        let touchedIndices = new Set();

        for (let string = 0; string < 6; string++) {
            if (voicing[string] > 0) {
                touchedIndices.add(`${voicing[string]}-${string}`);
            }
        }
    });

    const endTime = performance.now();
    return endTime - startTime;
}

function filterPlayableChordsWithArrayCheck(allChordsCopy) {
    const startTime = performance.now();

    allChordsCopy.forEach(voicing => {
        let touchedIndices = [];

        for (let string = 0; string < 6; string++) {
            if (voicing[string] > 0) {
                let index = `${voicing[string]}-${string}`;
                if (!touchedIndices.includes(index)) {
                    touchedIndices.push(index);
                }
            }
        }
    });

    const endTime = performance.now();
    return endTime - startTime;
}

const numChords = 10000;
const allChordsCopy = generateFixedChords(numChords);

const timeWithSet = filterPlayableChordsWithSet(allChordsCopy);
const timeWithArrayCheck = filterPlayableChordsWithArrayCheck(allChordsCopy);

console.log(`Time taken with Set: ${timeWithSet} milliseconds`);
console.log(`Time taken with Array Check: ${timeWithArrayCheck} milliseconds`);

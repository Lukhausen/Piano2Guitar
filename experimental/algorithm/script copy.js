const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const standardTuning = ['E', 'A', 'D', 'G', 'B', 'E'];

function getValidFretPositionsForNote(note, guitarString) {
    let validFrets = []
    validFrets[0] = (note - guitarString + 12) % 12
    validFrets[1] = validFrets[0] + 12
    return validFrets
}

console.log(getValidFretPositionsForNote("C", "E"))

function parseNotes(input) {
    // Normalize the input to uppercase and replace various non-standard note formats
    input = input.toUpperCase().replace(/B#/g, 'C').replace(/E#/g, 'F').replace(/,/g, ' ');

    // Create an array by splitting the string on spaces or commas, and filter out empty strings
    const notesArray = input.split(/\s+/).filter(note => note !== '');

    // Validate notes and filter out any invalid entries
    const validNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return notesArray.filter(note => validNotes.includes(note));
}



function findGuitarChords(chordNotes, tuningNotes) {
    // Make Note Beatifull into an array
    chordNotes = parseNotes(chordNotes)

    //Process Chords Array to Number Array
    chordNotes = chordNotes.map(note => {
        const index = notes.indexOf(note);
        return index !== -1 ? index : null;
    }).filter(num => num !== null);

    //Process Tuning Array to Number Array
    tuningNotes = tuningNotes.map(note => {
        const index = notes.indexOf(note);
        return index !== -1 ? index : null;
    }).filter(num => num !== null);

    let possiblePositions = []
    // For Each String, Go though Each Chord Note
    tuningNotes.forEach((stringElement, stringIndex) =>{
        chordNotes.forEach((chordElement, chordIndex) => {
            possiblePositions[stringElement].push(...getValidFretPositionsForNote(chordElement, stringElement))
        })
    })

    possiblePositions.forEach(value=>console.log(value))








    // const chordInput = document.getElementById('chordInput').value.toUpperCase();
    // const chordNotes = chordInput.split('');

    // const guitarChords = [];

    // for (let i = 0; i < standardTuning.length; i++) {
    //     const stringNote = notes.indexOf(standardTuning[i]);
    //     const fretPositions = [];

    //     for (let j = 0; j < chordNumbers.length; j++) {
    //         const fretPosition = (chordNumbers[j] - stringNote + 12) % 12;
    //         fretPositions.push(fretPosition);
    //         fretPositions.push(fretPosition + 12);
    //     }

    //     guitarChords.push(fretPositions);
    // }

    // const chordIntervals = [];
    // for (let i = 0; i <= 12; i++) {
    //     const interval = guitarChords.map(string => {
    //         const fretPositions = string.filter(fret => fret >= i && fret < i + 4);
    //         return fretPositions.length > 0 ? fretPositions[0] - i : 'x';
    //     });
    //     if (!interval.every(fret => fret === 'x')) {
    //         chordIntervals.push(interval.join(''));
    //     }
    // }

    // const outputDiv = document.getElementById('output');
    // outputDiv.innerHTML = `<h2>Possible Guitar Chords for ${chordInput}:</h2>`;
    // chordIntervals.forEach(chord => {
    //     outputDiv.innerHTML += `<p>${chord}</p>`;
    // });
}

console.log(findGuitarChords("C, E, G", standardTuning))
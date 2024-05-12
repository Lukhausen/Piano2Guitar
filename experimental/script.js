function updateChord() {
    const inputField = document.getElementById('noteInput');
    const outputField = document.getElementById('chordOutput');
    
    // Convert input to uppercase and replace "H" with "B"
    let processedInput = inputField.value.toUpperCase().replace(/H/g, 'B');
    
    // Regular expression to match notes, considering sharps, flats after processing
    const notesRegex = /([A-G][#b]?)/g;
    const notes = processedInput.match(notesRegex) || [];
    const chordName = identifyChord(notes);
    outputField.textContent = chordName || "Chord will be displayed here";
}
const noteValues = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7,
    'G#': 8, 'A': 9, 'A#': 10, 'B': 11, 'DB': 1, 'EB': 3, 'GB': 6, 'AB': 8, 'BB': 10
};

function processNotes(notesString) {
    let notes = notesString.toUpperCase().replace(/H/g, 'B').match(/([A-G][#B]?)/g);
    if (!notes) return [];
    notes = [...new Set(notes)]; // Remove duplicate notes
    return notes
        .map(note => {
            if (noteValues.hasOwnProperty(note)) {
                return { note, value: noteValues[note] };
            } else {
                console.warn(`Invalid note name: ${note}`);
                return null;
            }
        })
        .filter(note => note !== null);
}

const chordPatterns = [
    // Triads
    { name: "", intervals: [0, 4, 7], priority: 2 }, // Major
    { name: "m", intervals: [0, 3, 7], priority: 2 }, // Minor
    { name: "aug", intervals: [0, 4, 8], priority: 3 }, // Augmented
    { name: "dim", intervals: [0, 3, 6], priority: 3 }, // Diminished
    // Seventh Chords
    { name: "Maj7", intervals: [0, 4, 7, 11], priority: 4 }, // Major 7th
    { name: "7", intervals: [0, 4, 7, 10], priority: 4 }, // Dominant 7th
    { name: "m7", intervals: [0, 3, 7, 10], priority: 4 }, // Minor 7th
    { name: "mMaj7", intervals: [0, 3, 7, 11], priority: 4 }, // Minor Major 7th
    { name: "dim7", intervals: [0, 3, 6, 9], priority: 4 }, // Diminished 7th
    { name: "m7♭5", intervals: [0, 3, 6, 10], priority: 4 }, // Half-diminished 7th (m7♭5)
    // Extended Chords
    { name: "9", intervals: [0, 4, 7, 10, 14], priority: 5 }, // Dominant 9th
    { name: "Maj9", intervals: [0, 4, 7, 11, 14], priority: 5 }, // Major 9th
    { name: "m9", intervals: [0, 3, 7, 10, 14], priority: 5 }, // Minor 9th
    { name: "11", intervals: [0, 4, 7, 10, 14, 17], priority: 6 }, // Dominant 11th
    { name: "Maj11", intervals: [0, 4, 7, 11, 14, 17], priority: 6 }, // Major 11th
    { name: "m11", intervals: [0, 3, 7, 10, 14, 17], priority: 6 }, // Minor 11th
    { name: "13", intervals: [0, 4, 7, 10, 14, 17, 21], priority: 7 }, // Dominant 13th
    { name: "Maj13", intervals: [0, 4, 7, 11, 14, 17, 21], priority: 7 }, // Major 13th
    { name: "m13", intervals: [0, 3, 7, 10, 14, 17, 21], priority: 7 }, // Minor 13th
    // Altered Chords
    { name: "7♭5", intervals: [0, 4, 6, 10], priority: 4 }, // 7th flat 5
    { name: "7♯5", intervals: [0, 4, 8, 10], priority: 4 }, // 7th sharp 5
    { name: "7♭9", intervals: [0, 4, 7, 10, 13], priority: 5 }, // 7th flat 9
    { name: "7♯9", intervals: [0, 4, 7, 10, 15], priority: 5 }, // 7th sharp 9
    // Power Chords
    { name: "5", intervals: [0, 7], priority: 1 }, // Perfect fifth
    // Slash Chords
    { name: "C/G", intervals: [0, 4, 7, 19], priority: 3 }, // C major with G in the bass
    { name: "D/F#", intervals: [0, 4, 7, 14], priority: 3 }, // D major with F# in the bass
    // Suspended Chords
    { name: "sus2", intervals: [0, 2, 7], priority: 3 }, // Suspended 2nd
    { name: "sus4", intervals: [0, 5, 7], priority: 3 }, // Suspended 4th
    // Added Tone Chords
    { name: "6", intervals: [0, 4, 7, 9], priority: 3 }, // 6th chord
    { name: "m6", intervals: [0, 3, 7, 9], priority: 3 }, // Minor 6th chord
];

function identifyChordWithConfidence(notesString, confidenceThreshold = 0.7) {
    let processedNotes = processNotes(notesString);
    let bestMatch = { name: "Unknown", confidence: 0, priority: 0 };
    processedNotes.forEach(rootNote => {
        chordPatterns.forEach(pattern => {
            let matchedNotes = 0;
            let noteIntervals = new Set(processedNotes.map(note => (12 + note.value - rootNote.value) % 12));
            pattern.intervals.forEach(interval => {
                if (noteIntervals.has(interval)) matchedNotes++;
            });
            let score = matchedNotes / pattern.intervals.length;
            if ((score > bestMatch.confidence) || (score === bestMatch.confidence && pattern.priority > bestMatch.priority)) {
                bestMatch = {
                    name: rootNote.note + pattern.name,
                    confidence: score,
                    priority: pattern.priority
                };
            }
        });
    });
    return bestMatch.confidence >= confidenceThreshold ? bestMatch.name : "Unknown";
}

function updateChord() {
    const inputField = document.getElementById('noteInput');
    const outputField = document.getElementById('chordOutput');
    const chordListField = document.getElementById('chordList');
    const notes = inputField.value;
    try {
        const chordResults = identifyChordsOverThreshold(notes);
        if (chordResults.length > 0) {
            outputField.textContent = chordResults[0].name;
            chordListField.innerHTML = chordResults
                .map(result => `${result.name} (${(result.confidence * 100).toFixed(2)}%)`)
                .join('<br>');
        } else {
            outputField.textContent = 'Unknown';
            chordListField.innerHTML = '';
        }
    } catch (error) {
        outputField.textContent = 'Error: ' + error.message;
        chordListField.innerHTML = '';
    }
}

function identifyChordsOverThreshold(notesString, confidenceThreshold = 0.7) {
    let processedNotes = processNotes(notesString);
    let chordResults = [];
    processedNotes.forEach(rootNote => {
        chordPatterns.forEach(pattern => {
            let matchedNotes = 0;
            let noteIntervals = new Set(processedNotes.map(note => (12 + note.value - rootNote.value) % 12));
            pattern.intervals.forEach(interval => {
                if (noteIntervals.has(interval)) matchedNotes++;
            });
            let confidence = matchedNotes / pattern.intervals.length;
            if (confidence >= confidenceThreshold) {
                chordResults.push({
                    name: rootNote.note + pattern.name,
                    confidence: confidence,
                    priority: pattern.priority
                });
            }
        });
    });
    chordResults.sort((a, b) => b.confidence - a.confidence || b.priority - a.priority);
    return chordResults;
}
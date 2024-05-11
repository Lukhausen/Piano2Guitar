import { STANDARD_TUNING, NOTE_INDEX_MAP, BARRE_RATING } from './constants.js';
import { parseNotes, removeDuplicateArrays } from './utils.js';
import { ChordFactory } from './chord.js';

let totalDuration = 0;
const repetitions = 50;
let lastPlayChords;

for (let i = 0; i < repetitions; i++) {
    const startTime = performance.now();
    
    const chord = new ChordFactory("E, G, B", 4, true, STANDARD_TUNING);
    const playableChords = chord.playableChords
    
    if (i === repetitions - 1) { // Only save the last result
        lastPlayChords = playableChords;
    }

    const endTime = performance.now();
    totalDuration += endTime - startTime; // Calculate the duration for this iteration
}

// Sort lastPlayChords by difficulty
if (lastPlayChords && lastPlayChords.length > 0) {
    lastPlayChords.sort((a, b) => a.rating - b.rating);
}

lastPlayChords.forEach((chord) => console.log(chord));

// Calculate the average time
const averageTime = totalDuration / repetitions;
console.log(`Average Processing Time: ${averageTime.toFixed(2)} ms`);

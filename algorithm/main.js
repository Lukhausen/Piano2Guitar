import { Chord } from './chord.js';

let totalDuration = 0;
const repetitions = 50;
let lastPlayChords;

for (let i = 0; i < repetitions; i++) {
    const startTime = performance.now();
    
    const chord = new Chord("E, C, G, B, D");
    const allChords = chord.generateAllChordCombinations();
    const playableChords = chord.filterPlayableChords(allChords, 0, true);
    
    if (i === repetitions - 1) { // Only save the last result
        lastPlayChords = playableChords;
    }

    const endTime = performance.now();
    totalDuration += endTime - startTime; // Calculate the duration for this iteration
}
console.log(lastPlayChords);
// Calculate the average time
const averageTime = totalDuration / repetitions;
console.log(`Average Processing Time: ${averageTime.toFixed(2)} ms`);

// Print the last result


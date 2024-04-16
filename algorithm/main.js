import { Chord } from './chord.js';

const chord = new Chord("E, C, G");
const allChords = chord.generateAllChordCombinations();
const playableChords = chord.filterPlayableChords(allChords, 0, true);

console.log(playableChords);
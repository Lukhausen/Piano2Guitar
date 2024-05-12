import { STANDARD_TUNING, NOTE_INDEX_MAP, BARRE_RATING } from '../chord-factory/constants.js';
import { parseNotes, removeDuplicateArrays } from '../chord-factory/utils.js';
import { ChordFactory } from '../chord-factory/chordfactory.js';
import { Chord } from '../chord-library/script.js';


const chords = new ChordFactory("E, G, B", 4, true, STANDARD_TUNING);
const playableChords = chords.playableChords


if (playableChords && playableChords.length > 0) {
    playableChords.sort((a, b) => a.rating - b.rating);
}

for (let i = playableChords.length - 1; i >= 0; i--) {
    console.log(playableChords[i]);
}
console.log(playableChords[0])

export class ProgressionGenerator {
    constructor(initialProgression = [], useRoot = true, tuning = STANDARD_TUNING) {
        this.tuning = tuning;
        this.progression = [];
        this.useRoot = useRoot; // This flag determines if the root note should be the starting note
        this.setProgression(initialProgression);
        this.progressionTypes = {
            basic: this.getProgressionBasic,
            // Add more progression types as methods here
        };
    }

    // Set initial progression with ChordFactory instances for each chord
    setProgression(initialProgression) {
        initialProgression.forEach(chord => {
            if (chord instanceof Chord) {
                // Create a ChordFactory for each chord definition = Get All Possible Chords for the Chord
                let chordFactory = new ChordFactory(chord.notes, chord.root, this.useRoot, this.tuning);
                this.progression.push(chordFactory);
            } else {
                console.error('Invalid chord object in initial progression. Each chord must be an instance of Chord.');
            }
        });
    }

    getProgression(type = 'basic') {
        if (this.progressionTypes[type]) {
            return this.progressionTypes[type].call(this); // Ensures the method is called with correct this context
        } else {
            console.error('Invalid progression type requested.');
            return [];
        }
    }

    getProgressionBasic() {
        // Iterate over each entry in the progression and get the first playable chord
        return this.progression.map(chordFactory => {
            if (chordFactory.playableChords && chordFactory.playableChords.length > 0) {
                return chordFactory.playableChords[0];
            } else {
                return null; // Return null if there are no playable chords available
            }
        }).filter(chord => chord !== null); // Filter out any null entries
    }
}
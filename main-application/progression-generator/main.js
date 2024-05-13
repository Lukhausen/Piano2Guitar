import { STANDARD_TUNING, NOTE_INDEX_MAP, BARRE_RATING } from '../chord-factory/constants.js';
import { parseNotes, removeDuplicateArrays } from '../chord-factory/utils.js';
import { ChordFactory } from '../chord-factory/chordfactory.js';
import { Chord } from '../chord-library/script.js';
import TabGenerator from "../tab-generator/script.js"


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
            console.log(chord)
            if (chord instanceof Chord) {
                // Create a ChordFactory for each chord definition = Get All Possible Chords for the Chord                
                let chordFactory = new ChordFactory(chord.notes, chord.rootNote, this.useRoot, this.tuning);
                console.log(chordFactory)
                this.progression.push(chordFactory);
            } else {
                console.error('ProgressionGenerator: Invalid chord object in initial progression. Each chord must be an instance of Chord.');
            }
        });
    }

    getProgression(type = 'basic') {
        if (this.progressionTypes[type]) {
            return this.progressionTypes[type].call(this); // Ensures the method is called with correct this context
        } else {
            console.error('ProgressionGenerator: Invalid progression type requested.');
            return [];
        }
    }

    getProgressionHTML(desiredClasses = [], progressionType = "basic", color, fingerNumbers = "belowString", showOpenStrings = true) {
        // Create an instance of ProgressionGenerator with the given progression and tuning
        const progression = this.getProgression(progressionType); // Get the basic progression

        const diagramsContainer = document.createElement('div'); // Container for chord diagrams
        desiredClasses.forEach(desiredClass => {
            diagramsContainer.classList.add(desiredClass)
        });

        progression.forEach(chordVoicing => {
            // Extract first playable chord from each ChordFactory instance
            if (chordVoicing) {
                // Assuming TabGenerator takes chord details and returns an SVG element
                try {
                    const chordDiagram = new TabGenerator(chordVoicing.voicing, chordVoicing.fingerPositions, chordVoicing.barreSize, chordVoicing.barre, color, this.invertColor(color), fingerNumbers, showOpenStrings);
                    const svg = chordDiagram.generateChordSVG();
                    diagramsContainer.appendChild(svg);
                } catch (error) {
                    console.error('Error generating chord diagram:', error);
                }
            }
        });

        return diagramsContainer; // Return the container with all SVGs
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


    invertColor(hex) {
        // Remove the hash at the start if it's there
        hex = hex.startsWith('#') ? hex.slice(1) : hex;

        // Convert hex to RGB
        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);

        // Invert each component by subtracting from 255
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;

        // Convert the inverted RGB values back to hex
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
}
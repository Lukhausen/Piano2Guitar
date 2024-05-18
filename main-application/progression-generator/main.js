import { TUNING, NOTE_INDEX_MAP, BARRE_RATING } from '../chord-factory/constants.js';
import { parseNotes, removeDuplicateArrays } from '../chord-factory/utils.js';
import { ChordFactory } from '../chord-factory/chordfactory.js';
import { Chord } from '../chord-library/script.js';
import TabGenerator from "../tab-generator/script.js"



export class ProgressionGenerator {
    constructor(initialProgression = [], useRoot = true, tuning = TUNING, color, fingerNumbers = "belowString", showOpenStrings = true) {
        this.tuning = tuning;
        this.color = color;
        this.fingerNumbers = fingerNumbers;
        this.showOpenStrings = showOpenStrings;
        this.progression = [];
        this.useRoot = useRoot; // This flag determines if the root note should be the starting note
        this.chordFactoryMap = {}; // HashMap to store ChordFactory instances

        this.setProgression(initialProgression);

        this.progressionTypes = {
            basic: this.getProgressionBasic,
            // Add more progression types as methods here
        };
    }


    getKey() {
        let notesSet = new Set()
        this.progression.forEach(element => {
            element.notes.forEach(note => {
                notesSet.add(note)
            })
        })
        console.log("getKey - Noteset:", notesSet)
        console.log(this.findKey(notesSet).highestMatch)
        return notesSet
    }

    findKey(noteSet) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const majorScaleIntervals = [2, 2, 1, 2, 2, 2, 1];
        const minorScaleIntervals = [2, 1, 2, 2, 1, 2, 2];

        function generateScale(rootIndex, intervals) {
            let scale = [rootIndex];
            let currentIndex = rootIndex;
            for (let interval of intervals) {
                currentIndex = (currentIndex + interval) % 12;
                scale.push(currentIndex);
            }
            return scale;
        }

        function getMatchPercentage(scale, noteSet) {
            const matchCount = scale.filter(note => noteSet.has(note)).length;
            return (matchCount / scale.length) * 100;
        }

        let keyMatches = [];
        let highestMatch = { key: null, percentage: 0 };

        notes.forEach((note, index) => {
            const majorScale = generateScale(index, majorScaleIntervals);
            const minorScale = generateScale(index, minorScaleIntervals);
            const majorMatchPercentage = getMatchPercentage(majorScale, noteSet);
            const minorMatchPercentage = getMatchPercentage(minorScale, noteSet);

            keyMatches.push({ key: `${note} Major`, percentage: majorMatchPercentage });
            keyMatches.push({ key: `${note} Minor`, percentage: minorMatchPercentage });

            // Update highest match as needed
            if (majorMatchPercentage > highestMatch.percentage) {
                highestMatch = { key: `${note} Major`, percentage: majorMatchPercentage };
            }
            if (minorMatchPercentage > highestMatch.percentage) {
                highestMatch = { key: `${note} Minor`, percentage: minorMatchPercentage };
            }
        });

        return {
            highestMatch: highestMatch,
            allMatches: keyMatches.filter(match => match.percentage > 0) // Filter out 0% matches for brevity
        };
    }

    // Set initial progression with ChordFactory instances for each chord
    setProgression(initialProgression) {
        const newChordFactoryMap = {};
        // Create or reuse ChordFactory instances
        initialProgression.forEach(chord => {
            if (chord instanceof Chord) {
                let chordFactory;
                if (this.chordFactoryMap[chord.name]) {
                    chordFactory = this.chordFactoryMap[chord.name];
                    console.log('ChordFactory retrieved for:', chord.name);

                } else {
                    chordFactory = new ChordFactory(chord, this.useRoot, this.tuning);
                    console.log('New ChordFactory created for:', chord.name);
                }
                newChordFactoryMap[chord.name] = chordFactory;
            } else {
                console.error('ProgressionGenerator: Invalid chord object in initial progression. Each chord must be an instance of Chord.');
            }
        });

        // Update the hashmap and clear out unused ChordFactories
        this.chordFactoryMap = newChordFactoryMap;

        // Populate this.progression with references from the new map
        this.progression = initialProgression.map(chord => this.chordFactoryMap[chord.name]);
        this.getKey()
    }

    getProgression(type = 'basic') {
        if (this.progressionTypes[type]) {
            return this.progressionTypes[type].call(this); // Ensures the method is called with correct this context
        } else {
            console.error('ProgressionGenerator: Invalid progression type requested.');
            return [];
        }
    }

    getProgressionHTML(desiredClasses = [], progressionType = "basic") {
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
                    const chordDiagram = new TabGenerator(chordVoicing.voicing, chordVoicing.fingerPositions, chordVoicing.barreSize, chordVoicing.barre, this.color, this.invertColor(this.color), this.fingerNumbers, this.showOpenStrings);
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


    getProgressionDynamicHTML(soundQuality = 0.5) {
        // Iterate over each entry in the progression, sort by combined rating, and get the first playable chord
        this.progression.forEach(chordFactory => {
            chordFactory.sortPlayableChordsByCombinedRating(soundQuality);
        });

        let diagramsContainer = document.createElement('div'); // Container for chord diagrams
        console.log(this.progression)


        this.progression.forEach(chordFactory => {
            // Extract first playable chord from each ChordFactory instance
            if (chordFactory.playableChords[0]) {
                // Assuming TabGenerator takes chord details and returns an SVG element
                try {
                    const chordDiagram = new TabGenerator(chordFactory.playableChords[0].voicing, chordFactory.playableChords[0].fingerPositions, chordFactory.playableChords[0].barreSize, chordFactory.playableChords[0].barre, this.color, this.invertColor(this.color), this.fingerNumbers, this.showOpenStrings);
                    const svg = chordDiagram.generateChordSVG();
                    diagramsContainer.appendChild(svg);
                } catch (error) {
                    console.error('Error generating chord diagram:', error);
                }
            }
        });

        return diagramsContainer; // Return the container with all SVGs
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
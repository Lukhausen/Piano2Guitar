import { settings, NOTE_INDEX_MAP, BARRE_RATING } from '../chord-factory/constants.js';
import { parseNotes, removeDuplicateArrays } from '../chord-factory/utils.js';
import { ChordFactory } from '../chord-factory/chordfactory.js';
import { Chord } from '../chord-library/script.js';
import { numberToNote } from '../chord-factory/utils.js';
import TabGenerator from "../tab-generator/script.js"



export class ProgressionGenerator {
    constructor(initialProgression = [], useRoot = true, tuning = settings.tuning, color, fingerNumbers = "belowString", showOpenStrings = true) {
        this.tuning = tuning;
        this.color = color;
        this.fingerNumbers = fingerNumbers;
        this.showOpenStrings = showOpenStrings;
        this.progression = [];
        this.useRoot = useRoot; // This flag determines if the root note should be the starting note
        this.chordFactoryMap = {}; // HashMap to store ChordFactory instances
        this.keyAnalysis = []

        this.setProgression(initialProgression);

        this.progressionTypes = {
            basic: this.getProgressionBasic,
            // Add more progression types as methods here
        };
    }

    addKeyAnalysis(root, keyscale, prob) {
        // Push a new object to the array with the analysis data
        this.keyAnalysis.push({
            rootNote: root,
            scale: keyscale,
            probability: prob
        });
    }
    analyzeKey() {

        this.keyAnalysis = []
        //Define Possible Scales
        //Higher Prioroty means They get artifically boostes at the Raking
        const scaleStructures = {
            'Major': { notes: [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1], priority: 0.01 },  // Major Scale: C, D, E, F, G, A, B
            'Minor': { notes: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0], priority: 0.01 },  // Natural Minor Scale: A, B, C, D, E, F, G
            'Minor Pentatonic': { notes: [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0], priority: 0 },  // Minor Pentatonic Scale: A, C, D, E, G
            'Major Pentatonic': { notes: [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], priority: 0 },  // Major Pentatonic Scale: C, D, E, G, A
            'Harmonic Minor': { notes: [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1], priority: 0 },  // Harmonic Minor Scale: A, B, C, D, E, F, G#
            'Blues': { notes: [1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0], priority: 0 },  // Blues Scale: A, C, D, D#, E, G
            'Mixolydian': { notes: [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0], priority: 0 },  // Mixolydian Mode: G, A, B, C, D, E, F
            'Dorian': { notes: [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0], priority: 0 }, // Dorian Mode: D, E, F, G, A, B, C
            'Phrygian': { notes: [1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], priority: 0 }, // Phrygian Mode: E, F, G, A, B, C, D
            'Lydian': { notes: [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1], priority: 0 }, // Lydian Mode: F, G, A, B, C, D, E
            'Locrian': { notes: [1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0], priority: 0 }  // Locrian Mode: B, C, D, E, F, G, A
        };


        //Generate an Array of Notes and How often They are present
        let notesSet = Array(12).fill(0);
        this.progression.forEach(element => {
            element.notes.forEach(note => {
                notesSet[note]++
            })
        })
        console.log("analyzeKey - notesSet:", notesSet)





        //Now GO through The NoteSet and Calucalte A Number for The Probability of the Key
        notesSet.forEach((scopeNote, index) => {


            //Only Look at occuring Notes
            if (scopeNote != 0) {
                //Loop Through the scaleStrucurtres and the notes array

                Object.keys(scaleStructures).forEach(key => {
                    let ammountWeight = 0.01
                    let rootWeight = 0.01
                    //DO NOT CHANGE
                    let distanceToRootWeight = 1
                    let keyProbability = 0
                    for (let relativeNote = 0; relativeNote < 11; relativeNote++) {
                        if ((notesSet[(relativeNote + index) % 12] > 0) && ((scaleStructures[key].notes[relativeNote]) > 0)) {
                            keyProbability += (1 + (notesSet[(relativeNote + index) % 12]) * ammountWeight) * (1 / (distanceToRootWeight))
                            distanceToRootWeight += rootWeight
                        }
                    }
                    this.addKeyAnalysis(index, key, keyProbability + scaleStructures[key].priority)
                })

            }
        })
        this.keyAnalysis = this.keyAnalysis.sort((a, b) => b.probability - a.probability);
        return
    }


    // Set initial progression with ChordFactory instances for each chord
    async setProgression(initialProgression) {
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
        if (this.progression.length > 1) {
            this.analyzeKey()
            console.log("analyzeKey: ", this.keyAnalysis)
            const event = new CustomEvent('scaleDetected', { detail: { scale: "Scale: <b>" + numberToNote(this.keyAnalysis[0].rootNote) + " " + this.keyAnalysis[0].scale + "</b>" } });
            console.log("Key Change Event: " + numberToNote(this.keyAnalysis[0].rootNote) + " " + this.keyAnalysis[0].scale)
            window.dispatchEvent(event);
        } else {
            const event = new CustomEvent('scaleDetected', { detail: { scale: "Scale: ..." } });
            console.log("Key Change Event: none")
            window.dispatchEvent(event);
        }

    }

    getProgression(type = 'basic') {
        if (this.progressionTypes[type]) {
            return this.progressionTypes[type].call(this); // Ensures the method is called with correct this context
        } else {
            console.error('ProgressionGenerator: Invalid progression type requested.');
            return [];
        }
    }

    getPlaceholderHTML() {
        const placeholderCount = 4; // Generate 1 to 3 placeholders
        const diagramsContainer = document.createElement('div'); // Container for chord diagrams
        diagramsContainer.style.opacity = 0.2
        diagramsContainer.style.display = "flex"

        for (let i = 0; i < placeholderCount; i++) {
            // Example placeholder data


            let voicing = [0, 0, 0, 0, 0, 0];

            // Create a set to keep track of chosen indices (to ensure uniqueness)
            let indices = new Set();

            // Randomly choose 4 unique indices
            while (indices.size < 4) {
                let index = Math.floor(Math.random() * voicing.length);
                indices.add(index);
            }

            // Populate the chosen indices with random numbers between -1 and 4
            indices.forEach(index => {
                voicing[index] = Math.floor(Math.random() * 6) - 1; // Generates values from -1 to 4
            });

            const fingerPositions = [0, 0, 0, 0, 0, 0]; // Positions for C major
            const barreSize = 0; // No barre for this example

            // Assuming TabGenerator can handle this static data
            try {
                const chordDiagram = new TabGenerator(voicing, fingerPositions, 0, null, this.color, this.invertColor(this.color), this.fingerNumbers, this.showOpenStrings);
                const svg = chordDiagram.generateChordSVG();
                diagramsContainer.appendChild(svg);
            } catch (error) {
                console.error('Error generating placeholder chord diagram:', error);
            }
        }
        const textContent = document.createElement('div')
        textContent.innerHTML = "Search for chords using the piano keys, the search bar, or connect your MIDI device."
        textContent.style.display = "flex"
        textContent.style.alignItems = "center"
        diagramsContainer.appendChild(textContent);
        return diagramsContainer; // Return the container with all placeholder SVGs
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
                    const chordDiagram = new TabGenerator(chordVoicing.voicing, chordVoicing.fingerPositions, chordVoicing.minAboveZero, chordVoicing.barres, this.color, this.invertColor(this.color), this.fingerNumbers, this.showOpenStrings);
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


    async getProgressionDynamicHTML(soundQuality = 0.5, ammount = 1) {
        // Iterate over each entry in the progression, sort by combined rating, and get the first playable chord
        if (this.progression.length < 1) {
            return this.getPlaceholderHTML()
        }
        this.progression.forEach(chordFactory => {
            chordFactory.sortPlayableChordsByCombinedRating(soundQuality);
        });

        let diagramsContainer = document.createElement('div'); // Container for chord diagrams
        diagramsContainer.classList.add("progressionGeneratorContainer")
        console.log(this.progression)


        this.progression.forEach(chordFactory => {
            // Extract first playable chord from each ChordFactory instance
            for (let i = 0; i < ammount; i++) {
                if (chordFactory.playableChords[i]) {
                    // Assuming TabGenerator takes chord details and returns an SVG element
                    try {
                        const chordDiagram = new TabGenerator(chordFactory.playableChords[i].voicing, chordFactory.playableChords[i].fingerPositions, chordFactory.playableChords[i].minAboveZero, chordFactory.playableChords[i].barres, this.color, this.invertColor(this.color), this.fingerNumbers, this.showOpenStrings);
                        const svg = chordDiagram.generateChordSVG();
                        let svgContainer = document.createElement('div'); // Container for chord diagrams
                        svgContainer.classList.add("progressionGeneratorSvgContainer")

                        let svgNameContainer = document.createElement('div'); // Container for chord diagrams
                        svgNameContainer.innerHTML = chordFactory.identifier
                        svgNameContainer.classList.add("progressionGeneratorSvgChordName")


                        svgContainer.appendChild(svg);
                        svgContainer.appendChild(svgNameContainer)
                        diagramsContainer.appendChild(svgContainer)
                    } catch (error) {
                        console.error('Error generating chord diagram:', error);
                    }
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
import { settings, BARRE_RATING } from '../chord-factory/constants.js';
import { parseNotes, removeDuplicateArrays, NOTE_INDEX_MAP } from '../chord-factory/utils.js';
import { ChordFactory } from '../chord-factory/chordfactory.js';
import { Chord } from '../chord-library/script.js';
import { numberToNote } from '../chord-factory/utils.js';
import TabGenerator from "../tab-generator/script.js"
import { TabHTML } from './tabhtml.js';



export class ProgressionGenerator {
    constructor(initialProgression = [], useRoot = true, color, fingerNumbers = "belowString", showOpenStrings = true) {
        this.tuning = settings.tuning;
        this.color = color;
        this.fingerNumbers = fingerNumbers;
        this.showOpenStrings = showOpenStrings;
        this.progression = [];
        this.progressionChords = [];
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
        //only do this if progression is there...
        if (!initialProgression) {
            return
        }
        this.progressionChords = initialProgression
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

    async reloadProgression() {
        this.tuning = settings.tuning;
        this.chordFactoryMap = {};
        this.progression = []
        this.setProgression(this.progressionChords);
        console.log("ProgressionGenerator: Reloaded Progression")
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
                // Generate random values from -1 to fretifinger - 1
                voicing[index] = Math.floor(Math.random() * (settings.fingerFretRange + 1));
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



    async getProgressionDynamicHTML(soundQuality = 0.5, ammount = 1) {
        // Check if there are any chords in the progression
        if (this.progression.length < 1) {
            return this.getPlaceholderHTML();
        }

        // Create the container for the chord diagrams
        let diagramsContainer = document.createElement('div'); // Container for chord diagrams
        diagramsContainer.classList.add("progressionGeneratorContainer");

        // Iterate over each ChordFactory instance in the progression
        this.progression.forEach(chordFactory => {
            // Create an instance of TabHTML for the current chordFactory
            const tabHTML = new TabHTML(chordFactory, this.color, this.fingerNumbers, this.showOpenStrings);

            // Generate the HTML for the current chordFactory
            const chordDiagrams = tabHTML.generateHTML(soundQuality, ammount);

            // Append the generated HTML to the main container
            chordDiagrams.forEach(element => {
                diagramsContainer.appendChild(element);

            })
        });

        // Return the container with all chord diagrams
        return diagramsContainer;
    }


    async getProgressionEasyHTML() {
        //First Find The Easiest to play Chords With this Gutar Tuning


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
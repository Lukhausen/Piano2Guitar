import { settings } from '../chord-factory/constants.js';
import { ChordFactory } from '../chord-factory/chordfactory.js';
import { Chord } from '../chord-library/script.js';
import { numberToNote } from '../chord-factory/utils.js';
import { TabHTML } from './tabhtml.js';


class ChordFactoryManager {
    constructor(useRoot) {
        this.chordFactoryMap = {};
        this.useRoot = useRoot;
    }

    getChordFactory(chord, key) {
        if (!this.chordFactoryMap[key]) {
            this.chordFactoryMap[key] = {};
        }

        if (this.chordFactoryMap[key][chord.name]) {
            console.log(`ChordFactory retrieved for: ${chord.name} in key: ${key}`);
            return this.chordFactoryMap[key][chord.name];
        } else {
            const chordFactory = new ChordFactory(chord, this.useRoot, settings.tuning);
            this.chordFactoryMap[key][chord.name] = chordFactory;
            console.log(`New ChordFactory created for: ${chord.name} in key: ${key}`);
            return chordFactory;
        }
    }
}


export class ProgressionGenerator {
    constructor(initialProgression = [], useRoot = true, chordLibrary, color, fingerNumbers = "belowString", showOpenStrings = true) {
        this.color = color;
        this.fingerNumbers = fingerNumbers;
        this.showOpenStrings = showOpenStrings;
        this.progression = [];
        this.progressionChords = [];
        this.useRoot = useRoot; // This flag determines if the root note should be the starting note
        this.keyAnalysis = []
        this.chordLibrary = chordLibrary

        // Initialize ChordFactoryManager
        this.chordFactoryManager = new ChordFactoryManager(this.useRoot);

        // Call the asynchronous initialization function
        this.initialize(initialProgression);
    }

    async initialize(initialProgression) {
        await this.setProgression(initialProgression);

        await this.getEasiestChords();


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
        if (!initialProgression) {
            return;
        }

        this.progressionChords = initialProgression;

        // Populate this.progression with ChordFactory instances
        this.progression = initialProgression.map(chord => {
            if (chord instanceof Chord) {
                return this.chordFactoryManager.getChordFactory(chord, "dynamic");
            } else {
                console.error('ProgressionGenerator: Invalid chord object in initial progression. Each chord must be an instance of Chord.');
                return null;
            }
        }).filter(chordFactory => chordFactory !== null);

        // Populate this.progression with references from the new map
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
        this.chordFactoryManager = new ChordFactoryManager(this.useRoot);
        this.progression = [];
        this.initialize(this.progressionChords);
        console.log("ProgressionGenerator: Reloaded Progression");
    }


    getPlaceholderHTML() {
        let diagramsContainer = document.createElement('div');
        diagramsContainer.classList.add("progressionGeneratorContainer");
        diagramsContainer.style.opacity = 0.2

        let placeholderhtml = new TabHTML().generatePlaceholder(3)

        placeholderhtml.forEach(element => {
            diagramsContainer.appendChild(element);

        })
        return diagramsContainer; // Return the container with all placeholder SVGs
    }



    async getProgressionDynamicHTML(soundQuality = 0.5, amount = 1) {
        if (this.progression.length < 1) {
            return this.getPlaceholderHTML();
        }

        let diagramsContainer = document.createElement('div');
        diagramsContainer.classList.add("progressionGeneratorContainer");


        this.progression.forEach((chordFactory, index)=>{
            let container = document.createElement("div")
            let placeholderhtml = new TabHTML().generatePlaceholder(1, "Loading...")
            placeholderhtml[0].style.opacity=0.2
            container.id = "progression-generator-dynamic-"+index
            container.appendChild(placeholderhtml[0])
            diagramsContainer.appendChild(container);
        })

        this.progression.forEach(async (chordFactory, index) => {
            const tabHTML = new TabHTML(chordFactory, this.color, this.fingerNumbers, this.showOpenStrings);
            const chordDiagrams = await tabHTML.generateHTML(soundQuality, amount);
            let container = document.getElementById("progression-generator-dynamic-"+index)
            container.innerHTML=""
            container.appendChild(chordDiagrams[0])
        });

        return diagramsContainer;
    }


    async getProgressionEasyHTML() {
        if (!this.easiestChords) {
            await this.getEasiestChords();  // Assumed to properly fetch and set this.easiestChords
        }

        if (this.progression.length < 1) {
            return [this.getPlaceholderHTML(), 0];
        }
        const originalProgression = structuredClone(this.progressionChords); // Make a copy of the progression chords
        let bestTransposition = 0;
        let maxOverlap = 0;

        // Function to transpose a chord by a given number of semitones
        let transposeChord = (chord, semitones) => {
            return this.chordLibrary.transposeChord(chord, semitones);
        };

        for (let i = 0; i < 12; i++) {

            let overlapCount = 0;
            let transposedProgression = await Promise.all(
                originalProgression.map(chord =>
                    this.chordLibrary.simplifySlashChord(transposeChord(chord, i))
                )
            );
            transposedProgression.forEach(chord => {

                this.easiestChords.forEach(easyChord => {
                    if (chord.name == easyChord.name) {
                        overlapCount++;
                    }
                });
            });

            if (overlapCount > maxOverlap) {
                maxOverlap = overlapCount;
                bestTransposition = i;
            }
        }

        // Transpose the original progression to the best transposition

        let bestTransposedProgression = await Promise.all(
            originalProgression.map(chord =>
                this.chordLibrary.simplifySlashChord(transposeChord(chord, bestTransposition))
            )
        );

        bestTransposedProgression = bestTransposedProgression.map(chord => {
            if (chord instanceof Chord) {
                return this.chordFactoryManager.getChordFactory(chord, "easy");
            } else {
                console.error('ProgressionGenerator: Invalid chord object in initial progression. Each chord must be an instance of Chord.');
                return null;
            }
        });


        // Generate the HTML for the best transposed progression
        let diagramsContainer = document.createElement('div'); // Container for chord diagrams
        diagramsContainer.classList.add("progressionGeneratorContainer");



        bestTransposedProgression.forEach((chordFactory, index)=>{
            let container = document.createElement("div")
            let placeholderhtml = new TabHTML().generatePlaceholder(1, "Loading...")
            placeholderhtml[0].style.opacity=0.2
            container.id = "progression-generator-easy-"+index
            container.appendChild(placeholderhtml[0])
            diagramsContainer.appendChild(container);
        })

        // Iterate over each ChordFactory instance in the progression
        bestTransposedProgression.forEach(async (chordFactory,index) => {
            // Create an instance of TabHTML for the current chordFactory
            let tabHTML = new TabHTML(chordFactory, this.color, this.fingerNumbers, this.showOpenStrings);

            // Generate the HTML for the current chordFactory
            let chordDiagrams = await tabHTML.generateHTML(0, 1);
            // Append the generated HTML to the main container

            let container = document.getElementById("progression-generator-easy-"+index)
            container.innerHTML=""
            container.appendChild(chordDiagrams[0])

        });

        // Return the container with all chord diagrams
        return [diagramsContainer, (12 - bestTransposition) % 12];
    }

    async getEasiestChords() {
        const easiestChordsArray = [
            [-1, 0, 2, 2, 2, 0],   // A major (A)
            [-1, 0, 2, 2, 1, 0],   // A minor (Am)
            [-1, 0, 2, 0, 1, 0],   // A minor 7 (Am7)
            [-1, 0, 2, 2, 0, 0],   // Asus2
            [-1, 3, 2, 0, 1, 0],   // C major (C)
            [-1, 3, 2, 0, 1, 0],   // C major 7 (Cmaj7)
            [-1, -1, 0, 2, 3, 2],  // D major (D)
            [-1, -1, 0, 2, 1, 2],  // D minor (Dm)
            [3, 2, 0, 0, 0, 3],    // G major (G)
            [0, 2, 2, 1, 0, 0],    // E major (E)
            [0, 2, 0, 1, 0, 0],    // E7
            [0, 2, 2, 0, 0, 0],    // E minor (Em)
            [1, 3, 3, 2, 1, 1],    // F major (F)
        ];


        let easiestChords = [];
        let currentChord = new Set();

        for (const element of easiestChordsArray) {
            currentChord = new Set();
            for (let i = 0; i < 6; i++) {
                if (element[i] != -1) {
                    currentChord.add((settings.tuning[i] + element[i]) % 12);
                }
            }
            let root = -1
            for (let i = 0; i < 6; i++) {
                if (element[i] != -1) {
                    root = (settings.tuning[i] + element[i]) % 12
                    break;
                }
            }
            const foundChords = await this.chordLibrary.searchChords(Array.from(currentChord), root, 100);
            if (foundChords[0]) {
                easiestChords.push(foundChords[0]);
            }
        }

        console.log("getEasiestChords:", easiestChords)
        this.easiestChords = easiestChords
        return
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
import { DragAndDropItem } from "../drag-drop/script.js";

export class Chord {
    constructor(rootNote, notes, name, customRoot) {
        this.rootNote = rootNote; // Integer 0-11, where 0 = C, 1 = C#, 2 = D, etc.
        this.notes = notes; // Array of integers representing notes of the chord
        this.name = name; // String representing the full name of the chord, e.g., "Gm", "Asus4"
        this.customRoot = customRoot 
        console.log("Constructed Chord: " + this.name + " Root: " + this.rootNote + " Notes: " + this.notes)
    }
}

export class ChordLibrary {
    constructor() {
        this.chords = [];
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        this.chordStructures = {
            '': { notes: [0, 4, 7], priority: 1 }, // Major
            'm': { notes: [0, 3, 7], priority: 2 }, // Minor
            '7': { notes: [0, 4, 7, 10], priority: 3 }, // Dominant 7th
            'M7': { notes: [0, 4, 7, 11], priority: 4 }, // Major 7th
            'm7': { notes: [0, 3, 7, 10], priority: 5 }, // Minor 7th
            'mM7': { notes: [0, 3, 7, 11], priority: 18 }, // Minor Major 7th
            'sus2': { notes: [0, 2, 7], priority: 7 }, // Suspended 2nd
            'sus4': { notes: [0, 5, 7], priority: 6 }, // Suspended 4th
            'dim': { notes: [0, 3, 6], priority: 9 }, // Diminished
            'aug': { notes: [0, 4, 8], priority: 8 }, // Augmented
            '9': { notes: [0, 4, 7, 10, 14], priority: 11 }, // Dominant 9th
            'M9': { notes: [0, 4, 7, 11, 14], priority: 12 }, // Major 9th
            'm9': { notes: [0, 3, 7, 10, 14], priority: 13 }, // Minor 9th
            '11': { notes: [0, 4, 7, 10, 14, 17], priority: 16 }, // Dominant 11th
            '13': { notes: [0, 4, 7, 10, 14, 17, 21], priority: 24 }, // Dominant 13th
            'add9': { notes: [0, 2, 4, 7], priority: 17 }, // Added 9th
            'm6': { notes: [0, 3, 7, 9], priority: 14 }, // Minor 6th
            '6': { notes: [0, 4, 7, 9], priority: 15 }, // Major 6th
            '5': { notes: [0, 7], priority: 10 }, // Power chord
            '6/9': { notes: [0, 4, 7, 9, 14], priority: 42 }, // Major 6/9
            'm11': { notes: [0, 3, 7, 10, 14, 17], priority: 39 }, // Minor 11
            'M7#11': { notes: [0, 4, 7, 11, 18], priority: 29 }, // Major 7#11
            'm7b5': { notes: [0, 3, 6, 10], priority: 19 }, // Half-Diminished
            '+7': { notes: [0, 4, 8, 10], priority: 21 }, // Augmented 7th
            'dim7': { notes: [0, 3, 6, 9], priority: 20 }, // Diminished 7th
            'M7+5': { notes: [0, 4, 8, 11], priority: 28 }, // Augmented Major 7th
            'mM9': { notes: [0, 3, 7, 11, 14], priority: 18 }, // Minor Major 9th
            'dimM7': { notes: [0, 3, 6, 11], priority: 22 }, // Diminished Major 7th
            '7alt': { notes: [0, 4, 6, 10, 13], priority: 23 }, // Altered Dominant
            'M13': { notes: [0, 4, 7, 11, 14, 17, 21], priority: 24 }, // Major 13th
            'M11': { notes: [0, 4, 7, 11, 14, 17], priority: 25 }, // Major 11th
            'M7sus4': { notes: [0, 5, 7, 11], priority: 26 }, // Major 7th Suspended 4th
            'm7#5': { notes: [0, 3, 8, 10], priority: 27 }, // Minor 7th #5
            'M#5': { notes: [0, 4, 8], priority: 28 }, // Major #5
            '9#11': { notes: [0, 4, 7, 10, 14, 18], priority: 29 }, // Dominant 9th #11
            '13#11': { notes: [0, 4, 7, 10, 14, 18, 21], priority: 30 }, // Dominant 13th #11
            '7b5': { notes: [0, 4, 6, 10], priority: 31 }, // Dominant 7th Flat Five
            'M7b5': { notes: [0, 4, 6, 11], priority: 32 }, // Major 7th Flat Five
            'M7#5': { notes: [0, 4, 8, 11], priority: 33 }, // Major 7th Sharp Five
            'm7b9': { notes: [0, 3, 7, 10, 13], priority: 34 }, // Minor 7th Flat Nine
            '9b5': { notes: [0, 4, 6, 10, 14], priority: 34 }, // 9th Flat Five
            '9#5': { notes: [0, 4, 8, 10, 14], priority: 35 }, // 9th Sharp Five
            '7b9': { notes: [0, 4, 7, 10, 13], priority: 36 }, // Dominant 7th Flat Nine
            '7#9': { notes: [0, 4, 7, 10, 15], priority: 37 }, // Dominant 7th Sharp Nine
            '7#11': { notes: [0, 4, 7, 10, 18], priority: 38 }, // Dominant 7th Sharp Eleven
            'm7add11': { notes: [0, 3, 7, 10, 17], priority: 39 }, // Minor 7th Add 11
            'add2': { notes: [0, 2, 4, 7], priority: 40 }, // Major Add 2
            'add4': { notes: [0, 4, 5, 7], priority: 41 }, // Major Add 4
            '6add9': { notes: [0, 4, 7, 9, 14], priority: 42 }, // Major 6 Add 9

            '/C': { notes: [0, 4, 7], root: 0, priority: 43 }, // C Major
            'm/C': { notes: [0, 3, 7], root: 0, priority: 44 }, // C Minor
            '/C#': { notes: [0, 4, 7], root: 1, priority: 43 }, // C# Major
            'm/C#': { notes: [0, 3, 7], root: 1, priority: 44 }, // C# Minor
            '/D': { notes: [0, 4, 7], root: 2, priority: 43 }, // D Major
            'm/D': { notes: [0, 3, 7], root: 2, priority: 44 }, // D Minor
            '/D#': { notes: [0, 4, 7], root: 3, priority: 43 }, // D# Major
            'm/D#': { notes: [0, 3, 7], root: 3, priority: 44 }, // D# Minor
            '/E': { notes: [0, 4, 7], root: 4, priority: 43 }, // E Major
            'm/E': { notes: [0, 3, 7], root: 4, priority: 44 }, // E Minor
            '/F': { notes: [0, 4, 7], root: 5, priority: 43 }, // F Major
            'm/F': { notes: [0, 3, 7], root: 5, priority: 44 }, // F Minor
            '/F#': { notes: [0, 4, 7], root: 6, priority: 43 }, // F# Major
            'm/F#': { notes: [0, 3, 7], root: 6, priority: 44 }, // F# Minor
            '/G': { notes: [0, 4, 7], root: 7, priority: 43 }, // G Major
            'm/G': { notes: [0, 3, 7], root: 7, priority: 44 }, // G Minor
            '/G#': { notes: [0, 4, 7], root: 8, priority: 43 }, // G# Major
            'm/G#': { notes: [0, 3, 7], root: 8, priority: 44 }, // G# Minor
            '/A': { notes: [0, 4, 7], root: 9, priority: 43 }, // A Major
            'm/A': { notes: [0, 3, 7], root: 9, priority: 44 }, // A Minor
            '/A#': { notes: [0, 4, 7], root: 10, priority: 43 }, // A# Major
            'm/A#': { notes: [0, 3, 7], root: 10, priority: 44 }, // A# Minor
            '/B': { notes: [0, 4, 7], root: 11, priority: 43 }, // B Major
            'm/B': { notes: [0, 3, 7], root: 11, priority: 44 } // B Minor
        };

        this.generateChords();
    }

    generateChords() {
        Object.entries(this.chordStructures).forEach(([suffix, structure]) => {
            for (let i = 0; i < 12; i++) {
                let rootNote = i
                let customRoot = false
                let notes = structure.notes.map(interval => (i + interval) % 12);
                const chordName = `${this.noteNames[i]}${suffix}`;
                if (structure.root !== undefined) {
                    // Filter Dumb Chord Like C/C D/D
                    if (structure.root == rootNote) {
                        continue;
                    }
                    rootNote = structure.root;
                    customRoot = true;
                    notes.push(rootNote);
                }

                const chord = new Chord(rootNote, notes, chordName, customRoot);
                chord.priority = structure.priority;
                this.chords.push(chord);
            }
        });

        // Sort chords by priority
        this.chords.sort((a, b) => a.priority - b.priority);
    }

    async searchChords(noteArray, rootNote, threshold = 50) {
        console.log("Searching Chords...")
        const results = [];
        noteArray = noteArray.map(note => note % 12); // Normalize notes to be within octave
        if (rootNote) {
            rootNote = rootNote % 12

        }
        const inputNotesSet = new Set(noteArray);

        this.chords.forEach(chord => {
            let chordNotes = [...chord.notes];

            //console.log("Comparing to: " + chord.name)
            //Add the Root note to the Chords For Cases like A/D
            
            //console.log("Input Notes Set: ", inputNotesSet);

            const commonNotes = new Set([...chordNotes].filter(note => inputNotesSet.has(note)));
            //console.log("Common Notes with Chord: ", commonNotes);

            const totalUniqueNotes = new Set([...chordNotes, ...noteArray]);
            //console.log("Total Unique Notes: ", totalUniqueNotes);


            let matchPercentage = (commonNotes.size / totalUniqueNotes.size) * 100;
            //console.log("Searched Root: " + rootNote + " Presen Root: " + chord.rootNote);

            // Adjusting match percentage based on root note comparison
            if (rootNote !== null) {
                if (chord.rootNote == rootNote) {
                    //console.log("Matching Root for: " + chord.name + " Root: " + chord.rootNote + " Notes: " + chordNotes)
                    // If root notes match, this is fine as calculated
                } else {
                    // Penalize the match percentage slightly if root notes don't match
                    matchPercentage *= 0.85; // Penalize by 10%
                    //console.log("Panelized for not matching Root")
                }
            } else {
                //If a Custom Root in the CHord Details is specified but the user hasnt put a custom root
                if (chord.customRoot == true) {
                    matchPercentage *= 0.85; // Penalize by 10%
                    //console.log("Panelized For Havinng Specific when it shouldnt")

                }
            }



            if (matchPercentage >= threshold) {
                results.push(
                    new DragAndDropItem(chord, parseFloat(matchPercentage.toFixed(2)))
                );
            }
        });

        // Sort results by probability in descending order
        return results.sort((a, b) => b.probability - a.probability);
    }

    getAllChords() {
        // Return all chord names in a simplified object format
        return this.chords;
    }

    getChordByName(name) {
        const chord = this.chords.find(chord => chord.name === name);
        if (chord) {
            //console.log('Chord found:', chord);
            return chord;
        } else {
            //console.log('No chord found with the name:', name);
            return null;
        }
    }
}


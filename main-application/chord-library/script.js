class Chord {
    constructor(rootNote, notes, name, customRoot) {
        this.rootNote = rootNote; // Integer 0-11, where 0 = C, 1 = C#, 2 = D, etc.
        this.notes = notes; // Array of integers representing notes of the chord
        this.name = name; // String representing the full name of the chord, e.g., "Gm", "Asus4"
        this.customRoot = customRoot
        console.log("Registered Note: " + this.name + " Root: " + this.rootNote + " Notes: " + this.notes)
    }
}

class ChordLibrary {
    constructor() {
        this.chords = [];
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        this.chordStructures = {
            '': { notes: [0, 4, 7] }, // Major
            'm': { notes: [0, 3, 7] }, // Minor
            '7': { notes: [0, 4, 7, 10] }, // Dominant 7th
            'M7': { notes: [0, 4, 7, 11] }, // Major 7th
            'm7': { notes: [0, 3, 7, 10] }, // Minor 7th
            'mM7': { notes: [0, 3, 7, 11] }, // Minor Major 7th
            'sus2': { notes: [0, 2, 7] }, // Suspended 2nd
            'sus4': { notes: [0, 5, 7] }, // Suspended 4th
            'dim': { notes: [0, 3, 6] }, // Diminished
            'aug': { notes: [0, 4, 8] }, // Augmented
            '9': { notes: [0, 4, 7, 10, 14] }, // Dominant 9th
            'M9': { notes: [0, 4, 7, 11, 14] }, // Major 9th
            'm9': { notes: [0, 3, 7, 10, 14] }, // Minor 9th
            '11': { notes: [0, 4, 7, 10, 14, 17] }, // Dominant 11th
            '13': { notes: [0, 4, 7, 10, 14, 17, 21] }, // Dominant 13th
            'add9': { notes: [0, 2, 4, 7] }, // Added 9th
            'm6': { notes: [0, 3, 7, 9] }, // Minor 6th
            '6': { notes: [0, 4, 7, 9] }, // Major 6th
            '5': { notes: [0, 7] }, // Power chord
            '6/9': { notes: [0, 4, 7, 9, 14] }, // Major 6/9
            'm11': { notes: [0, 3, 7, 10, 14, 17] }, // Minor 11
            'M7#11': { notes: [0, 4, 7, 11, 14, 18] }, // Major 7#11
            'm7b5': { notes: [0, 3, 6, 10] }, // Half-Diminished
            '+7': { notes: [0, 4, 8, 10] }, // Augmented 7th
            'dim7': { notes: [0, 3, 6, 9] }, // Diminished 7th
            'M7+5': { notes: [0, 4, 8, 11] }, // Augmented Major 7th
            'mM9': { notes: [0, 3, 7, 11, 14] }, // Minor Major 9th
            'dimM7': { notes: [0, 3, 6, 11] }, // Diminished Major 7th
            '7alt': { notes: [0, 4, 6, 10, 13] }, // Altered Dominant (using 6 and 13)
            'M13': { notes: [0, 4, 7, 11, 14, 17, 21] }, // Major 13th

            '/C': { notes: [0, 4, 7], root: 0 }, // C Major
            'm/C': { notes: [0, 3, 7], root: 0 }, // C Minor
            '/C#': { notes: [0, 4, 7], root: 1 }, // C# Major
            'm/C#': { notes: [0, 3, 7], root: 1 }, // C# Minor
            '/D': { notes: [0, 4, 7], root: 2 }, // D Major
            'm/D': { notes: [0, 3, 7], root: 2 }, // D Minor
            '/D#': { notes: [0, 4, 7], root: 3 }, // D# Major
            'm/D#': { notes: [0, 3, 7], root: 3 }, // D# Minor
            '/E': { notes: [0, 4, 7], root: 4 }, // E Major
            'm/E': { notes: [0, 3, 7], root: 4 }, // E Minor
            '/F': { notes: [0, 4, 7], root: 5 }, // F Major
            'm/F': { notes: [0, 3, 7], root: 5 }, // F Minor
            '/F#': { notes: [0, 4, 7], root: 6 }, // F# Major
            'm/F#': { notes: [0, 3, 7], root: 6 }, // F# Minor
            '/G': { notes: [0, 4, 7], root: 7 }, // G Major
            'm/G': { notes: [0, 3, 7], root: 7 }, // G Minor
            '/G#': { notes: [0, 4, 7], root: 8 }, // G# Major
            'm/G#': { notes: [0, 3, 7], root: 8 }, // G# Minor
            '/A': { notes: [0, 4, 7], root: 9 }, // A Major
            'm/A': { notes: [0, 3, 7], root: 9 }, // A Minor
            '/A#': { notes: [0, 4, 7], root: 10 }, // A# Major
            'm/A#': { notes: [0, 3, 7], root: 10 }, // A# Minor
            '/B': { notes: [0, 4, 7], root: 11 }, // B Major
            'm/B': { notes: [0, 3, 7], root: 11 } // B Minor

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
                    //Filter Dumb Chord Like C/C D/D
                    if (structure.root == rootNote) {
                        continue
                    }
                    rootNote = structure.root
                    customRoot = true
                    notes.push(rootNote)
                }


                this.chords.push(new Chord(rootNote, notes, chordName, customRoot));
            }
        });
    }

    searchChords(noteArray, rootNote, threshold = 50) {
        console.log("Searching Chords...")
        const results = [];
        noteArray = noteArray.map(note => note % 12); // Normalize notes to be within octave
        if (rootNote) {
            rootNote = rootNote % 12

        }

        this.chords.forEach(chord => {
            let chordNotes = [...chord.notes];

            //console.log("Comparing to: " + chord.name)
            //Add the Root note to the Chords For Cases like A/D
            const inputNotesSet = new Set(noteArray);
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
                results.push({
                    name: chord.name,
                    probability: parseFloat(matchPercentage.toFixed(2))
                });
            }
        });

        // Sort results by probability in descending order
        return results.sort((a, b) => b.probability - a.probability);
    }

    getAllChords() {
        // Return all chord names in a simplified object format
        return this.chords.map(chord => ({ name: chord.name }));
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


export { Chord, ChordLibrary };
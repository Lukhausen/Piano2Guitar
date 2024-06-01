const standardTuning = ['E', 'A', 'D', 'G', 'B', 'E'];
const noteIndexMap = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
    'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9,
    'A#': 10, 'B': 11
};

function getValidFretPositionsForNote(noteIndex, stringIndex) {
    let baseFret = (noteIndex - stringIndex + 12) % 12;
    return [baseFret, baseFret + 12];
}

function parseNotes(input) {
    return input.toUpperCase()
        .replace(/B#/g, 'C').replace(/E#/g, 'F')
        .split(/[\s,]+/)
        .filter(note => noteIndexMap.hasOwnProperty(note));
}

function findValidFingerPlacement(chordNotes, tuningNotes) {
    let chordIndices = parseNotes(chordNotes).map(note => noteIndexMap[note]);
    let tuningIndices = tuningNotes.map(note => noteIndexMap[note]);

    let possiblePositions = tuningIndices.map(stringIndex => {
        return chordIndices.reduce((acc, chordIndex) => {
            acc.push(...getValidFretPositionsForNote(chordIndex, stringIndex));
            return acc;
        }, []);
    });
    return possiblePositions;
}

console.log(findValidFingerPlacement("C, E, G", standardTuning));


// Example usage

const fingerPositions = [
    [8, 20, 0, 12, 3, 15],
    [3, 15, 7, 19, 10, 22],
    [10, 22, 2, 14, 5, 17],
    [5, 17, 9, 21, 0, 12],
    [1, 13, 5, 17, 8, 20],
    [8, 20, 0, 12, 3, 15]
];

function generateAllChords(fingerPositions) {
    const chords = [];

    // Recursive function to generate combinations
    function generateCombinations(currentChord, stringIndex, minFret, maxFret) {
        // Base case: If all strings are processed, add the current chord to the result
        if (stringIndex === fingerPositions.length) {
            chords.push([...currentChord]);
            return;
        }

        // Iterate over the finger positions for the current string
        for (const fret of fingerPositions[stringIndex]) {
            // Update minFret and maxFret if the current fret is not zero
            const newMinFret = fret !== 0 ? Math.min(minFret, fret) : minFret;
            const newMaxFret = fret !== 0 ? Math.max(maxFret, fret) : maxFret;

            // Check if the chord is still playable
            if (newMaxFret - newMinFret <= 3) {
                currentChord[stringIndex] = fret;
                // Recursively generate combinations for the next string
                generateCombinations(currentChord, stringIndex + 1, newMinFret, newMaxFret);
            }
        }
    }

    // Start generating combinations from an empty chord
    generateCombinations([], 0, Infinity, 0);

    return chords;
}




function findMinAboveZero(arr) {
    let min = Number.MAX_SAFE_INTEGER; // Initialize min to the largest safe integer

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > 0 && arr[i] < min) {
            min = arr[i];
        }
    }

    return min === Number.MAX_SAFE_INTEGER ? null : min;
}

function removeDuplicateArrays(arrays) {
    const uniqueArrays = new Set();
    const result = [];
  
    arrays.forEach(array => {
      const serialized = JSON.stringify(array);
      if (!uniqueArrays.has(serialized)) {
        uniqueArrays.add(serialized);
        result.push(array);
      }
    });
  
    return result;
  }


const rootNote = 0
const startWithRoot = true


const allChords = generateAllChords(fingerPositions);

function generatePlayableChords(allChords) {
    playableChords = []
    allChords.forEach((element, index) => {
        console.log("Chord:" + element)
    
        if (startWithRoot) {
            for (let i = 0; i <= 5; i++) {
                //Mute all strings untill you find the root note
                if (((element[i] + noteIndexMap[standardTuning[i]] - rootNote) % 12) !== 0) {
                    element[i] = "x"
                }
                else {
                    break
                }
            }
    
            console.log("=>" + element)
        }
    
    
        minAboveZero = findMinAboveZero(element)
        fingersUsed = 0
        min = Math.min(...element);
        //console.log("Min: "+min)
        //console.log("Check for Barre...")
        barre = 0
        barreAddFingers = 0
        for (let i = 5; i >= 0; i--) {
            //Check How many frets are possible to be pressed down using the barre finger.
            if (element[i] >= minAboveZero) {
                barre++
                if (element[i] > minAboveZero) {
                    barreAddFingers++
                }
            }
            else {
                break
            }
        }
        
        //If there are more than 2 frets for the barre, count it as a barre
        if (barre >= 2) {
            console.log("Barre Detected, minAboveZero = " + minAboveZero)
        }
        // if additionally to the barre there are more than 3 fingers requred, mark it as unplayable
        if (barre >= 2 && barreAddFingers > 3) {
            console.log("UNPLAYABLE >3")
            return; // Skip to the next iteration of forEach
        }
        // Mark Chord as unplayable if it's not a Barre and more than 4 fingers are used
        else if (barre == 0) {
            for (let i = 0; i <= 5; i++) {
                if (element[i] >= minAboveZero) {
                    fingersUsed++
                }
            }
        }
        if (fingersUsed > 4) {
            console.log("UNPLAYABLE >4")
            return; // Skip to the next iteration of forEach
        }

        // Nothing has Triggered yet, add the Chord to the Playable List
        playableChords.push(element)
    });
    return removeDuplicateArrays(playableChords);
}

console.log(generatePlayableChords(allChords));

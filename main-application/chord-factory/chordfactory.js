import { STANDARD_TUNING, NOTE_INDEX_MAP, TUNING, FINGER_FRET_RANGE, BARRE_RATING } from './constants.js';
import { parseNotes, removeDuplicateArrays } from './utils.js';
import { ChordVoicing } from './chordvoicing.js';


export class ChordFactory {
  constructor(notes, root, startWithRoot = true, tuning = TUNING) {
    console.log("ChordFactory Recieved Notes: ", notes)
    this.notes = notes;
    this.startWithRoot = startWithRoot
    this.root = root
    this.tuning = tuning;
    this.fingerPositions = this.calculateFingerPositions();
    this.allChords = this.generateAllChordCombinations2()
    this.playableChords = this.filterPlayableChords(structuredClone(this.allChords))
    this.sortPlayableChordsByRating(1)
    //this.getFretSpanStatistics()
    this.sortPlayableChordsByCombinedRating(1)
  }

  getFretSpanStatistics() {
    let spanCounts = {};  // Object to store the count of each span

    // Iterate over all chord combinations
    this.allChords.forEach(chord => {
      // Filter out muted and open strings, keeping only fretted notes
      const frets = chord.filter(fret => fret > 0);
      if (frets.length > 1) { // Ensure there's more than one fretted note to calculate a span
        const minFret = Math.min(...frets);
        const maxFret = Math.max(...frets);
        const span = maxFret - minFret;

        // Update the count for the calculated span
        if (span in spanCounts) {
          spanCounts[span] = spanCounts[span] + 1;
        } else {
          spanCounts[span] = 1;
        }
      }
    });

    // Log the statistics for review
    console.log("Fret Span Statistics:", spanCounts);
    return spanCounts;
  }


  calculateFingerPositions() {
    const fingerPositions = [];

    for (let stringIndex of this.tuning) {
      const positions = [];
      for (let chordIndex of this.notes) {
        const validPositions = this.getValidFretPositionsForNote(chordIndex, stringIndex % 12);
        positions.push(...validPositions);
      }
      positions.push(-1); // Add -1 once for each string index
      positions.sort((a, b) => a - b); // Sort the positions from lowest to highest
      fingerPositions.push(positions);
    }

    return fingerPositions;
  }

  getValidFretPositionsForNote(noteIndex, stringIndex) {
    const baseFret = (noteIndex - stringIndex + 120) % 12;
    return [baseFret, baseFret + 12];
  }

  cartesianProduct(arrays) {
    return arrays.reduce((acc, curr) => {
      return acc.flatMap(a => curr.map(b => [...a, b]));
    }, [[]]);
  }

  generateAllChordCombinations() {
    const chords = [];
    // All 12 Frets
    for (let startFret = 0; startFret <= 12; startFret++) {
      let positionsInRange = []
      let endFret = startFret + FINGER_FRET_RANGE - 1
      for (let string = 0; string < 6; string++) {
        let possibleStringPlacements = []
        //Push -1 to every String Because it could be muted
        possibleStringPlacements.push(-1)
        // As The First Index of The this.fingerPositions[string] String Array ALLWAYS is 1 -1, we can skip it and add it separately
        //THis is why we start a t 1
        for (let finger = 1; finger < this.fingerPositions[string].length; finger++) {
          // As the this.fingerPositions[string][finger] Array is sorted, we can break out, once we hit a higher position than endFret
          if (this.fingerPositions[string][finger] > endFret) {
            break;
          } else if (this.fingerPositions[string][finger] == endFret) {
            possibleStringPlacements.push(this.fingerPositions[string][finger])
            break;
          } else if (this.fingerPositions[string][finger] >= startFret) {
            possibleStringPlacements.push(this.fingerPositions[string][finger])
          } else if (this.fingerPositions[string][finger] == 0) {
            possibleStringPlacements.push(this.fingerPositions[string][finger])
          }
        }
        positionsInRange[string] = possibleStringPlacements
      }
      chords.push(...this.cartesianProduct(positionsInRange))

    }

    return chords;
  }


  generateAllChordCombinations2() {

    const startTime = performance.now();

    let chords = [];
    //console.log("Initial chords array:", chords);

    let maskScope = [];
    for (let i = 0; i < 6; i++) {
      maskScope[i] = [-1]; // Each sub-array is separately instantiated
    }
    //console.log("Initial maskScope array:", maskScope);

    const fingerIndexStorage = Array(6).fill(1);
    //console.log("Initial fingerIndexStorage array:", fingerIndexStorage);

    let fingerIndexLength = []
    this.fingerPositions.forEach((element, inndex) => {
      fingerIndexLength[inndex] = element.length - 1
    })

    //console.log("Finger index lengths for all strings:", fingerIndexLength);

    // As the first entry of the chords is allways -1 we can skip this
    for (let fret = 0; fret < 13; fret++) {
      //console.log("generateAllChordCombinations2 - FRET: ", fret)

      for (let string = 0; string < 6; string++) {

        for (let validPosition = 0; validPosition < maskScope[string].length; validPosition++) {
          // FIrst remove all Non Fitting Elements From Out current maskScope on All Strings.
          // Exclude The -1 (muted) and 0 (open string) Because they can be used everywhere
          if (maskScope[string][validPosition] > 0 && maskScope[string][validPosition] < fret) {
            maskScope[string].splice(validPosition, 1);
          }


        }


      }
      //for (let i = 0; i < 6; i++) {
      //console.log("generateAllChordCombinations2 - maskScope: ", i, maskScope[i])

      //}

      //Now We deleted all old ElementInternals, we can start inserting New elements one by one
      for (let string = 0; string < 6; string++) {
        //console.log("generateAllChordCombinations2 Fret, String", fret, string)

        // Add The New Element, if there is one 
        // First Check If there is a New Element inside the Array
        if (fingerIndexStorage[string] < fingerIndexLength[string]) {
          // CHeck if its in range for Valid CHord, if so add it 
          if (this.fingerPositions[string][fingerIndexStorage[string]] <= fret + FINGER_FRET_RANGE) {
            //console.log("generateAllChordCombinations2 Pushing into maskScope[string], string, this.fingerPositions[string][fingerIndexStorage[string]] ", maskScope[string], string, this.fingerPositions[string][fingerIndexStorage[string]])

            maskScope[string].push(this.fingerPositions[string][fingerIndexStorage[string]])
            //Flag the next index to be looked at later

            for (let pos1 of maskScope[(string + 1) % 6]) {
              for (let pos2 of maskScope[(string + 2) % 6]) {
                for (let pos3 of maskScope[(string + 3) % 6]) {
                  for (let pos4 of maskScope[(string + 4) % 6]) {
                    for (let pos5 of maskScope[(string + 5) % 6]) {
                      let newVoicing = []
                      newVoicing[string] = this.fingerPositions[string][fingerIndexStorage[string]]
                      newVoicing[(string + 1) % 6] = pos1
                      newVoicing[(string + 2) % 6] = pos2
                      newVoicing[(string + 3) % 6] = pos3
                      newVoicing[(string + 4) % 6] = pos4
                      newVoicing[(string + 5) % 6] = pos5


                      //console.log("NEW: ", newVoicing)
                      chords.push([...newVoicing]);
                    }
                  }
                }
              }
            }
            fingerIndexStorage[string]++

          } else {
            //Break because the element found is too big to be inserte into the maskScope
          }
        } else {
          //break because there are no more elments left in the Array
        }

        //Calculate the Cartesian Product From the Inserted element

        // Add each element to the chords
      }
    }
    // Track end time
    const endTime = performance.now();

    // Calculate the time taken
    const timeTaken = endTime - startTime;
    console.log("Time taken:", timeTaken, "milliseconds");
    console.log(chords)
    return chords;
  }


  filterPlayableChords(allChordsCopyCopy) {
    let allChordsCopy = [...allChordsCopyCopy]
    const playableChords = allChordsCopy.map(voicing => {
      if (this.startWithRoot) {
        for (let string = 0; string <= 5; string++) {
          if (voicing[string] == -1) {
            continue;
          }
          else if (((voicing[string] + this.tuning[string]) % 12) != this.root) {
            voicing[string] = -1;
          } else {
            break;
          }
        }
      }

      //Faster Way to Calculate the MinaboveZero
      let minAboveZero = Infinity;

      for (let i = 0; i < voicing.length; i++) {
        if (voicing[i] > 0 && voicing[i] < minAboveZero) {
          minAboveZero = voicing[i];
        }
      }

      if (minAboveZero === Infinity) {
        minAboveZero = 0;
      }


      let fingersUsed = 0;
      let barreStop = false;
      let barreUseFingers = 0;
      let barreAddFingers = 0;
      for (let i = 5; i >= 0; i--) {
        if (voicing[i] <= 0) {
          barreStop = true;
        }
        if (voicing[i] >= minAboveZero && barreStop == false) {
          barreUseFingers++;
          if (voicing[i] > minAboveZero) {
            barreAddFingers++;
          }
        } else if (voicing[i] > 0 && voicing[i] !== "x") {
          barreAddFingers++;
        }
      }
      if (barreUseFingers)
        if (barreUseFingers >= 2 && barreAddFingers > 3) {
          return null;
        } else if (barreUseFingers < 2) {
          fingersUsed = voicing.filter(fret => fret >= minAboveZero).length;
          barreUseFingers = 0
        }
      if (fingersUsed <= 4) {
        let newVoicing = new ChordVoicing(voicing, barreUseFingers > 0 ? minAboveZero : null, barreUseFingers > 0 ? barreAddFingers : fingersUsed, barreUseFingers, minAboveZero, this.notes, this.startWithRoot ? this.root : -1)

        return newVoicing;
      }
      return null;
    }
    ).filter(chordVoicing => chordVoicing !== null);
    return playableChords;
  }

  sortPlayableChordsByRating() {
    this.playableChords.sort((a, b) => a.rating - b.rating);
  }

  /**
   * Sorts the playable chords by a combined rating based on sound quality and 
   * playability. The combined rating is calculated using a weighted sum of 
   * the sound quality rating and the playability rating.
   * 
   * @param {number} soundWeight - A value between 0 and 1 that determines the weight 
   * given to the sound quality rating. The weight given to the playability rating 
   * will be (1 - soundWeight).
   * 
   * Usage example:
   * ```javascript
   * const chordFactory = new ChordFactory(notes, root, startWithRoot, tuning);
   * chordFactory.sortPlayableChordsByCombinedRating(0.7);
   * console.log(chordFactory.playableChords); // Sorted chords based on the combined rating
   * ```
   * 
   * @throws {Error} If `soundWeight` is not a number between 0 and 1.
   */
  sortPlayableChordsByCombinedRating(soundWeight = 0) {
    if (typeof soundWeight !== 'number' || soundWeight < 0 || soundWeight > 1) {
      throw new Error("soundWeight must be a number between 0 and 1.");
    }
    console.log("Sorting...")
    this.playableChords.sort((a, b) => {
      let aCombinedRating = (a.soundQualityRating * soundWeight) + (a.playabilityRating * (1 - soundWeight));
      let bCombinedRating = (b.soundQualityRating * soundWeight) + (b.playabilityRating * (1 - soundWeight));
      return bCombinedRating - aCombinedRating;
    });
  }
}

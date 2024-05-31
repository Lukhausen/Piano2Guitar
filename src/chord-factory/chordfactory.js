import { settings, MAX_FRETS } from './constants.js';
import { ChordVoicing } from './chordvoicing.js';


export class ChordFactory {
  constructor(chord, startWithRoot = true, tuning = settings.tuning) {
    console.log("ChordFactory Recieved Notes: ", chord.notes)
    this.identifier = chord.name
    this.notes = chord.notes;
    settings.startWithRoot = settings.startWithRoot
    this.root = chord.rootNote
    this.tuning = tuning;
    this.fingerPositions = this.calculateValidFingerPositions();
    this.allChords = this.generateAllChordCombinations2()
    this.playableChords = this.filterPlayableChords2(structuredClone(this.allChords))
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


  calculateValidFingerPositions() {
    const fingerPositions = [];

    for (let stringIndex of this.tuning) {
      const positions = [];
      for (let chordIndex of this.notes) {
        const validPositions = this.getValidFretPositionsForNote(chordIndex, stringIndex % 12);
        positions.push(...validPositions);
      }
      if (settings.mutePermutations) {
        positions.push(-1); // Add -1 only if there is no 0
      }
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


  //Highly efficent Variant of the Cartesian Product, That will not calulate any position twice
  generateAllChordCombinations2() {

    const startTime = performance.now();

    let chords = [];
    //console.log("Initial chords array:", chords);

    let maskScope = Array.from({ length: 6 }, () => []);
    //console.log("Initial maskScope array:", maskScope);

    const fingerIndexStorage = Array(6).fill(0);
    //console.log("Initial fingerIndexStorage array:", fingerIndexStorage);

    let fingerIndexLength = []
    this.fingerPositions.forEach((element, inndex) => {
      fingerIndexLength[inndex] = element.length - 1
    })

    //console.log("Finger index lengths for all strings:", fingerIndexLength);

    // As the first entry of the chords is allways -1 we can skip this
    for (let fret = -1; fret < 13; fret++) {
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
          if (this.fingerPositions[string][fingerIndexStorage[string]] < fret + settings.fingerFretRange) {
            //  console.log("generateAllChordCombinations2 Pushing into maskScope[string], string, this.fingerPositions[string][fingerIndexStorage[string]] ", maskScope[string], string, this.fingerPositions[string][fingerIndexStorage[string]])
            //console.log("fret, string", fret, string)
            maskScope[string].push(this.fingerPositions[string][fingerIndexStorage[string]])
            // console.log("maskScope" ,structuredClone(maskScope))

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


                      chords.push(newVoicing);
                    }
                  }
                }
              }
            }
            //Flag the next index to be looked at later

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
    console.log("generateAllChordCombinations2 - Time taken:", timeTaken, "milliseconds");
    return chords;
  }


  filterPlayableChords(allChordsCopy) {
    const startTime = performance.now();

    const playableChordsSet = new Set();

    allChordsCopy.forEach(voicing => {
      // Start By Muting All Chords
      if (settings.startWithRoot) {
        for (let string = 0; string < 6; string++) {
          if (voicing[string] == -1) {
            continue;
          } else if (((voicing[string] + this.tuning[string]) % 12) != this.root) {
            voicing[string] = -1;
          } else {
            break;
          }
        }
      }

      // Faster Way to Calculate the MinaboveZero
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
      if (barreUseFingers) {
        if (barreUseFingers >= 2 && barreAddFingers > 3) {
          return;
        } else if (barreUseFingers < 2) {
          fingersUsed = voicing.filter(fret => fret >= minAboveZero).length;
          barreUseFingers = 0;
        }
      }
      if (fingersUsed <= 4) {
        let newVoicing = new ChordVoicing(
          voicing,
          barreUseFingers > 0 ? minAboveZero : null,
          barreUseFingers > 0 ? barreAddFingers : fingersUsed,
          barreUseFingers,
          minAboveZero,
          this.notes,
          settings.startWithRoot ? this.root : -1
        );

        playableChordsSet.add(JSON.stringify(newVoicing));
      }
    });

    // Convert the Set back to an array of unique ChordVoicing objects
    const playableChords = Array.from(playableChordsSet).map(voicingString => JSON.parse(voicingString));

    // Track end time
    const endTime = performance.now();

    // Calculate the time taken
    const timeTaken = endTime - startTime;
    console.log("filterPlayableChords - Time taken:", timeTaken, "milliseconds");

    return playableChords;
  }


  filterPlayableChords2(allChordsCopy) {
    const startTime = performance.now();
    let playableChordsVoicingSet = new Set();
    let playableChordsArray = []
    let totalChordVoicingTime = 0; // Initialize a variable to accumulate time for ChordVoicing creation

    // Pre-create and reuse these objects - Testing Showed This is faster than Creating them newly
    let barreClass = Array.from({ length: MAX_FRETS }, () => Array.from({ length: 6 }, () => []));
    let barreClassesUsed = new Set();
    let barreSeparatorIndex = Array.from({ length: MAX_FRETS }, () => 0);
    let minAboveZero = 99;
    let mutingTillRoot = true;
    let touchedSet = new Set();
    let barres = []
    let touchedIndices = [];
    let fingerPositionsCounter = 0
    let fingerPositions = [-1, -1, -1, -1, -1, -1]
    let fingerPositionsAmmount = 0
    let actuallyPlayedNotes = [-1, -1, -1, -1, -1, -1]


    allChordsCopy.forEach(voicing => {
      minAboveZero = 99;
      mutingTillRoot = true;

      // Reset values for each iteration
      barreClass.forEach(fretArray => fretArray.forEach(stringArray => stringArray.length = 0));
      barreClassesUsed.clear();
      touchedSet.clear()
      barreSeparatorIndex.fill(0);
      barres = []
      touchedIndices = [];
      fingerPositionsCounter = 0
      fingerPositions = [-1, -1, -1, -1, -1, -1]
      fingerPositionsAmmount = 0



      //Calcualte the Real played Notes
      for (let i = 0; i < 6; i++) {
        if (voicing[i] >= 0) {
          actuallyPlayedNotes[i] = (voicing[i] + settings.tuning[i])
        } else {
          actuallyPlayedNotes[i] = voicing[i]
        }
      }


      for (let string = 0; string < 6; string++) {
        //Mute Strings That are not the Root Note
        if (settings.startWithRoot && mutingTillRoot) {
          if (actuallyPlayedNotes[string] == -1) {
            // Do Nothing
          } else if (((actuallyPlayedNotes[string]) % 12) != this.root) {
            // Mute The String
            voicing[string] = -1;
          } else {
            mutingTillRoot = false;
          }
        }

        //Count Total Fingers Used in this voicing.
        if (voicing[string] > 0) {
          fingerPositionsAmmount++
          if (voicing[string] < minAboveZero) {
            minAboveZero = voicing[string];
          }
        }


      }
      // Check if the voicing is already in the set
      let voicingString = "V-" + voicing[0] + voicing[1] + voicing[2] + voicing[3] + voicing[4] + voicing[5];
      if (playableChordsVoicingSet.has(voicingString)) {
        //console.log("Allready Has Voicing, Skipping...")
        return; // Skip processing if voicing is already in the set
      }

      //Remove Chords Below two fingers used.
      if (fingerPositionsAmmount < 2) {
        return
      }

      //Take a Look at the Ammount of fingers Required. If is less than 5 no barre needs to be caluclated.
      if (fingerPositionsAmmount > 4) {

        for (let string = 0; string < 6; string++) {
          //Mute Strings That are not the Root Note




          //Now, Place the Strings in their Corresponding barreClass
          if (voicing[string] >= 0) {

            barreClassesUsed.forEach((index) => {
              if (voicing[string] < index) {
                barreSeparatorIndex[index] += 1;
              }
            });

            barreClassesUsed.add(voicing[string]);
            barreClass[voicing[string]][barreSeparatorIndex[voicing[string]]].push(string);
            const newIndex = `${voicing[string]}-${barreSeparatorIndex[voicing[string]]}`;
            if (!touchedSet.has(newIndex)) {
              touchedIndices.push([voicing[string], barreSeparatorIndex[voicing[string]]]);
              touchedSet.add(newIndex);
            }
          }
        }


        // Sort touchedIndices from lowest to highest fret
        touchedIndices.sort(([fretA], [fretB]) => fretA - fretB);
        //console.log(touchedIndices)
        touchedIndices.forEach(([fret, index]) => {
          if (barreClass[fret][index].length > 0) {
            if (barreClass[fret][index].length > 1 && fret != 0) {
              barres.push([fret, Math.min(...barreClass[fret][index]), Math.max(...barreClass[fret][index])])
              fingerPositionsCounter++
              barreClass[fret][index].forEach(element => {
                fingerPositions[element] = fingerPositionsCounter
              })

            } else if (fret != 0) {
              fingerPositionsCounter++
              fingerPositions[barreClass[fret][index]] = fingerPositionsCounter
            }

          }

        });


        //Check if 5 Finger are still used, If so, Remove the CHord.
        if (fingerPositionsCounter > 4) {
          return
        }
      } else {
        //console.log("SkippedBarre Because The Fingers are to less")
        //No Barre Requred, so we can just calulate Where each finger goes.
        for (let fret = 0; fret < settings.fingerFretRange; fret++) {
          for (let string = 0; string < 6; string++) {
            if (minAboveZero + fret == voicing[string] && fingerPositions[string] !== 1 && voicing[string] !== 0) {
              fingerPositionsCounter++
              fingerPositions[string] = fingerPositionsCounter

            }
          }
        }
      }

      //IF minabove Zero Was note set, Set it to zero
      if (minAboveZero == 99) {
        minAboveZero = 0
      }

      const chordVoicingStartTime = performance.now();

      let newVoicing = new ChordVoicing(
        voicing,
        fingerPositions,
        barres,
        minAboveZero,
        fingerPositionsAmmount,
        this.notes,
        settings.startWithRoot ? this.root : -1,
        actuallyPlayedNotes
      );

      const chordVoicingEndTime = performance.now();
      const chordVoicingTimeTaken = chordVoicingEndTime - chordVoicingStartTime;
      totalChordVoicingTime += chordVoicingTimeTaken;

      playableChordsVoicingSet.add(voicingString);
      playableChordsArray.push(newVoicing);
      //console.log("filterPlayableChords2 - voicing, barres", voicing, barres);
      //Now Check For each Barre Class Starting at MinAboveZero...

    });
    const endTime = performance.now();

    // Calculate the time taken
    const totalTimeTaken = endTime - startTime;

    console.log("filterPlayableChords2 - Total time taken:", totalTimeTaken, "milliseconds");
    console.log("Total time taken for ChordVoicings:", totalChordVoicingTime, "milliseconds");
    return playableChordsArray
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

import { settings, MAX_FRETS } from './constants.js';
import { ChordVoicing } from './chordvoicing.js';


export class ChordFactory {
  constructor(chord, startWithRoot = true, tuning = settings.tuning) {


   //CREATE Workers and Updtae Their Settings, as the Workers do not share the same context as the main Thread
    this.ChordCombinationsWorker = new Worker(new URL('./ChordCombinationsWorker.js', import.meta.url), { type: 'module' });
    this.ChordFilteringWorker = new Worker(new URL('./ChordFilteringWorker.js', import.meta.url), { type: 'module' });
    this.ChordFilteringWorker.postMessage({ type: 'settingsUpdate', newSettings: settings });
    this.ChordCombinationsWorker.postMessage({ type: 'settingsUpdate', newSettings: settings });



    console.log("ChordFactory Recieved Notes: ", chord.notes)
    this.identifier = chord.name
    this.notes = chord.notes;
    this.root = chord.rootNote
    this.tuning = tuning;
    this.fingerPositions = this.calculateValidFingerPositions();
    this.playableChordsLoaded = new Promise(resolve => {
      this.resolvePlayableChords = resolve;
    });






    this.ChordCombinationsWorker.postMessage({ fingerPositions: this.fingerPositions });
    this.ChordCombinationsWorker.onmessage = (e => {
      this.allChords = e.data;
      this.initializeChordFilteringWorker(); // Initialize the new worker here
    }).bind(this);

  }

  initializeChordFilteringWorker() {

    this.ChordFilteringWorker.postMessage({
      allChords: structuredClone(this.allChords),
      notes: this.notes,
      root: this.root
    });

    this.playableChords = [];
    this.ChordFilteringWorker.onmessage = (e => {
      if (e.data.status === 'finished') {
        this.resolvePlayableChords();  // Resolve the promise when chords are ready
        this.terminateWorkers();
      } else {
        const { voicing, fingerPositions, barres, minAboveZero, fingersused, notes, root, actuallyPlayedNotes } = e.data;
        let newVoicing = new ChordVoicing(
          voicing,
          fingerPositions,
          barres,
          minAboveZero,
          fingersused,
          notes,
          root,
          actuallyPlayedNotes
        );
        this.playableChords.push(newVoicing);
      }
    }).bind(this);
  }


  terminateWorkers() {
    if (this.ChordCombinationsWorker) {
      this.ChordCombinationsWorker.terminate();
      this.ChordCombinationsWorker = null;
    }
    if (this.ChordFilteringWorker) {
      this.ChordFilteringWorker.terminate();
      this.ChordFilteringWorker = null;
    }
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
        // Add each valid position only if it's not already in the array
        validPositions.forEach(position => {
          if (!positions.includes(position)) {
            positions.push(position);
          }
        });
      }
      // Add -1 for muting if necessary, ensuring it's not already present
      if (settings.mutePermutations && !positions.includes(-1)) {
        positions.push(-1);
      }
      // Sort the positions from lowest to highest
      positions.sort((a, b) => a - b);
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





  filterPlayableChords(allChordsCopy) {
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

      let fingersused = Math.max(...fingerPositions)
      //filter one String Chords
      if (fingersused < 2) {
        return
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
        fingersused,
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
  async sortPlayableChordsByCombinedRating(soundWeight = 0) {
    if (typeof soundWeight !== 'number' || soundWeight < 0 || soundWeight > 1) {
      throw new Error("soundWeight must be a number between 0 and 1.");
    }

    await this.playableChordsLoaded;  // Wait for the playable chords to be loaded

    console.log("Sorting...")
    this.playableChords.sort((a, b) => {
      let aCombinedRating = (a.soundQualityRating * soundWeight) + (a.playabilityRating * (1 - soundWeight));
      let bCombinedRating = (b.soundQualityRating * soundWeight) + (b.playabilityRating * (1 - soundWeight));
      return bCombinedRating - aCombinedRating;
    });

    return this.playableChords;  // Explicitly return the sorted array
  }

}

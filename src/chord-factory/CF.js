import { MAX_FRETS } from './constants.js';

let settings;
self.onmessage = (e) => {
  if (e.data.type === 'settingsUpdate') {
    settings = e.data.newSettings;
    //console.warn("settingsUpdate:", settings)

  } else {
    const { allChords, notes, root } = e.data;
    filterPlayableChords(allChords, notes, root);
  }
};

function filterPlayableChords(allChords, notes, rootNote) {
  //console.warn("Settings at filterPlayableChords", settings)

  //console.error(allChords)
  const startTime = performance.now();
  let playableChordsVoicingSet = new Set();
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


  allChords.forEach(voicing => {
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
        } else if (((actuallyPlayedNotes[string]) % 12) != rootNote) {
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

    self.postMessage({
      voicing,
      fingerPositions,
      barres,
      minAboveZero,
      fingersused,
      notes,
      root: settings.startWithRoot ? rootNote : -1,
      actuallyPlayedNotes
    });

    const chordVoicingEndTime = performance.now();
    const chordVoicingTimeTaken = chordVoicingEndTime - chordVoicingStartTime;
    totalChordVoicingTime += chordVoicingTimeTaken;

    playableChordsVoicingSet.add(voicingString);

  });
  self.postMessage({ status: 'finished' });

  const endTime = performance.now();

  // Calculate the time taken
  const totalTimeTaken = endTime - startTime;

  console.log("filterPlayableChords2 - Total time taken:", totalTimeTaken, "milliseconds");
  console.log("Total time taken for ChordVoicings:", totalChordVoicingTime, "milliseconds");

}

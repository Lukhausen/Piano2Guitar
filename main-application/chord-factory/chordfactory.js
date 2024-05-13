import { STANDARD_TUNING, NOTE_INDEX_MAP, BARRE_RATING } from './constants.js';
import { parseNotes, removeDuplicateArrays } from './utils.js';
import { ChordVoicing } from './chordvoicing.js';


export class ChordFactory {
  constructor(notes, root, startWithRoot = true, tuning = STANDARD_TUNING) {
    this.notes = notes;
    this.startWithRoot = startWithRoot
    this.root = root
    this.tuning = tuning;
    this.fingerPositions = this.calculateFingerPositions();
    this.allChords = this.generateAllChordCombinations()
    this.playableChords = this.filterPlayableChords(this.allChords, this.root, this.startWithRoot)
    this.sortPlayableChordsByRating() 
  }

  calculateFingerPositions() {
    const chordIndices = this.notes.map(note => NOTE_INDEX_MAP[note]);
    const tuningIndices = this.tuning.map(note => NOTE_INDEX_MAP[note]);
    return tuningIndices.map(stringIndex => {
      return chordIndices.reduce((positions, chordIndex) => {
        positions.push(...this.getValidFretPositionsForNote(chordIndex, stringIndex));
        return positions;
      }, []);
    });
  }

  getValidFretPositionsForNote(noteIndex, stringIndex) {
    const baseFret = (noteIndex - stringIndex + 12) % 12;
    return [baseFret, baseFret + 12];
  }

  generateAllChordCombinations() {
    const chords = [];

    const generateCombinations = (currentChord, stringIndex, minFret, maxFret) => {
      if (stringIndex === this.fingerPositions.length) {
        chords.push([...currentChord]);
        return;
      }

      for (const fret of this.fingerPositions[stringIndex]) {
        const newMinFret = fret !== 0 ? Math.min(minFret, fret) : minFret;
        const newMaxFret = fret !== 0 ? Math.max(maxFret, fret) : maxFret;

        if (newMaxFret - newMinFret <= 3) {
          currentChord[stringIndex] = fret;
          generateCombinations(currentChord, stringIndex + 1, newMinFret, newMaxFret);
        }
      }
    };

    generateCombinations([], 0, Infinity, 0);
    return chords;
  }


  filterPlayableChords(allChords, rootNote = 0, startWithRoot = true) {
    const playableChords = allChords.map(chord => {
      if (startWithRoot) {
        for (let i = 0; i <= 5; i++) {
          if (((chord[i] + NOTE_INDEX_MAP[this.tuning[i]] - rootNote) % 12) !== 0) {
            chord[i] = -1;
          } else {
            break;
          }
        }
      }
      const minAboveZero = Math.min(...chord.filter(fret => fret > 0));
      let fingersUsed = 0;
      let barreStop = false;
      let barreUseFingers = 0;
      let barreAddFingers = 0;
      for (let i = 5; i >= 0; i--) {
        if (chord[i] <= 0) {
          barreStop = true;
        }
        if (chord[i] >= minAboveZero && barreStop == false) {
          barreUseFingers++;
          if (chord[i] > minAboveZero) {
            barreAddFingers++;
          }
        } else if (chord[i] > 0 && chord[i] !== "x") {
          barreAddFingers++;
        }
      }
      if (barreUseFingers)
      if (barreUseFingers >= 2 && barreAddFingers > 3) {
        return null;
      } else if (barreUseFingers < 2) {
        fingersUsed = chord.filter(fret => fret >= minAboveZero).length;
        barreUseFingers = 0
      }
      if (fingersUsed <= 4) {
        let voicing = new ChordVoicing(chord, barreUseFingers > 0 ? minAboveZero : null, barreUseFingers > 0 ? barreAddFingers : fingersUsed, barreUseFingers, minAboveZero)
        voicing.calculateFingerPosition();
        voicing.calculateChordSpacing();
        voicing.rateVoicing(chord);

        return voicing;
      }
      return null;
    }
    ).filter(chordVoicing => chordVoicing !== null);
    return removeDuplicateArrays(playableChords);
  }

  sortPlayableChordsByRating() {
    this.playableChords.sort((a, b) => a.rating - b.rating);
  }
}

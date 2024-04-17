import { STANDARD_TUNING, NOTE_INDEX_MAP, BARRE_RATING } from './constants.js';
import { parseNotes, removeDuplicateArrays } from './utils.js';

export class ChordVoicing {
  constructor(voicing, barre, rating, fingersUsed, barreSize) {
    this.voicing = voicing;
    this.barre = barre;
    this.rating = rating;
    this.fingersUsed = fingersUsed
    this.barreSize = barreSize
  }
}

export class Chord {
  constructor(notes, tuning = STANDARD_TUNING) {
    this.notes = parseNotes(notes);
    this.tuning = tuning;
    this.fingerPositions = this.calculateFingerPositions();
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

  User
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
      if (barreUseFingers >= 2 && barreAddFingers > 3) {
        return null;
      } else if (barreUseFingers === 0) {
        fingersUsed = chord.filter(fret => fret >= minAboveZero).length;
      }
      if (fingersUsed <= 4) {
        const rating = this.rateVoicing(chord);
        return new ChordVoicing(chord, barreUseFingers > 0 ? minAboveZero : null, rating, barreUseFingers > 0 ? barreAddFingers : fingersUsed, barreUseFingers);
      }
      return null;
    }
    ).filter(chordVoicing => chordVoicing !== null);
    return removeDuplicateArrays(playableChords);
  }

  getFingerPosition(chordVoicing) {

  }

  rateVoicing(chordVoicing) {
    let rating = 0;
    if (chordVoicing.barre !== null) {
      rating + BARRE_RATING
    }


    // Rate playability: easier chords have smaller fret spreads and fewer fingers used
    const frets = chordVoicing.filter(fret => fret > 0);
    const fretSpread = frets.length > 0 ? Math.max(...frets) - Math.min(...frets) : 0;
    const fingersUsed = frets.length;
    rating += 5 - fretSpread; // max spread of 5 frets is still reasonable
    rating += 5 - fingersUsed; // less fingers used is better, up to 5 fingers considered

    // Rate sound quality: richer chords with open strings get higher ratings
    const openStrings = chordVoicing.filter(fret => fret === 0).length;
    rating += openStrings; // each open string adds a point

    return rating;
  }
}
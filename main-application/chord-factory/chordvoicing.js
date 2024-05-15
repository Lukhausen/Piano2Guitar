import { STANDARD_TUNING, TUNING, NOTE_INDEX_MAP, BARRE_RATING } from './constants.js';
import { parseNotes, removeDuplicateArrays } from './utils.js';
import { ChordFactory } from './chordfactory.js';

export class ChordVoicing {
  constructor(voicing, barre, fingersUsed, barreSize, minAboveZero, chordFactoryNotes, chordFactoryRoot) {
    this.voicing = voicing;
    this.barre = barre;

    this.fingersUsed = fingersUsed
    this.barreSize = barreSize
    this.minAboveZero = minAboveZero
    this.fingerPositions = [0, 0, 0, 0, 0, 0]
    this.chordSpacing = 0
    this.chordFactoryNotes = chordFactoryNotes
    this.chordFactoryRoot = chordFactoryRoot
    this.actuallyPlayedNotes = [0, 0, 0, 0, 0, 0]

    for (let i = 0; i < 6; i++) {
      if (this.voicing[i] >= 0) {
        this.actuallyPlayedNotes[i] = (this.voicing[i] + TUNING[i]) % 12
      } else {
        this.actuallyPlayedNotes[i] = this.voicing[i]
      }
    }

    this.playabilityRating = 0;
    this.soundQualityRating = 0; // New property to store sound quality rating


    this.calculateChordSpacing()
    this.calculateFingerPosition()

    this.rateSoundQuality()
    this.ratePlayability()

    //Send From ChordFactory over

  }

  calculateChordSpacing() {
    if (this.fingerPositions.length !== 6 || this.voicing.length !== 6) {
      throw new Error('Input arrays must each have 6 elements.');
    }

    let notes = this.fingerPositions.map((finger, index) => ({
      string: index + 1,
      fret: this.voicing[index],
      finger
    })).filter(note => note.finger !== 0 && note.fret !== -1);

    // Additional condition for barre chords
    if (this.barre) {
      notes = notes.filter(note => note.finger !== 1);
    }

    notes.sort((a, b) => a.fret - b.fret || a.string - b.string);

    let totalSpacing = 0;
    for (let i = 0; i < notes.length - 1; i++) {
      const stringDistance = Math.abs(notes[i].string - notes[i + 1].string);
      const fretDistance = Math.abs(notes[i].fret - notes[i + 1].fret);
      totalSpacing += stringDistance + fretDistance;
    }

    this.chordSpacing = totalSpacing;
  }


  calculateFingerPosition() {
    let startPosition = this.minAboveZero
    let finger = 1

    //Make the start Position the BArre Position and If there is an Barre, Set all The according Things to Barre
    if (this.barre) {
      for (let i = this.barreSize; i > 0; i--) {
        if (this.voicing[6 - i] == this.barre) {
          this.fingerPositions[6 - i] = 1
        }

        finger = 2
      }
    }
    //Now go through each Fret, Start With the lowest fret above zero or with the barre fret.

    for (let fret = 0; fret < 4; fret++) {
      for (let string = 0; string < 6; string++) {
        if (startPosition + fret == this.voicing[string] && this.fingerPositions[string] !== 1 && this.voicing[string] !== 0) {
          this.fingerPositions[string] = finger
          finger++
        }
      }
    }

    return;
  }

  ratePlayability() {
    let rating = 0;
    /*
        // Chord spacing difficulty
        rating += this.chordSpacing;
    
        // Smaller barres are harder than full 6-string barres
        rating += this.barreSize * 4;
    
        // Exponential muted strings
        let mutedCount = 0;
        this.voicing.forEach((note) => {
          if (note == -1) {
            mutedCount++;
          }
        });
        rating += Math.pow(3, mutedCount);
    
        // More fingers used, more difficult
        rating += (this.fingersUsed + this.barreSize) * 2;
    
        // Higher up the fretboard, more difficult
        rating += this.minAboveZero;
    
        // Wider the fingers are spread, more difficult
        let spread = this.minAboveZero - Math.max(...this.voicing);
        rating += spread * spread;
        */

    // Calculate detailed finger position difficulty
    rating += this.calculateFingerPositionDifficulty();

    this.playabilityRating = rating;
    return rating;
  }

  calculateFingerPositionDifficulty() {
    let difficulty = 0;

    // Thumb position (not used in this example)
    // if thumb used, add difficulty accordingly

    // Evaluate the physical stretch required between the fingers
    let maxFret = Math.max(...this.voicing.filter(fret => fret > 0));
    let minFret = Math.min(...this.voicing.filter(fret => fret > 0));
    let stretch = maxFret - minFret;
    difficulty += stretch > 3 ? 3 : stretch;

    // Adjacent fingers on the same fret
    let sameFretAdjacent = this.voicing.reduce((acc, fret, index, arr) => {
      if (index > 0 && fret === arr[index - 1] && fret !== 0) acc++;
      return acc;
    }, 0);
    difficulty += sameFretAdjacent;

    // Open strings
    let openStrings = this.voicing.filter(fret => fret === 0).length;
    difficulty -= openStrings;

    // Hand size (subjective, minimal stretch considered)
    difficulty += stretch > 2 ? 2 : stretch;

    // Chord inversion and voicing
    difficulty += this.isClusteredVoicing() ? -1 : 1;

    return difficulty;
  }

  isClusteredVoicing() {
    // Check if the voicing is clustered (fingers close together)
    let activeFrets = this.voicing.filter(fret => fret > 0);
    let maxFret = Math.max(...activeFrets);
    let minFret = Math.min(...activeFrets);
    return (maxFret - minFret) <= 2;
  }


  rateSoundQuality() {
    let totalScore = (
      //Check How Many of the Notes in the Desired Chord Are Present in the Guitar Chord
      this.assessHarmonicCompleteness() +
      this.assessOpenStrings() +
      this.assessPlayedStrings() +
      this.assessFretBoardHeight()
    ) / 4;
    if (totalScore < 0 || totalScore > 1) {
      console.error("ChordVoicing.rateSoundQuality: Unusual Rating Output: " + totalScore + " from Object: ", this)
    }
    this.soundQualityRating = totalScore;
    return;
  }

  assessHarmonicCompleteness() {
    // Get desired notes as a Set to ensure uniqueness
    const uniqueDesiredNotes = new Set(this.chordFactoryNotes);

    // Calculate the number of overlapping notes
    let overlapCount = 0;
    uniqueDesiredNotes.forEach(note => {
      if (this.actuallyPlayedNotes.includes(note)) {
        overlapCount++;
      }
    });

    // Calculate harmonic completeness score
    const completenessScore = overlapCount / uniqueDesiredNotes.size;
    return completenessScore;
  }

  assessOpenStrings() {
    let openStrings = 0;

    for (let i = 0; i < this.voicing.length; i++) {
      if (this.voicing[i] === 0) {
        openStrings++;
      }
    }

    return openStrings / this.voicing.length;
  }

  assessPlayedStrings() {
    let playedStrings = 0;

    for (let i = 0; i < this.voicing.length; i++) {
      if (this.voicing[i] >= 0) {
        playedStrings++;
      }
    }

    return playedStrings / this.voicing.length;
  }

  assessFretBoardHeight() {
    return Math.max(0, (1 - (this.minAboveZero / 12)))
  }

}

/*
assessVoicingRange(){
  //TODO: Asses, The Difference Between the Lowest and the highest Played note. Find a Way to normalize the output between 0 (small difference) and 1
}


assessTonalBalance() {
  const noteFrequencies = this.voicing.map((fret, string) =>
    fret !== -1 ? (STANDARD_TUNING[string] + fret) % 12 : null
  ).filter(note => note !== null);

  const lowNotes = noteFrequencies.filter(note => note < 5).length;
  const midNotes = noteFrequencies.filter(note => note >= 5 && note < 9).length;
  const highNotes = noteFrequencies.filter(note => note >= 9).length;

  const balance = Math.min(lowNotes, midNotes, highNotes);
  return balance / 3 * 10;
}



assessVoicingRange() {
  const frets = this.voicing.filter(fret => fret !== -1);
  const range = Math.max(...frets) - Math.min(...frets);
  return range > 5 ? 0 : (5 - range) / 5 * 10;
}

assessDissonance() {
  const intervals = [];
  const frets = this.voicing.filter(fret => fret !== -1);

  for (let i = 0; i < frets.length; i++) {
    for (let j = i + 1; j < frets.length; j++) {
      const interval = Math.abs(frets[i] - frets[j]);
      intervals.push(interval);
    }
  }

  const dissonantIntervals = intervals.filter(interval => [1, 2, 6, 10].includes(interval));
  return 10 - dissonantIntervals.length * 2;
}

assessResonanceAndSustain() {
  const openStrings = this.voicing.filter(fret => fret === 0).length;
  return openStrings * 2;
}

assessChordClarity() {
  const clearNotes = this.voicing.filter(fret => fret !== -1 && fret !== 0);
  return clearNotes.length / 6 * 10;
}

assessContextualFit(contextChords) {
  const similarityScores = contextChords.map(contextChord => {
    let score = 0;
    for (let i = 0; i < 6; i++) {
      if (contextChord.voicing[i] === this.voicing[i]) {
        score++;
      }
    }
    return score;
  });

  const maxSimilarity = Math.max(...similarityScores);
  return maxSimilarity / 6 * 10;
}
}*/

/*
Start at Index Finger, represented by fingerPositions 1.
Count the String changes on the Same Fret with the middle finger so if the middle finger is 2 stings below, add 2 to the evalutaion 
if the middle finger is on the next fret over the minAboveZero, add 0, and only add 1 for each string it moved down or upward relative to the index finger
if the index finger is on the same fret as the middle finger, but the index finger is not also on the fret where the ring finger is, add the string count distance between the middle and ring finger 
if the index finger is on one fret more thatn the middle finger, but the middle and the index finger are on the fret below, add only the distance between the ring and the middle finger
if the index finger is on one fret, the middle finger is on +1 fret and the ring finger is on #1 fret, add 3 to the difficulty
if the small finger is on the same fret as the ring finger, but no other finger is on that fret, only add the string distance between the ring and the small finger.


*/
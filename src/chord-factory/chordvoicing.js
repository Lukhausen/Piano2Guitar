import { settings } from './constants.js';


/**
 * Class representing a Chord Voicing.
 * 
 * The `ChordVoicing` class is used to represent a specific way to play a chord on a guitar. It includes
 * properties and methods to calculate and rate the playability and sound quality of the chord voicing.
 * 
 * @class
 */
export class ChordVoicing {
  /**
   * Creates an instance of ChordVoicing.
   * 
   * @constructor
   * @param {Array<number>} voicing - Array representing the fret positions for each string (0-5). `-1` represents a muted string, `0` represents an open string.
   * @param {number|null} barre - The fret position where a barre chord is applied. `null` if no barre chord.
   * @param {number} fingersUsed - The number of fingers used to play the chord.
   * @param {number} minAboveZero - The minimum fret position above zero used in the voicing.
   * @param {Array<number>} chordFactoryNotes - Array of note indices used in the chord (0-11 representing C-B).
   * @param {number} chordFactoryRoot - The root note of the chord.
   */
  constructor(voicing, fingerPositions, barres, minAboveZero, fingersUsed, chordFactoryNotes, chordFactoryRoot, actuallyPlayedNotes) {


    this.voicing = voicing;
    this.barres = barres;

    this.minAboveZero = minAboveZero
    this.fingerPositions = fingerPositions
    this.fingersUsed = fingersUsed
    this.chordSpacing = 0
    this.chordFactoryNotes = chordFactoryNotes
    this.chordFactoryRoot = chordFactoryRoot
    this.actuallyPlayedNotes = actuallyPlayedNotes



    this.playabilityRating = 0;
    this.soundQualityRating = 0; // New property to store sound quality rating

    this.ratingDetails = {
      playability: {
        fingersUsed: 0,
        fingerSpread: 0,
        mutedAmount: 0,
        fretHeight: 0,
        total: 0,
      },
      soundQuality: {
        harmonicCompleteness: 0,
        openStrings: 0,
        playedStrings: 0,
        fretBoardHeight: 0,
        voicingRange: 0,
        doubleNotes: 0,
        total: 0,
      }
    };

    //this.calculateChordSpacing()
    //this.calculateFingerPosition()

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





  //1 is good playability, 0 is bad palyability
  ratePlayability() {
    // Define playability weights directly within this method
    const PLAYABILITY_WEIGHTS = {
      fingersUsed: 3,        // Increased due to significant impact on difficulty
      fingerSpread: 5,       // Increased to reflect moderate spreads being easier
      fretHeight: 30,         // Kept moderate as high frets can be challenging
      mutedAmount: 40,        // Kept moderate as muting few strings is common
      mutedDifficulty: 14,    // Increased due to high difficulty of unreachable mutes
      mutedReachability: 2,  // Increased due to difficulty of unreachable mutes
      barreAmount: 9,        // Increased due to high difficulty of barre chords
      barreDifficulty: 6,
      fingerDistances: 2,    // Increased to reflect larger distances being harder
    };



    const details = this.ratingDetails.playability;
    details.fingersUsed = this.assessPlayabilityFingersUsed() * PLAYABILITY_WEIGHTS.fingersUsed;
    details.fingerSpread = this.assessPlayabilityFingerSpread() * PLAYABILITY_WEIGHTS.fingerSpread;
    details.mutedAmount = this.assessPlayabilityMutedAmount() * PLAYABILITY_WEIGHTS.mutedAmount;
    details.fretHeight = this.assessPlayabilityFretHeight() * PLAYABILITY_WEIGHTS.fretHeight;
    details.mutedDifficulty = this.assessPlayabilityMutedDifficulty() * PLAYABILITY_WEIGHTS.mutedDifficulty;
    details.mutedReachability = this.assessPlayabilityMutedReachability() * PLAYABILITY_WEIGHTS.mutedReachability;
    details.barreAmount = this.assessPlayabilityBarreAmount() * PLAYABILITY_WEIGHTS.barreAmount;
    details.fingerDistances = this.assessPlayabilityFingerDistances() * PLAYABILITY_WEIGHTS.fingerDistances;
    details.barreDifficulty = this.assessPlayabilityBarreDifficulty() * PLAYABILITY_WEIGHTS.barreDifficulty;

    // Calculate total playability score
    details.total = (
      details.fingersUsed +
      details.fingerSpread +
      details.mutedAmount +
      details.fretHeight +
      details.mutedDifficulty +
      details.mutedReachability +
      details.barreAmount +
      details.barreDifficulty +
      details.fingerDistances
    ) / Object.values(PLAYABILITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);

    this.playabilityRating = details.total;
  }

  assessPlayabilityFingersUsed() {
    // USe FInger Positions because They are MOst realibale and ALgorithmically Safe Way (Becaus of possible future Changes) to asses Finger COunt
    let maxUsableFingers = 4
    // INvert Rating so Many fingers used gets a low score
    let rating = 1 - (this.fingersUsed / maxUsableFingers)
    return rating
  }

  assessPlayabilityFingerSpread() {
    let maxFret = 0
    for (let i = 0; i < 6; i++) {
      if (this.voicing[i] > maxFret) {
        maxFret = this.voicing[i]
      }
    }
    return 1 - ((2 ** (maxFret - this.minAboveZero)) / (2 ** settings.fingerFretRange))
  }

  assessPlayabilityMutedAmount() {
    let mutedCount = 0
    for (let i = 0; i < 6; i++) {
      if (this.voicing[i] == -1) {
        mutedCount++
      }
    }
    return 1 - (mutedCount / 6)
  }

  assessPlayabilityFretHeight() {
    if (Math.max(...this.voicing) > settings.fingerFretRange) {
      return 1 - (this.minAboveZero / 12)
    }
    else {
      return 1
    }

  }

  assessPlayabilityMutedDifficulty() {
    let mutedDifficulty = 0
    //Check Muting from the top
    for (let i = 0; i < 4; i++) {
      if (this.voicing[i] == -1) {
        mutedDifficulty += (i * 1)
      }
    }
    //Check Muting from the bottom  
    for (let i = 0; i < 4; i++) {
      if (this.voicing[5 - i] == -1) {
        mutedDifficulty += (i * 1.5)
      }
    }

    return 1 - (mutedDifficulty / 15)

  }

  assessPlayabilityBarreAmount() {
    return 1 - ((this.barres.length * this.barres.length) / (3 * 3))
  }

  assessPlayabilityBarreDifficulty() {
    if(this.barres.length ==0){
      return 0.9
    }
    let count = 0
    this.barres.forEach(barre => {
      //If Full Barre
      count += barre[2] - barre[1]
    })
    let barrevalue = count / this.barres.length
    return (barrevalue / 5)
  }

  assessPlayabilityMutedReachability() {
    let mutedDifficulty = 0;
    let totalUnreachableMutes = 0;

    // Loop through the strings to check for muted strings surrounded by open strings
    for (let i = 1; i < this.voicing.length - 1; i++) { // Start from the second string and go to the second-last
      if (this.voicing[i] === -1) { // Check if the current string is muted
        // Check if both neighboring strings are open
        if (this.voicing[i - 1] === 0 && this.voicing[i + 1] === 0) {
          totalUnreachableMutes++;
        }
      }
    }

    // Edge cases: Check the first and last string separately if needed
    if (this.voicing[0] === -1 && this.voicing[1] === 0) { // First string muted and second string open
      totalUnreachableMutes++;
    }
    if (this.voicing[this.voicing.length - 1] === -1 && this.voicing[this.voicing.length - 2] === 0) { // Last string muted and the one before it open
      totalUnreachableMutes++;
    }

    // Normalize the difficulty score: the more muted strings surrounded by open strings, the higher the difficulty
    mutedDifficulty = totalUnreachableMutes / (this.voicing.filter(v => v === -1).length || 1); // Avoid division by zero

    return 1 - mutedDifficulty; // Invert to match scale where 1 is easy and 0 is difficult
  }

  assessPlayabilityFingerDistances() {
    const positions = [];

    // Collect positions of all fingers that are not muting a string.
    this.fingerPositions.forEach((pos, index) => {
      if (pos > 0 && this.voicing[index] !== -1) {
        positions.push({ finger: pos, fret: this.voicing[index], string: index });
      }
    });

    // Sort the positions array by finger order
    positions.sort((a, b) => a.finger - b.finger);
    //console.log(positions)

    // Calculate total distance between consecutive fingers
    let totalDistance = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      const fretDistance = Math.abs(positions[i].fret - positions[i + 1].fret);
      const stringDistance = Math.abs(positions[i].string - positions[i + 1].string);
      totalDistance += fretDistance + stringDistance;
    }

    return settings.fingerFretRange / totalDistance;
  }













  rateSoundQuality() {
    // Define sound quality weights directly within this method
    const SOUND_QUALITY_WEIGHTS = {
      harmonicCompleteness: 1,
      openStrings: 1,
      playedStrings: 2,
      fretBoardHeight: 3,
      voicingRange: 4,
      doubleNotes: 1,
      voicingExp: 3,
      highStringHarmonicCompleteness: 2,
    };

    const details = this.ratingDetails.soundQuality;
    details.harmonicCompleteness = this.assessSoundHarmonicCompleteness() * SOUND_QUALITY_WEIGHTS.harmonicCompleteness;
    details.openStrings = this.assessSoundOpenStrings() * SOUND_QUALITY_WEIGHTS.openStrings;
    details.playedStrings = this.assessSoundPlayedStrings() * SOUND_QUALITY_WEIGHTS.playedStrings;
    details.fretBoardHeight = this.assessSoundFretBoardHeight() * SOUND_QUALITY_WEIGHTS.fretBoardHeight;
    details.voicingRange = this.assessSoundVoicingRange() * SOUND_QUALITY_WEIGHTS.voicingRange;
    details.doubleNotes = this.assessSoundDoubleNotes() * SOUND_QUALITY_WEIGHTS.doubleNotes;
    details.voicingExp = this.assessSoundVoicingExp() * SOUND_QUALITY_WEIGHTS.voicingExp;
    details.highStringHarmonicCompleteness = this.assessSoundHighStringHarmonicCompleteness() * SOUND_QUALITY_WEIGHTS.highStringHarmonicCompleteness;

    // Calculate total sound quality score
    details.total = (
      details.harmonicCompleteness +
      details.openStrings +
      details.playedStrings +
      details.fretBoardHeight +
      details.voicingRange +
      details.doubleNotes +
      details.voicingExp +
      details.highStringHarmonicCompleteness
    ) / Object.values(SOUND_QUALITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);

    this.soundQualityRating = details.total;
  }

  assessSoundHarmonicCompleteness() {
    // Transform chordFactoryNotes to modulo 12 and store as a Set
    const uniqueDesiredNotes = new Set(this.chordFactoryNotes.map(note => note % 12));

    // Transform actuallyPlayedNotes to modulo 12 and store as a Set
    const playedNotesModuloSet = new Set(this.actuallyPlayedNotes.map(note => note % 12));

    // Calculate the number of overlapping notes using set intersection
    let overlapCount = 0;
    uniqueDesiredNotes.forEach(note => {
      if (playedNotesModuloSet.has(note)) {
        overlapCount++;
      }
    });

    // Calculate harmonic completeness score
    const completenessScore = overlapCount / uniqueDesiredNotes.size;
    return completenessScore;
  }

  assessSoundOpenStrings() {
    let openStrings = 0;

    for (let i = 0; i < this.voicing.length; i++) {
      if (this.voicing[i] === 0) {
        openStrings++;
      }
    }

    return openStrings / this.voicing.length;
  }

  assessSoundPlayedStrings() {
    let playedStrings = 0;

    for (let i = 0; i < this.voicing.length; i++) {
      if (this.voicing[i] >= 0) {
        playedStrings++;
      }
    }

    return playedStrings / this.voicing.length;
  }

  assessSoundFretBoardHeight() {
    return Math.max(0, (1 - (this.minAboveZero / 12)))
  }



  assessSoundVoicingRange() {
    let minIndex = -1
    let maxIndex = -1
    for (let i = 0; i < 6; i++) {
      if (this.voicing[i] != -1) {
        minIndex = i
        break;
      }
    }
    //Check if one thing is presen
    if (minIndex < 0) {
      return 0;
    }

    for (let i = 5; i >= 0; i--) {
      if (this.voicing[i] != -1) {
        maxIndex = i
        break;
      }
    }
    let spacing = this.actuallyPlayedNotes[maxIndex] - this.actuallyPlayedNotes[minIndex]
    let maxSpacing = settings.tuning[5] + this.minAboveZero + settings.fingerFretRange - settings.tuning[0] + this.minAboveZero

    // The Higher the number, the better So The higher the Spacing archived, the better
    let spacingRatio = spacing / maxSpacing
    return spacingRatio
  }

  assessSoundDoubleNotes() {
    let doubleNotes = 0
    for (let i = 0; i < 5; i++) {
      if (this.actuallyPlayedNotes[i] == this.actuallyPlayedNotes[i + 1]) {
        doubleNotes++;
      }
    }
    return 1 - (doubleNotes / 5)
  }

  assessSoundVoicingExp() {
    // The Closer to 1 the Bigger are the Gaps Between the Low Notes
    // The CLoser to 0, the more it is equal spaces are between the Notes
    let decayParameter = 0.5
    this.ratingDetails.soundQuality.expDeltaArray = [0, 0, 0, 0, 0, 0]
    let min = 99
    let max = -1
    this.actuallyPlayedNotes.forEach(element => {
      if (element > max) {
        max = element
      }
      if (element < min && element != -1) {
        min = element
      }
    })
    let difference = max - min

    let desiredpoint
    let comultative_delta = 0
    let unmuted_strings = 0
    for (let i = 0; i < 6; i++) {
      //If Not Muted, get the Desired exponential Decay point
      if (this.actuallyPlayedNotes[i] != -1) {
        unmuted_strings++
        desiredpoint = ((difference) * (1 - Math.exp(-decayParameter * i))) + min;
        comultative_delta += Math.abs(desiredpoint - this.actuallyPlayedNotes[i])
        this.ratingDetails.soundQuality.expDeltaArray[i] = desiredpoint
      }
    }
    this.ratingDetails.soundQuality.expComultativeDelta = comultative_delta

    //lessdelta means Better sound
    return 1 - Math.min((comultative_delta / (difference * unmuted_strings)), 1)
  }
  assessSoundHighStringHarmonicCompleteness() {
    let playedNotesModulo = this.actuallyPlayedNotes.map(note => note % 12)
    let overlap = new Set();
    let minStrings = Math.min(6, this.chordFactoryNotes.length);
    for (let string = 0; string < minStrings; string++) {
      if (this.chordFactoryNotes.includes(playedNotesModulo[5 - string])) {
        overlap.add(playedNotesModulo[5 - string]);
      }
    }
    this.ratingDetails.soundQuality.highStringHarmonicOverlap = overlap.size + " / " + minStrings
    return overlap.size / minStrings;
  }
}
/*
assessVoicingRange(){
  //TODO: Asses, The Difference Between the Lowest and the highest Played note. Find a Way to normalize the output between 0 (small difference) and 1
}


assessTonalBalance() {
  const noteFrequencies = this.voicing.map((fret, string) =>
    fret !== -1 ? (STANDARD_settings.tuning[string] + fret) % 12 : null
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
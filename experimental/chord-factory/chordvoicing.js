import { STANDARD_TUNING, NOTE_INDEX_MAP, BARRE_RATING } from './constants.js';
import { parseNotes, removeDuplicateArrays } from './utils.js';
import { ChordFactory } from './chord.js';

export class ChordVoicing {
    constructor(voicing, barre, fingersUsed, barreSize, minAboveZero) {
      this.voicing = voicing;
      this.barre = barre;
      this.rating = 0;
      this.fingersUsed = fingersUsed
      this.barreSize = barreSize
      this.minAboveZero = minAboveZero
      this.fingerPositions = [0, 0, 0, 0, 0, 0]
      this.chordSpacing = 0
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
  
    rateVoicing() {
      let rating = 0;
  
      // How Far The Points are away from each other
      rating += this.chordSpacing
  
      //Smaller Barre is Harder Than full 6 String Barre
      if (this.barre<5) {
        rating += 15
      }else if (this.barre){
        rating +=10
      }
  
      // Exponential Muted Strings
      let mutedCount = 0
      this.voicing.forEach((note) => {
        if (note == -1) {
          mutedCount++
        }
      })
      rating += Math.pow(3, mutedCount)
  
      // The More fingers are used, the more difficult
      rating += this.fingersUsed
  
      // The Higher up the Fretboard, the more difficult
      rating += (this.minAboveZero)
  
      //The Wider the Finger are Spread, the more difficult it is.
      let spread = this.minAboveZero - Math.max(...this.voicing)
      rating += spread*spread
  
      this.rating = rating
      return;
    }
  }
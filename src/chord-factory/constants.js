// constants.js

export const BARRE_RATING = 1
export const MAX_FRETS = 24

/**
 * Class representing application settings.
 */
class Settings {
  /**
   * Create a settings object with default values.
   */
  constructor() {
    this._tuning = [40, 45, 50, 55, 59, 64];
    this._fingerFretRange = 4;
    this._mutePermutations = false
    this._startWithRoot = true;

  }

  /**
   * Get the current tuning values.
   * @returns {number[]} The current tuning values as an array of integers.
   */
  get tuning() {
    return this._tuning;
  }

  /**
   * Set new tuning values.
   * @param {number[]} value - An array of integers representing the new tuning values.
   * @throws {Error} Throws an error if the value is not an array of integers.
   */
  set tuning(value) {
    if (Array.isArray(value) && value.every(num => Number.isInteger(num))) {
      this._tuning = value;
    } else {
      throw new Error("Invalid tuning value. It must be an array of integers.");
    }
  }

  /**
   * Get the current finger fret range.
   * @returns {number} The current finger fret range as a positive integer.
   */
  get fingerFretRange() {
    return this._fingerFretRange;
  }

  /**
   * Set a new finger fret range.
   * @param {number} value - A positive integer representing the new finger fret range.
   * @throws {Error} Throws an error if the value is not a positive integer.
   */
  set fingerFretRange(value) {
    if (Number.isInteger(value) && value > 0) {
      this._fingerFretRange = value;
    } else {
      throw new Error("Invalid fingerFretRange value. It must be a positive integer.");
    }
  } /**
  * Get the current mutePermutations value.
  * @returns {boolean} The current mutePermutations value.
  */

  get mutePermutations() {
    return this._mutePermutations;
  }

  /**
   * Set a new mutePermutations value.
   * @param {boolean} value - A boolean representing the new mutePermutations value.
   * @throws {Error} Throws an error if the value is not a boolean.
   */
  set mutePermutations(value) {
    if (typeof value === 'boolean') {
      this._mutePermutations = value;
    } else {
      throw new Error("Invalid mutePermutations value. It must be a boolean.");
    }
  }
  /**
  * Get the current startWithRoot value.
  * @returns {boolean} The current startWithRoot value.
  */
  get startWithRoot() {
    return this._startWithRoot;
  }

  /**
   * Set a new startWithRoot value.
   * @param {boolean} value - A boolean representing the new startWithRoot value.
   * @throws {Error} Throws an error if the value is not a boolean.
   */
  set startWithRoot(value) {
    if (typeof value === 'boolean') {
      this._startWithRoot = value;
    } else {
      throw new Error("Invalid startWithRoot value. It must be a boolean.");
    }
  }

}

export const settings = new Settings();

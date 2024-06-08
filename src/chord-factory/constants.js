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
    this.tuning = [40, 45, 50, 55, 59, 64];
    this.fingerFretRange = 4;
    this.mutePermutations = false
    this.startWithRoot = true;
    this.trailing = true;

  }

}

export var settings = new Settings();

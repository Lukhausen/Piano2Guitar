function generatePlayableChords(positions) {
    const chords = [];
  
    // Helper function to generate combinations
    function generateCombinations(currentChord, stringIndex, minFret, maxFret) {
      // Base case: If we have processed all strings, add the current chord to the result
      if (stringIndex === positions.length) {
        chords.push([...currentChord]);
        return;
      }
  
      // Recursive case: Generate combinations for the current string
      for (let i = 0; i < positions[stringIndex].length; i++) {
        const fret = positions[stringIndex][i];
  
        // Update minFret and maxFret
        const newMinFret = fret !== 0 ? Math.min(minFret, fret) : minFret;
        const newMaxFret = Math.max(maxFret, fret);
  
        // Check if the chord is still playable
        if (newMaxFret - newMinFret <= 2) {
          currentChord[stringIndex] = fret;
  
          // Move to the next string
          generateCombinations(currentChord, stringIndex + 1, newMinFret, newMaxFret);
        }
      }
    }
  
    // Generate all combinations starting from an empty chord
    generateCombinations([], 0, Infinity, 0);
  
    return chords;
  }
  
  // Example usage
  const fingerPositions = [
    [8, 20, 0, 12, 3, 15],
    [3, 15, 7, 19, 10, 22],
    [10, 22, 2, 14, 5, 17],
    [5, 17, 9, 21, 0, 12],
    [1, 13, 5, 17, 8, 20],
    [8, 20, 0, 12, 3, 15]
  ];
  
  const playableChords = generatePlayableChords(fingerPositions);
  console.log(playableChords);
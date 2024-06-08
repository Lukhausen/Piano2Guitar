let settings
// ChordCombinationsWorker.js
onmessage = function (e) {
    if (e.data.type === 'settingsUpdate') {
        settings = e.data.newSettings;
        console.warn("settingsUpdate:", settings)

    } else {
        const { fingerPositions } = e.data;
        console.warn("ChordCombinationsWorker called:", fingerPositions)
        const chords = generateAllChordCombinations(fingerPositions);
        postMessage(chords);
    }
};



function generateAllChordCombinations(fingerPositions) {
    console.warn("Settings at generateAllChordCombinations", settings)

    // Start the timer to measure function execution time
    const startTime = performance.now();

    // Array to keep track of temporary indexes where -1 is inserted
    let temporaryMutedIndexes = [];
    // Array to store all generated chord combinations
    let generatedChords = [];

    // Initialize maskScope with 6 empty arrays, one for each string
    let maskScope = Array.from({ length: 6 }, () => []);
    let preScope = [];
    let trail = []
    let trailIndexes = []

    // Array to store the current index in fingerPositions for each string
    const fingerIndexStorage = Array(6).fill(0);

    // Array to store the length of valid positions for each string minus one
    let fingerIndexLength = [];
    fingerPositions.forEach((element, index) => {
        fingerIndexLength[index] = element.length - 1;
    });


    // Iterate over all possible frets from -1 (muted) to 12
    for (let fret = -1; fret < 13; fret++) {
        preScope = [];
        temporaryMutedIndexes = [];

        // Reduce the Trail for each Trail Index by 1
        if (settings.trailing) {
            trailIndexes.forEach((string, index, object) => {
                trail[string] -= 1;

                // Check if the current value is below the allowable range
                if (trail[string] <= (settings.fingerFretRange * -1)) {
                    trail[string] = 0;

                    // Remove the current string from trailIndexes if the value is out of the range
                    object.splice(index, 1);
                }
            });
        }

        // Iterate over each string of the guitar
        for (let string = 0; string < 6; string++) {
            //console.log("maskScope before", structuredClone(maskScope));

            console.log("scope before removal", structuredClone(maskScope))
            // Remove positions in maskScope that are less than the current fret
            for (let validPosition = 0; validPosition < maskScope[string].length; validPosition++) {
                if (maskScope[string][validPosition] > 0 && maskScope[string][validPosition] < fret) {
                    maskScope[string].splice(validPosition, 1);
                    //Add the position to the Trailing Elements
                    if (settings.trailing) {
                        trail[string] = -1
                    }
                }
            }
            console.log("scope after removal", structuredClone(maskScope))

            // If maskScope is empty for the current string, add it to preScope
            if (maskScope[string].length == 0) {
                // only Push the element to the PreScope If its not trailing
                if (!trail[string] || !settings.trailing) {
                    preScope.push(string);
                }
            }
        }

        // Populate maskScope for strings in preScope
        preScope.forEach((string) => {
            if (fingerIndexStorage[string] < fingerIndexLength[string]) {
                // If the next valid position is within the allowed fret range
                if (fingerPositions[string][fingerIndexStorage[string]] < fret + settings.fingerFretRange) {
                    // Do nothing as the position will be added in the next loop
                } else {
                    // Add -1 (muted) to maskScope if the position is out of range
                    maskScope[string].push(-1);
                    temporaryMutedIndexes.push(string);
                }
            }
        });

        // Insert new elements into maskScope
        for (let string = 0; string < 6; string++) {
            // If there are valid positions left for the current string
            if (fingerIndexStorage[string] < fingerIndexLength[string]) {
                // If the next valid position is within the allowed fret range
                if (fingerPositions[string][fingerIndexStorage[string]] < fret + settings.fingerFretRange) {
                    //console.log("generateAllChordCombinations2 Pushing into maskScope[string], string, fingerPositions[string][fingerIndexStorage[string]] ", maskScope[string], string, fingerPositions[string][fingerIndexStorage[string]]);
                    //console.log("fret, string", fret, string);
                    maskScope[string].push(fingerPositions[string][fingerIndexStorage[string]]);
                    //console.log("maskScope after insertion", structuredClone(maskScope));

                    // Generate all combinations of positions in maskScope
                    for (let pos1 of maskScope[(string + 1) % 6]) {
                        for (let pos2 of maskScope[(string + 2) % 6]) {
                            for (let pos3 of maskScope[(string + 3) % 6]) {
                                for (let pos4 of maskScope[(string + 4) % 6]) {
                                    for (let pos5 of maskScope[(string + 5) % 6]) {
                                        let newVoicing = [];
                                        newVoicing[string] = fingerPositions[string][fingerIndexStorage[string]];
                                        newVoicing[(string + 1) % 6] = pos1;
                                        newVoicing[(string + 2) % 6] = pos2;
                                        newVoicing[(string + 3) % 6] = pos3;
                                        newVoicing[(string + 4) % 6] = pos4;
                                        newVoicing[(string + 5) % 6] = pos5;

                                        //console.log("NEW: ", structuredClone(newVoicing));
                                        generatedChords.push(newVoicing);
                                    }
                                }
                            }
                        }
                    }

                    // Move to the next valid position for the current string
                    fingerIndexStorage[string]++;



                } else {
                    // Break because the element found is too big to be inserted into the maskScope
                }
            } else {
                // Break because there are no more elements left in the Array
            }
        }
        // Remove the temporary -1 values added to maskScope
        for (let i of temporaryMutedIndexes) {
            maskScope[i].pop();
        }
    }

    // Track end time and calculate the time taken
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    console.log("generateAllChordCombinations2 - Time taken:", timeTaken, "milliseconds");

    return generatedChords;
}
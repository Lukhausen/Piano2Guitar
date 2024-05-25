const MAX_FRETS = 22;

function createNewEachTime() {
    const startTime = performance.now();
    for (let i = 0; i < 70000; i++) {
        let barreClass = Array.from({ length: MAX_FRETS }, () => Array.from({ length: 6 }, () => []));
        let barreClassesUsed = new Set();
        let barreSeparatorIndex = Array.from({ length: MAX_FRETS }, () => 0);
        let minAboveZero = 99;
        let mutingTillRoot = true;
        // Simulate some operations
        barreClassesUsed.add(1);
        minAboveZero = Math.min(minAboveZero, 5);
    }
    const endTime = performance.now();
    console.log("Time taken for creating new objects each time:", endTime - startTime, "milliseconds");
}

function reuseAndClear() {
    const startTime = performance.now();
    let barreClass = Array.from({ length: MAX_FRETS }, () => Array.from({ length: 6 }, () => []));
    let barreClassesUsed = new Set();
    let barreSeparatorIndex = Array.from({ length: MAX_FRETS }, () => 0);
    for (let i = 0; i < 70000; i++) {
        let minAboveZero = 99;
        let mutingTillRoot = true;
        // Simulate some operations
        barreClassesUsed.add(1);
        minAboveZero = Math.min(minAboveZero, 5);
        // Clear objects
        barreClass.forEach(fretArray => fretArray.forEach(stringArray => stringArray.length = 0));
        barreClassesUsed.clear();
        barreSeparatorIndex.fill(0);
    }
    const endTime = performance.now();
    console.log("Time taken for reusing and clearing objects:", endTime - startTime, "milliseconds");
}

reuseAndClear();
createNewEachTime();

function performCalculations() {
    let start = performance.now();
    let x = 0;
    for (let i = 0; i < 600000000; i++) {
        x = Math.abs(i - 100);
    }
    let end = performance.now();
    console.log(`Time taken: ${(end - start) / 1000} seconds`);
}

performCalculations();

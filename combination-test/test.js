function realDelta(arr1, arr2) {
    let sum = 0;
    for (let i = 0; i < arr1.length; i++) {
        sum += Math.abs(arr1[i] - arr2[i]);
    }
    return sum;
}

function sparseWeightedDiff(arr1, arr2, weights) {
    let diff = 0;
    for (let i = 0; i < arr1.length; i++) {
        diff += (arr2[i] - arr1[i]) * weights[i];
    }
    return diff;
}

const arrays = [
    [-1, -1, 14, 12, 0, 0],
    [-1, 7, 9, 9, 0, 7],
    [-1, 19, 21, 21, 20, 19],
    [0, 19, 17, 0, 17, 0],
    [0, 19, 21, 0, 20, 19]
];

const weights = [1, 0.5, 1, 0.5, 1, 0.5];

const comparisonResults = [];
for (let i = 0; i < arrays.length; i++) {
    for (let j = i + 1; j < arrays.length; j++) {
        const arr1 = arrays[i];
        const arr2 = arrays[j];
        const realDeltaValue = realDelta(arr1, arr2);
        const estimatedDeltaValue = sparseWeightedDiff(arr1, arr2, weights);
        comparisonResults.push({
            Array1: arr1,
            Array2: arr2,
            RealDelta: realDeltaValue,
            EstimatedDelta: estimatedDeltaValue
        });
    }
}

// Display results
comparisonResults.forEach(result => {
    console.log("Array 1:", result.Array1);
    console.log("Array 2:", result.Array2);
    console.log("Real Delta:", result.RealDelta);
    console.log("Estimated Delta:", result.EstimatedDelta);
    console.log("---".repeat(10)); // Separator for readability
});

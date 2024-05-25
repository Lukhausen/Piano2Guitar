function generateRandomArray(length, min, max) {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

function generateTestData(arrayCount, arrayLength, min, max) {
    const data = [];
    for (let i = 0; i < arrayCount; i++) {
        data.push(generateRandomArray(arrayLength, min, max));
    }
    return data;
}

function testJSONStringify(data) {
    const startTime = performance.now();
    const result = data.map(array => JSON.stringify(array));
    const endTime = performance.now();
    return endTime - startTime;
}

function testManualConcatenation(data) {
    const startTime = performance.now();
    const result = data[0]+data[1]+data[2]+data[3]+data[4]+data[5]+" ";
    const endTime = performance.now();
    return endTime - startTime;
}

const arrayCount = 70000;
const arrayLength = 6;
const min = -1;
const max = 24;

const testData = generateTestData(arrayCount, arrayLength, min, max);

const iterations = 10;
let totalJSONStringifyTime = 0;
let totalManualConcatTime = 0;

for (let i = 0; i < iterations; i++) {
    totalJSONStringifyTime += testJSONStringify(testData);
    totalManualConcatTime += testManualConcatenation(testData);
}

const avgJSONStringifyTime = totalJSONStringifyTime / iterations;
const avgManualConcatTime = totalManualConcatTime / iterations;

console.log(`Average JSON.stringify time: ${avgJSONStringifyTime.toFixed(3)} ms`);
console.log(`Average Manual concatenation time: ${avgManualConcatTime.toFixed(3)} ms`);

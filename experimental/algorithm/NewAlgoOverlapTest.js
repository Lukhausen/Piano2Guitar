const fs = require('fs');

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

function findDifferences(arr1, arr2) {
    let differences = { uniqueToArr1: [], uniqueToArr2: [] };

    const arr2Set = new Set(arr2.map(arr => JSON.stringify(arr)));

    arr1.forEach(arr => {
        if (!arr2Set.has(JSON.stringify(arr))) {
            differences.uniqueToArr1.push(arr);
        }
    });

    const arr1Set = new Set(arr1.map(arr => JSON.stringify(arr)));

    arr2.forEach(arr => {
        if (!arr1Set.has(JSON.stringify(arr))) {
            differences.uniqueToArr2.push(arr);
        }
    });

    return differences;
}

function countDuplicates(arr) {
    let counts = {};
    let duplicates = 0;
    let duplicatedElements = [];

    arr.forEach(element => {
        let key = JSON.stringify(element);
        if (counts[key]) {
            counts[key]++;
            if (counts[key] === 2) { // Add the element and count the first time it's identified as a duplicate
                duplicatedElements.push({ element: element, count: counts[key] });
            } else {
                // Update the count in the duplicatedElements array
                let foundElement = duplicatedElements.find(el => JSON.stringify(el.element) === key);
                if (foundElement) {
                    foundElement.count = counts[key];
                }
            }
        } else {
            counts[key] = 1;
        }
    });

    duplicates = Object.values(counts).reduce((acc, count) => count > 1 ? acc + (count - 1) : acc, 0);

    return { count: duplicates, elements: duplicatedElements };
}

function countUniqueElements(arr) {
    let uniqueElements = new Set(arr.map(element => JSON.stringify(element)));
    return uniqueElements.size;
}

function loadArrayFromFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading file from disk: ${err}`);
        return [];
    }
}

const array_1 = loadArrayFromFile('experimental/algorithm/array_1.json');
const array_2 = loadArrayFromFile('experimental/algorithm/array_2.json');

const differences = findDifferences(array_1, array_2);
const duplicatesInNewAlgo = countDuplicates(array_1);
const duplicatesInOldAlgo = countDuplicates(array_2);
const uniqueCountInNewAlgo = countUniqueElements(array_1);
const uniqueCountInOldAlgo = countUniqueElements(array_2);

console.log("Arrays in array_1 but not in array_2:", differences.uniqueToArr1);
console.log("Amount: ", differences.uniqueToArr1.length);
console.log("Arrays in array_2 but not in array_1:", differences.uniqueToArr2);
console.log("Amount: ", differences.uniqueToArr2.length);
console.log("Duplicate items in array_1: ", duplicatesInNewAlgo.count);
console.log("Duplicated elements in array_1: ", duplicatesInNewAlgo.elements);
console.log("Duplicate items in array_2: ", duplicatesInOldAlgo.count);
console.log("Duplicated elements in array_2: ", duplicatesInOldAlgo.elements);
console.log("Unique elements in array_1: ", uniqueCountInNewAlgo);
console.log("Unique elements in array_2: ", uniqueCountInOldAlgo);
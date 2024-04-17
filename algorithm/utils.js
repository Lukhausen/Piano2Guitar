import { STANDARD_TUNING, NOTE_INDEX_MAP } from './constants.js';

export function parseNotes(input) {
  return input.toUpperCase()
    .replace(/B#/g, 'C').replace(/E#/g, 'F')
    .split(/[\s,]+/)
    .filter(note => NOTE_INDEX_MAP.hasOwnProperty(note));
}

export function removeDuplicateArrays(arrays) {
  const uniqueArrays = new Set();
  return arrays.filter(array => {
    const serialized = JSON.stringify(array);
    if (!uniqueArrays.has(serialized)) {
      uniqueArrays.add(serialized);
      return true;
    }
    return
  });
}
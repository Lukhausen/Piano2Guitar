// Mapping of musical notes to their respective index numbers
export const NOTE_INDEX_MAP = {
  'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3, 'E': 4, 'FB': 4,
  'F': 5, 'F#': 6, 'GB': 6, 'G': 7, 'G#': 8, 'AB': 8, 'A': 9, 'A#': 10,
  'BB': 10, 'B': 11, 'CB': 11
};

// Reverse mapping for number to note conversion
export const NOTE_ARRAY = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Convert a note to its respective index number
export function noteToNumber(note) {
  
  const normalizedNote = note.toUpperCase().replace(/[\s#]+/g, '#').replace(/[\sB]+/g, 'B');
  
  return NOTE_INDEX_MAP.hasOwnProperty(normalizedNote) 
    ? NOTE_INDEX_MAP[normalizedNote] 
    : "Invalid note";
}

// Convert a number to its respective musical note
export function numberToNote(number) {
  return NOTE_ARRAY[number % 12];
}

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

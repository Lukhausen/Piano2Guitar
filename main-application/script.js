import DragAndDropList from './drag-drop/script.js';
import Piano from './piano/script.js';

document.addEventListener('DOMContentLoaded', () => {
    // Function to calculate the number of octaves based on screen width
    function calculateOctaves() {
        const screenWidth = window.innerWidth;
        console.log((Math.sqrt(screenWidth)))
        const maxOctaves = 3; // Base octaves to start with
        const extraOctaves = Math.ceil((Math.sqrt(screenWidth)) / 25);
        return Math.min(maxOctaves, extraOctaves);
    }

    // Create a new Piano instance with dynamic number of octaves
    const myPiano = new Piano('.pianoContainer', { octaves: calculateOctaves() });

    // Create the Search and Drag and Drop
    const items = ['Am', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D'];
    const dropzone = 'selectedItems';
    const itemsContainer = "itemsContainer";
    const itemSearch = "itemSearch";
    const selectedItems = "selectedItems";
    const emptyMessageContainer = "emptyMessageContainer";
    const dragAndDropList = new DragAndDropList(items, dropzone, itemsContainer, itemSearch, selectedItems, emptyMessageContainer);

    window.clearPiano = function() {
        myPiano.clearPiano();
        console.log("Piano cleared");
    };

    // Handle window resize to adjust the number of octaves dynamically
    window.onresize = function() {
        const newOctaves = calculateOctaves();
        myPiano.setOctaves(newOctaves); // Assuming there's a method to update the octaves dynamically
    };


    document.querySelector('.pianoContainer').addEventListener('notesChanged', (e) => {
        console.log('Piano notes changed:', e.detail.notes, e.detail.rootNote);
        //dragAndDropList.ceateAndInsertElement(e.detail.notes)
        // Additional logic to handle the change in notes
    });
});

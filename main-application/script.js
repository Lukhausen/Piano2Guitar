import DragAndDropList from './drag-drop/script.js';
import Piano from './piano/script.js';

document.addEventListener('DOMContentLoaded', () => {
    // Function to calculate the number of octaves based on screen width
    function calculateOctaves() {
        const screenWidth = window.innerWidth;
        console.log(screenWidth)
        const baseOctaves = 1; // Base octaves to start with
        const extraOctaves = Math.ceil((screenWidth - 1000) / 1000);
        return Math.max(baseOctaves, baseOctaves + extraOctaves); // Ensure at least 2 octaves
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
});

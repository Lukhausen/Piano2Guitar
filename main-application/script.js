
import DragAndDropList from './drag-drop/script.js';
import Piano from './piano/script.js';

document.addEventListener('DOMContentLoaded', () => {
    // Create a new Piano instance within the specified container
    const myPiano = new Piano('.pianoContainer', { octaves: 2 });

    // Create The Search and Drag and Drop
    const items = ['Am', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D', 'B', 'C', 'D'];
    const dropzone = 'selectedItems';
    const itemsContainer = "itemsContainer"
    const itemSearch = "itemSearch"
    const selectedItems = "selectedItems"
    const dragAndDropList = new DragAndDropList(items, dropzone, itemsContainer, itemSearch, selectedItems);

    window.clearPiano = function() {
        myPiano.clearPiano()
        console.log("Piano cleared");
    };

});
// Initialize variables
let idCounter = 0;
const items = ['Am', 'B', 'C', 'D'];
const itemsContainer = document.getElementById('itemsList');
const selectedItemsContainer = document.getElementById('selectedItems');
const itemFilterInput = document.getElementById('itemFilter');
const displayArray = document.createElement('div'); // Display area for the selected items array
displayArray.id = 'displayArray';
document.body.appendChild(displayArray); // Append display area to the body

// Store selected items in an array
let selectedItemsArray = [];

// Event listeners
selectedItemsContainer.addEventListener('dragover', allowDrop);
selectedItemsContainer.addEventListener('drop', handleDropOnContainer);
itemFilterInput.addEventListener('input', filterItems);

// Populate the items list
items.forEach(item => {
    itemsContainer.appendChild(createItemElement(item, true));
});

// Update the display of selected items array
function updateDisplayArray() {
    displayArray.textContent = `Selected Items: ${selectedItemsArray.join(', ')}`;
}

// Add a selected item to the selected items container and array
function addSelectedItem(item) {
    const selectedItemElement = createSelectedItemElement(item);
    selectedItemsContainer.appendChild(selectedItemElement);
    selectedItemsArray.push(item); // Add to array
    updateDisplayArray(); // Update display
}

// Function to update the array and display when items are reordered
function updateArrayAndDisplay() {
    selectedItemsArray = Array.from(selectedItemsContainer.children).map(el => el.textContent);
    updateDisplayArray();
}

// Create an item element
function createItemElement(item, isSelectable = false) {
    const itemElement = document.createElement('div');
    itemElement.textContent = item;
    itemElement.className = 'item';
    itemElement.draggable = true;
    itemElement.id = `item-${idCounter++}`;
    itemElement.addEventListener('dragstart', handleDragStart);
    if (isSelectable) {
        itemElement.addEventListener('click', () => addSelectedItem(item));
    }
    return itemElement;
}

// Create a selected item element
function createSelectedItemElement(item) {
    const selectedItemElement = document.createElement('div');
    selectedItemElement.className = 'selected-item';
    selectedItemElement.draggable = true;
    selectedItemElement.id = `selected-item-${idCounter++}`;
    selectedItemElement.textContent = item;
    selectedItemElement.addEventListener('dragstart', handleDragStart);
    selectedItemElement.addEventListener('dragover', handleDragOver);
    selectedItemElement.addEventListener('drop', handleDropReorder);
    selectedItemElement.addEventListener('dragend', handleDragEnd);
    selectedItemElement.addEventListener('dragleave', handleDragLeave);
    return selectedItemElement;
}

// Add a selected item to the selected items container
function addSelectedItem(item) {
    const selectedItemElement = createSelectedItemElement(item);
    selectedItemsContainer.appendChild(selectedItemElement);
}

// Handle drag start event
function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
    event.target.classList.add('dragging');
}

// Handle drag over event
function handleDragOver(event) {
    event.preventDefault();
    const targetElement = event.target.closest('.selected-item');
    if (targetElement) {
        targetElement.classList.add('over');
    }
}

function handleDragLeave(event) {
    event.preventDefault();
    const targetElement = event.target.closest('.selected-item');
    if (targetElement) {
        targetElement.classList.remove('over');
    }
}

// Handle drop event for reordering
function handleDropReorder(event) {
    event.preventDefault();
    const droppedItemId = event.dataTransfer.getData('text/plain');
    const droppedItemElement = document.getElementById(droppedItemId);
    if (!droppedItemElement) return;

    const targetElement = event.target.closest('.selected-item');
    if (targetElement) {
        if (droppedItemElement.classList.contains('selected-item')) {
            insertAtCorrectPosition(droppedItemElement, targetElement);
        }
    } else {
        if (!droppedItemElement.classList.contains('selected-item')) {
            const newClone = createSelectedItemElement(droppedItemElement.textContent);
            selectedItemsContainer.appendChild(newClone);
        } else {
            selectedItemsContainer.appendChild(droppedItemElement);
        }
    }
}

// Handle drag end event
function handleDragEnd(event) {
    event.target.classList.remove('dragging');
    const overItems = document.querySelectorAll('.selected-item.over');
    overItems.forEach(item => item.classList.remove('over'));
    updateArrayAndDisplay(); // Update the array and display
}

// Allow drop on selected items container
function allowDrop(event) {
    event.preventDefault();
}

// Handle drop on selected items container
function handleDropOnContainer(event) {
    event.preventDefault();
    const droppedItemId = event.dataTransfer.getData('text/plain');
    const droppedItemElement = document.getElementById(droppedItemId);

    if (droppedItemElement && !droppedItemElement.classList.contains('selected-item')) {
        const newClone = createSelectedItemElement(droppedItemElement.textContent);
        selectedItemsContainer.appendChild(newClone);
    }
    updateArrayAndDisplay(); // Update the array and display

}

// Insert a dropped item at the correct position in the selected items list
function insertAtCorrectPosition(droppedItemElement, targetElement) {
    const droppedIndex = Array.from(selectedItemsContainer.children).indexOf(droppedItemElement);
    const targetIndex = Array.from(selectedItemsContainer.children).indexOf(targetElement);

    if (droppedIndex < targetIndex) {
        targetElement.after(droppedItemElement);
    } else {
        targetElement.before(droppedItemElement);
    }
    targetElement.classList.remove('over');
}

// Filter items based on user input
function filterItems() {
    const filterValue = itemFilterInput.value.toUpperCase();
    const itemElements = itemsContainer.querySelectorAll('.item');
    itemElements.forEach(itemElement => {
        const itemText = itemElement.textContent.toUpperCase();
        itemElement.style.display = itemText.includes(filterValue) ? '' : 'none';
    });
}
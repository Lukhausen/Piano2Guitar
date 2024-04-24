class DragAndDropList {
    constructor(items, dropzoneId, itemsContainer, itemSearch, selectedItems) {
        this.idCounter = 0;
        this.items = items;
        this.dropzoneId = dropzoneId;
        this.itemsContainer = document.getElementById(itemsContainer);
        this.selectedItemsContainer = document.getElementById(selectedItems);
        this.itemFilterInput = document.getElementById(itemSearch);
        this.displayArray = document.createElement('div');
        this.displayArray.id = 'displayArray';
        document.body.appendChild(this.displayArray);
        this.selectedItemsArray = [];

        this.addEventListeners();
        this.populateItemsList();
    }

    addEventListeners() {
        window.addEventListener('dragover', this.handleWindowDragOver.bind(this));
        window.addEventListener('drop', this.handleWindowDrop.bind(this));
        this.selectedItemsContainer.addEventListener('dragover', this.allowDrop.bind(this));
        this.selectedItemsContainer.addEventListener('drop', this.handleDropOnContainer.bind(this));
        this.itemFilterInput.addEventListener('input', this.filterItems.bind(this));
        this.itemsContainer.addEventListener('drop', this.handleDropOnItemList.bind(this));
    }

    handleWindowDragOver(e) {
        e = e || event;
        if (e.target.id !== this.dropzoneId) {
            e.preventDefault();
        }
    }

    handleWindowDrop(e) {
        e = e || event;
        if (e.target.id !== this.dropzoneId) {
            e.preventDefault();
        }
    }

    populateItemsList() {
        this.items.forEach(item => {
            this.itemsContainer.appendChild(this.createItemElement(item, true));
        });
    }

    createItemElement(item, isSelectable = false) {
        const itemElement = document.createElement('div');
        itemElement.textContent = item;
        itemElement.className = 'dragDropItem';
        itemElement.draggable = true;
        itemElement.id = `dragDropItem-${this.idCounter++}`;
        itemElement.addEventListener('dragstart', this.handleDragStart.bind(this));
        itemElement.addEventListener('dragend', this.handleDragEnd.bind(this));
        if (isSelectable) {
            itemElement.addEventListener('click', () => this.addSelectedItem(item));
        }
        return itemElement;
    }

    createSelectedItemElement(item) {
        const selectedItemElement = document.createElement('div');
        selectedItemElement.className = 'selected-dragDropItem';
        selectedItemElement.draggable = true;
        selectedItemElement.id = `selected-dragDropItem-${this.idCounter++}`;
        selectedItemElement.textContent = item;
        selectedItemElement.addEventListener('dragstart', this.handleDragStart.bind(this));
        selectedItemElement.addEventListener('dragover', this.handleDragOver.bind(this));
        selectedItemElement.addEventListener('drop', this.handleDropReorder.bind(this));
        selectedItemElement.addEventListener('dragend', this.handleDragEnd.bind(this));
        selectedItemElement.addEventListener('dragleave', this.handleDragLeave.bind(this));
        selectedItemElement.addEventListener('dblclick', this.removeSelectedItem.bind(this));
        selectedItemElement.addEventListener('click', this.removeSelectedItem.bind(this));
        return selectedItemElement;
    }

    removeSelectedItem(item) {
        item.target.remove();
        this.updateArrayAndDisplay();
    }

    addSelectedItem(item) {
        const selectedItemElement = this.createSelectedItemElement(item);
        this.selectedItemsContainer.appendChild(selectedItemElement);
        this.selectedItemsArray.push(item);
        this.updateDisplayArray();
    }

    updateDisplayArray() {
        this.displayArray.textContent = `Selected Items: ${this.selectedItemsArray.join(', ')}`;
    }

    handleDropOnItemList(event) {
        event.preventDefault();
        const droppedItemId = event.dataTransfer.getData('text/plain');
        const droppedItemElement = document.getElementById(droppedItemId);

        if (droppedItemElement && droppedItemElement.classList.contains('selected-dragDropItem')) {
            droppedItemElement.remove();
            this.selectedItemsArray = this.selectedItemsArray.filter(item => item !== droppedItemElement.textContent);
            this.updateDisplayArray();
        }
    }

    handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.id);

        if (event.target.classList.contains('selected-dragDropItem')) {
            event.target.classList.add('dragging');
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        const targetElement = event.target.closest('.selected-dragDropItem');
        if (targetElement) {
            targetElement.classList.add('over');
        }
    }

    handleDragLeave(event) {
        event.preventDefault();
        const targetElement = event.target.closest('.selected-dragDropItem');
        if (targetElement) {
            targetElement.classList.remove('over');
        }
    }

    handleDropReorder(event) {
        event.preventDefault();
        const droppedItemId = event.dataTransfer.getData('text/plain');
        const droppedItemElement = document.getElementById(droppedItemId);
        if (!droppedItemElement) return;

        const targetElement = event.target.closest('.selected-dragDropItem');
        if (targetElement) {
            if (droppedItemElement.classList.contains('selected-dragDropItem')) {
                this.insertAtCorrectPosition(droppedItemElement, targetElement);
            }
        } else {
            if (!droppedItemElement.classList.contains('selected-dragDropItem')) {
                const newClone = this.createSelectedItemElement(droppedItemElement.textContent);
                this.selectedItemsContainer.appendChild(newClone);
                this.selectedItemsArray.push(droppedItemElement.textContent);
            } else {
                this.selectedItemsContainer.appendChild(droppedItemElement);
            }
        }
        this.updateDisplayArray();
    }

    handleDragEnd(event) {
        event.target.classList.remove('dragging');
        const overItems = document.querySelectorAll('.selected-dragDropItem');
        overItems.forEach(item => item.classList.remove('over'));
        this.updateArrayAndDisplay();
    }

    allowDrop(event) {
        event.preventDefault();
    }

    handleDropOnContainer(event) {
        event.preventDefault();
        const droppedItemId = event.dataTransfer.getData('text/plain');
        const droppedItemElement = document.getElementById(droppedItemId);

        if (droppedItemElement && !droppedItemElement.classList.contains('selected-dragDropItem')) {
            const newClone = this.createSelectedItemElement(droppedItemElement.textContent);
            this.selectedItemsContainer.appendChild(newClone);
            this.selectedItemsArray.push(droppedItemElement.textContent);
        }
        this.updateDisplayArray();
    }

    insertAtCorrectPosition(droppedItemElement, targetElement) {
        const droppedIndex = Array.from(this.selectedItemsContainer.children).indexOf(droppedItemElement);
        const targetIndex = Array.from(this.selectedItemsContainer.children).indexOf(targetElement);

        if (droppedIndex < targetIndex) {
            targetElement.after(droppedItemElement);
        } else {
            targetElement.before(droppedItemElement);
        }
        targetElement.classList.remove('over');
        this.updateArrayAndDisplay();
    }

    updateArrayAndDisplay() {
        this.selectedItemsArray = Array.from(this.selectedItemsContainer.children).map(el => el.textContent);
        this.updateDisplayArray();
    }

    filterItems() {
        const filterValue = this.itemFilterInput.value.toUpperCase();
        const itemElements = this.itemsContainer.querySelectorAll('.dragDropItem');
        itemElements.forEach(itemElement => {
            const itemText = itemElement.textContent.toUpperCase();
            itemElement.style.display = itemText.includes(filterValue) ? '' : 'none';
        });
    }

    getArray() {
        return [...this.selectedItemsArray];
    }
}

export default DragAndDropList 
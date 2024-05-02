class DragAndDropList {
    constructor(items, dropzoneId, itemsContainer, itemSearch, selectedItems, emptyMessage) {
        this.idCounter = 0;
        this.items = items;
        this.dropzoneId = dropzoneId;

        this.emptyMessageContainer = document.getElementById(emptyMessage);
        this.itemsContainer = document.getElementById(itemsContainer);
        this.selectedItemsContainer = document.getElementById(selectedItems);
        this.itemFilterInput = document.getElementById(itemSearch);
        this.displayArray = document.createElement('div');
        this.displayArray.id = 'displayArray';
        document.body.appendChild(this.displayArray);
        this.selectedItemsArray = [];

        this.addEventListeners();
        this.populateItemsList();

        this.emptyMessage = "Click on chords to add"; // Placeholder for the input string
        this.emptyMessageElement = document.createElement('div');
        this.emptyMessageElement.id = "DragAndDrop-EmptyMessage";

        // Split the input message by spaces to get individual words
        const words = this.emptyMessage.split(' ');

        // Create a base element to clone from
        const baseElement = this.createItemElement("Sample Word"); // Replace "Sample Word" with any sample text
        baseElement.draggable = false;
        baseElement.isSelectable = false;

        // Loop through each word and append a cloned element to the emptyMessageElement
        words.forEach(word => {
            const clone = baseElement.cloneNode(true);
            clone.innerHTML = word; // Set the innerHTML to the current word
            this.emptyMessageElement.appendChild(clone);
        });

        this.selectedItemsContainer.appendChild(this.emptyMessageElement);


    }

    addEventListeners() {
        window.addEventListener('dragover', this.handleWindowDragOver.bind(this));
        window.addEventListener('drop', this.handleWindowDrop.bind(this));
        this.selectedItemsContainer.addEventListener('dragover', this.allowDrop.bind(this));
        this.selectedItemsContainer.addEventListener('drop', this.handleDropOnContainer.bind(this));
        this.itemFilterInput.addEventListener('input', this.filterItems.bind(this));
        //this.itemsContainer.addEventListener('drop', this.handleDropOnItemList.bind(this));
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

    last100PercentItemIndex() {
        let lastIndex = -1;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].probability == 100) {
                lastIndex = i;
            }
        }
        return lastIndex;
    }

    populateItemsList() {
        const lastIndex100Percent = this.last100PercentItemIndex();
        var first100Percent = false;
        this.items.forEach((item, index) => {
            if (item.probability == 100 && first100Percent == false) {
                first100Percent = true
                // Create and insert a First element
                const firstElement = document.createElement('div');
                firstElement.style.width = "100%";
                firstElement.innerHTML = "BEST MATCHES FOUND:"
                firstElement.style.backgroundColor = "#ffffff00"
                firstElement.style.color = "var(--light3)"
                firstElement.style.fontSize = "small"
                firstElement.style.marginBottom = "var(--padding)"

                this.itemsContainer.appendChild(firstElement);
            }
            const itemElement = this.createItemElement(item, true);
            this.itemsContainer.appendChild(itemElement);

            // Check if the current index is the last 100% probability index
            if (index === lastIndex100Percent) {
                // Create and insert a break element
                const breakElement = document.createElement('div');
                breakElement.style.width = "100%";
                breakElement.style.height = "2px"; // Adjust the height as necessary
                breakElement.style.backgroundColor = "var(--dark1)"
                breakElement.style.marginTop = "var(--padding)"
                breakElement.style.marginBottom = "var(--padding)"
                breakElement.style.boxShadow = "var(--padding) 0px 0px 0px var(--dark1), calc(var(--padding)*-1) 0px 0px 0px var(--dark1)"


                this.itemsContainer.appendChild(breakElement);
            }
        });
    }

    createItemElement(item, isSelectable = false) {
        const itemElement = document.createElement('div');
        itemElement.textContent = item.name; // Assuming item is an object with 'name' and 'probability'
        itemElement.className = 'dragDropItem';
        //itemElement.draggable = true;
        itemElement.id = `dragDropItem-${this.idCounter++}`;

        if (item.probability !== undefined) {
            const probabilitySpan = document.createElement('span');
            probabilitySpan.textContent = `(${item.probability}%)`;
            probabilitySpan.style.backgroundColor = this.getBackgroundColor(item.probability);
            if (item.probability == 100) {
                itemElement.style.boxShadow = '0px 0px 13px 0px rgba(0,255,0)';
                itemElement.style.fontWeight = "800"
                //itemElement.style.marginRight = "100%"
                //itemElement.style.marginBottom = "100%"
                //itemElement.style.filter ="contrast(1.2)"
            }

            itemElement.appendChild(probabilitySpan);
        }

        //itemElement.addEventListener('dragstart', this.handleDragStart.bind(this));
        //itemElement.addEventListener('dragend', this.handleDragEnd.bind(this));
        if (isSelectable) {
            itemElement.addEventListener('click', () => this.addSelectedItem(item));
        }
        return itemElement;
    }

    getBackgroundColor(probability) {
        const startColor = [255, 130, 130]; // #ddd
        const endColor = [230, 230, 30]; // #3f3
        const winnerColor = [150, 200, 0]

        // Ensure probability is within the new range of 50 to 100
        probability = Math.max(50, Math.min(100, probability));

        // Transforming probability to start changing from 50 to 100
        const scaledProbability = (probability - 50) / 50;

        // Adjusting the probability scale logarithmically from 0.0 at probability 50 to 1.0 at probability 100
        const adjustedProbability = Math.log10(1 + 9 * scaledProbability); // Logarithmic scale from 0 to 1

        let blendedColor = startColor.map((component, index) => {
            return Math.round(component + (endColor[index] - component) * adjustedProbability);
        });
        if (probability == 100) {
            blendedColor = winnerColor
        }
        return `rgb(${blendedColor.join(',')})`;
    }


    createSelectedItemElement(item) {
        const selectedItemElement = document.createElement('div');
        selectedItemElement.className = 'selected-dragDropItem dragDropItem';
        selectedItemElement.draggable = true;
        selectedItemElement.id = `selected-dragDropItem-${this.idCounter++}`;
        selectedItemElement.textContent = item.name; // Assuming item is an object with 'name'
        selectedItemElement.addEventListener('dragstart', this.handleDragStart.bind(this));
        selectedItemElement.addEventListener('dragover', this.handleDragOver.bind(this));
        selectedItemElement.addEventListener('drop', this.handleDropReorder.bind(this));
        selectedItemElement.addEventListener('dragend', this.handleDragEnd.bind(this));
        selectedItemElement.addEventListener('dragleave', this.handleDragLeave.bind(this));
        selectedItemElement.addEventListener('click', this.removeSelectedItem.bind(this));
        return selectedItemElement;
    }

    removeSelectedItem(item) {
        item.target.remove();
        this.updateArray();
    }

    addSelectedItem(item) {
        const selectedItemElement = this.createSelectedItemElement(item);
        this.selectedItemsContainer.appendChild(selectedItemElement);
        this.selectedItemsArray.push(item.name); // Store only the name in the array
        this.updateDisplayArray();
    }

    ceateAndInsertElement(item) {
        const element = this.createSelectedItemElement(item)
        this.addSelectedItem(element)
    }
    updateItems(newItems) {
        console.log("Updating Library...")
        // Clear existing items from the display and internal storage
        this.clearList()
        this.items = newItems;

        // Repopulate the items list with new items
        this.populateItemsList();
    }

    clearList() {
        // Clear the internal items array
        this.items = [];

        // Remove all child elements of the items container
        while (this.itemsContainer.firstChild) {
            this.itemsContainer.removeChild(this.itemsContainer.firstChild);
        }
    }

    clearSelectedList() {
        // Clear the internal items array
        this.selectedItemsArray = [];

        // Remove all child elements of the items container
        while (this.selectedItemsContainer.firstChild) {
            this.selectedItemsContainer.removeChild(this.selectedItemsContainer.firstChild);
        }
        this.updateDisplayArray();

    }


    handleDropOnItemList(event) {
        event.preventDefault();
        const droppedItemId = event.dataTransfer.getData('text/plain');
        const droppedItemElement = document.getElementById(droppedItemId);

        if (droppedItemElement && droppedItemElement.classList.contains('selected-dragDropItem')) {
            droppedItemElement.remove();
            this.updateArray();
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
    }

    allowDrop(event) {
        event.preventDefault();
    }

    handleDropOnContainer(event) {
        event.preventDefault();
        const droppedItemId = event.dataTransfer.getData('text/plain');
        const droppedItemElement = document.getElementById(droppedItemId);

        if (droppedItemElement && !droppedItemElement.classList.contains('selected-dragDropItem')) {
            const item = {
                name: droppedItemElement.textContent,
                probability: undefined // Probability is not needed in selected items
            };
            const newClone = this.createSelectedItemElement(item);
            this.selectedItemsContainer.appendChild(newClone);
            this.selectedItemsArray.push(item.name);
            this.updateDisplayArray();
        }
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
        this.updateArray();
    }

    updateArray() {
        this.selectedItemsArray = Array.from(this.selectedItemsContainer.children).map(el => el.textContent);
        this.updateDisplayArray();
    }

    updateDisplayArray() {
        this.displayArray.textContent = `Selected Items: ${this.selectedItemsArray.join(', ')}`;
        console.log(this.selectedItemsArray.length);
        if (this.selectedItemsArray.length == 0) {
            if (!this.emptyMessageElement.parentNode) {
                this.selectedItemsContainer.appendChild(this.emptyMessageElement);
            }
        } else {
            this.emptyMessageElement.remove();
        }
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
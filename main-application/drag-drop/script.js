import { Chord } from "../chord-library/script.js";

export class DragAndDropItem extends Chord {
    constructor(chord, probability = -1) {
        super(chord)
        this.rootNote = chord.rootNote; // Integer 0-11, where 0 = C, 1 = C#, 2 = D, etc.
        this.notes = chord.notes; // Array of integers representing notes of the chord
        this.name = chord.name; // String representing the full name of the chord, e.g., "Gm", "Asus4"
        this.customRoot = chord.customRoot
        this.probability = probability
    }
}

export default class DragAndDropList {
    constructor(items, dropzoneId, itemsContainer, itemSearch, selectedItems, emptyMessage) {
        this.items = []
        this.idCounter = 0;
        items.forEach(item => {
            this.items.push(new DragAndDropItem(item))
        })

        this.dropzoneId = dropzoneId;

        this.selectedItemsEvent = new CustomEvent('selectedItemsUpdated', { bubbles: true, detail: { selectedItems: [] } });

        this.emptyMessageContainer = document.getElementById(emptyMessage);
        this.itemsContainer = document.getElementById(itemsContainer);
        this.selectedItemsContainer = document.getElementById(selectedItems);
        this.itemFilterInput = document.getElementById(itemSearch);
        this.selectedItemsArray = [];

        this.addEventListeners();
        this.populateItemsList();

        this.emptyMessage = "Click on chords to add";
        this.emptyMessageElement = document.createElement('div');
        this.emptyMessageElement.id = "DragAndDrop-EmptyMessage";

        const words = this.emptyMessage.split(' ');

        const baseElement = this.createItemElement({ name: "Sample Word" });
        baseElement.draggable = false;
        baseElement.isSelectable = false;

        words.forEach(word => {
            const clone = baseElement.cloneNode(true);
            clone.innerHTML = word;
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
            if (this.items[i].probability === 100) {
                lastIndex = i;
            }
        }
        return lastIndex;
    }

    populateItemsList() {
        const lastIndex100Percent = this.last100PercentItemIndex();
        let first100Percent = false;
        this.items.forEach((item, index) => {
            if (item.probability === 100 && !first100Percent) {
                first100Percent = true;
                const firstElement = document.createElement('div');
                firstElement.style.width = "100%";
                firstElement.innerHTML = "BEST MATCHES FOUND:";
                firstElement.style.backgroundColor = "#ffffff00";
                firstElement.style.color = "var(--light3)";
                firstElement.style.fontSize = "small";
                firstElement.style.marginBottom = "var(--padding)";

                this.itemsContainer.appendChild(firstElement);
            }
            const itemElement = this.createItemElement(item, true);
            this.itemsContainer.appendChild(itemElement);

            if (index === lastIndex100Percent) {
                const breakElement = document.createElement('div');
                breakElement.style.width = "100%";
                breakElement.style.height = "2px";
                breakElement.style.backgroundColor = "var(--dark1)";
                breakElement.style.marginTop = "var(--padding)";
                breakElement.style.marginBottom = "var(--padding)";
                breakElement.style.boxShadow = "var(--padding) 0px 0px 0px var(--dark1), calc(var(--padding)*-1) 0px 0px 0px var(--dark1)";

                this.itemsContainer.appendChild(breakElement);
            }
        });
    }

    createItemElement(item, isSelectable = false) {
        const itemElement = document.createElement('div');
        itemElement.textContent = item.name;

        itemElement.className = 'dragDropItem';
        itemElement.id = `dragDropItem-${this.idCounter++}`;

        if (item.probability >0) {
            const probabilitySpan = document.createElement('span');
            probabilitySpan.textContent = `(${item.probability}%)`;
            probabilitySpan.style.backgroundColor = this.getBackgroundColor(item.probability);
            if (item.probability === 100) {
                itemElement.style.boxShadow = '0px 0px 13px 0px rgba(0,255,0)';
                itemElement.style.fontWeight = "800";
            }

            itemElement.appendChild(probabilitySpan);
        }

        if (isSelectable) {
            itemElement.addEventListener('click', () => this.addSelectedItem(item));
        }
        return itemElement;
    }

    getBackgroundColor(probability) {
        const startColor = [255, 130, 130];
        const endColor = [230, 230, 30];
        const winnerColor = [150, 200, 0];

        probability = Math.max(50, Math.min(100, probability));

        const scaledProbability = (probability - 50) / 50;

        const adjustedProbability = Math.log10(1 + 9 * scaledProbability);

        let blendedColor = startColor.map((component, index) => {
            return Math.round(component + (endColor[index] - component) * adjustedProbability);
        });
        if (probability === 100) {
            blendedColor = winnerColor;
        }
        return `rgb(${blendedColor.join(',')})`;
    }

    createSelectedItemElement(item) {
        const selectedItemElement = document.createElement('div');
        selectedItemElement.className = 'selected-dragDropItem dragDropItem';
        selectedItemElement.draggable = true;
        selectedItemElement.id = `selected-dragDropItem-${this.idCounter++}`;
        selectedItemElement.textContent = item.name;
        selectedItemElement.addEventListener('dragstart', this.handleDragStart.bind(this));
        selectedItemElement.addEventListener('dragover', this.handleDragOver.bind(this));
        selectedItemElement.addEventListener('drop', this.handleDropReorder.bind(this));
        selectedItemElement.addEventListener('dragend', this.handleDragEnd.bind(this));
        selectedItemElement.addEventListener('dragleave', this.handleDragLeave.bind(this));
        selectedItemElement.addEventListener('click', this.removeSelectedItem.bind(this));
        return selectedItemElement;
    }

    removeSelectedItem(event) {
        event.target.remove();
        this.updateArray();
    }

    addSelectedItem(item) {
        const selectedItemElement = this.createSelectedItemElement(item);
        this.selectedItemsContainer.appendChild(selectedItemElement);
        this.selectedItemsArray.push(item);
        this.updateDisplayArray();
    }

    updateItems(newItems) {
        console.log("Updating Library...");
        this.clearList();
        this.items = newItems;
        this.populateItemsList();
    }

    clearList() {
        this.items = [];
        while (this.itemsContainer.firstChild) {
            this.itemsContainer.removeChild(this.itemsContainer.firstChild);
        }
    }

    clearSelectedList() {
        this.selectedItemsArray = [];
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
                const chordName = droppedItemElement.textContent.split(' (')[0];
                const chord = this.items.find(item => item.name === chordName);

                if (chord) {
                    const newClone = this.createSelectedItemElement(chord);
                    this.selectedItemsContainer.appendChild(newClone);
                    this.selectedItemsArray.push(chord);
                }
            } else {
                this.selectedItemsContainer.appendChild(droppedItemElement);
                this.updateArray();
            }
        }
        this.updateDisplayArray();
    }

    updateArray() {
        this.selectedItemsArray = Array.from(this.selectedItemsContainer.children).map(el => {
            const chordName = el.textContent.split(' (')[0];
            return this.items.find(item => item.name === chordName);
        });
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
            const chordName = droppedItemElement.textContent.split(' (')[0];
            const chord = this.items.find(item => item.name === chordName);

            if (chord) {
                const newClone = this.createSelectedItemElement(chord);
                this.selectedItemsContainer.appendChild(newClone);
                this.selectedItemsArray.push(chord);
                this.updateDisplayArray();
            }
        }
    } insertAtCorrectPosition(droppedItemElement, targetElement) {
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

    updateDisplayArray() {
        console.log(`Selected Items: ${this.selectedItemsArray.map(item => item.name).join(', ')}`);
        console.log(this.selectedItemsArray.length);
        if (this.selectedItemsArray.length === 0) {
            if (!this.emptyMessageElement.parentNode) {
                this.selectedItemsContainer.appendChild(this.emptyMessageElement);
            }
        } else {
            this.emptyMessageElement.remove();
        }
        this.selectedItemsEvent.detail.selectedItems = [...this.selectedItemsArray];
        document.dispatchEvent(this.selectedItemsEvent);
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
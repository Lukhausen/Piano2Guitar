document.addEventListener('DOMContentLoaded', function () {
    let draggedElement = null;
    let dropZones = document.getElementsByClassName('selected-item');

    const itemsContainer = document.getElementById('itemsList');
    const selectedItemsContainer = document.getElementById('selectedItems');
    const itemFilterInput = document.getElementById('itemFilter');

    const items = ['A', 'B', 'C', 'D'];
    items.forEach(item => {
        itemsContainer.appendChild(createItemElement(item, true));
    });

    function createItemElement(item, isSelectable = false) {
        const itemElement = document.createElement('div');
        itemElement.textContent = item;
        itemElement.className = 'item';
        if (isSelectable) {
            itemElement.addEventListener('click', () => addSelectedItem(item));
        }
        return itemElement;
    }

    function addSelectedItem(item) {
        const selectedItemElement = document.createElement('div');
        selectedItemElement.className = 'selected-item';
        selectedItemElement.textContent = item;
        selectedItemElement.draggable = true;

        selectedItemElement.addEventListener('dragstart', function (event) {
            draggedElement = selectedItemElement;
        });

        selectedItemElement.addEventListener('dragover', function (event) {
            event.preventDefault();
            event.target.classList.add('draggable-over');
        });

        selectedItemElement.addEventListener('dragleave', function (event) {
            event.target.classList.remove('draggable-over');
        });

        selectedItemElement.addEventListener('drop', function (event) {
            event.preventDefault();
            if (draggedElement !== event.target) {
                let referenceNode = event.target.nextElementSibling;
                if (referenceNode) {
                    selectedItemsContainer.insertBefore(draggedElement, referenceNode);
                } else {
                    selectedItemsContainer.appendChild(draggedElement);
                }
            }
            event.target.classList.remove('draggable-over');
        });

        selectedItemsContainer.appendChild(selectedItemElement);
    }

    itemFilterInput.addEventListener('input', function () {
        const filterValue = itemFilterInput.value.toUpperCase();
        const itemElements = itemsContainer.querySelectorAll('.item');
        itemElements.forEach(itemElement => {
            const itemText = itemElement.textContent.toUpperCase();
            itemElement.style.display = itemText.includes(filterValue) ? '' : 'none';
        });
    });

    selectedItemsContainer.addEventListener('dragover', function (event) {
        event.preventDefault();
    });
});

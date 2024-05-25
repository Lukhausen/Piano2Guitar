import DragAndDropList from '../drag-drop/script.js';
import { ChordLibrary } from "../chord-library/script.js"
import { ProgressionGenerator } from '../progression-generator/main.js';
import { settings } from '../chord-factory/constants.js';


document.addEventListener('DOMContentLoaded', () => {


    // Get All Chords From the Libaray
    const chordLibrary = new ChordLibrary

    // Create the Search and Drag and Drop

    const allChordLibraryItems = chordLibrary.getAllChords()


    const dropzone = 'selectedItems';
    const itemsContainer = "itemsContainer";
    const itemSearch = "itemSearch";
    const selectedItems = "selectedItems";
    const emptyMessageContainer = "emptyMessageContainer";
    const dragAndDropList = new DragAndDropList(allChordLibraryItems, dropzone, itemsContainer, itemSearch, selectedItems, emptyMessageContainer);

    window.clearProgression = function () {
        dragAndDropList.clearSelectedList();
        console.log("Selected Items cleared");
    };



    let soundQualityValue = 1;
    let progressionGenerator = new ProgressionGenerator([], true, settings.tuning, "#ffffff", "onNote", true)

    document.addEventListener('selectedItemsUpdated', async function (event) {
        console.log('Updated Selected Items:', event.detail.selectedItems[0]);
        
        await progressionGenerator.setProgression([event.detail.selectedItems[0]])
        await updateProgressionDynamic(soundQualityValue)
        dragAndDropList.clearSelectedList();
    });


    const soundQualitySlider = document.getElementById("soundQualitySlider");
    soundQualitySlider.addEventListener('input', async (e) => {
        soundQualityValue = e.target.value / 100;
        console.log("Slider Value:", soundQualityValue);
        await updateProgressionDynamic(soundQualityValue)
    });

    async function updateProgressionDynamic(soundQualityValue) {
        let progressionHTML = await progressionGenerator.getProgressionDynamicHTML(soundQualityValue, 20);
        document.getElementById("dynamicProgressionWrapper").innerHTML = "";
        document.getElementById("dynamicProgressionWrapper").appendChild(progressionHTML);
    };


    //Update the Progressions to get the PLaceholders:
    updateProgressionDynamic(soundQualityValue)
})

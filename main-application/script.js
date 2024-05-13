import DragAndDropList from './drag-drop/script.js';
import Piano from './piano/script.js';
import { Chord, ChordLibrary } from "./chord-library/script.js"
import MIDIAccessManager from "./midi-integration/script.js"
import { ProgressionGenerator } from './progression-generator/main.js';
import { STANDARD_TUNING } from './chord-factory/constants.js';


document.addEventListener('DOMContentLoaded', () => {


    //Make Settings Button functional
    window.toggleSettings = function () {
        let settingsScreen = document.getElementById("settings");
        // Toggle a class that controls the visibility and opacity
        settingsScreen.classList.toggle('visible');
    }
    


    // Import the MidiManager
    const midiManager = new MIDIAccessManager();

    var visualPianoOctaves = 3


    // Function to calculate the number of octaves based on screen width
    function calculateOctaves() {
        const screenWidth = window.innerWidth;
        console.log((Math.sqrt(screenWidth)))
        const maxOctaves = 3; // Base octaves to start with
        const extraOctaves = Math.ceil((Math.sqrt(screenWidth)) / 25);
        visualPianoOctaves = Math.min(maxOctaves, extraOctaves)
        return visualPianoOctaves;
    }



    // Create a new Piano instance with dynamic number of octaves
    const myPiano = new Piano('.pianoContainer', { octaves: calculateOctaves() });


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


    var isVolumeOn = localStorage.getItem('volumeState') === 'off' ? false : true;
    const volumeIcon = document.getElementById('volumeIcon');

    updateVolumeIcon(); // Update the icon at load

    window.toggleVolume = function () {

        if (isVolumeOn) {
            myPiano.volumeOff(); // Turn volume off
            isVolumeOn = false;
            localStorage.setItem('volumeState', 'off');
        } else {
            myPiano.volumeOn(); // Turn volume on
            isVolumeOn = true;
            localStorage.setItem('volumeState', 'on');
        }
        updateVolumeIcon();
    };

    function updateVolumeIcon() {
        if (!isVolumeOn) {
            volumeIcon.innerHTML = `<path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z"/>`;
        } else {
            volumeIcon.innerHTML = `<path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z"/>`;
        }
    }

    window.playPiano = function () {
        myPiano.playChord();
        console.log("Piano played");
    };


    window.clearPiano = function () {
        document.getElementById("itemSearch").value = ""
        myPiano.clearPiano();
        console.log("Piano cleared");
    };

    window.clearProgression = function () {
        document.getElementById("itemSearch").value = ""
        dragAndDropList.clearSelectedList();
        console.log("Selected Items cleared");
    };

    // Handle window resize to adjust the number of octaves dynamically
    window.onresize = function () {
        const newOctaves = calculateOctaves();
        myPiano.setOctaves(newOctaves); // Assuming there's a method to update the octaves dynamically
    };




    document.querySelector('.pianoContainer').addEventListener('notesChanged', (e) => {
        console.log('Piano notes changed:', e.detail.notes, e.detail.rootNote);
        let items
        if (e.detail.notes.length > 0) {
            console.log("Reviced notesChanged Event: " + e.detail.notes + " Root: " + e.detail.rootNote)
            items = chordLibrary.searchChords(e.detail.notes, e.detail.rootNote, 50)
        } else {
            items = allChordLibraryItems
        }
        //dragAndDropList.ceateAndInsertElement(e.detail.notes)
        dragAndDropList.updateItems(items)
        // Additional logic to handle the change in notes
    });


    //Midi Integration for Pinao Notes 
    let actualPressedKeys = new Map(); // Maps actual notes to their counts
    let visualPressedKeys = new Set();

    function mapNoteToVisualKey(note) {
        return note % (visualPianoOctaves * 12);
    }

    window.addEventListener('noteOn', (e) => {
        const { note } = e.detail;
        const visualKey = mapNoteToVisualKey(note);
        let count = actualPressedKeys.get(note) || 0;
        actualPressedKeys.set(note, count + 1);
        visualPressedKeys.add(visualKey);
        myPiano.activateKey(visualKey);
        updateRootNote();
    });

    window.addEventListener('noteOff', (e) => {
        const { note } = e.detail;
        if (actualPressedKeys.has(note)) {
            let count = actualPressedKeys.get(note);
            if (count > 1) {
                actualPressedKeys.set(note, count - 1);
            } else {
                actualPressedKeys.delete(note);
                // Check if any other actual key maps to the same visual key
                const anyOther = [...actualPressedKeys.keys()].some(k => mapNoteToVisualKey(k) === mapNoteToVisualKey(note));
                if (!anyOther) {
                    visualPressedKeys.delete(mapNoteToVisualKey(note));
                    myPiano.deactivateKey(mapNoteToVisualKey(note));
                }
            }
        }
        updateRootNote();
    });

    function updateRootNote() {
        if (actualPressedKeys.size > 0) {
            // Convert actualPressedKeys to an array and sort it
            const sortedNotes = Array.from(actualPressedKeys.keys()).sort((a, b) => a - b);
    
            // Determine if the lowest note should be set as the root note
            const lowestNote = sortedNotes[0];
            const lowestNoteMod12 = lowestNote % 12;
            let setRoot = false;
    
            // Check if the lowest note is doubled in higher octaves
            if (sortedNotes.some(note => note !== lowestNote && note % 12 === lowestNoteMod12)) {
                setRoot = true;
            }
    
            // Check if the lowest note is 12 interval steps away from the second lowest note
            if (sortedNotes.length > 1 && (sortedNotes[1] - lowestNote >= 6 )) {
                setRoot = true;
            }
    
            // Set or clear the root note based on the above conditions
            if (setRoot) {
                const visualKey = mapNoteToVisualKey(lowestNote);
                myPiano.setRootNote(visualKey);
            } else {
                myPiano.clearRootNote();
            }
        } else {
            myPiano.clearRootNote();
        }
    }
    

    window.addEventListener("statusUpdated", (e) => {
        document.getElementById("MIDIStatusDiv").innerHTML = e.detail

    })


    //Functionality to autom,atically add Chord when played by midi:
    window.addEventListener('notesOutput', (e) => {
        const notes = e.detail;
        if (notes.length > 0) {
            const rootNote = Math.min(...notes);
            const searchResults = chordLibrary.searchChords(notes, rootNote, 100);
            if (searchResults.length > 0) {
                const chord = searchResults[0];
                dragAndDropList.addSelectedItem(chord);
                //popUp.open("Added: " +chord.name, { autoClose: true, duration: 1000 });
            }
        }
    });


    let progressionGenerator = new ProgressionGenerator()

    document.addEventListener('selectedItemsUpdated', function(event) {
        console.log('Updated Selected Items:', event.detail.selectedItems);
        console.log(typeof(event.detail.selectedItems[0]))
        progressionGenerator = new ProgressionGenerator(event.detail.selectedItems, true, STANDARD_TUNING)
        let progressionHTML = progressionGenerator.getProgressionHTML([], "basic", "#ffffff", "belowString", true)
        document.getElementById("outputWrapper").appendChild(progressionHTML)
    });
    
});

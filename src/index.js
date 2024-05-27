import DragAndDropList from './drag-drop/script.js';
import Piano from './piano/script.js';
import { Chord, ChordLibrary } from "./chord-library/script.js"
import MIDIAccessManager from "./midi-integration/script.js"
import { ProgressionGenerator } from './progression-generator/main.js';
import { settings } from './chord-factory/constants.js';
import { noteToNumber, numberToNote } from "./chord-factory/utils.js";



document.addEventListener('DOMContentLoaded', () => {
    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }






    // Import the MidiManager
    const midiManager = new MIDIAccessManager();

    var visualPianoOctaves = 3


    // Function to calculate the number of octaves based on screen width
    function calculateOctaves() {
        const screenWidth = window.innerWidth;
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
        dragAndDropList.clearSelectedList();
        console.log("Selected Items cleared");
    };

    // Handle window resize to adjust the number of octaves dynamically
    window.onresize = function () {
        const newOctaves = calculateOctaves();
        myPiano.setOctaves(newOctaves); // Assuming there's a method to update the octaves dynamically
    };




    document.querySelector('.pianoContainer').addEventListener('notesChanged', async (e) => {
        console.log('Piano notes changed:', e.detail.notes, e.detail.rootNote);
        let items
        if (e.detail.notes.length > 0) {
            console.log("Reviced notesChanged Event: " + e.detail.notes + " Root: " + e.detail.rootNote)
            items = await chordLibrary.searchChords(e.detail.notes, e.detail.rootNote, 50)
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
            if (sortedNotes.length > 1 && (sortedNotes[1] - lowestNote >= 6)) {
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


    window.addEventListener("statusUpdated", async (e) => {
        document.getElementById("MIDIStatusDiv").innerHTML = e.detail
    })


    //Functionality to autom,atically add Chord when played by midi:
    window.addEventListener('notesOutput', async (e) => {
        const notes = e.detail;
        if (notes.length > 0) {
            const rootNote = Math.min(...notes);
            const searchResults = await chordLibrary.searchChords(notes, rootNote, 100);
            if (searchResults.length > 0) {
                const chord = searchResults[0];
                dragAndDropList.addSelectedItem(chord);
                //popUp.open("Added: " +chord.name, { autoClose: true, duration: 1000 });
            }
        }
    });



    //Scale Detector Listener
    const scaleDisplay = document.getElementById("scaleDisplay")
    window.addEventListener('scaleDetected', async function (event) {
        scaleDisplay.innerHTML = event.detail.scale
    });





    let soundQualityValue = 1;
    let progressionGenerator = new ProgressionGenerator([], true, chordLibrary, "#ffffff", "onNote", true)

    document.addEventListener('selectedItemsUpdated', async function (event) {
        console.log('Updated Selected Items:', event.detail.selectedItems);
        await progressionGenerator.setProgression(event.detail.selectedItems)
        await updateProgressionDynamic(soundQualityValue)
        await updateProgressionEasy()
    });


    const soundQualitySlider = document.getElementById("soundQualitySlider");
    soundQualitySlider.addEventListener('input', async (e) => {
        soundQualityValue = e.target.value / 100;
        console.log("Slider Value:", soundQualityValue);

        await updateProgressionDynamic(soundQualityValue)
        console.log(progressionGenerator)
    });

    async function updateProgressionDynamic(soundQualityValue) {
        let progressionHTML = await progressionGenerator.getProgressionDynamicHTML(soundQualityValue);
        document.getElementById("dynamicProgressionWrapper").innerHTML = "";
        document.getElementById("dynamicProgressionWrapper").appendChild(progressionHTML);
    };

    async function updateProgressionEasy() {
        let [progressionHTML, capo] = await progressionGenerator.getProgressionEasyHTML();
        document.getElementById("easyProgressionWrapper").innerHTML = "";
        document.getElementById("easyProgressionWrapper").appendChild(progressionHTML);
        document.getElementById("easyProgressionCapo").innerHTML = "Capo: "+capo+"fr";

    };






    let reloadFlag = false;

    // Make Settings Button functional
    window.toggleSettings = async function () {
        let settingsScreen = document.getElementById("settings");
        let closeSettings = document.getElementById("closeSettings");
    
        console.log("Toggle Settings clicked");
    
        // Toggle a class that controls the visibility and opacity
        settingsScreen.classList.toggle('visible');
        closeSettings.classList.toggle('visible');
    
        console.log("Settings screen visibility toggled:", settingsScreen.classList.contains('visible'));
    
        if (reloadFlag) {
            console.log("Reload flag is true, updating tuning settings.");
            localStorage.setItem('guitarTuning', JSON.stringify(settings.tuning));
    
            console.log("New tuning saved to localStorage:", settings.tuning);
    
            progressionGenerator.reloadProgression();
            console.log("Progression reloaded.");
            
            updateProgressionDynamic(soundQualityValue);
            console.log("Progression dynamic updated.");
    
            updateProgressionEasy();
            console.log("Progression easy updated.");
    
            reloadFlag = false;
        }
    };

    // Function to load tuning settings into the select elements
    function loadTuningSettings() {
        console.log("Loading tuning settings...");
        if (localStorage.getItem('guitarTuning')) {
            settings.tuning = JSON.parse(localStorage.getItem('guitarTuning'));
            console.log("Stored tuning from localStorage:", settings.tuning);

        }
        settings.tuning.forEach((element, index) => {
            const selectElement = document.getElementById(`settingsString${index + 1}`);
            const displayElement = document.getElementById(`settingsStringValue${index + 1}`);

            displayElement.innerHTML = numberToNote(element);
            selectElement.value = element % 12
        });
    }


    // Add event listeners to the select elements
    for (let i = 0; i < 6; i++) {
        let selectElement = document.getElementById("settingsString" + (i + 1));
        if (selectElement) {
            selectElement.addEventListener('input', () => {
                let displayElement = document.getElementById(`settingsStringValue${i + 1}`);
                displayElement.innerHTML = numberToNote(parseInt(selectElement.value));
                document.getElementById('settingsCommonTunings').value = ""
                settings.tuning[i] = parseInt(selectElement.value);  // Ensure parsing as integer
                reloadFlag = true;
                console.log(`String ${i + 1} tuning changed to:`, settings.tuning[i]);
                checkCommonTunings();  // Check if current tuning matches a common tuning

            });
            console.log(`Event listener added for string ${i + 1}`);
        } else {
            console.warn(`Element with ID settingsString${i + 1} not found.`);
        }
    }



    function setTuning(tuning) {
        const tuningArray = tuning.split(' ').map(noteToNumber);
        settings.tuning = tuningArray;

        tuningArray.forEach((value, index) => {
            const selectElement = document.getElementById(`settingsString${index + 1}`);
            const displayElement = document.getElementById(`settingsStringValue${index + 1}`);

            selectElement.value = value;
            displayElement.innerHTML = numberToNote(value);
        });

        reloadFlag = true;
        console.log("Tuning set to:", tuningArray);
        checkCommonTunings(); // Check if the new tuning matches a common tuning
    }

    // Add event listener to dropdown
    document.getElementById('settingsCommonTunings').addEventListener('change', function () {
        if (this.value) {
            setTuning(this.value);
        }
    });

    // Function to compare current tuning with common tunings
    function checkCommonTunings() {
        const dropdown = document.getElementById('settingsCommonTunings');
        const currentTuning = settings.tuning.map(numberToNote).join(' ');

        let found = false;
        for (let i = 0; i < dropdown.options.length; i++) {
            if (dropdown.options[i].value === currentTuning) {
                dropdown.value = currentTuning;
                found = true;
                break;
            }
        }

        if (!found) {
            dropdown.value = "";
        }
    }




    //FretRange

    // Function to set fret range
    function setFretRange(fret) {
        // Update the fret range display
        const fretValueDisplay = document.getElementById('settingsFretValue');
        fretValueDisplay.textContent = `${fret} Frets`;

        // Update the settings.fretRange
        settings.fingerFretRange = fret;

        // Set the reloadFlag to true
        reloadFlag = true;

        // Update the localStorage
        localStorage.setItem('fretRange', fret);

        // Update the selected fret bar
        const fretBars = document.querySelectorAll('.settingsFretBar');
        fretBars.forEach((bar, index) => {
            if (index < fret) {
                bar.classList.add('selected');
                bar.setAttribute('data-fret', index + 1); // Set data attribute for the selected fret

            } else {
                bar.classList.remove('selected');
                bar.removeAttribute('data-fret'); // Remove data attribute for unselected frets

            }
            bar.textContent = index + 1;
        });

        console.log(`Fret range set to: ${fret} frets`);
    }

    // Add event listeners to the fret bars
    const fretBars = document.querySelectorAll('.settingsFretBar');
    fretBars.forEach((bar, index) => {
        bar.addEventListener('click', () => {
            setFretRange(index + 1);
        });
        console.log(`Event listener added for fret ${index + 1}`);
    });

    // Load the fret range setting from localStorage
    function loadFretRangeSetting() {
        console.log("Loading fret range setting...");
        if (localStorage.getItem('fretRange')) {
            const storedFretRange = parseInt(localStorage.getItem('fretRange'));
            setFretRange(storedFretRange);
            console.log("Stored fret range from localStorage:", storedFretRange);
        } else{
            setFretRange(settings.fingerFretRange)
        }
    }

    // Initialize the fret range setting
    loadFretRangeSetting();
    loadTuningSettings();
    checkCommonTunings()
    //Update the Progressions to get the PLaceholders:
    updateProgressionDynamic(soundQualityValue)
    updateProgressionEasy()
})

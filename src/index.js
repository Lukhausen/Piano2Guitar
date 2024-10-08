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

    const MIDIStatusDiv = document.getElementById('MIDIStatusDiv');

    MIDIStatusDiv.style.display = "none";


    // Event listener to update the device list when devices change
    window.addEventListener('MIDIdeviceChange', (event) => {
        const devices = event.detail.devicelist; // Receive the detailed list of devices
        if (!devices.length) {
            MIDIStatusDiv.style.display = "none";
            midiToggleIcon.style.display = "none"; // Hide the MIDI toggle icon if no devices
            return;
        }

        MIDIStatusDiv.innerHTML = ''; // Clear existing options

        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.name;
            option.textContent = "MIDI: " + device.name;
            MIDIStatusDiv.appendChild(option);
        });

        MIDIStatusDiv.style.display = "flex";
        midiToggleIcon.style.display = "flex"; // Show the MIDI toggle icon when devices are connected

        // Restore the selected device if it is available, or set the first device as default
        if (MIDIStatusDiv.querySelector(`option[value="${event.detail.selectedDeviceName}"]`)) {
            MIDIStatusDiv.value = event.detail.selectedDeviceName;
        } else {
            midiManager.setMIDIDevice(devices[0].name);
            MIDIStatusDiv.value = devices[0].name;
        }
    });


    document.getElementById('MIDIStatusDiv').addEventListener('change', function () {
        const selectedDeviceId = this.value;
        midiManager.setMIDIDevice(selectedDeviceId);
    });

    // Event listener to update the device list when devices change

    // Initial update on page load















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

    var isVolumeOn
    const volumeIcon = document.getElementById('volumeIcon');




    function setPianoVolume(state = true) {
        if (state == "off") {
            console.error("TRIGGERED OFF", localStorage.getItem('volumeState'))

            myPiano.volumeOff()
            localStorage.setItem('volumeState', "off");
            isVolumeOn = false;
            volumeIcon.innerHTML = `<title>Unmute Piano</title><path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z"/>`;
            return
        } else {
            console.error("TRIGGERED ON", localStorage.getItem('volumeState'))

            myPiano.volumeOn()
            localStorage.setItem('volumeState', "on");
            isVolumeOn = true;
            volumeIcon.innerHTML = `<title>Mute Piano</title><path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z"/>`;
            return
        }
    }
    setPianoVolume(localStorage.getItem('volumeState'))

    window.toggleVolume = function () {
        if (isVolumeOn) {
            setPianoVolume("off")
        } else {
            setPianoVolume("on")

        }
    };



    window.playPiano = function () {
        setPianoVolume(true)
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













    // MIDI state variable
    let isMIDIOn = localStorage.getItem('MIDIState') === 'on';

    const midiToggleIcon = document.getElementById('midiToggleIcon');

    function setMIDIState(state = true) {
        if (state === "off") {
            localStorage.setItem('MIDIState', "off");
            MIDIStatusDiv.style.textDecoration = "line-through"
            MIDIStatusDiv.style.opacity = 0.8
            MIDIStatusDiv.style.color="#ff5555"

            isMIDIOn = false;
            midiToggleIcon.innerHTML = `<title>Enable MIDI</title><desc>Enable MIDI input</desc><path d="m813-61-59-59H180q-24.75 0-42.37-17.63Q120-155.25 120-180v-574l-59-59 43-43 752 752-43 43Zm27-145-60-60v-514H673v360q0 9-5 17t-14 11L533-513v-267H427v161L206-840h574q24.75 0 42.38 17.62Q840-804.75 840-780v574Zm-660 26h157v-210h-20q-12.75 0-21.37-8.63Q287-407.25 287-420v-167L180-694v514Zm197 0h206v-111L427-447v27q0 13-8.5 21.5T397-390h-20v210Zm246 0h71l-71-71v71Z"/>`;
            midiToggleIcon.style.fill = "#ff5555"
        } else {
            localStorage.setItem('MIDIState', "on");
            MIDIStatusDiv.style.textDecoration = "none"
            MIDIStatusDiv.style.opacity = 1
            MIDIStatusDiv.style.color=""
            isMIDIOn = true;
            midiToggleIcon.innerHTML = `<title>Disable MIDI</title><desc>Disable MIDI input</desc><path d="M180-120q-24 0-42-18t-18-42v-600q0-23 18-41.5t42-18.5h600q23 0 41.5 18.5T840-780v600q0 24-18.5 42T780-120H180Zm0-60h157v-210h-20q-12.75 0-21.37-8.63Q287-407.25 287-420v-360H180v600Zm443 0h157v-600H673v360q0 12.75-8.62 21.37Q655.75-390 643-390h-20v210Zm-246 0h206v-210h-20q-12.75 0-21.37-8.63Q533-407.25 533-420v-360H427v360q0 12.75-8.62 21.37Q409.75-390 397-390h-20v210Z"/>`;
            midiToggleIcon.style.fill = ""

        }
    }

    // Set initial MIDI state based on localStorage
    setMIDIState(isMIDIOn ? "on" : "off");

    window.toggleMIDI = function () {
        if (isMIDIOn) {
            setMIDIState("off");
        } else {
            setMIDIState("on");
        }
    };
















    document.querySelector('.pianoContainer').addEventListener('notesChanged', async (e) => {

        if (document.visibilityState === 'visible') {
            let items
            if (e.detail.notes.length > 0) {
                console.log("Reviced notesChanged Event: " + e.detail.notes + " Root: " + e.detail.rootNote)
                items = await chordLibrary.searchChords(e.detail.notes, e.detail.rootNote, 50)
            } else {
                items = allChordLibraryItems
            }
            //dragAndDropList.ceateAndInsertElement(e.detail.notes)
            dragAndDropList.updateItems(items)
        }
        // Additional logic to handle the change in notes}
    });


    //Midi Integration for Pinao Notes 
    let actualPressedKeys = new Map(); // Maps actual notes to their counts
    let visualPressedKeys = new Set();

    function mapNoteToVisualKey(note) {
        return note % (visualPianoOctaves * 12);
    }

    window.addEventListener('noteOn', (e) => {
        if (document.visibilityState === 'visible' && isMIDIOn) {
            const { note } = e.detail;
            const visualKey = mapNoteToVisualKey(note);
            let count = actualPressedKeys.get(note) || 0;
            actualPressedKeys.set(note, count + 1);
            visualPressedKeys.add(visualKey);
            myPiano.activateKey(visualKey);
            updateRootNote();
        }
    });

    window.addEventListener('noteOff', (e) => {
        if (document.visibilityState === 'visible') {
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
        }
    });

    function updateRootNote() {
        if (isMIDIOn) {
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
    }


    /*     window.addEventListener("statusUpdated", async (e) => {
            document.getElementById("MIDIStatusDiv").innerHTML = e.detail
        }) */


    //Functionality to autom,atically add Chord when played by midi:
    window.addEventListener('notesOutput', async (e) => {
        if (document.visibilityState === 'visible' && isMIDIOn) {
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
        }
    });



    //Scale Detector Listener
    const scaleDisplay = document.getElementById("scaleDisplay")
    window.addEventListener('scaleDetected', async function (event) {
        scaleDisplay.innerHTML = event.detail.scale
    });







    function updateURLWithChordNames(selectedItems) {
        // Extract chord names from the selected items
        const chordNames = selectedItems.map(item => item.name);

        // Join all chord names into a comma-separated string
        const chordsParam = chordNames.join(',');

        // Create the new URL
        const newURL = `${window.location.pathname}?chords=${encodeURIComponent(chordsParam)}`;

        // Update the URL without reloading the page
        window.history.replaceState({ path: newURL }, '', newURL);
        console.log("URL Updated with Chords: " + newURL);
    }






    function getChordsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const chordsParam = urlParams.get('chords');
        if (chordsParam) {
            const chordNames = chordsParam.split(',');
            return chordNames.map(decodeURIComponent);
        }
        return [];
    }

    function loadChordsFromURL() {
        const chordNames = getChordsFromURL();
        if (chordNames.length > 0) {
            let chords = chordNames.map(chord => chordLibrary.getChordByName(chord))
            dragAndDropList.loadChords(chords);
            console.log("Chords loaded from URL:", chords);
        }
    }










    let soundQualityValue = 0.7;
    document.getElementById("soundQualitySlider").value = soundQualityValue * 100
    let progressionGenerator = new ProgressionGenerator([], true, chordLibrary, "#ffffff", "onNote", true)

    document.addEventListener('selectedItemsUpdated', async function (event) {
        console.log('Updated Selected Items:', event.detail.selectedItems);
        await progressionGenerator.setProgression(event.detail.selectedItems)
        await updateProgressionDynamic(soundQualityValue)
        await updateProgressionEasy()
        await updateProgressionTransposed()
        updateURLWithChordNames(event.detail.selectedItems);


    });




    const soundQualitySlider = document.getElementById("soundQualitySlider");
    soundQualitySlider.addEventListener('input', async (e) => {
        soundQualityValue = e.target.value / 100;
        console.log("Slider Value:", soundQualityValue, progressionGenerator);
        await updateProgressionDynamic(soundQualityValue)
    });

    async function updateProgressionDynamic(soundQualityValue) {
        let progressionHTML = await progressionGenerator.getProgressionDynamicHTML(soundQualityValue);
        document.getElementById("dynamicProgressionWrapper").innerHTML = "";
        document.getElementById("dynamicProgressionWrapper").appendChild(progressionHTML);
    };
















    //How many capo suggestions are displayed
    const easyProgressionCapoAmmount = 3

    // Add event listener for transpositionsDetermined event
    window.addEventListener('transpositionsDetermined', (event) => {
        const bestTranspositions = event.detail.bestTranspositions;
        console.log("bestTranspositions:", bestTranspositions)
        let easyProgressionCapo = document.getElementById("easyProgressionCapo");
        let easyProgressionCapoWrapper = document.getElementById("easyProgressionCapoWrapper");

        easyProgressionCapo.innerHTML = ""; // Clear existing content
        if (bestTranspositions == "none") {
            easyProgressionCapoWrapper.style.display = "none"
            return;
        }
        easyProgressionCapoWrapper.style.display = "flex"

        // This array will hold all capo elements to manage classes later
        let capoElements = [];

        for (let i = 0; i < easyProgressionCapoAmmount; i++) {
            let suffix = "";
            let capo = (12 - bestTranspositions[i]) % 12
            switch (capo) {
                case 0:
                    capo = "No Capo"
                    break;
                case 1:
                    suffix = "<sup>st</sup>";  // Unicode for 'st'
                    break;
                case 2:
                    suffix = "<sup>nd</sup>";  // Unicode for 'nd'
                    break;
                case 3:
                    suffix = "<sup>rd</sup>";  // Unicode for 'rd'
                    break;
                default:
                    suffix = "<sup>th</sup>";  // Unicode for 'th'
                    break;
            }

            let capoElement = document.createElement("div");
            capoElement.classList.add("dragDropItem");
            if (i == 0) {
                capoElement.classList.add("active");
            }

            capoElement.id = `easyProgressionCapo-${i}`;
            capoElement.dataset.transposition = i;  // Set data attribute
            capoElement.innerHTML = `${capo}${suffix}`;

            // Attach click event listener
            capoElement.addEventListener('click', function (event) {
                // Remove active class from all capo elements
                capoElements.forEach(el => el.classList.remove('active'));

                // Add active class to the clicked element
                capoElement.classList.add('active');

                const transposition = parseInt(event.currentTarget.dataset.transposition);
                updateProgressionEasy(transposition);
            });

            // Store the capo element in the array
            capoElements.push(capoElement);

            // Append the capo element to the container
            easyProgressionCapo.appendChild(capoElement);
        };
    });

    async function updateProgressionEasy(transposition = 0) {
        let [progressionHTML, capo] = await progressionGenerator.getProgressionEasyHTML(transposition);
        document.getElementById("easyProgressionWrapper").innerHTML = "";
        document.getElementById("easyProgressionWrapper").appendChild(progressionHTML);



    };


    let transposeValue = 0;
    const transposeSlider = document.getElementById("transposeSlider");
    const labels = document.querySelectorAll('.sliderLables div');

    // Event listener for slider input changes
    transposeSlider.addEventListener('input', (e) => {
        transposeValue = parseInt(e.target.value);
        updateSliderValue(transposeValue);
    });

    // Event listener for label clicks
    labels.forEach(label => {
        label.addEventListener('click', (e) => {
            transposeValue = parseInt(e.target.getAttribute('data-value'));
            updateSliderValue(transposeValue);
        });
    });

    // Function to update slider value and handle highlighting
    function updateSliderValue(value) {
        // Update slider value
        transposeSlider.value = transposeValue;

        // Remove 'active' class from all labels
        labels.forEach(label => label.classList.remove('active'));

        // Add 'active' class to the clicked label
        const currentLabel = document.querySelector(`.sliderLables div[data-value="${transposeValue}"]`);
        if (currentLabel) {
            currentLabel.classList.add('active');
        }
        updateProgressionTransposed(transposeValue)
    }

    async function updateProgressionTransposed(transposeValue) {
        let [progressionHTML, capo] = await progressionGenerator.getProgressionTransposedHTML(transposeValue);
        document.getElementById("transposedProgressionWrapper").innerHTML = "";
        document.getElementById("transposedProgressionWrapper").appendChild(progressionHTML);
    };





    document.addEventListener('keydown', function (event) {
        if (event.key === "Escape") { // Check if the pressed key is Escape
            let settingsScreen = document.getElementById("settings");

            // Check if any settings panel is currently visible
            if (settingsScreen.classList.contains('visible')) {
                toggleSettings()
                console.log("Settings panels hidden due to Escape key.");
            }
        }
    });




    //ADVANCED SETTINGS
    window.toggleAdvSettings = async function () {

        let advSettingsScreen = document.getElementById("settingsAdvanced");
        advSettingsScreen.classList.toggle("visible")

    }

    let reloadFlag = false;

    // Make Settings Button functional
    window.toggleSettings = async function () {
        let settingsScreen = document.getElementById("settings");
        let closeSettings = document.getElementById("closeSettings");
        let advSettingsScreen = document.getElementById("settingsAdvanced");


        console.log("Toggle Settings clicked");

        // If the main settings are being closed, also close the advanced settings
        if (settingsScreen.classList.contains('visible') && advSettingsScreen.classList.contains('visible')) {
            advSettingsScreen.classList.remove('visible');
        }

        // Toggle a class that controls the visibility and opacity
        settingsScreen.classList.toggle('visible');
        closeSettings.classList.toggle('visible');

        console.log("Settings screen visibility toggled:", settingsScreen.classList.contains('visible'));

        if (reloadFlag) {
            console.log("Reload flag is true, updating tuning settings.");
            localStorage.setItem('guitarTuning', JSON.stringify(settings.tuning));
            console.warn("Settings at Reload", settings)

            console.log("New tuning saved to localStorage:", settings.tuning);

            await progressionGenerator.reloadProgression();
            console.log("Progression reloaded.");

            await updateProgressionDynamic(soundQualityValue);
            console.log("Progression dynamic updated.");

            await updateProgressionEasy();
            console.log("Progression easy updated.");

            await updateProgressionTransposed();
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
            selectElement.value = element
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
        const tuningArray = tuning.split(' ').map(Number);
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
        const currentTuning = settings.tuning.join(' ');

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
        } else {
            setFretRange(settings.fingerFretRange)
        }
    }







    //ADVANCED
    //settingsmutePermutations
    document.getElementById('settingsmutePermutations').addEventListener('change', function () {
        settings.mutePermutations = this.checked;
        localStorage.setItem('mutePermutations', this.checked);
        reloadFlag = true; // Ensure the progression is updated
        console.log(`Only mute if necessary set to: ${this.checked}`);
    });

    function loadMuteSetting() {
        console.log("Loading mute setting...");
        if (localStorage.getItem('mutePermutations') !== null) {
            const storedMuteSetting = JSON.parse(localStorage.getItem('mutePermutations'));
            settings.mutePermutations = storedMuteSetting;
            document.getElementById('settingsmutePermutations').checked = storedMuteSetting;
            console.log("Stored mute setting from localStorage:", storedMuteSetting);
        } else {
            settings.mutePermutations = false; // Default value
            document.getElementById('settingsmutePermutations').checked = false;
        }
    }

    //startWithRoot
    document.getElementById('settingsStartWithRoot').addEventListener('change', function () {
        settings.startWithRoot = this.checked;
        localStorage.setItem('startWithRoot', this.checked);
        reloadFlag = true; // Ensure the progression is updated
        console.log(`Start with root set to: ${this.checked}`);
    });

    function loadRootSetting() {
        console.log("Loading root setting...");
        if (localStorage.getItem('startWithRoot') !== null) {
            const storedRootSetting = JSON.parse(localStorage.getItem('startWithRoot'));
            settings.startWithRoot = storedRootSetting;
            document.getElementById('settingsStartWithRoot').checked = storedRootSetting;
            console.log("Stored root setting from localStorage:", storedRootSetting);
        } else {
            settings.startWithRoot = true; // Default value
            document.getElementById('settingsStartWithRoot').checked = true;
        }
    }

    // Trailing Notes
    document.getElementById('settingsTrailing').addEventListener('change', function () {
        settings.trailing = this.checked;
        localStorage.setItem('trailing', this.checked);
        reloadFlag = true; // Ensure the progression is updated
        console.log(`Trailing used notes set to: ${this.checked}`);
    });

    function loadTrailingSetting() {
        console.log("Loading trailing setting...");
        if (localStorage.getItem('trailing') !== null) {
            const storedTrailingSetting = JSON.parse(localStorage.getItem('trailing'));
            settings.trailing = storedTrailingSetting;
            document.getElementById('settingsTrailing').checked = storedTrailingSetting;
            console.log("Stored trailing setting from localStorage:", storedTrailingSetting);
        } else {
            settings.trailing = false; // Default value
            document.getElementById('settingsTrailing').checked = false;
        }
    }

    loadTrailingSetting();
    loadFretRangeSetting();
    loadTuningSettings();
    loadMuteSetting();
    loadRootSetting();
    reloadFlag = false;

    checkCommonTunings();
    updateProgressionDynamic(soundQualityValue);
    updateProgressionEasy();
    updateProgressionTransposed();
    loadChordsFromURL();
})

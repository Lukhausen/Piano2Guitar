// Global variables to manage retries
let retryCount = 0;
const maxRetries = 5;

// Entry point to check if the Web MIDI API is available and initiate
if (navigator.requestMIDIAccess) {
    attemptMIDIAccess();
} else {
    console.log("Web MIDI API not supported!");
}

// Function to attempt to access MIDI, with retry logic
function attemptMIDIAccess() {
    navigator.requestMIDIAccess()
        .then(onMIDISuccess, onMIDIFailure)
        .catch(err => {
            console.error('Error accessing MIDI devices:', err);
            handleRetry(err);
        });
}

function onMIDISuccess(midiAccess) {
    updateStatus("MIDI ready!");
    midiAccess.onstatechange = updateDeviceState;
    Array.from(midiAccess.inputs.values()).forEach(input => input.onmidimessage = onMIDIMessage);
}

function onMIDIFailure() {
    updateStatus("Failed to access MIDI devices. Retrying...");
    handleRetry(new Error("Initial connection failed"));
}

// Retry handler function
function handleRetry(err) {
    if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying... Attempt ${retryCount}`);
        setTimeout(attemptMIDIAccess, 1000); // Retry after 1 second
    } else {
        console.error('Final attempt failed. Error:', err);
        updateStatus(`Failed to connect after ${maxRetries} attempts: ${err.message}`);
    }
}

const notesPlayed = new Set();
let activeNotes = new Set();

function onMIDIMessage({ data: [command, note, velocity] }) {
    if (command === 144 && velocity > 0) {
        if (activeNotes.size === 0) { // Check if this is the start of a new session
            notesPlayed.clear(); // Clear previous session notes
            updateLog(); // Clear the log display
        }
        notesPlayed.add(note);
        activeNotes.add(note);
    } else if (command === 128 || velocity === 0) {
        activeNotes.delete(note);
        if (activeNotes.size === 0 && notesPlayed.size > 0) {
            outputNotes();
        }
    }
}

function outputNotes() {
    const uniqueNotes = Array.from(notesPlayed);
    console.log(uniqueNotes);
    document.getElementById('log').textContent = `Notes Played: ${JSON.stringify(uniqueNotes)}`;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function updateDeviceState({ port }) {
    updateStatus(`Device ${port.name} ${port.state}`);
}

function updateLog() {
    document.getElementById('log').textContent = 'Ready to record new session.';
}

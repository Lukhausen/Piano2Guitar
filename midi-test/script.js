// Check if the Web MIDI API is available and initiate
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess()
        .then(onMIDISuccess, onMIDIFailure)
        .catch(err => console.error('Error accessing MIDI devices:', err));
} else {
    console.log("Web MIDI API not supported!");
}

function onMIDISuccess(midiAccess) {
    updateStatus("MIDI ready!");
    midiAccess.onstatechange = updateDeviceState;
    Array.from(midiAccess.inputs.values()).forEach(input => input.onmidimessage = onMIDIMessage);
}

function onMIDIFailure() {
    updateStatus("Failed to access MIDI devices.");
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

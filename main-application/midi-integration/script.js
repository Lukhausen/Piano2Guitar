export class MIDIAccessManager {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = 5;
        this.notesPlayed = new Set();
        this.activeNotes = new Set();

        if (navigator.requestMIDIAccess) {
            this.attemptMIDIAccess();
        } else {
            console.log("Web MIDI API not supported!");
        }
    }

    attemptMIDIAccess() {
        navigator.requestMIDIAccess()
            .then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this))
            .catch(err => {
                console.error('Error accessing MIDI devices:', err);
                this.handleRetry(err);
            });
    }

    onMIDISuccess(midiAccess) {
        this.updateStatus("MIDI ready!");
        midiAccess.onstatechange = this.updateDeviceState.bind(this);
        Array.from(midiAccess.inputs.values()).forEach(input => input.onmidimessage = this.onMIDIMessage.bind(this));
    }

    onMIDIFailure() {
        this.updateStatus("Failed to access MIDI devices. Retrying...");
        this.handleRetry(new Error("Initial connection failed"));
    }

    handleRetry(err) {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`Retrying... Attempt ${this.retryCount}`);
            setTimeout(() => this.attemptMIDIAccess(), 1000); // Retry after 1 second
        } else {
            console.error('Final attempt failed. Error:', err);
            this.updateStatus(`Failed to connect after ${this.maxRetries} attempts: ${err.message}`);
        }
    }

    onMIDIMessage({ data: [command, note, velocity] }) {
        const eventDetail = { command, note, velocity };
        if (command === 144 && velocity > 0) {
            if (this.activeNotes.size === 0) { // New session
                this.notesPlayed.clear();
            }
            this.notesPlayed.add(note);
            this.activeNotes.add(note);
            window.dispatchEvent(new CustomEvent('noteOn', { detail: eventDetail }));
        } else if (command === 128 || velocity === 0) {
            this.activeNotes.delete(note);
            window.dispatchEvent(new CustomEvent('noteOff', { detail: eventDetail }));
            if (this.activeNotes.size === 0 && this.notesPlayed.size > 0) {
                this.outputNotes();
            }
        }
    }

    outputNotes() {
        const uniqueNotes = Array.from(this.notesPlayed);
        console.log(uniqueNotes);
        window.dispatchEvent(new CustomEvent('notesOutput', { detail: uniqueNotes }));
    }

    updateStatus(message) {
        window.dispatchEvent(new CustomEvent('statusUpdated', { detail: message }));
    }

    updateDeviceState({ port }) {
        const status = `MIDI: ${port.name} ${port.state}`;
        this.updateStatus(status);
        window.dispatchEvent(new CustomEvent('deviceStateChanged', { detail: { name: port.name, state: port.state } }));
    }
}

export default MIDIAccessManager
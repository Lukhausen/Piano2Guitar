export class MIDIAccessManager {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = 50;
        this.notesPlayed = new Set();
        this.activeNotes = new Set();
        this.selectedDeviceId = localStorage.getItem('selectedMIDIId') || null;

        if (navigator.requestMIDIAccess) {
            this.attemptMIDIAccess();
        } else {
            console.log("Web MIDI API not supported!");
        }
    }

    getAllMIDIDevices() {
        if (!this.midiAccess) {
            console.log("MIDI access has not been initialized.");
            return { inputs: [], outputs: [] };
        }
        return {
            inputs: Array.from(this.midiAccess.inputs.values()),
            outputs: Array.from(this.midiAccess.outputs.values())
        };
    }

    setMIDIDevice(deviceId) {
        // Store the selected device ID in localStorage
        localStorage.setItem('selectedMIDIId', deviceId);

        // First, disconnect all existing connections
        this.midiAccess.inputs.forEach(input => {
            input.onmidimessage = null;
        });

        // Now, set the new device
        const device = this.midiAccess.inputs.get(deviceId);
        if (!device) {
            console.error("Device not found:", deviceId);
            return;
        }

        device.onmidimessage = this.onMIDIMessage.bind(this);
        console.log(`MIDI device set: ${device.name}`);
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
        this.updateStatus("MIDI ready...");
        this.midiAccess = midiAccess; // Store midiAccess for later use
        midiAccess.onstatechange = this.updateDeviceState.bind(this);
        this.addMIDIInputs(midiAccess.inputs);

        // Attempt to set the previously selected MIDI device
        if (this.selectedDeviceId) {
            this.setMIDIDevice(this.selectedDeviceId);
        }
    }

    addMIDIInputs(inputs) {
        Array.from(inputs.values()).forEach(input => input.onmidimessage = this.onMIDIMessage.bind(this));
    }

    onMIDIFailure() {
        this.updateStatus("");
        this.handleRetry(new Error("Initial connection failed"));
    }

    handleRetry(err) {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`Retrying... Attempt ${this.retryCount}`);
            setTimeout(() => this.attemptMIDIAccess(), 3000); // Retry after 3 seconds
        } else {
            console.error(`Failed to connect after ${this.maxRetries} attempts: ${err.message}`);
            // No MIDI Device Found
            this.updateStatus("");
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
                this.notesPlayed.clear();
            }
        }
    }

    outputNotes() {
        const uniqueNotes = Array.from(this.notesPlayed);
        if (uniqueNotes.length > 0) {
            console.log(uniqueNotes);
            window.dispatchEvent(new CustomEvent('notesOutput', { detail: uniqueNotes }));
        }
    }

    updateStatus(message) {
        window.dispatchEvent(new CustomEvent('statusUpdated', { detail: message }));
    }

    updateDeviceState({ port }) {
        const status = `MIDI: ${port.name} ${port.state}`;
        this.updateStatus(status);
        window.dispatchEvent(new CustomEvent('deviceStateChanged', { detail: { name: port.name, state: port.state } }));

        // Trigger an update to the MIDI devices list
        window.dispatchEvent(new Event('MIDIDeviceChanged'));

        if (port.state === "disconnected" || port.state === "unavailable") {
            this.handleDisconnection();
        }
    }

    handleDisconnection() {
        console.log("MIDI device disconnected. Attempting to reconnect...");
        this.attemptMIDIAccess();
    }
}

export default MIDIAccessManager;

export class MIDIAccessManager {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = 50;
        this.notesPlayed = new Set();
        this.activeNotes = new Set();
        this.selectedDeviceName = localStorage.getItem('selectedMIDIName') || null;

        if (navigator.requestMIDIAccess) {
            this.attemptMIDIAccess();
        } else {
            console.log("Web MIDI API not supported!");
        }
    }


    setMIDIDevice(deviceName) {
        // Store the selected device name in localStorage
        this.selectedDeviceName = deviceName
        localStorage.setItem('selectedMIDIName', deviceName);
    
        // First, disconnect all existing connections
        this.midiAccess.inputs.forEach(input => {
            input.onmidimessage = null;
        });
    
        // Convert inputs to an array and find the device by name
        const devices = Array.from(this.midiAccess.inputs.values());
        let device = devices.find(d => d.name === deviceName);
    
        // If the device is not found, log an error and use the first device in the list
        if (!device) {
            console.error("Device not found:", deviceName);
            device = devices[0]; // Default to the first device if the specified one isn't found
        }
    
        // Set the MIDI message handler
        device.onmidimessage = this.onMIDIMessage.bind(this);
        console.log(`MIDI device set: ${device.name}`);
    
        // Dispatch the event with updated devices list and the selected device name
        this.dispatchMIDIDeviceChange();
    }
    

    dispatchMIDIDeviceChange() {
        window.dispatchEvent(new CustomEvent('MIDIdeviceChange', {
            detail: {
                devicelist: Array.from(this.midiAccess.inputs.values()),
                selectedDeviceName: this.selectedDeviceName,
            }
        }));
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
        midiAccess.onstatechange = this.handleMIDIStateChange.bind(this);
        this.addMIDIInputs(midiAccess.inputs);

        // Attempt to set the previously selected MIDI device
        if (this.selectedDeviceName) {
            this.setMIDIDevice(this.selectedDeviceName);
        }
    }
    handleMIDIStateChange(event) {
        this.updateDeviceState(event);
        this.dispatchMIDIDeviceChange(); // Dispatch on every state change
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


        if (port.state === "disconnected" || port.state === "unavailable") {
            this.handleDisconnection();
        }
        this.dispatchMIDIDeviceChange();
    }

    handleDisconnection() {
        console.log("MIDI device disconnected. Attempting to reconnect...");
        this.attemptMIDIAccess();
    }
}

export default MIDIAccessManager;

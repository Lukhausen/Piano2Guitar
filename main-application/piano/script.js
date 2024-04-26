class Piano {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.updatePlayedNotesDebounced = this.debounce(this.updatePlayedNotes, 10);

        this.octaves = options.octaves || 2;
        this.playedNotes = [];
        this.rootNote = null; // Add a property for the root note

        this.lastClickTime = 0;
        this.clickDelay = 300; // 300 milliseconds delay

        this.layout = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
        this.keysPerOctave = this.layout.length;
        this.whiteKeyCount = this.layout.filter(x => x === 0).length;
        this.whiteKeyWidth = 100 / (this.whiteKeyCount * this.octaves);
        this.blackKeyWidth = this.whiteKeyWidth * 0.5829787234;
        this.blackKeyHeight = 0.63;
        this.totalKeys = this.octaves * this.keysPerOctave;

        this.createPiano();
        this.addKeyListeners();
    }



    createPiano() {
        this.container.innerHTML = ''; // Clear existing piano keys
        let whiteCounter = 0;

        for (let index = 0; index < this.totalKeys; index++) {
            let key = document.createElement("div");
            key.setAttribute('data-note', index);
            if (this.layout[index % this.keysPerOctave] === 1) {
                key.classList.add("key", "black");
                key.style.left = `${(whiteCounter * this.whiteKeyWidth) - (this.blackKeyWidth / 2)}%`;
                key.style.width = `${this.blackKeyWidth}%`;
                key.style.height = `${this.blackKeyHeight * 100}%`;
                key.style.boxSizing = "border-box";
                key.style.position = `absolute`;
            } else {
                key.classList.add("key", "white");
                key.style.boxSizing = "border-box";
                key.style.width = `${this.whiteKeyWidth}%`;
                whiteCounter++;
            }
            this.container.appendChild(key);
        }
    }

    addKeyListeners() {
        this.container.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', () => {
                console.log("Click triggered")

                const note = key.getAttribute('data-note');
                if (this.rootNote === note) {
                    key.classList.add("selectedKey");
                    key.classList.remove("rootNote");
                    let currentTime = Date.now();

                    this.lastClickTime = currentTime;
                    console.log("Set Time to: "+currentTime)
                    this.rootNote = null;

                } else if (this.playedNotes.includes(note)) {
                    this.playedNotes = this.playedNotes.filter(n => n !== note);
                    key.classList.remove("selectedKey");
                } else {
                    this.playedNotes.push(note);
                    key.classList.add("selectedKey");
                }
                this.updatePlayedNotesDebounced();
            });

            key.addEventListener('dblclick', (event) => {
                event.stopPropagation();
                console.log("Doubleclick triggered")
                const note = key.getAttribute('data-note');
                if (this.rootNote === note) {
                    key.classList.add("selectedKey");
                    key.classList.remove("rootNote");
                    this.rootNote = null;
                } else {
                    if (this.rootNote !== null) {
                        this.container.querySelector(`.key[data-note="${this.rootNote}"]`).classList.remove('rootNote');
                    }
                    let currentTime = Date.now();
                    if (currentTime - this.lastClickTime < 200) {
                        console.log("AAAAAAAAAAAAA Lastclick to early")
                    } else {
                        this.rootNote = note;
                        if (!this.playedNotes.includes(note)) {
                            this.playedNotes.push(note);
                        }
                        key.classList.add('rootNote', 'selectedKey');
                    }

                }
                this.updatePlayedNotesDebounced();
            });
        });
    }

    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    updatePlayedNotes() {
        const event = new CustomEvent('notesChanged', { detail: { notes: this.playedNotes, rootNote: this.rootNote } });
        console.log("Dispatching Note Change Event: " + this.playedNotes + " Root: " + this.rootNote)
        this.container.dispatchEvent(event);
    }
    clearPiano() {
        this.playedNotes = []; // Clear the array of played notes
        this.rootNote = null; // Clear the root note
        this.container.querySelectorAll('.key.selectedKey').forEach(key => {
            key.classList.remove("selectedKey");
        });
        this.container.querySelectorAll('.key.rootNote').forEach(key => {
            key.classList.remove("rootNote");
        });
        this.updatePlayedNotes();
    }

    setOctaves(newOctaves) {
        if (newOctaves !== this.octaves) {
            this.octaves = newOctaves;
            this.totalKeys = this.octaves * this.keysPerOctave;
            this.whiteKeyWidth = 100 / (this.whiteKeyCount * this.octaves);
            this.blackKeyWidth = this.whiteKeyWidth * 0.5829787234;
            this.clearPiano();
            this.createPiano();
            this.addKeyListeners();
        }
    }
}

export default Piano;

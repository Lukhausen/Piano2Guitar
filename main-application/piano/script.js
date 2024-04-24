class Piano {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.octaves = options.octaves || 2;
        this.playedNotes = [];
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
                const note = key.getAttribute('data-note');
                if (this.playedNotes.includes(note)) {
                    this.playedNotes = this.playedNotes.filter(n => n !== note);
                    key.classList.remove("selectedKey");
                } else {
                    this.playedNotes.push(note);
                    key.classList.add("selectedKey");
                }
                this.updatePlayedNotes();
            });
        });
    }

    updatePlayedNotes() {
        const display = document.getElementById('playedNotes');
        if (display) {
            display.textContent = 'Played Notes: [' + this.playedNotes.join(', ') + ']';
        }
    }

    clearPiano() {
        this.playedNotes = []; // Clear the array of played notes
        this.container.querySelectorAll('.key.selectedKey').forEach(key => {
            key.classList.remove("selectedKey");
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

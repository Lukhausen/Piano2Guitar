let playedNotes = [];

document.addEventListener('DOMContentLoaded', () => {
    createPiano()
});


function createPiano() {
    const pianoContainer = document.querySelector('.piano-container');
    pianoContainer.innerHTML = ''; // Clear existing piano keys
    let octaves = 2;

    const layout = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
    const keysPerOctave = layout.length;
    const whiteKeyAmmount = layout.filter(x => x === 0).length;
    const whiteKeyWidth = 100 / (whiteKeyAmmount * octaves)
    //Black Keys are roughly 58% of the WHite Keys
    const blackKeyWidth = whiteKeyWidth * 0.5829787234
    // How many Percent the black keys are are of the white key height
    const blackKeyHeight = 0.63
    const totalKeys = octaves * keysPerOctave;

    // Creating keys
    let whiteCounter = 0
    for (let index = 0; index < totalKeys; index++) {
        let key = document.createElement("div");
        key.setAttribute('data-note', index);
        if (layout[index%keysPerOctave] == 1){
            key.classList.add("key","black");
            key.style.left = `${(whiteCounter * whiteKeyWidth)-(blackKeyWidth/2)}%`;
            key.style.width = `${blackKeyWidth}%`;
            key.style.height = `${blackKeyHeight*100}%`;
            key.style.boxSizing = "border-box";
            key.style.position = `absolute`;


        } else{
            key.classList.add("key","white");
            key.style.boxSizing = "border-box";
            key.style.width = `${whiteKeyWidth}%`;
            whiteCounter++
        }
        pianoContainer.appendChild(key);
    }

    addKeyListeners();
}

function addKeyListeners() {
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', function () {
            const note = key.getAttribute('data-note');
            if (playedNotes.includes(note)) {
                playedNotes = playedNotes.filter(n => n !== note);
                key.classList.remove("selectedKey");
            } else {
                playedNotes.push(note);
                key.classList.add("selectedKey");
            }
            updatePlayedNotes();
        });
    });
}

function updatePlayedNotes() {
    document.getElementById('playedNotes').textContent = 'Played Notes: [' + playedNotes.join(', ') + ']';
}

function clearPiano() {
    playedNotes = []; // Clear the array of played notes

    // Remove the selectedKey class from all keys
    document.querySelectorAll('.key.selectedKey').forEach(key => {
        key.classList.remove("selectedKey");
    });

    // Update the display of played notes
    updatePlayedNotes();
}
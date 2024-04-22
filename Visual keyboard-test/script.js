let playedNotes = [];

document.addEventListener('DOMContentLoaded', () => {
    const pianoContainer = document.querySelector('.piano-container');
    const base = "./audio/";
    
    // Creating keys
    for (let index = 1; index <= 24; index++) {
        let div = document.createElement("div");
        div.setAttribute('data-note', index);
        div.classList.add("key", index <= 10 ? "black-key" : "white-key");
        pianoContainer.appendChild(div);
    }

    // Adding click event listeners
    document.querySelectorAll('.white-key, .black-key').forEach(key => {
        key.addEventListener('click', function() {
            const note = key.getAttribute('data-note');
            if (playedNotes.includes(note)) {
                // Remove note if it's already selected
                playedNotes = playedNotes.filter(n => n !== note);
                key.style.backgroundColor = ""; // Remove the yellow background
            } else {
                // Add note if not already selected
                playedNotes.push(note);
                key.style.backgroundColor = "yellow"; // Set the yellow background
            }
            updatePlayedNotes();
        });
    });
    
    function updatePlayedNotes() {
        document.getElementById('playedNotes').textContent = 'Played Notes: [' + playedNotes.join(', ') + ']';
    }
});

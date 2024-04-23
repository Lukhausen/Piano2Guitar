import Piano from './piano/script.js';

document.addEventListener('DOMContentLoaded', () => {
    // Create a new Piano instance within the specified container
    const myPiano = new Piano('.piano-container', { octaves: 2 });
});
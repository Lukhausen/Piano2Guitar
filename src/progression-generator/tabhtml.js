import TabGenerator from "../tab-generator/script.js";

export class TabHTML {
    constructor(chordFactory, color, fingerNumbers = "belowString", showOpenStrings = true) {
        this.chordFactory = chordFactory; // Pointer to the ChordFactory instance
        this.color = color;
        this.fingerNumbers = fingerNumbers;
        this.showOpenStrings = showOpenStrings;
        this.currentIndex = 0; // Track the current index of playable chords
        this.maxChords = chordFactory.playableChords.length

    }

    invertColor(hex) {
        // Remove the hash at the start if it's there
        hex = hex.startsWith('#') ? hex.slice(1) : hex;

        // Convert hex to RGB
        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);

        // Invert each component by subtracting from 255
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;

        // Convert the inverted RGB values back to hex
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    vibrateElement(element) {
        element.classList.add('vibrate');
        setTimeout(() => {
            element.classList.remove('vibrate');
        }, 200); // Match this duration with the animation duration in CSS
    }

    updateChordDiagram(svgContainer, svgNameContainer,voicingInfoDiv, direction) {
        const playableChords = this.chordFactory.playableChords;
        voicingInfoDiv.innerHTML=this.currentIndex+1 + " / " + this.maxChords
        if (this.currentIndex < playableChords.length && this.currentIndex >= 0) {
            let slideOutClass, slideInClass;

            if (direction === 'next') {
                slideOutClass = 'slide-out-left';
                slideInClass = 'slide-in-right';
            } else if (direction === 'previous') {
                slideOutClass = 'slide-out-right';
                slideInClass = 'slide-in-left';
            }

            // Apply slide-out animation to the current SVG
            svgContainer.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-right', 'slide-out-left');
            svgContainer.classList.add(slideOutClass);

            // Wait for the slide-out animation to complete
            setTimeout(() => {
                const chord = playableChords[this.currentIndex];
                const chordDiagram = new TabGenerator(
                    chord.voicing,
                    chord.fingerPositions,
                    chord.minAboveZero,
                    chord.barres,
                    this.color,
                    this.invertColor(this.color),
                    this.fingerNumbers,
                    this.showOpenStrings
                );
                const newSvg = chordDiagram.generateChordSVG();

                // Replace the old SVG with the new one
                svgContainer.innerHTML = '';
                svgContainer.appendChild(newSvg);
                svgNameContainer.innerHTML = this.chordFactory.identifier;

                // Apply slide-in animation to the new SVG
                svgContainer.classList.remove(slideOutClass);
                svgContainer.classList.add(slideInClass);
                setTimeout(() => {
                    svgContainer.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-right', 'slide-out-left');
                },100)
            }, 100); // Match this duration with the animation duration in CSS

        }
    }

    generateHTML(soundQuality = 0.5, ammount = 1) {
        // Sort the playable chords by combined rating
        this.chordFactory.sortPlayableChordsByCombinedRating(soundQuality);

        let diagrams = [];

        // Extract first 'ammount' playable chords from the ChordFactory instance
        for (let i = 0; i < ammount; i++) {
            if (this.chordFactory.playableChords[i]) {
                // Assuming TabGenerator takes chord details and returns an SVG element
                try {
                    this.currentIndex = i;
                    const chord = this.chordFactory.playableChords[this.currentIndex];
                    const chordDiagram = new TabGenerator(
                        chord.voicing,
                        chord.fingerPositions,
                        chord.minAboveZero,
                        chord.barres,
                        this.color,
                        this.invertColor(this.color),
                        this.fingerNumbers,
                        this.showOpenStrings
                    );
                    const svg = chordDiagram.generateChordSVG();
                    let svgInfoContainer = document.createElement('div');
                    svgInfoContainer.classList.add("progressionGeneratorSvgInfoContainer");

                    let voicingInfoContainer = document.createElement('div');
                    voicingInfoContainer.classList.add("progressionGeneratorVoicingInfoContainer");

                    let voicingInfoDiv = document.createElement('div');
                    voicingInfoDiv.innerHTML = this.currentIndex + 1 + " / " + this.maxChords;

                    let svgContainer = document.createElement('div'); // Container for chord diagrams
                    svgContainer.classList.add("progressionGeneratorSvgContainer");

                    let svgNameContainer = document.createElement('div'); // Container for chord diagrams
                    svgNameContainer.innerHTML = this.chordFactory.identifier;
                    svgNameContainer.classList.add("progressionGeneratorSvgChordName");

                    // SVG for next button
                    const nextButton = document.createElement('div');
                    nextButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="auto" fill="#e8eaed"><path d="M579-480 285-774q-15-15-14.5-35.5T286-845q15-15 35.5-15t35.5 15l307 308q12 12 18 27t6 30q0 15-6 30t-18 27L356-115q-15 15-35 14.5T286-116q-15-15-15-35.5t15-35.5l293-293Z"/></svg>';

                    nextButton.classList.add("progressionGeneratorChordButton");

                    nextButton.onclick = () => {
                        if (this.currentIndex + 1 < this.chordFactory.playableChords.length) {
                            this.currentIndex++;
                            this.updateChordDiagram(svgContainer, svgNameContainer, voicingInfoDiv, 'next');
                        } else {
                            this.vibrateElement(svgContainer);
                        }
                    };

                    // SVG for previous button
                    const prevButton = document.createElement('div');
                    prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="auto" fill="#e8eaed"><path d="m142-480 294 294q15 15 14.5 35T435-116q-15 15-35 15t-35-15L57-423q-12-12-18-27t-6-30q0-15 6-30t18-27l308-308q15-15 35.5-14.5T436-844q15 15 15 35t-15 35L142-480Z"/></svg>';
                    prevButton.classList.add("progressionGeneratorChordButton");

                    prevButton.onclick = () => {
                        if (this.currentIndex > 0) {
                            this.currentIndex--;
                            this.updateChordDiagram(svgContainer, svgNameContainer, voicingInfoDiv, 'previous');
                        } else {
                            this.vibrateElement(svgContainer);
                        }
                    };

                    svgContainer.appendChild(svg);
                    voicingInfoContainer.appendChild(prevButton);
                    voicingInfoContainer.appendChild(voicingInfoDiv);
                    svgInfoContainer.appendChild(svgNameContainer);
                    voicingInfoContainer.appendChild(nextButton);
                    let diagramsContainer = document.createElement('div');
                    diagramsContainer.classList.add("progressionGeneratorDiagramsContainer");


                    diagramsContainer.appendChild(svgContainer);
                    diagramsContainer.appendChild(voicingInfoContainer);
                    diagramsContainer.appendChild(svgInfoContainer);
                    diagrams.push(diagramsContainer);
                } catch (error) {
                    console.error('Error generating chord diagram:', error);
                }
            }
        }

        return diagrams; // Return the container with all SVGs
    }
}
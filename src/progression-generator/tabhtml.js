import TabGenerator from "../tab-generator/script.js";
import { settings } from "../chord-factory/constants.js";

export class TabHTML {
    constructor(chordFactory = [], color = "#fff", fingerNumbers = "belowString", showOpenStrings = true) {
        this.chordFactory = chordFactory; // Pointer to the ChordFactory instance
        this.color = color;
        this.fingerNumbers = fingerNumbers;
        this.showOpenStrings = showOpenStrings;
        this.currentIndex = 0; // Track the current index of playable chords
        this.maxChords = chordFactory.playableChords?.length ?? 0;


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

    updateChordDiagram(svgContainer, voicingInfoDiv, direction) {
        const playableChords = this.chordFactory.playableChords;
        const currentIndex = parseInt(svgContainer.getAttribute('data-current-index'), 10);
        voicingInfoDiv.innerHTML = currentIndex + 1 + " / " + this.maxChords
        if (this.currentIndex < playableChords.length && currentIndex >= 0) {
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
                const chord = playableChords[currentIndex];
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

                // Apply slide-in animation to the new SVG
                svgContainer.classList.remove(slideOutClass);
                svgContainer.classList.add(slideInClass);
                setTimeout(() => {
                    svgContainer.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-right', 'slide-out-left');
                }, 100)
            }, 100); // Match this duration with the animation duration in CSS

        }
    }

    async generateHTML(soundQuality = 0.5, amount = 1) {
        await this.chordFactory.sortPlayableChordsByCombinedRating(soundQuality);
        this.maxChords = this.chordFactory.playableChords.length;

        let diagrams = [];
        for (let i = 0; i < amount; i++) {
            if (this.chordFactory.playableChords[i]) {
                try {
                    const chord = this.chordFactory.playableChords[i];
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
                    let svgContainer = document.createElement('div');
                    svgContainer.classList.add("progressionGeneratorSvgContainer");
                    svgContainer.setAttribute('data-current-index', i);
                    svgContainer.appendChild(svg);

                    let chordSwitchContainer = this.createChordSwitchContainer(svgContainer);

                    let chordNameContainer = document.createElement('div');
                    chordNameContainer.innerHTML = this.chordFactory.identifier;
                    chordNameContainer.classList.add("progressionGeneratorChordName");

                    let chordInfoContainer = document.createElement('div');
                    chordInfoContainer.classList.add("progressionGeneratorChordInfoContainer");
                    chordInfoContainer.appendChild(chordNameContainer);
                    chordInfoContainer.appendChild(chordSwitchContainer);

                    let diagramsContainer = document.createElement('div');
                    diagramsContainer.classList.add("progressionGeneratorDiagramsContainer");
                    diagramsContainer.appendChild(svgContainer);
                    diagramsContainer.appendChild(chordInfoContainer);

                    diagrams.push(diagramsContainer);
                } catch (error) {
                    console.error('Error generating chord diagram:', error);
                }
            } else {
                let placeholder = this.generatePlaceholder(1, this.chordFactory.identifier);
                placeholder[0].style.opacity = 0.4;
                placeholder[0].style.filter = "blur(3px)";
                diagrams.push(placeholder[0]);
            }
        }
        return diagrams;
    }

    createChordSwitchContainer(svgContainer) {
        let chordSwitchContainer = document.createElement('div');
        chordSwitchContainer.classList.add("progressionGeneratorChordSwitchContainer");

        let chordSwitchInfo = document.createElement('div');
        let currentIndex = parseInt(svgContainer.getAttribute('data-current-index'), 10);
        chordSwitchInfo.innerHTML = (currentIndex + 1) + " / " + this.maxChords;

        const nextButton = document.createElement('div');
        nextButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" ><path fill="currentColor" d="M579-480 285-774q-15-15-14.5-35.5T286-845q15-15 35.5-15t35.5 15l307 308q12 12 18 27t6 30q0 15-6 30t-18 27L356-115q-15 15-35 14.5T286-116q-15-15-15-35.5t15-35.5l293-293Z"/></svg>';
        nextButton.classList.add("progressionGeneratorChordSwitchButton");

        nextButton.onclick = () => {
            currentIndex = parseInt(svgContainer.getAttribute('data-current-index'), 10);
            if (currentIndex + 1 < this.chordFactory.playableChords.length) {
                currentIndex++;
                svgContainer.setAttribute('data-current-index', currentIndex);
                this.updateChordDiagram(svgContainer, chordSwitchInfo, 'next');
            } else {
                this.vibrateElement(svgContainer);
            }
        };

        const prevButton = document.createElement('div');
        prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" ><path fill="currentColor" d="m142-480 294 294q15 15 14.5 35T435-116q-15 15-35 15t-35-15L57-423q-12-12-18-27t-6-30q0-15 6-30t18-27l308-308q15-15 35.5-14.5T436-844q15 15 15 35t-15 35L142-480Z"/></svg>';
        prevButton.classList.add("progressionGeneratorChordSwitchButton");

        prevButton.onclick = () => {
            currentIndex = parseInt(svgContainer.getAttribute('data-current-index'), 10);
            if (currentIndex > 0) {
                currentIndex--;
                svgContainer.setAttribute('data-current-index', currentIndex);
                this.updateChordDiagram(svgContainer, chordSwitchInfo, 'previous');
            } else {
                this.vibrateElement(svgContainer);
            }
        };

        chordSwitchContainer.appendChild(prevButton);
        chordSwitchContainer.appendChild(chordSwitchInfo);
        chordSwitchContainer.appendChild(nextButton);

        return chordSwitchContainer;
    }

    generatePlaceholder(placeholderCount = 4, label) {
        let diagrams = [];

        for (let i = 0; i < placeholderCount; i++) {
            let voicing = [0, 0, 0, 0, 0, 0];
            let indices = new Set();
            while (indices.size < 4) {
                let index = Math.floor(Math.random() * voicing.length);
                indices.add(index);
            }

            indices.forEach(index => {
                voicing[index] = Math.floor(Math.random() * (settings.fingerFretRange + 1));
            });

            const fingerPositions = [0, 0, 0, 0, 0, 0];

            const chordDiagram = new TabGenerator(
                voicing,
                fingerPositions,
                0,
                [],
                this.color,
                this.invertColor(this.color),
                this.fingerNumbers,
                this.showOpenStrings
            );
            const svg = chordDiagram.generateChordSVG();

            // Container for the actual SVG element
            let svgContainer = document.createElement('div');
            svgContainer.classList.add("progressionGeneratorSvgContainer");
            svgContainer.appendChild(svg);

            // Container for the chord switching
            let chordSwitchContainer = document.createElement('div');
            chordSwitchContainer.classList.add("progressionGeneratorChordSwitchContainer");

            // Div for displaying the current chord number
            let chordSwitchInfo = document.createElement('div');
            let random = Math.floor(Math.random() * 500)
            chordSwitchInfo.innerHTML = `1 / ${random}`;

            // Next button and functions
            const nextButton = document.createElement('div');
            nextButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" ><path fill="currentColor" d="M579-480 285-774q-15-15-14.5-35.5T286-845q15-15 35.5-15t35.5 15l307 308q12 12 18 27t6 30q0 15-6 30t-18 27L356-115q-15 15-35 14.5T286-116q-15-15-15-35.5t15-35.5l293-293Z"/></svg>';
            nextButton.classList.add("progressionGeneratorChordSwitchButton");

            nextButton.onclick = () => {
                this.vibrateElement(svgContainer); // Placeholder does not actually switch
            };

            // Previous button and functions
            const prevButton = document.createElement('div');
            prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" ><path fill="currentColor" d="m142-480 294 294q15 15 14.5 35T435-116q-15 15-35 15t-35-15L57-423q-12-12-18-27t-6-30q0-15 6-30t18-27l308-308q15-15 35.5-14.5T436-844q15 15 15 35t-15 35L142-480Z"/></svg>';
            prevButton.classList.add("progressionGeneratorChordSwitchButton");

            prevButton.onclick = () => {
                this.vibrateElement(svgContainer); // Placeholder does not actually switch
            };

            // Adding the three elements to the switch div
            chordSwitchContainer.appendChild(prevButton);
            chordSwitchContainer.appendChild(chordSwitchInfo);
            chordSwitchContainer.appendChild(nextButton);




            //Crafting the CHordname contsainer
            let chordNameContainer = document.createElement('div'); // Container for chord diagrams
            let underscores = ""

            if (!label) {
                console.log("Label",label)
                random = Math.floor(Math.random() * 3) + 2;

                underscores = "_".repeat(random);
                let easteregg = Math.floor(Math.random() * 2000);
                if (easteregg == 1) {
                    underscores = "Hannah"
                }
                if (easteregg == 2) {
                    underscores = "Lukas"
                }
                if (easteregg == 3) {
                    underscores = "Marc"
                }
            } else { underscores = label }
            chordNameContainer.innerHTML = underscores;

            chordNameContainer.classList.add("progressionGeneratorChordName");

            //Putting chordSwitchContainer and chordNameContainer into a div so they dont have any gap
            let chordInfoContainer = document.createElement('div');
            chordInfoContainer.classList.add("progressionGeneratorChordInfoContainer");
            chordInfoContainer.appendChild(chordNameContainer);

            chordInfoContainer.appendChild(chordSwitchContainer);


            //Creating the Full Container WIth everhting in it
            let diagramsContainer = document.createElement('div');
            diagramsContainer.classList.add("progressionGeneratorDiagramsContainer");
            diagramsContainer.appendChild(svgContainer);
            diagramsContainer.appendChild(chordInfoContainer);








            // Pushing it into the diagrams
            diagrams.push(diagramsContainer);
        }

        return diagrams; // Return the container with all SVGs
    }

}
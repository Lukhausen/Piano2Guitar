# PianoToGuitar - Guitar Chord Diagram Generator

## Overview

PianoToGuitar is a web-based application that assists musicians in generating guitar chord diagrams based on piano inputs or MIDI integration. This project allows users to visualize guitar chords that correspond to piano notes, helping bridge the gap between piano and guitar players. The application supports dynamic chord progression generation, drag-and-drop chord selection, and customization of chord diagrams.

## Features

- **Chord Factory:** Generates all possible chord voicings for a given chord and filters them based on playability.
- **Chord Library:** Provides a comprehensive library of predefined chords with various structures.
- **Drag-and-Drop Interface:** Allows users to easily select and reorder chords for creating progressions.
- **MIDI Integration:** Supports real-time MIDI input for detecting and logging notes played on a connected MIDI device.
- **Dynamic Progression Generator:** Generates chord progressions dynamically, with adjustable settings for sound quality and playability.
- **Guitar Chord Diagrams:** Visualizes chord diagrams with customizable colors, finger positions, and barre chords.

## Project Structure

The project is organized into several directories, each containing scripts and resources for different functionalities:

- `audio/`: Contains audio files for piano key sounds.
- `chord-factory/`: Contains scripts for generating and filtering chord voicings.
  - `chordfactory.js`
  - `chordvoicing.js`
  - `constants.js`
  - `main.js`
  - `utils.js`
- `chord-library/`: Contains scripts for defining and searching chords.
  - `script.js`
- `drag-drop/`: Contains scripts for drag-and-drop functionality.
  - `script.js`
- `midi-integration/`: Contains scripts for MIDI integration.
  - `index.html`
  - `script.js`
- `piano/`: Contains scripts for the virtual piano interface.
  - `script.js`
- `progression-generator/`: Contains scripts for generating and displaying chord progressions.
  - `main.js`
- `svg/`: Contains SVG resources for chord diagrams.
- `tab-generator/`: Contains scripts for generating guitar tab diagrams.
  - `index.html`
  - `script.js`
- `index.html`: The main entry point for the web application.
- `createChatGPTContext.js`: A script for generating context files.
- `script.js`: Main script file for initializing and managing the application.

## Installation and Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd PianoToGuitar

   npm install parcel-bundler@1.12.3 --save-dev
   npm install parcel-plugin-obfuscate --save-dev

   ```

2. **Install dependencies:**
   This project does not have any external dependencies beyond standard HTML, CSS, and JavaScript.

3. **Open the application:**
   Simply open `index.html` in your preferred web browser to run the application.

## Usage

1. **Select Chords:**
   Use the virtual piano to select notes or search for chords using the search bar. You can also connect a MIDI device and play notes to detect chords in real-time.

2. **Drag and Drop:**
   Drag and drop chords into the selected items area to create a chord progression.

3. **Generate Diagrams:**
   Adjust the sound quality slider to generate chord diagrams with varying degrees of playability and sound quality.

4. **Customization:**
   Customize the chord diagrams with different colors, finger positions, and barre settings through the settings menu.

## Contributing

Since this is a closed-source project, contributions are not accepted at this time. For any issues or feature requests, please contact the project maintainers directly.

## License

This project is proprietary and not open for public use or distribution.

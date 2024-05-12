const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');

// Set path to ffmpeg and ffprobe binaries
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const inputFolder = 'audio'; // Specify your actual input folder path
const outputFolder = 'audio_out'; // Specify your actual output folder path

function addSilenceToMp3(inputFile, outputFile) {
    ffmpeg()
        .input(inputFile)
        .input('anullsrc')  // Set anullsrc as a separate input
        .inputFormat('lavfi')
        .complexFilter([
            '[1:a] atrim=duration=0.1 [silence]', // Generate 0.1 seconds of silence
            '[silence][0:a] concat=n=2:v=0:a=1'  // Concatenate silence and the original audio
        ])
        .audioCodec('libmp3lame') // Use the MP3 codec
        .audioBitrate(320) // Set a higher bitrate, e.g., 320 kbps
        .toFormat('mp3')
        .on('end', () => {
            console.log(`${outputFile} has been saved with added silence.`);
        })
        .on('error', (err) => {
            console.error('An error occurred: ' + err.message);
        })
        .save(outputFile);
}

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

fs.readdir(inputFolder, (err, files) => {
    if (err) {
        console.error('Error reading input folder:', err);
        return;
    }

    files.forEach(file => {
        if (path.extname(file).toLowerCase() === '.mp3') {
            const inputFile = path.join(inputFolder, file);
            const outputFile = path.join(outputFolder, 'silenced_' + file); // Prevent overwriting original files
            addSilenceToMp3(inputFile, outputFile);
        }
    });
});

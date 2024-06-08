const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/index.html');
const placeholder = '{{BUILD_DATE}}';
const creationDate = new Date().toLocaleDateString();

function insertDate() {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the HTML file:', err);
      return;
    }

    // Insert the creation date
    const result = data.replace(placeholder, creationDate);

    fs.writeFile(filePath, result, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to the HTML file:', err);
      } else {
        console.log('Creation date inserted successfully.');
        // Proceed with the build process
        buildProject();
      }
    });
  });
}

function buildProject() {
  const { exec } = require('child_process');
  exec('npx parcel build src/index.html --no-cache', (err, stdout, stderr) => {
    if (err) {
      console.error('Build process failed:', err);
      return;
    }
    console.log(stdout);
    console.error(stderr);
    resetPlaceholder();
  });
}

function resetPlaceholder() {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the HTML file:', err);
      return;
    }

    // Reset the placeholder
    const result = data.replace(creationDate, placeholder);

    fs.writeFile(filePath, result, 'utf8', (err) => {
      if (err) {
        console.error('Error resetting the HTML file:', err);
      } else {
        console.log('Placeholder reset successfully.');
      }
    });
  });
}

insertDate();
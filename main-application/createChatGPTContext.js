const fs = require('fs');
const path = require('path');

function isHtmlOrJsFile(file) {
  return file.endsWith('.html') || file.endsWith('.js');
}

function getDirectoryStructure(dir, fileStructure = {}, root = true) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      fileStructure[item] = {};
      getDirectoryStructure(fullPath, fileStructure[item], false);
    } else if (isHtmlOrJsFile(item)) {
      fileStructure[item] = fullPath;
    }
  });
  if (root) {
    return fileStructure;
  }
}

function readAllFiles(dir) {
  let allText = '';
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      allText += readAllFiles(fullPath);
    } else if (isHtmlOrJsFile(item)) {
      allText += `File: ${item}\n\n`;
      allText += fs.readFileSync(fullPath, 'utf8') + '\n\n';
    }
  });
  return allText;
}

function formatStructure(fileStructure, indent = 0) {
  let structureText = '';
  const indentString = ' '.repeat(indent);
  for (const key in fileStructure) {
    if (typeof fileStructure[key] === 'string') {
      structureText += `${indentString}${key}\n`;
    } else {
      structureText += `${indentString}${key}/\n`;
      structureText += formatStructure(fileStructure[key], indent + 2);
    }
  }
  return structureText;
}

const targetDir = path.join(__dirname, ''); // Change 'target' to your target folder
const outputFilePath = path.join(__dirname, 'output.txt');

// Get the folder and file structure
const fileStructure = getDirectoryStructure(targetDir);

// Format the structure to a string
const structureText = formatStructure(fileStructure);

// Read all the text from HTML and JS files
const filesText = readAllFiles(targetDir);

// Combine structure and file texts
const finalOutput = `${structureText}\n${filesText}`;

// Write the final output to a file
fs.writeFileSync(outputFilePath, finalOutput);

console.log('Folder structure and file contents have been saved to output.txt');

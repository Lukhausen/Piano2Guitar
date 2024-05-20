const fs = require('fs');
const path = require('path');

function isHtmlOrJsFile(file) {
  return file.endsWith('.html') || file.endsWith('.js') ;
}

function getDirectoryStructure(dir, fileStructure = {}, parentPath = '') {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      fileStructure[item] = {};
      getDirectoryStructure(fullPath, fileStructure[item], path.join(parentPath, item));
    } else {
      fileStructure[item] = {
        path: fullPath,
        relativePath: path.join(parentPath, item),
        size: stats.size,
        lastModified: stats.mtime
      };
    }
  });
  return fileStructure;
}

function readAllFiles(dir, parentPath = '') {
  let allText = '';
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      allText += readAllFiles(fullPath, path.join(parentPath, item));
    } else if (isHtmlOrJsFile(item)) {
      allText += `File: ${item}\n`;
      allText += `Path: ${path.join(parentPath, item)}\n\n`;
      allText += fs.readFileSync(fullPath, 'utf8') + '\n\n';
    }
  });
  return allText;
}

function formatStructure(fileStructure, indent = 0) {
  let structureText = '';
  const indentString = ' '.repeat(indent);
  for (const key in fileStructure) {
    if (typeof fileStructure[key] === 'object' && 'relativePath' in fileStructure[key]) {
      const { relativePath, size, lastModified } = fileStructure[key];
      structureText += `${indentString}${key} (Path: ${relativePath}, Size: ${size} bytes)\n`;
    } else {
      structureText += `${indentString}${key}/\n`;
      structureText += formatStructure(fileStructure[key], indent + 2);
    }
  }
  return structureText;
}

try {
  const targetDir = path.join(__dirname, ''); // Change '' to your target folder
  const outputFilePath = path.join(__dirname, 'output.txt');

  // Get the folder and file structure
  const fileStructure = getDirectoryStructure(targetDir);

  // Format the structure to a string
  const structureText = formatStructure(fileStructure);

  // Read all the text from HTML and JS files
  const filesText = readAllFiles(targetDir);

  // Combine structure and file texts
  const finalOutput = `Directory Structure:\n${structureText}\nFile Contents:\n${filesText}`;

  // Write the final output to a file
  fs.writeFileSync(outputFilePath, finalOutput);

  console.log('Folder structure and file contents have been saved to output.txt');
} catch (error) {
  console.error('Error reading directory:', error.message);
}

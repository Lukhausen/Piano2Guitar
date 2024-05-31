const fs = require('fs');
const path = require('path');

function isHtmlOrJsFile(file) {
  return file.endsWith('.html') || file.endsWith('.js');
}

function getDirectoryStructure(dir, fileStructure = {}, parentPath = '') {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      fileStructure[item] = {};
      getDirectoryStructure(fullPath, fileStructure[item], path.join(parentPath, item));
    } else if (isHtmlOrJsFile(item)) {
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

function removeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function removeComments(text) {
  const singleLineCommentPattern = /\/\/.*(?=[\n\r]|$)/g;
  const multiLineCommentPattern = /\/\*[\s\S]*?\*\//g;
  const stringPattern = /(['"`])(?:(?!\1|\\).|\\.)*\1/g;
  const regexPattern = /\/(?!\*)[^/\\\n]+\/[gimsuy]*/g; // Improved regex for JS regex patterns

  // Preserve strings and regex to avoid removing comment-like patterns within them
  const preservedItems = [];
  let preservedText = text.replace(stringPattern, match => {
    preservedItems.push(match);
    return `__PRESERVED__${preservedItems.length - 1}__`;
  }).replace(regexPattern, match => {
    preservedItems.push(match);
    return `__PRESERVED__${preservedItems.length - 1}__`;
  });

  // Remove comments
  preservedText = preservedText.replace(singleLineCommentPattern, '');
  preservedText = preservedText.replace(multiLineCommentPattern, '');

  // Restore strings and regex patterns
  preservedText = preservedText.replace(/__PRESERVED__(\d+)__/g, (_, index) => preservedItems[Number(index)]);

  return preservedText;
}

function readAllFiles(dir, parentPath = '', removeWhitespaceSetting = false, removeCommentsSetting = false) {
  let allText = '';
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      allText += readAllFiles(fullPath, path.join(parentPath, item), removeWhitespaceSetting, removeCommentsSetting);
    } else if (isHtmlOrJsFile(item)) {
      let fileContent = fs.readFileSync(fullPath, 'utf8');
      if (removeWhitespaceSetting) {
        fileContent = removeWhitespace(fileContent);
      }
      if (removeCommentsSetting && item.endsWith('.js')) {
        fileContent = removeComments(fileContent);
      }
      allText += `File: ${item}\n`;
      allText += `Path: ${path.join(parentPath, item)}\n\n`;
      allText += fileContent + '\n\n';
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
      structureText += `${indentString}${key} (Path: ${relativePath})\n`;
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
  const removeWhitespaceSetting = true ; // Set to true to remove whitespace
  const removeCommentsSetting = true; // Set to true to remove comments

  // Get the folder and file structure
  const fileStructure = getDirectoryStructure(targetDir);

  // Format the structure to a string
  const structureText = formatStructure(fileStructure);

  // Read all the text from HTML and JS files
  const filesText = readAllFiles(targetDir, '', removeWhitespaceSetting, removeCommentsSetting);

  // Combine structure and file texts
  const finalOutput = `Directory Structure:\n${structureText}\nFile Contents:\n${filesText}`;

  // Write the final output to a file
  fs.writeFileSync(outputFilePath, finalOutput);

  console.log('Folder structure and file contents have been saved to output.txt');
} catch (error) {
  console.error('Error reading directory:', error.message);
}

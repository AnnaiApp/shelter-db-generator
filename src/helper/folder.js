const { existsSync, lstatSync, readdirSync, rmdirSync, unlinkSync } = require('fs');
const Path = require('path');

const deleteRecursive = (path) => {
  if (!existsSync(path)) {
    return;
  }
  if (!lstatSync(path).isDirectory()) {
    // Delete the file
    unlinkSync(path);
    return;
  }
  readdirSync(path).forEach((file, index) => {
    const curPath = Path.join(path, file);
    if (lstatSync(curPath).isDirectory()) {
      // Recurse
      deleteRecursive(curPath);
    } else {
      // Delete the file
      unlinkSync(curPath);
    }
  });
  rmdirSync(path);
};

module.exports = {
  deleteRecursive
};
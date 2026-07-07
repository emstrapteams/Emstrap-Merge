import fs from 'fs';
import path from 'path';

function findFiles(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') continue;
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      findFiles(path.join(dir, file), filter, fileList);
    } else if (filter(file)) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const frontendDir = 'd:/Rajshekar/Desktop/1st/emstrap/almost full (1)/yashwa newly edited/yashwa/emstrap/emstrap/Emstrap-main/frontend/src';

const files = findFiles(frontendDir, file => file.endsWith('.js') || file.endsWith('.jsx'));
let found = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes('socket.io-client') || content.includes('io(')) {
    found.push(file);
  }
}

console.log(found.join('\n'));

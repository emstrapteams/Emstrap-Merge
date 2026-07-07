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

const backendDir = 'd:/Rajshekar/Desktop/1st/emstrap/almost full (1)/yashwa newly edited/yashwa/emstrap/emstrap/Emstrap-main/backend';
const frontendDir = 'd:/Rajshekar/Desktop/1st/emstrap/almost full (1)/yashwa newly edited/yashwa/emstrap/emstrap/Emstrap-main/frontend';

const backendFiles = findFiles(backendDir, file => file.endsWith('.js'));
console.log(`Found ${backendFiles.length} JS files in backend.`);

const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
const dynamicImportRegex = /import\(['"](.*?)['"]\)/g;
const requireRegex = /require\(['"](.*?)['"]\)/g;

let errors = [];

function checkFileImports(filePath, isBackend = true) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const dir = path.dirname(filePath);
  
  const matches = [...content.matchAll(importRegex), ...content.matchAll(dynamicImportRegex), ...content.matchAll(requireRegex)];
  for (const match of matches) {
    const importPath = match[1];
    
    // Ignore node built-ins and npm packages (rough check)
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) continue;
    
    let targetPath = path.resolve(dir, importPath);
    
    if (isBackend) {
      if (!fs.existsSync(targetPath)) {
         // Maybe it's a directory and it needs index.js?
         if (fs.existsSync(targetPath + '.js')) {
            // in ES modules, .js extension is required!
            if (!importPath.endsWith('.js')) {
               errors.push(`Missing extension in backend: ${importPath} in ${filePath}`);
            }
         } else if (fs.existsSync(path.join(targetPath, 'index.js'))) {
            if (!importPath.endsWith('/index.js')) {
               errors.push(`Missing /index.js in backend: ${importPath} in ${filePath}`);
            }
         }
         else {
            errors.push(`Broken import: ${importPath} in ${filePath}`);
         }
      }
    } else {
        // Frontend vite resolver handles extensions differently usually, but let's just check if file exists
        if (!fs.existsSync(targetPath) && !fs.existsSync(targetPath + '.js') && !fs.existsSync(targetPath + '.jsx') && !fs.existsSync(path.join(targetPath, 'index.js')) && !fs.existsSync(path.join(targetPath, 'index.jsx')) && !fs.existsSync(targetPath + '.css')) {
            errors.push(`Broken import in frontend: ${importPath} in ${filePath}`);
        }
    }
  }
}

backendFiles.forEach(f => checkFileImports(f, true));

const frontendFiles = findFiles(frontendDir, file => file.endsWith('.js') || file.endsWith('.jsx'));
console.log(`Found ${frontendFiles.length} JS/JSX files in frontend.`);

frontendFiles.forEach(f => checkFileImports(f, false));

fs.writeFileSync('import_errors.json', JSON.stringify(errors, null, 2));
console.log('Saved to import_errors.json');

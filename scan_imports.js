const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git') continue;
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      files = files.concat(walk(p));
    } else {
      files.push(p);
    }
  }
  return files;
}

const all = walk('frontend/src').filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
let errors = [];

all.forEach(f => {
  const c = fs.readFileSync(f, 'utf-8');
  const importRegex = /from ['"]([^'"]+)['"]/g;
  let m;
  while ((m = importRegex.exec(c)) !== null) {
    const imp = m[1];
    if (!imp.startsWith('.')) continue;
    const dir = path.dirname(f);
    let target = path.resolve(dir, imp);
    const exists = fs.existsSync(target) ||
      fs.existsSync(target + '.js') ||
      fs.existsSync(target + '.jsx') ||
      fs.existsSync(path.join(target, 'index.js')) ||
      fs.existsSync(path.join(target, 'index.jsx')) ||
      fs.existsSync(target + '.css');
    if (!exists) errors.push(f.replace(/\\/g, '/') + ' -> ' + imp);
  }
});

errors.forEach(e => console.log(e));
console.log('\nTotal broken imports:', errors.length);

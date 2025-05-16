import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const files = execSync('git ls-files "*.ts" "*.tsx"', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

const oldImport = `import { cacheTag } from "next/dist/server/use-cache/cache-tag"`;
const newImport = `import { unstable_cache as cache } from "next/cache"`;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes(oldImport)) {
    console.log(`Updating ${file}`);
    const newContent = content.replace(oldImport, newImport);
    fs.writeFileSync(file, newContent);
  }
}); 
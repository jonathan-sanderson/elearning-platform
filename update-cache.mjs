import { execSync } from 'child_process';
import fs from 'fs';

const files = execSync('git ls-files "*.ts" "*.tsx"', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if file doesn't use cacheTag
  if (!content.includes('cacheTag(')) {
    return;
  }

  // Replace the import
  content = content.replace(
    /import\s*{\s*cacheTag\s*}\s*from\s*["']next\/dist\/server\/use-cache\/cache-tag["']/g,
    'import { unstable_cache as cache } from "next/cache"'
  );

  // Replace function calls
  content = content.replace(/cacheTag\(/g, 'cache(');

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}); 
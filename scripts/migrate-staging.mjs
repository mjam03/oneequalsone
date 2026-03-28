import { readFileSync, writeFileSync, readdirSync, renameSync } from 'fs';
import { join } from 'path';

const STAGING = new URL('../src/content/blog-staging/', import.meta.url).pathname;
const BLOG = new URL('../src/content/blog/', import.meta.url).pathname;

function extractDescription(content) {
  // Strip frontmatter
  const afterFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
  const lines = afterFrontmatter.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip blanks, horizontal rules, headings, image lines, and html comments
    if (!trimmed) continue;
    if (trimmed === '* * *' || trimmed === '---' || trimmed === '***') continue;
    if (trimmed.startsWith('#')) {
      // h4 subtitles make great descriptions — strip the hashes
      if (trimmed.startsWith('####')) return trimmed.replace(/^#+\s*/, '');
      continue;
    }
    if (trimmed.startsWith('![]') || trimmed.startsWith('![')) continue;
    if (trimmed.startsWith('<') || trimmed.startsWith('<!--')) continue;
    if (trimmed.startsWith('Photo by')) continue;
    // Strip markdown escapes, bold/italic markers, and escape quotes for YAML
    return trimmed
      .replace(/\\([*_`])/g, '$1')   // unescape \* \_ \`
      .replace(/^[*_]+|[*_]+$/g, '') // strip leading/trailing bold/italic
      .replace(/"/g, "'");           // avoid breaking YAML double-quoted string
  }
  return null;
}

function fixFrontmatter(content, filename) {
  const fmMatch = content.match(/^(---\n)([\s\S]*?)(---\n)/);
  if (!fmMatch) {
    console.warn(`  ⚠ No frontmatter found in ${filename}`);
    return null;
  }

  let fm = fmMatch[2];

  // Rename date → pubDate
  fm = fm.replace(/^date:/m, 'pubDate:');

  // Remove draft field
  fm = fm.replace(/^draft:.*\n/m, '');

  // Add description if missing
  if (!/^description:/m.test(fm)) {
    const desc = extractDescription(content);
    if (desc) {
      fm += `description: "${desc}"\n`;
    } else {
      console.warn(`  ⚠ Could not extract description for ${filename} — using title`);
      const titleMatch = fm.match(/^title:\s*"?(.+?)"?\s*$/m);
      const title = titleMatch ? titleMatch[1] : filename;
      fm += `description: "${title}"\n`;
    }
  }

  return content.replace(fmMatch[0], `---\n${fm}---\n`);
}

const files = readdirSync(STAGING).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
console.log(`Processing ${files.length} files...\n`);

let ok = 0, skipped = 0;

for (const file of files) {
  const srcPath = join(STAGING, file);
  const destPath = join(BLOG, file);

  const content = readFileSync(srcPath, 'utf8');
  const fixed = fixFrontmatter(content, file);

  if (!fixed) {
    skipped++;
    continue;
  }

  writeFileSync(srcPath, fixed, 'utf8');
  renameSync(srcPath, destPath);
  console.log(`  ✓ ${file}`);
  ok++;
}

console.log(`\nDone: ${ok} moved, ${skipped} skipped.`);

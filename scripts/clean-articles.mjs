import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { basename } from 'path';

const BLOG_DIR = new URL('../src/content/blog', import.meta.url).pathname;

function cleanArticle(content) {
  // Split frontmatter from body
  const fmMatch = content.match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/);
  if (!fmMatch) return content;

  const frontmatter = fmMatch[1];
  let body = fmMatch[2];

  // 1. Remove leading h1 title + optional subtitle line(s) + hr separator
  //    Pattern: \n# Title\n\n[optional non-heading lines]\n\n* * *\n\n
  //    The hr in these articles is "* * *" (with spaces)
  body = body.replace(
    /^\n?# [^\n]+\n\n(?:[^#\n][^\n]*\n\n)?\* \* \*\n\n/,
    '\n'
  );

  // 2. Remove the "### Title\n\n#### Subtitle\n\n" block that appears early
  //    after the hero image attribution. It's always the first ### heading.
  //    Only remove if it's the very first ### in the body (within the opening section).
  body = body.replace(
    /^([\s\S]{0,400}?)\n### [^\n]+\n\n(?:#### [^\n]+\n\n)?/,
    (match, before) => before + '\n'
  );

  // 3. Remove Medium footer boilerplate:
  //    "By [Mark Jamison]..." through end of file
  //    Also handles any DDI/publication ads that precede it
  body = body.replace(
    /\n+(?:(?:Apply to be|Work with|Subscribe to)[^\n]+\n+)*By \[Mark Jamison\][\s\S]*$/,
    '\n'
  );

  return frontmatter + body;
}

const files = await glob(`${BLOG_DIR}/*.md`);
let count = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const cleaned = cleanArticle(original);
  if (cleaned !== original) {
    writeFileSync(file, cleaned);
    console.log(`Cleaned: ${basename(file)}`);
    count++;
  } else {
    console.log(`Unchanged: ${basename(file)}`);
  }
}

console.log(`\nDone. Updated ${count} files.`);

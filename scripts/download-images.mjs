import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';
import { glob } from 'glob';

const BLOG_DIR = new URL('../src/content/blog', import.meta.url).pathname;
const PUBLIC_IMAGES_DIR = new URL('../public/images/blog', import.meta.url).pathname;

const IMAGE_PATTERN = /!\[([^\]]*)\]\((https:\/\/cdn-images-1\.medium\.com\/[^\)]+)\)/g;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  'Referer': 'https://medium.com/',
};

async function downloadImage(url, destPath, retries = 8) {
  if (existsSync(destPath)) {
    console.log(`  Already exists: ${basename(destPath)}`);
    return true;
  }
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      writeFileSync(destPath, Buffer.from(buffer));
      console.log(`  Downloaded: ${basename(destPath)}`);
      await sleep(3000);
      return true;
    }
    if (res.status === 429) {
      const delay = 180000; // 3 minutes between retries
      console.log(`  Rate limited, waiting ${delay / 1000}s (attempt ${attempt + 1}/${retries})...`);
      await sleep(delay);
      continue;
    }
    console.error(`  Failed to download ${url}: ${res.status}`);
    return false;
  }
  console.error(`  Giving up on ${url} after ${retries} retries`);
  return false;
}

function getExtensionFromContentType(contentType) {
  if (!contentType) return '.jpg';
  if (contentType.includes('jpeg')) return '.jpg';
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('gif')) return '.gif';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('svg')) return '.svg';
  return '.jpg';
}

async function getImageExtension(url, urlFilename) {
  const ext = extname(urlFilename);
  if (ext) return ext;
  // No extension in URL — HEAD request to determine content type
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const ct = res.headers.get('content-type');
    return getExtensionFromContentType(ct);
  } catch {
    return '.jpg';
  }
}

async function processFile(filePath) {
  const slug = basename(filePath, '.md');
  const content = readFileSync(filePath, 'utf8');

  const imageDir = join(PUBLIC_IMAGES_DIR, slug);
  let newContent = content;
  let firstImagePath = null;
  let imageIndex = 0;

  // Collect all matches first
  const matches = [...content.matchAll(IMAGE_PATTERN)];
  if (matches.length === 0) return;

  console.log(`\nProcessing: ${slug} (${matches.length} image(s))`);
  mkdirSync(imageDir, { recursive: true });

  for (const match of matches) {
    const [fullMatch, altText, url] = match;
    const urlFilename = basename(new URL(url).pathname);
    const ext = await getImageExtension(url, urlFilename);
    // Use index-based filename to avoid collisions with repeated filenames
    const localFilename = `image-${imageIndex}${ext}`;
    const destPath = join(imageDir, localFilename);
    const publicPath = `/images/blog/${slug}/${localFilename}`;

    const ok = await downloadImage(url, destPath);
    if (!ok) continue;

    // Replace in content
    const newTag = `![${altText}](${publicPath})`;
    newContent = newContent.replace(fullMatch, newTag);

    if (firstImagePath === null) {
      firstImagePath = publicPath;
    }
    imageIndex++;
  }

  // Update heroImage in frontmatter if we have at least one image
  if (firstImagePath) {
    // Check if heroImage already set
    if (/^heroImage:/m.test(newContent)) {
      newContent = newContent.replace(/^heroImage:.*$/m, `heroImage: "${firstImagePath}"`);
    } else {
      // Insert after last frontmatter field (before closing ---)
      newContent = newContent.replace(/^(---\n[\s\S]*?)(---)/, (_, front, close) => {
        return `${front}heroImage: "${firstImagePath}"\n${close}`;
      });
    }
  }

  writeFileSync(filePath, newContent);
  console.log(`  Updated frontmatter heroImage: ${firstImagePath}`);
}

const files = await glob(`${BLOG_DIR}/*.md`);
for (const file of files) {
  await processFile(file);
}

console.log('\nDone!');

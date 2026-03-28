import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { join, basename } from 'path'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const INPUT_DIR = './medium-export/posts'
const OUTPUT_DIR = './src/content/blog'

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
td.use(gfm)

const files = await readdir(INPUT_DIR)
const htmlFiles = files.filter(f => f.endsWith('.html'))

await mkdir(OUTPUT_DIR, { recursive: true })

for (const file of htmlFiles) {
  const html = await readFile(join(INPUT_DIR, file), 'utf-8')

  // Extract title from <title> tag
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? 'Untitled'

  // Extract publish date from the filename (medium uses timestamp prefixes)
  const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]

  // Strip Medium UI chrome - just keep the article body
  const bodyMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/)
  const body = bodyMatch ? bodyMatch[1] : html

  const markdown = td.turndown(body)

  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
draft: false
---

`

  const slug = basename(file, '.html').replace(/^\d{4}-\d{2}-\d{2}_/, '').toLowerCase()
  await writeFile(join(OUTPUT_DIR, `${slug}.md`), frontmatter + markdown)
  console.log(`✓ ${file} → ${slug}.md`)
}

console.log(`\nDone! ${htmlFiles.length} articles converted.`)
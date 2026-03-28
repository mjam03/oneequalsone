# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build production site to ./dist/
npm run preview   # Preview built site locally
npm run astro     # Run Astro CLI commands
```

No test or lint commands are configured.

## Architecture

An **Astro** blog site ("One Equals One") migrated from Medium. Uses static site generation with content collections for type-safe blog management.

**Stack:** Astro 6 + MDX + RSS + Sitemap integrations. Node >=22.12.0.

**Content pipeline:** Blog posts live in `src/content/blog/` as `.md` or `.mdx` files. The schema is defined in `src/content.config.ts` — required frontmatter fields are `title`, `description`, and `pubDate` (date); optional are `updatedDate` and `heroImage`.

**Migration scripts** in `scripts/`:
- `migrate.mjs` — converts HTML from `medium-export/posts/` to Markdown in `src/content/blog/`
- `migrate-staging.mjs` — processes files from `src/content/blog-staging/`, fixes frontmatter (`date` → `pubDate`, removes `draft`, adds auto-extracted `description`), and moves them to `src/content/blog/`

**Site metadata** (`SITE_TITLE`, `SITE_DESCRIPTION`) is in `src/consts.ts`. The `site` URL in `astro.config.mjs` is currently a placeholder (`https://example.com`) and needs updating.

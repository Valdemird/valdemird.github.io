# valdemird.com

Personal website and blog built with Astro 6. Live at [valdemird.com](https://valdemird.com).

## Tech Stack

- **Framework**: [Astro 6](https://astro.build) — static site generation with file-based routing
- **Content**: MDX with interactive components (tabs, collapsibles, charts, code blocks, diagrams)
- **Styling**: OKLch color system with CSS custom properties, dark mode, editorial typography
- **Fonts**: Fraunces (serif display), Geist (sans body), Geist Mono (code) — self-hosted via Fontsource
- **i18n**: English (default) and Spanish, using Astro's built-in routing
- **OG Images**: Programmatic generation at build time via Satori + Sharp
- **Deployment**: GitHub Pages via GitHub Actions

## Architecture

```
src/
├── components/
│   ├── BaseHead.astro         # <head>: meta, fonts, JSON-LD, hreflang, OG tags, security headers
│   ├── Header.astro           # Sticky glass navbar with i18n switcher, dark mode toggle, mobile menu
│   ├── Footer.astro           # Minimal footer with social links
│   ├── ProjectCard.astro      # Project showcase with live iframe preview + mouse parallax
│   ├── PostPreview.astro      # Blog post card with accent bar and locale-aware dates
│   ├── FormattedDate.astro    # Locale-aware date formatter (en-US / es-ES)
│   └── blog/
│       ├── Callout.astro      # Colored callout blocks (tip/warning/note/important)
│       ├── CodeBlock.astro    # Code block with filename header + copy button
│       ├── Tabs.astro         # Tab container with animated underline indicator
│       ├── TabPanel.astro     # Tab content panel with fade-in transition
│       ├── Collapsible.astro  # Expandable/collapsible section
│       ├── FileTree.astro     # Interactive file tree with expand/collapse and highlighting
│       ├── CopyableCommand.astro  # Inline terminal command with one-click copy
│       ├── MermaidDiagram.astro   # Lazy-loaded Mermaid.js diagrams
│       ├── InteractiveChart.astro # Animated bar charts with hover tooltips
│       └── ReadingProgress.astro  # Scroll-driven reading progress bar
├── content/
│   └── blog/
│       ├── *.mdx              # English posts
│       └── es/*.mdx           # Spanish posts (same slug, es/ prefix in content id)
├── fonts/
│   └── Free*.ttf              # Bundled fonts for OG image generation
├── layouts/
│   └── BlogPost.astro         # Blog post layout: JSON-LD BlogPosting, hreflang pairing,
│                               # locale-aware dates, dynamic OG image fallback
├── lib/
│   └── og-fonts.ts            # Cached font loader for Satori OG image generation
├── pages/
│   ├── index.astro            # Landing: hero with parallax terminal + tech marquee + projects + posts
│   ├── about.astro            # About: timeline, skills grid, certifications, beliefs
│   ├── 404.astro              # Bilingual 404 page with locale detection
│   ├── blog/
│   │   ├── index.astro        # Blog listing with featured post highlight
│   │   └── [...slug].astro    # Blog post route (uses post.id for static paths)
│   ├── es/                    # Spanish mirrors of all pages
│   │   ├── index.astro
│   │   ├── about.astro
│   │   └── blog/index.astro
│   ├── og/
│   │   ├── [...slug].png.ts   # Dynamic OG image generation per blog post
│   │   └── default.png.ts     # Default OG image for non-blog pages
│   ├── llms.txt.ts            # LLM-friendly site summary (auto-generated from content)
│   ├── llms-full.txt.ts       # Full blog content in plain text for LLM crawlers
│   └── rss.xml.js             # RSS feed
├── styles/
│   └── global.css             # Design tokens (OKLch colors), base styles, animations, dark mode
├── consts.ts                  # Site config, i18n strings, social links, projects, locale detection
└── content.config.ts          # Content Layer schema (Zod validation for blog frontmatter)

public/
├── favicon.svg                # SVG favicon (dark bg, white "v", indigo dot)
├── robots.txt                 # Allows all crawlers, references sitemap + llms.txt
└── site.webmanifest           # PWA manifest
```

## Content System

Blog posts are MDX files with validated frontmatter:

```yaml
---
title: "Post Title"
description: "A compelling hook, not a summary."
pubDate: 2026-03-14
tags: ["tag1", "tag2"]
featured: false
lang: en  # or es
---
```

Every post should exist in both languages with matching slugs:
- `src/content/blog/my-post.mdx` (English, `lang: en`)
- `src/content/blog/es/my-post.mdx` (Spanish, `lang: es`)

The `lang` field drives `<html lang>`, hreflang alternate pairing, locale-aware date formatting, and the language switcher in the header.

## i18n Routing

The site uses two URL patterns depending on page type:

| Page Type | English | Spanish |
|-----------|---------|---------|
| Static pages | `/`, `/about/`, `/blog/` | `/es/`, `/es/about/`, `/es/blog/` |
| Blog posts | `/blog/my-post/` | `/blog/es/my-post/` |

Blog posts use the content `id` as the route slug. Since Spanish posts live in `src/content/blog/es/`, their id includes the `es/` prefix naturally. The locale detection in `getLocale()` handles both patterns.

## SEO & Discoverability

The site implements a comprehensive SEO strategy for both traditional search engines and LLM crawlers:

- **Structured Data**: JSON-LD on every page — `WebSite` + `Person` schema for general pages, `BlogPosting` schema for posts (with author, datePublished, dateModified, keywords)
- **Open Graph**: Full OG tags including `og:type` (`website` vs `article`), `og:locale` with alternates, `article:published_time`, `article:tag`
- **Hreflang**: Bidirectional `en` ↔ `es` alternates + `x-default` on all pages, auto-generated for blog post pairs
- **OG Images**: Every blog post gets a programmatically generated 1200x630 card image (Satori + Sharp) with title, date, tags, and branding. Non-blog pages fall back to a generic card.
- **LLM Crawling**: `/llms.txt` provides a structured site summary; `/llms-full.txt` provides full post content in plain text — both auto-generated from the content collection at build time
- **Meta Tags**: Canonical URLs, `article:author`, Twitter cards (`summary_large_image`), `meta author`, referrer policy
- **Feeds**: RSS (`/rss.xml`), Sitemap (`/sitemap-index.xml`)
- **Security**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` via meta tags

## Design System

Full documentation in `.claude/docs/DESIGN_SYSTEM.md`. Key principles:

- **Colors**: OKLch color space with CSS custom properties. Transparency via `oklch(from var(--token) l c h / alpha)`.
- **Typography**: Fraunces (serif) for headings, Geist (sans) for body, Geist Mono for code/meta/tags.
- **Dark Mode**: Dual selector strategy — `[data-theme='dark']` for explicit choice + `@media (prefers-color-scheme: dark)` for system preference. Flash prevention via inline script in `<head>`.
- **Animations**: Entrance animations on every page. Sections below the fold use Intersection Observer with cleanup on View Transitions. Spring easing for hover interactions.
- **View Transitions**: Astro `ClientRouter` with `astro:after-swap` re-initialization and `astro:before-swap` cleanup to prevent memory leaks.

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at localhost:4321
npm run build        # TypeScript check + production build
npm run preview      # Preview production build locally
```

The build generates static HTML, programmatic OG images, RSS feed, sitemap, and LLM content files. Deployed automatically to GitHub Pages on push to `main` via `.github/workflows/deploy.yml` (Node 22, `withastro/action@v2`).

## Adding a New Blog Post

1. Create `src/content/blog/<slug>.mdx` (English) and `src/content/blog/es/<slug>.mdx` (Spanish)
2. Include required frontmatter: `title`, `description`, `pubDate`, `tags`, `lang`
3. Use filenames that match between languages (hreflang pairing is automatic based on slug)
4. Import and use MDX components (Callout, CodeBlock, Tabs, etc.) for interactivity
5. Run `npm run build` to verify compilation, OG image generation, and hreflang links

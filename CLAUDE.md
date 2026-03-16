# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project

Personal website/blog at valdemird.com, built with Astro 6 and deployed to GitHub Pages via GitHub Actions.

## Commands

- **Dev server**: `npm run dev` (localhost:4321)
- **Build**: `npm run build` (runs `astro check` for TypeScript validation, then `astro build`)
- **Preview production build**: `npm run preview`
- **Astro CLI**: `npx astro <command>`

There are no tests or linting configured.

## Architecture

- **Astro 6 static site** with file-based routing (`src/pages/`), MDX support, View Transitions (`ClientRouter`), and auto-generated sitemap
- **Content Layer API** (`src/content.config.ts`) with `glob()` loader — blog posts use frontmatter: `title`, `description`, `pubDate` (required), `updatedDate`, `heroImage`, `tags`, `featured`, `lang` (optional)
- **i18n**: Built-in Astro routing with `en` (default, no prefix) and `es` (`/es/` prefix). UI strings in `src/consts.ts`
- **Dynamic routes** for blog posts via `src/pages/blog/[...slug].astro` using `getStaticPaths()` with `post.id` (not slug)
- **Layouts**: `BlogPost.astro` layout with reading progress bar, editorial typography, and SEO metadata
- **MDX Components**: `Callout` (tip/warning/note/important), `CodeBlock` (with filename + copy button) — imported in `.mdx` files
- **Global constants** (site title, i18n strings, social links, projects) in `src/consts.ts`
- **Styling**: OKLch color system in `src/styles/global.css` with CSS custom properties, dark mode via `data-theme` attribute
- **Fonts**: Fraunces (serif display), Geist (sans body), Geist Mono (code/meta) — loaded from Google Fonts
- **Deployment**: Push to `main` triggers `.github/workflows/deploy.yml` (Node 22, `withastro/action@v2`)

## Design System

**IMPORTANT**: Read `.claude/docs/DESIGN_SYSTEM.md` before making any visual changes. It defines:
- Color tokens (OKLch), typography scale, spacing system
- Animation patterns (entrance, hover, scroll-triggered)
- Component patterns (glass navbar, page heroes, tags/badges)
- Interaction standards (spring easing, shadow on hover, staggered reveals)

The landing page sets the visual standard — all pages must match its level of polish.

### Key Rules

- **Colors**: Always use CSS variables from global.css. For transparency, use `oklch(from var(--token) l c h / alpha)`.
- **Animations**: Every page needs entrance animations. Sections below fold use Intersection Observer.
- **Hover states**: Every interactive element gets `transform + shadow + border-color` with `--ease-spring`.
- **Typography**: Headings = Fraunces (serif). Body = Geist (sans). Labels/meta/tags = Geist Mono.
- **View Transitions**: Scripts must re-initialize on `astro:after-swap` event.
- **Dark mode**: Both `[data-theme='dark']` and `@media (prefers-color-scheme: dark)` selectors needed.

## File Structure

```
src/
├── components/
│   ├── BaseHead.astro        # <head> meta, fonts, View Transitions, dark mode script
│   ├── Header.astro          # Glass navbar with i18n, dark mode toggle, mobile menu
│   ├── Footer.astro          # Minimal footer with social links
│   ├── ProjectCard.astro     # Project showcase with live iframe preview
│   ├── PostPreview.astro     # Blog post preview card with accent bar
│   ├── FormattedDate.astro   # Date formatter
│   └── blog/
│       ├── Callout.astro     # MDX callout (tip/warning/note/important)
│       ├── CodeBlock.astro   # MDX code block with filename + copy
│       └── ReadingProgress.astro  # Scroll progress bar
├── content/
│   └── blog/
│       ├── *.mdx             # English posts
│       └── es/*.mdx          # Spanish posts
├── layouts/
│   └── BlogPost.astro        # Blog post layout with editorial typography
├── pages/
│   ├── index.astro           # Landing: hero + terminal + marquee + projects + posts
│   ├── about.astro           # About page with beliefs cards
│   ├── blog/
│   │   ├── index.astro       # Blog list with featured post
│   │   └── [...slug].astro   # Blog post route
│   ├── es/                   # Spanish mirrors
│   └── rss.xml.js            # RSS feed
├── styles/
│   └── global.css            # Design tokens, base styles, animations
├── consts.ts                 # Site config, i18n strings, social links, projects
└── content.config.ts         # Content Layer API schema
```

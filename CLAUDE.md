# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project

Personal website/blog at valdemird.com, built with Astro 6 and deployed to GitHub Pages via GitHub Actions.

## Blog Content Rules

**IMPORTANT**: Always use the `/blog-writer` skill for ANY action involving blog content — creating, editing, auditing, translating, or improving posts. This ensures consistent voice, proper use of MDX components, and bilingual quality.

### New Blog Post Checklist

When adding a new blog post, ensure ALL of the following:
- Create both EN (`src/content/blog/<slug>.mdx`) and ES (`src/content/blog/es/<slug>.mdx`) versions
- Include `lang: en` or `lang: es` in frontmatter — this drives `<html lang>` and hreflang pairing
- Hreflang alternates are auto-generated in `BlogPost.astro` by matching EN/ES pairs via slug, so filenames must match between languages
- Verify `og:type="article"` is applied (handled automatically via `BlogPost.astro` → `BaseHead type="article"`)
- Run `npm run build` to confirm both posts compile and hreflang links are correct

## Learn Track (agentic-systems course)

The `/learn/agentic-systems/` modules (`src/content/learn/*.mdx`, ES in `src/content/learn/es/`) follow an **easy→deep ramp**: a beginner starts gently and can drill as deep as they want without the prose losing rigor or references. Authoring rules:

- **Plain-language first, formal name second.** No hard term, symbol, or notation may appear cold in a title, `summary`, opening sentence, or headline `Callout`. Open with an intuition or analogy and the one plain claim; introduce the formalism only after, as a "here's what experts call this" turn.
- **`summary` frontmatter (Layer 0).** Every module gets a `summary: string[]` of 1–3 jargon-free sentences. It renders above the body via `<TLDR>` (wired in `LearnModule.astro`). It is distinct from `tldr`, which feeds the end-of-module `LearnRecall` check — keep both.
- **Gloss hard terms at first use with `<Term name="...">`.** The master glossary lives in `src/lib/learn-glossary.ts` (inline tooltip + glossary page); `<Term>` fails open (renders plain text) if the headword is missing. Decode notation in prose (e.g. read `π(a|o,h)` as "the next action *given* what it's seen").
- **Deep-dives go in `<Collapsible>`.** Proofs, derivations (εT², `p^t` caveats), research-camp disputes, and edge cases are demoted behind a labeled control — never deleted. Demotion ≠ deletion: the precise notation and its citation stay reachable in one click.
- Apply every change to **both** EN and ES (paired filenames); write the ES natively with `/blog-writer`, don't machine-translate. Run `npm run build` (validates `astro check` + hreflang reciprocity).

## Commands

- **Dev server**: `npm run dev` (localhost:4321)
- **Build**: `npm run build` (runs `astro check` for TypeScript validation, then `astro build`)
- **Preview production build**: `npm run preview`
- **Astro CLI**: `npx astro <command>`

There are no tests or linting configured.

## Architecture

- **Astro 6 static site** with file-based routing (`src/pages/`), MDX support, View Transitions (`ClientRouter`), and auto-generated sitemap
- **Content Layer API** (`src/content.config.ts`) with `glob()` loader — blog posts use frontmatter: `title`, `description`, `pubDate` (required), `updatedDate`, `heroImage`, `heroImageAlt`, `tags`, `featured`, `lang`, `tldr` (optional). If `heroImage` is set, always set `heroImageAlt` in the post's language.
- **i18n**: Built-in Astro routing with `en` (default, no prefix) and `es` (`/es/` prefix). UI strings in `src/consts.ts`
- **Dynamic routes** for blog posts via `src/pages/blog/[...slug].astro` using `getStaticPaths()` with `post.id` (not slug)
- **Layouts**: `BlogPost.astro` layout with reading progress bar, editorial typography, and SEO metadata
- **MDX Components**: `Callout` (tip/warning/note/important), `CodeBlock` (with filename + copy button), `Sidenote` (short editorial margin note — see usage rule below) — imported in `.mdx` files
- **Sidenote usage**: use `<Sidenote>...</Sidenote>` mid-sentence for quick context, references, mini-opinions, clarifications. Renders as an auto-numbered superscript button; click reveals the note inline below the paragraph. Keep notes to 1–2 sentences — if it needs a paragraph, leave it inline or promote it to a `Callout`. Do NOT add visual containers (boxes, borders, washes) to the sidenote — the minimal style is intentional.
- **Global constants** (site title, i18n strings, social links, projects) in `src/consts.ts`
- **Styling**: OKLch color system in `src/styles/global.css` with CSS custom properties, dark mode via `data-theme` attribute
- **Fonts**: Fraunces (serif display), Geist (sans body), Geist Mono (code/meta) — loaded from Google Fonts
- **Deployment**: Push to `main` triggers `.github/workflows/deploy.yml` (Node 22, `withastro/action@v5`). This is the ONLY deploy workflow — do not add a second one.
- **Component lab**: `/lab` (EN) and `/es/lab/` (ES) are public, indexed, bilingual galleries (linked from the site nav) that render every blog component live (real global.css, dark mode, GSAP, View Transitions). Shared markup lives in `LabIndexPage.astro`/`LabComponentPage.astro` under `src/components/pages/`; route files are thin shells. One demo file per component in `src/components/lab/demos/<Name>.demo.astro`; each exports `meta` (title, category, status, `summary`/`summaryEs`, props, and editorial `why`/`whyEs` paragraphs written with `/blog-writer`) and reads `const { lang = 'en' } = Astro.props` to localize its DemoSection labels/descriptions/captions with `es ? ... : ...`. The lab is reader-facing: `props` and `usage` metadata stay in the demo source for maintainers but are NOT rendered, and public copy must not expose project internals (libraries, plugins, CSS plumbing). When you CREATE or materially CHANGE a blog component, update its demo file in the same change. Inside a demo, import the component under an alias (the filename claims the component's own name).
- **Charts**: `InteractiveChart` supports bar/horizontal/line/area/donut/scatter, multi-series with legend toggling, thresholds, monotone curves, hover scrub + keyboard nav. Build-time math uses d3-scale/d3-shape/d3-array in `src/lib/chart/` (never ship d3 to the client); client interactivity lives in `src/lib/chart/interact.ts`.
- **Smoke test**: `npm run build` runs `scripts/check-dist.mjs` (postbuild) — validates internal links, hreflang reciprocity, OG images and RSS in `dist/`.
- **Comments**: Giscus embed via `Comments.astro`, mapped per-pathname. Threads live in the separate public repo `Valdemird/valdemird-comments` (this blog repo stays private). Moderation is GitHub-native: open the Discussions tab on `valdemird-comments` → hide / lock / ban offending replies. Categories are "Announcements" type, so only the maintainer can open threads — visitors only reply. To switch comment repos or category later, edit `REPO`, `REPO_ID`, `CATEGORY`, `CATEGORY_ID` constants at the top of `Comments.astro`.

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

### Visual Hierarchy: No Left Accent Bars

**This is a hard rule.** A colored vertical bar on the left edge of a block (Callout, blockquote, TLDR, featured card, sidenote, anything) is a recognizable AI design tell — it shows up in every Notion-shaped, Linear-shaped, Vercel-docs-shaped interface generated by an LLM. This site does not use that pattern. When you reach for `border-left: Npx solid var(--color-accent)` on a card-like element, stop and pick a different mechanism.

**Preferred mechanisms for marking categorical or emphatic blocks:**

1. **Eyebrow labels** — `font-family: var(--font-mono)`, `font-size: ~0.68rem`, `text-transform: uppercase`, `letter-spacing: ~0.14em`, color set to the relevant accent. The label itself (TIP, WARNING, NOTE, IMPORTANT, TL;DR, FEATURED) carries the category. See `Callout.astro`, `TLDR.astro`, blog index "FEATURED" badge.
2. **Tinted background washes** — `background: oklch(from var(--accent) l c h / 0.045)` (light mode) / `~0.085` (dark mode). Subtle enough to be ambient, strong enough to read as a block.
3. **Hairline top/bottom rules** — `border-top` and `border-bottom` at `1px solid var(--color-border)` to frame a block without enclosing it. Used in `TLDR.astro` and `PullQuote.astro`.
4. **Italic Fraunces + horizontal indent** — for blockquotes and pull-quotes. `font-style: italic; padding-left: 1.75em;` with no border. The serif italic + indent is the classical typographic blockquote.
5. **Centered short hairlines** — short horizontal accent lines (`width: ~2.75rem; height: 1px`) above and below a pulled element, like a magazine pull-quote frame. See `PullQuote.astro`.

**What NOT to do:**

- `border-left: 3px solid var(--color-accent)` on `.callout`, `.tldr`, `.tldr-like`, `.featured-*`, `.sidenote`, `blockquote`, or any similar block element.
- Gradient vertical bars on hover (e.g. the old `.featured-accent` on blog index).
- Any element whose entire purpose is being a colored vertical strip at the left edge of another block.

**If you must mark a left edge** (rare, e.g. an actual "draft mode" indicator), use a marker outside the content flow — a small mono label in the upper-left corner, a top-aligned numerical anchor, or an outset typographic mark — never a continuous colored vertical line.

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

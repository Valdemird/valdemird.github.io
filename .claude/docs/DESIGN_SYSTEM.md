# Design System — valdemird.com

This document defines the visual identity and interaction patterns for valdemird.com. Every page and component MUST follow these guidelines to maintain coherence.

## Aesthetic Direction

**Tone**: Refined technical editorial — the site itself is the portfolio. Every detail demonstrates craft.

**Keywords**: Glass morphism, spring easing, staggered reveals, monospace accents, generous whitespace, gradient depth.

**What makes it memorable**: The floating terminal with parallax, glass navbar, gradient orb backgrounds, and the consistent micro-interactions that make every hover feel deliberate.

---

## Color System (OKLch)

All colors use the OKLch color space. Never use hex, rgb, or hsl.

### Core Tokens (defined in `src/styles/global.css`)

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-bg` | `oklch(0.99 0 0)` | `oklch(0.16 0.01 260)` | Page background |
| `--color-bg-secondary` | `oklch(0.96 0 0)` | `oklch(0.2 0.01 260)` | Card backgrounds, code blocks |
| `--color-surface` | `oklch(1 0 0)` | `oklch(0.22 0.015 260)` | Elevated surfaces |
| `--color-text` | `oklch(0.18 0.01 260)` | `oklch(0.93 0.005 260)` | Primary text, headings |
| `--color-text-secondary` | `oklch(0.45 0.01 260)` | `oklch(0.7 0.01 260)` | Body text, descriptions |
| `--color-text-muted` | `oklch(0.6 0.01 260)` | `oklch(0.5 0.01 260)` | Meta, labels, placeholders |
| `--color-accent` | `oklch(0.55 0.15 260)` | `oklch(0.7 0.12 260)` | Links, active states, primary accent |
| `--color-accent-subtle` | `oklch(0.95 0.02 260)` | `oklch(0.24 0.025 260)` | Accent backgrounds, tag fills |
| `--color-success` | `oklch(0.6 0.18 145)` | `oklch(0.65 0.16 145)` | Status, positive states |
| `--color-warning` | `oklch(0.75 0.15 75)` | `oklch(0.78 0.13 75)` | Caution states |
| `--color-border` | `oklch(0.9 0.005 260)` | `oklch(0.3 0.015 260 / 0.5)` | Subtle borders |
| `--color-border-strong` | `oklch(0.82 0.01 260)` | `oklch(0.4 0.015 260)` | Hover borders |

### Transparency Pattern

When you need a color with transparency, use the `oklch(from <var> l c h / <alpha>)` syntax:

```css
/* Good */
background: oklch(from var(--color-surface) l c h / 0.6);
border: 1px solid oklch(from var(--color-border) l c h / 0.4);

/* Bad — never hardcode raw oklch values */
background: oklch(0.22 0.015 260 / 0.6);
```

### Browser Chrome Colors (terminal dots, preview bars)

These are the only acceptable hardcoded colors — used for macOS-style window chrome:

```css
/* Traffic light dots — always these exact values */
.dot-close:    oklch(0.65 0.2 27);    /* red */
.dot-minimize: oklch(0.78 0.15 85);   /* yellow */
.dot-maximize: oklch(0.6 0.18 145);   /* green */
```

---

## Typography

### Font Stack

| Role | Font | Variable | Usage |
|---|---|---|---|
| Display / Headings | Fraunces | `--font-serif` | h1, h2, h3, card titles, logo |
| Body / UI | Geist | `--font-sans` | Body text, nav, buttons, subtitles |
| Code / Meta | Geist Mono | `--font-mono` | Code, tags, labels, section numbers, badges, URLs |

### Heading Scale

```css
h1: clamp(2.2rem, 5vw, 3.2rem)    /* standard pages */
h1: clamp(3.2rem, 8vw, 5.5rem)    /* hero/landing only */
h2: clamp(1.6rem, 3.5vw, 2.2rem)
h3: clamp(1.3rem, 2.5vw, 1.7rem)
```

### Monospace as Visual Accent

A key part of the identity is using monospace (`--font-mono`) for:
- Section numbers (`01`, `02`)
- Labels (`Blog`, `About`, `LIVE`)
- Tags and badges
- Meta information (dates, reading time)
- URLs and file paths

This creates a "technical editorial" feel. Always use `font-family: var(--font-mono)` for these elements.

---

## Spacing

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | 0.25rem | Tiny gaps |
| `--space-sm` | 0.5rem | Compact gaps, inner padding |
| `--space-md` | 1rem | Standard gap |
| `--space-lg` | 1.5rem | Card padding, section gaps |
| `--space-xl` | 2.5rem | Section headers, large gaps |
| `--space-2xl` | 4rem | Between major sections |

### Page Padding Rules

- Hero sections: `6rem top, 4rem bottom` on desktop, `3rem top, 2.5rem bottom` on mobile
- Content sections: `5rem` vertical padding on desktop, `3rem` on mobile
- Side padding: Always `var(--space-lg)` (1.5rem)

---

## Shadows

| Token | Usage |
|---|---|
| `--shadow-sm` | Subtle elevation (nav on scroll) |
| `--shadow-md` | Hover states on buttons/links |
| `--shadow-lg` | Card hover states, terminal |
| `--shadow-xl` | Hero terminal, max elevation |

**Rule**: Every interactive card should gain shadow on hover. Use `--shadow-md` minimum for hover states.

---

## Animation & Motion

### Easing

| Variable | Value | Usage |
|---|---|---|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Hover lifts, bouncy interactions |
| `--ease-smooth` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Fade-ins, color transitions |

### Duration

| Variable | Value | Usage |
|---|---|---|
| `--duration-fast` | 150ms | Color changes, opacity |
| `--duration-normal` | 250ms | Transforms, borders |
| `--duration-slow` | 400ms | Background gradients |

### Entrance Animations

Every page MUST use staggered entrance animations for its main content:

```css
.animate-fade-in { animation: fadeIn 0.6s var(--ease-smooth) both; }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
```

### Scroll-Triggered Reveals

Sections below the fold MUST use Intersection Observer to fade in:

```css
.section {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.7s var(--ease-smooth), transform 0.7s var(--ease-smooth);
}
.section.visible {
    opacity: 1;
    transform: translateY(0);
}
```

```js
const observer = new IntersectionObserver(
    (entries) => { entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    }); },
    { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
);
document.querySelectorAll('.section').forEach(s => observer.observe(s));
```

### Hover State Pattern

Every interactive element follows this pattern:

```css
.interactive-element {
    transition: all var(--duration-normal) var(--ease-spring);
}
.interactive-element:hover {
    transform: translateY(-2px);      /* or translateX(4px) for horizontal */
    box-shadow: var(--shadow-md);
    border-color: var(--color-accent); /* when applicable */
}
```

---

## Component Patterns

### Page Hero

Every page (not just landing) has a hero area with:
1. A subtle grid pattern background with radial mask
2. A monospace label (e.g., `Blog`, `About`)
3. The page title
4. Entrance animation

```css
.hero-grid {
    background-image:
        linear-gradient(var(--color-border) 1px, transparent 1px),
        linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: 0.25;
    mask-image: radial-gradient(ellipse 70% 80% at 50% 60%, black 10%, transparent 70%);
}
```

### Tags/Badges

Two variants:

```css
/* Content tag (blog posts, tech stack) */
.tag {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 500;
    padding: 0.2em 0.55em;
    background: var(--color-accent-subtle);
    border-radius: var(--radius-sm);
    color: var(--color-accent);
}

/* Status badge (LIVE, Featured, section numbers) */
.badge {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}
```

### Glass Effect

Used on navbar and floating elements:

```css
background: oklch(from var(--color-bg) l c h / 0.65);
backdrop-filter: blur(16px) saturate(1.4);
-webkit-backdrop-filter: blur(16px) saturate(1.4);
```

### Section Headers (with number)

```html
<div class="section-header">
    <span class="section-label">01</span>
    <h2>Section Title</h2>
    <div class="section-line"></div>
</div>
```

The line uses `linear-gradient(90deg, var(--color-border), transparent)` to fade out.

---

## Layout Constraints

| Token | Value | Usage |
|---|---|---|
| `--content-width` | 680px | Blog prose, about body |
| `--wide-width` | 960px | Blog list, project grid, hero inner |
| `--full-width` | 1200px | Nav, outer containers |

---

## Responsive Breakpoints

- **768px**: Switch to mobile layout (stack columns, reduce spacing)
- **640px**: Switch to compact mobile (hide nav links, show hamburger)

### Mobile Rules

- Hide decorative elements (floating shapes, grid patterns)
- Reduce hero min-height to auto
- Stack flex layouts to column
- Reduce section padding from 5rem to 3rem

---

## Grain Texture

A subtle SVG noise texture overlays the entire page:

```css
body::after {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    opacity: 0.025;
    /* SVG feTurbulence noise */
}
```

This adds tactile quality. Never remove it.

---

## View Transitions

The site uses Astro's `ClientRouter` for SPA-like page transitions. Scripts that attach event listeners MUST re-initialize on `astro:after-swap`:

```js
function init() { /* setup */ }
init();
document.addEventListener('astro:after-swap', init);
```

---

## Checklist for New Pages/Components

- [ ] Uses CSS variables from global.css (no hardcoded colors)
- [ ] Has entrance animation (fade-in or scroll-triggered)
- [ ] Interactive elements have hover states with spring easing
- [ ] Uses monospace font for meta/labels/numbers
- [ ] Headings use serif font (Fraunces)
- [ ] Has page hero with grid pattern background
- [ ] Respects spacing tokens
- [ ] Shadow on hover for cards/buttons
- [ ] Re-initializes on `astro:after-swap` if using JS
- [ ] Dark mode works correctly

# Inline illustration prompt architect

**Purpose**: prompts for small, in-body illustrations used as a single image breaks up dense text. Applied when `/blog-image --slot inline` is used. Typical size 1024×1024, quality `medium`.

**First — don't generate one.** Inline illustrations are overused. Before invoking `/blog-image --slot inline`, ask: can one of these replace it?

| If you were going to illustrate… | Use this instead |
|---|---|
| A process / workflow / data flow | `MermaidDiagram` |
| A numeric comparison | `InteractiveChart` |
| A project layout | `FileTree` |
| Two options side-by-side | `Tabs` + `TabPanel` |
| A single CLI command | `CopyableCommand` |
| A sequence of steps (later phases) | `StepThroughDiagram` / `Timeline` |
| A stat you want to hit hard | `StatGrid` / `CountUp` |
| A comparative before/after | `BeforeAfter` |
| Optional detail | `Collapsible` |
| Emphasis on a quote | `PullQuote` |

If none of those fit — and only then — reach for a generated inline image.

## Hard rules

1. **Square by default.** 1024×1024 unless there's a structural reason (a vertical timeline graphic, a horizontal comparison). Square inline reads well sandwiched between paragraphs.
2. **Single subject, single purpose.** No composite scenes. The image has one job: to visually anchor the paragraph above it. Complex scenes belong in heroes or in Scrollytelling panels.
3. **No text.** Same rule as heroes. Labels and captions live in the MDX around the image.
4. **Match the post's register.** A technical post = precise, flat, diagrammatic or photorealistic. A narrative post = painterly, editorial. The style anchor chosen for the hero (if there is one) should carry through to inline illustrations in the same post — visual consistency matters.
5. **Alt text discipline.** When inserting the image in MDX, write real alt text: a sentence that describes what the image shows *and* why it's there. `![A cross-section of a mechanical keyboard switch, showing the stem, spring, and housing in contrast — used here to anchor the discussion of tactile feedback.](...)`.

## Required slots (shorter than hero)

| # | Slot | Example |
|---|---|---|
| 1 | **Subject (one thing)** | `a mechanical keyboard switch cut in half, showing stem, spring, and housing` |
| 2 | **Vantage** | `three-quarter view, eye-level, isometric-leaning` |
| 3 | **Lighting** | `clean studio light from upper-left, no harsh shadows` |
| 4 | **Palette** | `2 hues max — dominant neutral with a single accent oklch(0.55 0.18 280)` |
| 5 | **Style anchor** | `technical illustration, pen-and-wash, in the manner of a vintage repair manual` |
| 6 | **Background** | `plain, slightly warm off-white oklch(0.98 0.01 85)` — usually plain and untextured |
| 7 | **No-text line** | `No text anywhere in the image.` |
| 8 | **Negative clause** | `Avoid: 3D renders, glossy plastic, generic product-shot aesthetic, floating particles, abstract tech backgrounds.` |

## Exemplar

```
Draw a 1024×1024 technical illustration of a mechanical keyboard switch cut in half, cross-section view showing the stem, coil spring, and housing layers clearly separated. Vantage: three-quarter isometric, eye-level. Lighting: clean studio, soft key from upper-left, no harsh shadows. Palette: two hues — neutral warm gray oklch(0.65 0.02 80) for the housing and spring, single violet accent oklch(0.55 0.18 280) picking out the stem. Background: plain warm off-white oklch(0.98 0.01 85), no texture. Style: pen-and-wash technical illustration in the manner of a vintage repair manual — precise line weight, restrained color, legible layers. No text anywhere in the image. Avoid: 3D renders, glossy plastic, generic product-shot aesthetic, floating particles, abstract tech backgrounds, glowing edges.
```

## Cost hygiene

Inline images add up fast. If you're considering a second or third inline image in the same post:

- Run them at `--quality low` in draft → $0.006 each.
- Only re-run at `medium` the one(s) the user keeps in the final cut.
- A post with more than 2 generated inline images is usually a post that should have used interactive components — revisit the outline.

## Alt text template (paste this, then fill)

```
![{what the image shows} — {why it's here}](/images/blog/{slug}/{name}.webp)
```

Example:
```
![A cross-section of a mechanical keyboard switch showing the stem, spring, and housing — used to anchor the discussion of tactile feedback below.](/images/blog/why-keyboards-matter/switch-cutaway.webp)
```

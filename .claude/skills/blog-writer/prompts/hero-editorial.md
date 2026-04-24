# Hero-editorial prompt architect

**Purpose**: turn a rough authoring intent into a prompt that produces an image readable as **editorial illustration**, not as AI-generated stock. Applied when `/blog-image --slot hero` is used.

**Audience**: senior engineers, tech leaders. They see hundreds of AI images per week. A generic one betrays the whole post.

## The core problem this template solves

Image models default to **photorealism** and **first-metaphor clichés**. "Hourglass for time", "gavel for judgment", "lightbulb for ideas", "brain with circuits for AI". Combine photorealism with a first-metaphor and you get Adobe Stock, every time.

This template forces three disciplines that kill that failure mode:

1. **Non-photographic medium by default.** Gouache, vector, risograph, ink-and-wash, woodcut, mixed-media collage. Photorealism is allowed *only* as a deliberate choice for a still-life subject, and must be grounded in a named still-life photographer.
2. **Concrete visual anchors, not abstract aspirations.** Name an illustrator, a decade, a specific print tradition — not "editorial" or "high-quality" or "in the manner of a magazine".
3. **Second-metaphor requirement.** The first thing that comes to mind is banned. Write down the first three metaphor ideas for the post's topic, then cross out #1 and pick from #2 or #3. This alone prevents 80% of stock-aesthetic failures.

## Hard rules

1. **Imperative verb first.** Start with `Draw a 1536×1024 …` or `Paint a 1536×1024 …`. Never "create", "generate", "make".
2. **Medium is mandatory and specific.** One of:
   - `gouache illustration on warm paper`
   - `flat vector illustration, limited palette, no gradients`
   - `risograph print, 3-color (violet / amber / black), visible misregistration and grain`
   - `ink-and-wash on tinted paper, visible brush strokes`
   - `woodblock print, limited palette, visible grain and cut marks`
   - `cut-paper collage, visible edges and shadow on each layer`
   - `mixed-media editorial illustration, loose sketch lines plus flat color fills`
   - `photorealistic still-life, studio-lit` (allowed **only** for literal-object subjects and must cite a named photographer — Irving Penn, Mitch Epstein, Todd Hido)
3. **Visual anchor — describe, don't name living artists.** OpenAI's safety system rejects requests that name *living* illustrators ("in the style of Tom Haugomat" → 400). Anchor by **movement, period, or deceased artist** instead, or by **technique description** alone:
   - **Movements / periods (safe)**: 1960s–70s Polish poster movement, Pushpin Studios (1950s–60s), WPA poster aesthetic, Mid-century Penguin cover design, Russian Constructivist posters, 1920s Art Deco magazine covers, 1940s New Yorker spot illustration, 1960s Hornbook children's book plates.
   - **Deceased artists (generally safe)**: Saul Steinberg, Paul Rand, Milton Glaser, Ben Shahn, Tomi Ungerer, Leo Lionni, Maurice Sendak, Edward Gorey, Aubrey Beardsley, Alphonse Mucha.
   - **Living illustrators — describe, don't name.** Instead of "in the style of Christoph Niemann", write *what his work looks like*: "reductive flat-vector illustration, witty negative-space puns, two or three flat hues, sans-serif captions integrated as part of the image". Instead of "in the manner of Malika Favre", write: "bold flat-vector illustration with thick outlines, high-contrast duotone or tritone palette, confident silhouettes, no gradients". This works and passes moderation.
   - Pick **one** anchor (movement OR deceased artist OR description). Three anchors cancel each other out.
4. **No text inside the image.** gpt-image-2 miswrites glyphs. Text goes in MDX overlay or post title. The **only** exception is the `infographic` slot (use `infographic-dataviz.md`).
5. **Reserve ≥25% calm negative space**, specified by quadrant (usually lower-right) so the hero doubles as a social card.
6. **Two mandatory negative clauses** at the end of the prompt, copy-pasted verbatim:

   **Generic-AI clause:**
   ```
   Avoid: glowing blue circuits, binary code rain, silhouettes in hoodies, lightbulbs as ideas, cogs and gears as metaphors, abstract fluid particles, generic "futuristic" cityscapes, stock AI-brain imagery, holographic UI panels, glowing lines tracing across surfaces, neon accents on dark backgrounds.
   ```

   **Stock-photo clause:**
   ```
   Avoid: photorealistic stock-photo aesthetic, soft dramatic spotlight in a dark room, dust motes caught in a light beam, particles floating in sunbeams, heavy bokeh, moody gradient backgrounds, smoke or fog atmosphere, sand or liquid frozen mid-motion, tilt-shift, lens-flare, chromatic aberration.
   ```

   Then add topic-specific bans for first-metaphor clichés relevant to the post (see rule 7).
7. **First-metaphor-ban.** Before writing the prompt, list the 3 most obvious visual metaphors for the post's topic, then **cross out #1** and pick from #2 / #3 or combine them unexpectedly. Examples:
   - Topic "evaluations" → first: scales of justice ❌ · second: a proofreader's red pen over a page · third: a jeweler's loupe inspecting a stone. Use #2 or #3.
   - Topic "stop iterating" → first: hourglass / clock ❌ · second: a painter setting down a brush while the canvas is still half-finished · third: a locksmith walking away from a partly-assembled lock. Use #2 or #3.
   - Topic "deploys" → first: rockets, launch ❌ · second: a dockworker releasing a cargo container · third: a conductor cuing an entrance. Use #2 or #3.
   - Topic "AI agents" → first: robot, brain ❌ · second: a marionette with someone else holding the strings · third: a clerk filling out forms at a counter. Use #2 or #3.
   - Topic "specs" → first: blueprints ❌ · second: a tailor's chalk marks on half-cut fabric · third: a recipe card splattered with use. Use #2 or #3.

## Required slots (all of them, in order)

| # | Slot | Example |
|---|---|---|
| 1 | **Subject (second-metaphor)** | `a painter's hand setting down a flat wide brush on the rim of a paint tin, while the canvas just out of frame shows half-finished work` |
| 2 | **Medium** | `gouache illustration on warm cream paper, visible brush strokes at the edges of flat color shapes` |
| 3 | **Composition** | `asymmetric rule-of-thirds; the hand enters from the upper-left, brush rests at the center-left third, paint tin in the lower-left; ~30% calm negative space across the right half (reserved for overlay text or social-card title)` |
| 4 | **Palette** | `four flat hues: warm cream paper oklch(0.96 0.03 85), deep indigo ink oklch(0.25 0.05 280), warm ochre oklch(0.72 0.13 75), and a single spot of muted vermilion oklch(0.58 0.17 30) on the brush tip` |
| 5 | **Visual anchor** | `flat graphic shapes, confident silhouettes, restrained palette, no gradients, no rendering of texture beyond the paper grain itself — in the tradition of mid-century editorial illustration` (describe; do **not** name a living illustrator — triggers 400 safety reject) |
| 6 | **Linework / texture policy** | `hand-drawn black ink outlines only on the hand and brush, slightly wobbly; shapes are solid flat color; paper grain visible at 100% zoom` |
| 7 | **Mood (2–3 adjectives, concrete)** | `considered, paused, slightly reluctant` |
| 8 | **Text policy** | `No text, letters, numbers, or glyphs anywhere in the image.` |
| 9 | **Generic-AI negative clause** | (copy-paste the block from rule 6) |
| 10 | **Stock-photo negative clause** | (copy-paste the block from rule 6) |
| 11 | **Topic-specific cliché ban** | `Avoid: hourglasses, clocks, stopwatches, finish lines, sprinters, chess pieces, mountain summits.` |

## Optional slots

- **Light (only for non-flat mediums)**: `warm side-light from the right, long raking shadow across the canvas` — but skip for flat vector/gouache where light is stylized.
- **Scale anchor**: `the paint tin is small enough that the hand dwarfs it` — keeps the model from drifting to mis-scaled heroic compositions.
- **Era hint**: `feels like a 1965 Polish film poster` — strong signal that contracts the search space.

## Exemplar — the "when to stop iterating" post

### Weak prompt (what I wrote the first time, produced a stock-aesthetic hourglass)

```
Draw a 1536x1024 landscape editorial illustration. Subject: a brass hourglass tipped on its side mid-fall … Style anchor: editorial illustration in the manner of The Atlantic and Harper's Magazine covers — painterly but precise, visible brushwork kept to a minimum, compositionally disciplined. Mood: quiet, decisive, considered, slightly melancholic. …
```

Why it failed: "The Atlantic" is abstract; the model defaulted to photorealism (never specified a medium); "brass hourglass + amber sand" is first-metaphor #1 and locks the model into stock-photo composition.

### Architected prompt (second-metaphor, specific medium, named anchor)

```
Paint a 1536×1024 landscape editorial illustration.

Subject: an oil painter's hand setting down a flat wide paintbrush on the rim of a half-used paint tin. Just visible at the left edge of the frame: the corner of a canvas on an easel, the painting half-finished — a confident landscape shape with one quadrant still raw gesso. The painter's arm is relaxed, not abandoned. This is the gesture of deciding.

Medium: gouache illustration on warm cream paper. Flat color shapes with visible brush texture at their edges. Hand-drawn ink outlines ONLY on the painter's hand, brush, and paint tin — slightly wobbly, confident. Canvas and easel rendered as pure flat color shapes with no outline.

Composition: asymmetric rule-of-thirds. The hand enters from the upper-left, brush rests on the center-left third, paint tin sits on the lower-left. The entire right half of the image is calm warm cream paper (~45% negative space) with no elements — reserved for overlay post title.

Palette: four flat hues only — warm cream paper oklch(0.96 0.03 85) as background; deep indigo oklch(0.25 0.05 280) for ink outlines and the painter's sleeve; muted ochre oklch(0.72 0.13 75) for the brush handle and canvas exterior; a single spot of muted vermilion oklch(0.58 0.17 30) on the brush tip and in one smeared mark on the paint tin rim. No other colors. No gradients. No shadows under objects.

Visual anchor (described, not named): flat graphic shapes, confident silhouettes, restrained palette, no rendering of texture beyond the paper grain itself — in the tradition of mid-century editorial illustration.

Linework and texture: paper grain visible across the entire background. Outlines are slightly imperfect, drawn-by-hand. No digital clean-up aesthetic.

Mood: considered, paused, slightly reluctant.

Text policy: No text, letters, numbers, or glyphs anywhere in the image. No signatures, no watermarks, no UI elements.

Avoid: glowing blue circuits, binary code rain, silhouettes in hoodies, lightbulbs as ideas, cogs and gears as metaphors, abstract fluid particles, generic "futuristic" cityscapes, stock AI-brain imagery, holographic UI panels, glowing lines tracing across surfaces, neon accents on dark backgrounds.

Avoid: photorealistic stock-photo aesthetic, soft dramatic spotlight in a dark room, dust motes caught in a light beam, particles floating in sunbeams, heavy bokeh, moody gradient backgrounds, smoke or fog atmosphere, sand or liquid frozen mid-motion, tilt-shift, lens-flare, chromatic aberration.

Avoid (topic-specific): hourglasses, clocks, stopwatches, finish lines, sprinters, chess pieces, mountain summits, people meditating on a cliff, sunset silhouettes.
```

Read it carefully. Notice:
- The **subject** is concrete and specific (hand, brush, tin, half-finished canvas) — every noun carries weight.
- The **medium** is explicit and disciplined (gouache, flat color, outlines only on specific elements).
- The **composition** is prescriptive about empty space, down to the percentage.
- The **palette** is four OKLch hues, not "warm tones".
- The **anchor** is one named illustrator whose actual work looks a specific way.
- The **negative clauses** are three distinct blocks: generic-AI, stock-photo, topic-specific.

## Prompt length discipline

Keep the final prompt **under ~2000 characters**. Longer prompts risk triggering the safety false-positive filter even on benign content — we saw this live: the same conceptual prompt at ~2800 chars returned 400 safety rejections, while a tighter ~1500-char version passed instantly. Density beats length. If you're over 2000, cut:
- Redundant adjectives ("painterly but precise compositionally disciplined" → pick one)
- Multi-sentence mood statements (one 2–3 word mood line is enough)
- Redundant "avoid" items (the generic-AI + stock-photo clauses cover most; add only 1 topic-specific line)

## Before you send

Check your prompt against this list. If any answer is "no", rewrite.

1. Does it open with `Paint a 1536×1024…` or `Draw a 1536×1024…`?
2. Have you specified a **non-photographic medium** explicitly (unless the subject genuinely requires still-life photography)?
3. Have you named **one** illustrator / print tradition (not three, not zero)?
4. Did you **cross out the first-metaphor idea** and write from the second? If your subject is "hourglass / gavel / lightbulb / robot / rocket / blueprint", you did not.
5. Is the palette a fixed list of OKLch hues, no adjectives like "warm tones" or "rich colors"?
6. Is ≥25% negative space specified by quadrant or percentage?
7. Are both generic-AI and stock-photo negative clauses present verbatim?
8. Is there a topic-specific cliché ban listing the first-metaphor the reader would expect?
9. Is your visual anchor a **movement, a deceased artist, or a technique description** (never a living illustrator by name)? If you wrote "in the style of [Living Person]", the API will return 400.
10. Would this hero look out of place next to a Pudding or NYT Upshot feature? If no, you're done. If yes, rewrite.

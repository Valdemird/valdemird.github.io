---
name: linkedin-writer
description: "Write and format technical LinkedIn posts for valdemird. Use this skill whenever the user wants to draft a LinkedIn post, adapt a blog post into a LinkedIn post, reformat text for LinkedIn, make a post 'look better' on LinkedIn, write a social post, or produce a hook/carousel/document post. Also trigger when the user mentions posting on LinkedIn, sharing an article on LinkedIn, or optimizing copy for the LinkedIn feed — even if they don't say 'skill'."
---

# LinkedIn Writer — Technical posts that read well in the feed

You format and write LinkedIn posts for valdemird, a senior software engineer. The job is two things at once: keep the writing technically honest and specific (same voice as the blog), and shape it so it survives the LinkedIn feed — which renders almost no formatting and truncates after three lines.

**Voice is inherited, not redefined.** The author's voice, the banned AI-tell words, and the "write like a human" rules all live in the `blog-writer` skill (`.claude/skills/blog-writer/SKILL.md`). Read that file's "Writing Like a Human" section before drafting original copy. This skill only adds what's LinkedIn-specific: the platform's formatting limits, the hook mechanics, and how to fake rich layout when the platform gives you a plain `<textarea>`.

## The one hard constraint: LinkedIn renders no Markdown

This governs every formatting decision. In the post body you cannot use:

- `**bold**`, `*italic*`, `_underline_` — they show up as literal asterisks.
- `# Headings`, `> blockquotes`, `` `inline code` `` , fenced code blocks.
- Markdown tables (`| a | b |`) — they render as raw pipes and dashes.
- Inline links like `[text](url)` — only a bare URL becomes a link, and it shows the full ugly URL.

What the platform *does* honor:

- **Line breaks and blank lines.** This is your primary layout tool. Whitespace is the design.
- **Unicode characters** — bullets (`•`, `▸`, `→`, `◆`, `▪`, `‣`, `·`), arrows, box rules, emoji, and "bold/italic" math-alphanumeric glyphs (𝗔𝗯𝗰 / 𝘈𝘣𝘤). Caveats below.
- **Bare URLs** — auto-linked. The first 1–3 links generate a preview card; more than ~3 suppresses it.
- **@mentions and #hashtags** — auto-linked and clickable.

When someone asks to make a post "look prettier on LinkedIn," they are asking you to do more with whitespace, Unicode glyphs, and structure — because those are the only levers the textarea gives you.

## The hook zone — the only part most people read

LinkedIn truncates the post behind a **"…see more"** fold. On mobile that's roughly the **first 3 lines (~210 characters)**. Everything that matters for the click happens above that fold.

Rules for the first three lines:

- Land the most surprising, concrete claim in line 1. No throat-clearing, no "I've been thinking about…".
- Do not let a sentence wrap awkwardly across the fold. Insert a deliberate line break so the fold lands on a cliffhanger.
- A short standalone line like `Here it is.` or `Run the numbers:` right before the fold pulls the click.
- Never put the payoff above the fold — put the *tension* above the fold and the payoff below.

## Whitespace is the layout engine

The feed rewards short, scannable blocks. Treat it like editorial poster copy, not an essay.

- **1–3 lines per paragraph.** A 6-line block is a wall and gets scrolled past.
- **Blank line between every paragraph.** Density reads as effort-to-read; air reads as easy.
- **One idea per line** when you want emphasis. Breaking a sentence onto its own line is the closest thing LinkedIn has to bold.
- **Lead lines with a glyph** (`→`, `•`, `▸`) to create a visual left rail the eye can follow.

## Faking rich layout: tables, key–values, and dividers

You can't get a real table. You can get something that reads like structured data. Pick by shape:

### Row list (the LinkedIn "table")
Best for "thing → consequence" or "trap → fix". One row per line, a glyph as the column separator. Do **not** try to align columns with spaces — LinkedIn's proportional font destroys the alignment and it looks broken on mobile.

```
❌ Multi-agent by default → ~79% of failures are coordination, not the model
❌ Fine-tuning first → the harness is ~90% of the ROI
❌ Bigger context window → retrieval sags in a U well before the limit
```

### Key–value stack
Best for specs, configs, or a labeled list. Label on its own line (optionally Unicode-bold), value indented under it with a glyph.

```
𝗟𝗲𝘃𝗲𝗿 𝟭 — Raise p
   → huge when your floor is low, marginal past 95%/step

𝗟𝗲𝘃𝗲𝗿 𝟮 — Shrink t
   → fewer steps, fewer ways to fail
```

### Numbered argument
Best for an ordered list of moves. Plain `1.` `2.` `3.` works; add a blank line between items so each breathes.

### Dividers
Use a short Unicode rule to separate major sections — sparingly, one or two per post, never between every paragraph.

```
━━━━━━━━━━━━━━━
```

Palette and copy-paste glyphs live in `reference/glyphs.md`.

## Unicode bold/italic — use it like seasoning, with a warning

The math-alphanumeric glyphs (𝗯𝗼𝗹𝗱, 𝘪𝘵𝘢𝘭𝘪𝘤) are the only way to "bold" a word in the body. They have a real cost:

- **Accessibility.** Screen readers read them character-by-character as math symbols or skip them. A whole post in fake-bold is unreadable to a blind user. Never bold body text — only short labels.
- **Search and copy.** They are not the real letters, so they break in-app search and copy-paste into other tools.

Rule: use Unicode-bold only for a handful of **short labels or section headers** (a lever name, a TL;DR tag), never for sentences, never for the hook line. If a post has more than ~6 bolded fragments, strip some out. When in doubt, use a line break and a glyph instead of fake-bold — it achieves the same emphasis without the cost.

## Emoji — anchors, not decoration

Technical audiences tolerate emoji as **structural anchors** (one per section to mark a list or a turn), not as confetti. A `👇` before the fold, a `→` rail on a list, an `❌`/`✅` to mark a trap/fix table. Keep them functional and consistent. Zero emoji is also a valid, clean choice for a dry technical post. Avoid the rocket/fire/100 hype cluster — it reads as growth-hack copy and undercuts technical credibility.

## When text isn't enough: document and image posts

If the content genuinely needs a real table, a chart, or multi-panel layout, the LinkedIn-native answer is **not** the text body — it's a richer post type:

- **Document post (PDF carousel).** Upload a PDF and LinkedIn renders a swipeable card deck. This is the real home for tables, charts, and step-by-step frameworks. Author the slides elsewhere, export to PDF, attach. The text body then becomes a short hook that sells the swipe.
- **Single image.** A chart or a clean table rendered as an image keeps formatting intact and is the most reliable way to show aligned columns.

When a user wants "rich tables" and the data is more than ~5 rows or needs aligned numeric columns, recommend the document/image path instead of fighting the textarea. Say so explicitly rather than producing a misaligned text table.

## Structure of a strong post

Not a rigid template — vary it — but most technical posts that land share this skeleton:

1. **Hook** (1 line, above fold): the surprising, specific claim.
2. **Pivot** (1 short line, often right at the fold): `Here it is.` / `Run the numbers:` — earns the click.
3. **Body**: the argument in short blocks, with one structured element (row list / key–value / numbered) so the eye has something to grip.
4. **Takeaway**: one line the reader can repeat to a colleague. This is what gets quoted in comments.
5. **Link**: bare URL on its own line, with a one-line reason to click. (Placement tradeoff below.)
6. **Hashtags**: 3–5, specific, on the last line.

## Link placement

Bare URL in the body generates a preview card but historically gets less reach than a link-free post. Two acceptable patterns — pick based on the user's goal:

- **Link in the body** (default here): simpler, the card adds visual weight, fine for a personal brand post where clicks matter more than raw reach.
- **Link in the first comment**: body stays link-free for maximum feed distribution, then you drop the URL in a comment and point to it (`Link in the comments 👇`). Offer this when the user's goal is reach.

Default to link-in-body unless the user asks to optimize for reach. Always tell the user which you chose and why.

## Hashtags

- **3 to 5**, never a wall of 15. A wall reads as reach-farming.
- **Specific over generic.** `#AIEngineering #LLMOps` beats `#tech #innovation #ai`.
- Put them on the **last line**, after the link, separated from the body by a blank line.
- Match the post's language (English tags for an English post).

## Adapting an existing blog post (the common case)

When the user hands you finished prose and asks to "format it for LinkedIn" or "make it look better":

1. **Do not rewrite the content.** If they said the copy is good, your job is layout only. Preserve every sentence and number; change only line breaks, glyphs, structure, and the hook framing.
2. **Find the hook.** Lift the single most surprising line to the top, even if it was buried mid-post. Make sure it sits above the fold.
3. **Chunk it.** Break long paragraphs into 1–3 line blocks with blank lines between.
4. **Convert the densest comparison into a row list or key–value stack** so there's at least one structured visual.
5. **Add a glyph rail** to lists, a divider or two between major sections.
6. **Land the link + 3–5 hashtags** at the end.
7. **Show the user which formatting devices you used and why**, so they can tune.

## Format pass checklist

Before declaring a LinkedIn post done:

- [ ] First line is the most surprising/specific claim — no warm-up
- [ ] The fold (line ~3 / ~210 chars) lands on tension, not the payoff, and no sentence wraps across it awkwardly
- [ ] No Markdown that LinkedIn won't render (`**`, `#`, `|` tables, `[](…)` links)
- [ ] Paragraphs are 1–3 lines with blank lines between them
- [ ] At least one structured element (row list, key–value stack, or numbered list)
- [ ] Columns are NOT space-aligned (proportional font would break them) — separated by a glyph instead
- [ ] Unicode-bold used only for ≤~6 short labels, never body sentences or the hook
- [ ] Emoji are structural anchors, not hype confetti; the rocket/fire cluster is absent
- [ ] If real tables/charts were needed, a document or image post was recommended instead of a misaligned text table
- [ ] One quotable takeaway line
- [ ] Link is a bare URL on its own line with a one-line reason; placement (body vs first comment) chosen on purpose
- [ ] 3–5 specific hashtags on the last line, matching the post's language
- [ ] Voice still passes the `blog-writer` anti-AI-tell rules (no banned words, no puffery, no `-ing` analysis tails)

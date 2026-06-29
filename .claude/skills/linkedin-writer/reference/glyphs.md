# LinkedIn glyph & layout palette

Copy-paste building blocks for LinkedIn post layout. Everything here renders in the LinkedIn post body because it's plain Unicode, not Markdown.

## Bullets & rails

```
•  ▸  ‣  ·  ◦  ▪  ◆  ✦  —
```

Use one consistently per list as a left rail. `→` works as both a bullet and a "leads to" separator.

## Arrows & separators

```
→  ⟶  ↳  ⇒  ↦  |  ·  ─
```

`→` is the workhorse for "trap → fix" / "cause → effect" rows. `↳` is good for an indented sub-point under a line.

## Status markers (for trap/fix or do/don't rows)

```
✅  ❌  ⚠️  ✓  ✗  ◉  ○
```

## Section dividers (use 1–2 per post, max)

```
━━━━━━━━━━━━━━━
───────────────
▬▬▬▬▬▬▬▬▬▬▬▬▬
· · · · · · · · · · ·
```

## Pre-fold attention cue

```
👇   ↓   ⟶
```

A single one of these on its own line right before the "…see more" fold nudges the expand. Don't stack them.

## Unicode bold (sans-serif) — labels only, never body

Map plain letters to 𝗯𝗼𝗹𝗱 sans-serif. Accessibility cost is real (screen readers garble them), so reserve for short labels.

```
A→𝗔 B→𝗕 C→𝗖 D→𝗗 E→𝗘 F→𝗙 G→𝗚 H→𝗛 I→𝗜 J→𝗝 K→𝗞 L→𝗟 M→𝗠
N→𝗡 O→𝗢 P→𝗣 Q→𝗤 R→𝗥 S→𝗦 T→𝗧 U→𝗨 V→𝗩 W→𝗪 X→𝗫 Y→𝗬 Z→𝗭
a→𝗮 b→𝗯 c→𝗰 d→𝗱 e→𝗲 f→𝗳 g→𝗴 h→𝗵 i→𝗶 j→𝗷 k→𝗸 l→𝗹 m→𝗺
n→𝗻 o→𝗼 p→𝗽 q→𝗾 r→𝗿 s→𝘀 t→𝘁 u→𝘂 v→𝘃 w→𝘄 x→𝘅 y→𝘆 z→𝘇
0→𝟬 1→𝟭 2→𝟮 3→𝟯 4→𝟰 5→𝟱 6→𝟲 7→𝟳 8→𝟴 9→𝟵
```

## Unicode italic (sans-serif) — even rarer, for a single emphasized term

```
a→𝘢 b→𝘣 c→𝘤 d→𝘥 e→𝘦 f→𝘧 g→𝘨 h→𝘩 i→𝘪 j→𝘫 k→𝘬 l→𝘭 m→𝘮
n→𝘯 o→𝘰 p→𝘱 q→𝘲 r→𝘳 s→𝘴 t→𝘵 u→𝘶 v→𝘷 w→𝘸 x→𝘹 y→𝘺 z→𝘻
```

## Monospace (for a short formula or token, sparingly)

```
A→𝙰 … a→𝚊 … 0→𝟶
```

Note: monospace glyphs do **not** make columns align in the feed — LinkedIn still lays them out proportionally. Use only for the *look* of a code token (e.g. `𝚙^𝚝`), never to build a grid.

## Row-list template (the LinkedIn "table")

```
❌ <trap> → <one-line why>
❌ <trap> → <one-line why>
✅ <fix> → <one-line how>
```

## Key–value stack template

```
𝗟𝗮𝗯𝗲𝗹 𝗔
   → value / consequence

𝗟𝗮𝗯𝗲𝗹 𝗕
   → value / consequence
```

Reminder: never space-align columns. The separator glyph carries the structure; the proportional font carries the rest.

# Storytelling system — valdemird.com

The blog is interactive-first. This document catalogues every component available inside MDX posts and the rules the `/blog-writer` skill must follow when picking one.

## Decision tree — which component?

Match the *type of information* to the *right component*.

| Your content is… | Use | Tier |
|---|---|---|
| A process, workflow, data flow | `MermaidDiagram` | utility |
| A narrated sequence tied to a diagram | `StepThroughDiagram` | **story** |
| Numeric comparison — 2–8 categories | `InteractiveChart type="bar"` or `"horizontal"` | utility |
| Change over time, single series | `InteractiveChart type="line"` | utility |
| Volume-over-time or area-under-curve | `InteractiveChart type="area"` | utility |
| Part of a whole, 2–5 slices | `InteractiveChart type="donut"` | utility |
| A single big stat you want to land | `CountUp` | **story** |
| 3–6 KPIs at once | `StatGrid` | **story** |
| Tabular data to explore | `DataTable` | utility |
| A memorable quote or thesis | `PullQuote` | **story** |
| Same concept in multiple languages/frameworks | `Tabs` + `TabPanel` | utility |
| Before/after code change | `CodeDiff` | **story** |
| Before/after UI/image comparison | `BeforeAfter` | **story** |
| Chronology of events | `Timeline` | **story** |
| A long scrolling narrative anchored to a visual | `Scrollytelling` + `ScrollStep` | **story** |
| Branching reader choice | `DecisionTree` | utility |
| Content that should land only after commitment | `ProgressGate` | utility |
| Optional depth most readers skip | `Collapsible` | utility |
| Real runnable code with filename | `CodeBlock` | utility |
| Terminal one-liner | `CopyableCommand` | utility |
| Project file layout | `FileTree` | utility |
| Insight / warning / caveat | `Callout` | utility |
| Single static illustration (last resort) | `/blog-image --slot inline` | utility |
| Editorial hero image (last resort) | `/blog-image --slot hero` | utility |

**Story-tier components** are the ones that carry narrative. For posts marked `featured: true`, at least one story-tier component is mandatory.

## Minimum standard per post

- **Any post**: at least 4 different interactive components across the post.
- **`featured: true` posts**: at least 4 components **and** at least one story-tier component (CountUp, StatGrid, PullQuote, BeforeAfter, Timeline, Scrollytelling, StepThroughDiagram, CodeDiff).
- **Static images** are always the last resort. Prefer a component before reaching for `/blog-image`.

## How to import

Every component is a `.astro` file in `src/components/blog/`. Import at the top of the `.mdx`. Paths differ by language:

```mdx
// src/content/blog/<slug>.mdx
import Scrollytelling from '../../components/blog/Scrollytelling.astro';

// src/content/blog/es/<slug>.mdx
import Scrollytelling from '../../../components/blog/Scrollytelling.astro';
```

Keep every component import the post uses at the top; don't scatter imports mid-body.

## Per-component reference

### Callout — `utility`
```mdx
<Callout type="tip" title="Why this matters">...</Callout>
```
Types: `tip | warning | note | important`.

### CodeBlock — `utility`
```mdx
<CodeBlock filename="src/foo.ts">
```typescript
// code
```
</CodeBlock>
```
Always set `filename` for real code. Omit only for abstract examples.

### CopyableCommand — `utility`
```mdx
<CopyableCommand command="npx astro add mdx" />
```

### FileTree — `utility`
HTML-authored tree with optional `highlight` to draw the eye to one file. Folders are expandable.

### Tabs + TabPanel — `utility`
```mdx
<Tabs labels={["TS", "Python"]}>
  <TabPanel>...</TabPanel>
  <TabPanel>...</TabPanel>
</Tabs>
```

### Collapsible — `utility`
```mdx
<Collapsible title="Deep dive" open>...</Collapsible>
```

### MermaidDiagram — `utility`
```mdx
<MermaidDiagram title="Auth flow">
graph LR
A --> B --> C
</MermaidDiagram>
```
Good for quick flowcharts. For narrated step-through, use `StepThroughDiagram` instead.

### InteractiveChart — `utility`
Supports `bar | horizontal | line | area | donut`. Optional `story` headline (states the finding), `annotations` (callouts on specific points), `source` caption, `yLabel`/`xLabel`.

```mdx
<InteractiveChart
  story="Small teams ship 4× more often once they cross three engineers."
  type="horizontal"
  source="Source: internal survey, 2026"
  data={[
    { label: "1–2 engs",  value: 1.0 },
    { label: "3–5 engs",  value: 4.2 },
    { label: "6–10 engs", value: 3.8 },
    { label: "11–20 engs", value: 2.1 },
    { label: "21–50 engs", value: 1.4 },
    { label: "51+ engs",  value: 0.9 },
  ]}
  annotations={[
    { targetIndex: 1, text: "4.2 deploys/day — the inflection point", emphasize: true },
  ]}
/>
```

### DataTable — `utility`
Sortable; optional heatmap column coloring.
```mdx
<DataTable
  caption="Team-level CI metrics, 2026-Q1"
  columns={[
    { key: "team",    label: "Team",        align: "left" },
    { key: "deploys", label: "Deploys/day", align: "right", heatmap: true },
    { key: "mttr",    label: "MTTR (min)",  align: "right", heatmap: true, heatmapDirection: "descending" },
  ]}
  rows={[
    { team: "Gateway", deploys: 4.2, mttr: 9 },
    { team: "Billing", deploys: 1.1, mttr: 42 },
    { team: "Mobile",  deploys: 2.6, mttr: 23 },
  ]}
  defaultSort={{ key: "deploys", direction: "desc" }}
/>
```

### CountUp — `story`
Animated number when it enters the viewport.
```mdx
<CountUp to={4200} prefix="$" suffix=" MRR" label="Month one" context="Stripe payouts, pre-expenses." />
```

### StatGrid — `story`
KPI card grid.
```mdx
<StatGrid
  columns={3}
  stats={[
    { value: "4.2×", label: "Deploy rate",  context: "vs teams of 11+" },
    { value: "3m",   label: "Main CI",      context: "down from 14m" },
    { value: "$0.04", label: "Per hero",    context: "gpt-image-2 medium" },
  ]}
/>
```

### PullQuote — `story`
```mdx
<PullQuote cite="Anna Karlin" variant="bar">
A good benchmark is one everyone wants to game. That means it measures something worth gaming.
</PullQuote>
```
`variant`: `bar` (left accent) or `block` (centered italic).

### BeforeAfter — `story`
Drag-slider comparison for images, text, or any HTML.
```mdx
<BeforeAfter labelBefore="v1" labelAfter="v2" initial={45}>
  <img slot="before" src="/images/ui-v1.webp" alt="v1" />
  <img slot="after"  src="/images/ui-v2.webp" alt="v2" />
</BeforeAfter>
```

### Timeline — `story`
```mdx
<Timeline items={[
  { date: "2025-Q1", title: "Spec-driven v0",         body: "..." },
  { date: "2025-Q3", title: "Every feature has a spec", body: "...", emphasize: true },
  { date: "2026-Q1", title: "Specs as source of truth", body: "..." },
]} />
```

### Scrollytelling + ScrollStep — `story`
```mdx
<Scrollytelling graphic="right">
  <div slot="graphic">
    <img id="gfx" src="/images/blog/<slug>/scene.webp" alt="" />
  </div>
  <ScrollStep state="a" heading="First beat">...</ScrollStep>
  <ScrollStep state="b" heading="Second beat">...</ScrollStep>
  <ScrollStep state="c" heading="Resolution">...</ScrollStep>
</Scrollytelling>

<style>
  [data-scrolly-state="b"] #gfx { transform: scale(1.1); }
  [data-scrolly-state="c"] #gfx { transform: scale(1.2) rotate(-2deg); }
</style>
```
The reader scrolls through the steps; the graphic column pins. Each active step writes its `state` to `data-scrolly-state` on the section root — use it to drive graphic changes via your own CSS.

### StepThroughDiagram — `story`
```mdx
<StepThroughDiagram steps={[
  { id: "s1", label: "Client sends a request." },
  { id: "s2", label: "Gateway authenticates it." },
  { id: "s3", label: "Backend answers." },
]}>
  <svg slot="diagram" viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg">
    <g data-diagram-step="s1"><!-- client --></g>
    <g data-diagram-step="s2"><!-- gateway --></g>
    <g data-diagram-step="s3"><!-- backend --></g>
  </svg>
</StepThroughDiagram>
```
Cumulative by default (earlier step elements stay visible). Pass `exclusive` to show only the active step.

### DecisionTree — `utility`
```mdx
<DecisionTree
  root="start"
  nodes={{
    start: {
      question: "Is this a feature flag or a workaround?",
      choices: [
        { label: "Feature flag", next: "flag" },
        { label: "Workaround",   next: "wa" },
      ],
    },
    flag: {
      verdict: "Schedule a cleanup agent in 2 weeks.",
      detail: "Flags without expiry dates become tech debt.",
      choices: [{ label: "Start over", next: "start" }],
    },
    wa: {
      verdict: "Open a tracking issue before merging.",
      choices: [{ label: "Start over", next: "start" }],
    },
  }}
/>
```

### CodeDiff — `story`
```mdx
<CodeDiff
  filename="src/middleware/auth.ts"
  language="TypeScript"
  before={[
    { line: 1, text: "function auth(req) {" },
    { line: 2, text: "  const token = req.headers.get('Authorization');" },
    { line: 3, text: "  return verify(token);" },
    { line: 4, text: "}" },
  ]}
  after={[
    { line: 1, text: "function auth(req) {" },
    { line: 2, text: "  const token = req.headers.get('Authorization')?.slice(7);" },
    { line: 3, text: "  if (!token) throw new UnauthorizedError();" },
    { line: 4, text: "  return verify(token);" },
    { line: 5, text: "}" },
  ]}
  removed={[3]}
  added={[2, 3]}
  note="The bug silently passed 'Bearer <token>' to verify() because the scheme was never stripped."
/>
```

### ProgressGate — `utility`
```mdx
<ProgressGate hint="Scroll to see the actual numbers.">
  The full breakdown appears here.
</ProgressGate>
```

### ReadingProgress — `utility`
Automatic. Rendered by `BlogPost.astro`; no MDX usage needed.

## Accessibility rules (apply to every component)

- All CSS-based animations are globally damped by `@media (prefers-reduced-motion: reduce)` in `src/styles/global.css:419-428`. You don't need to re-declare it per component.
- All GSAP-driven animations **must** import from `src/lib/gsap.ts` and honor `onReducedMotion()` — this is enforced by convention; the new components all do it.
- Interactive widgets (BeforeAfter, DecisionTree, DataTable, Tabs) must work keyboard-only, with `aria-*` attributes carrying state (`aria-sort`, `aria-valuenow`, `aria-selected`, etc.).
- Decorative SVG/img elements use `aria-hidden="true"`; informational ones carry `role="img"` + `aria-label`.

## Animation library policy

- **Use GSAP + ScrollTrigger via `src/lib/gsap.ts`**. Singleton and registered exactly once.
- **Do not add** framer-motion, anime.js, chart.js, d3, recharts, or any other runtime animation/chart library. InteractiveChart is bespoke SVG on purpose — editorial polish, zero bundle cost.
- **Exception**: Mermaid is loaded lazily from CDN by `MermaidDiagram.astro` — this is its own isolated island, not a general-purpose addition.

## File locations

```
src/components/blog/
  BeforeAfter.astro
  Callout.astro
  CodeBlock.astro
  CodeDiff.astro
  Collapsible.astro
  CopyableCommand.astro
  CountUp.astro
  DataTable.astro
  DecisionTree.astro
  FileTree.astro
  InteractiveChart.astro      ← multi-type (bar/horizontal/line/area/donut)
  MermaidDiagram.astro
  ProgressGate.astro
  PullQuote.astro
  ReadingProgress.astro        ← used by the layout, not by MDX
  ScrollStep.astro
  Scrollytelling.astro
  StatGrid.astro
  StepThroughDiagram.astro
  TabPanel.astro
  Tabs.astro
  Timeline.astro

src/lib/
  gsap.ts                      ← GSAP singleton, onReducedMotion()
```

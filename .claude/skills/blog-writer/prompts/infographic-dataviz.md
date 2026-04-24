# Infographic / data-viz prompt architect

**Purpose**: compose prompts that produce rigorous, editorial-grade infographics — the kind you'd find in *NYT Upshot*, *FT Analysis*, *The Economist*, *Pudding*, *Reuters Graphics*. Applied when `/blog-image --slot infographic` is used. Typical size 1536×1024, quality `high` (text legibility matters).

Before writing the prompt, answer one question honestly: **can an interactive MDX component do this better?** If yes, use the component. Static infographics are for:
- Editorial layouts that need typographic polish no chart library offers.
- Information structures that aren't charts (Venn, quadrant, framework, taxonomy).
- Cover-grade infographics that set a post's visual register.

Dynamic charts (InteractiveChart, and when they exist: Timeline, StatGrid, multi-series line charts) beat a static image on every dimension *except* typographic control. Only generate if you need the typography.

## Hard rules (Tufte / Stephen Few discipline)

1. **Every chart carries a specific argument.** The headline is the *finding*, not the topic. Not `Deployment frequency by team size`. Instead: `Small teams ship 4× more often once they cross three engineers.` The chart exists to support that sentence.
2. **Reject chartjunk by default.** Ban in every prompt: drop shadows on bars, 3D perspective, gradients on data marks, decorative icons inside data areas, gridlines heavier than `0.5px`, legends when direct labeling works, pie charts with more than 3 slices.
3. **Data-to-ink ratio high.** Axes are thin, labels right-aligned, gridlines faint, data marks bold. The data carries the visual weight; the scaffolding disappears.
4. **Annotation-first.** Every data point that matters gets called out by name with a short annotation. Annotations are 85% of the chart's value — a plain bar chart becomes editorial the moment you label the outlier with `Colombia: 4.2× the regional median`.
5. **Colorblind-safe.** Default to a single accent hue against a neutral — this always works. When a second series is unavoidable, pick from a known safe pair (e.g. violet + amber, or blue + orange). Never red/green together. Use ColorBrewer sequential for ordered data, diverging for signed, qualitative for categorical. Check: would a protanope distinguish the marks? If not, redesign.
6. **In-image text is risky.** gpt-image-2 still miswrites numbers and long labels. Two strategies:
   - **Layout-only prompt** — instruct the model to produce the chart with **placeholder** labels (e.g. shaped rectangles where text will go) and render real text *in MDX* with an absolutely-positioned overlay. Safer.
   - **Full-render prompt** — accept the risk, use short labels (≤ 3 words), state all label text *verbatim* inside quoted strings in the prompt. Quality `high` only.
7. **One story per chart.** A chart that says two things says neither. If you need two arguments, produce two charts (Tabs + two `<img>` or two InteractiveCharts).

## Chart type by data relationship

Pick from this table first, then write the prompt:

| Relationship you're showing | First choice | Alt |
|---|---|---|
| Comparison across categories | Horizontal bar (sorted) | Lollipop if bars feel heavy |
| Part of a whole | Stacked bar (horizontal) | Waffle grid; avoid pie > 3 slices |
| Change over time, 1 series | Line chart | Area if the volume matters, slope for two-point comparison |
| Change over time, 2–5 series | Small multiples | Slope chart for just 2 time points |
| Distribution | Histogram | Strip plot / dot plot for <60 points |
| Correlation | Scatter with trend line | Hex-bin when many points overlap |
| Ranking | Dot plot or lollipop | Never a 3D pie |
| Flow / pipeline | Sankey | Alluvial for categorical flow |
| Geographic | Choropleth with small-multiples over time | Cartogram if area ≠ population |
| Taxonomy / structure | Tree / dendrogram / nested-set | Not a chart — use an editorial diagram |

## Color discipline

- **Background**: off-white (`oklch 0.98 0.01 85`) or deep indigo (`oklch 0.18 0.02 280`) matching the site's dark mode. Specify one explicitly.
- **Primary accent**: site violet `oklch(0.55 0.18 280)` for the *lead* series, the one the annotation is about.
- **Neutral series (if any)**: desaturated gray `oklch(0.6 0.02 280)` — lets the accent carry the eye.
- **Diverging** (positive/negative around 0): violet for positive, warm amber for negative.
- **Sequential** (ordered intensity): violet → indigo → near-black for dark mode; paper → amber → deep amber for light.
- **Qualitative** (up to 4 series): violet, amber, teal `oklch(0.65 0.12 200)`, sand `oklch(0.75 0.06 80)`. Don't add a fifth hue — redesign instead.

## Typography (when baked in-image)

All in-image type must be legible at 100% render *and* at 50% thumbnail. Safe sizes at 1536×1024:
- **Headline / finding**: 64px, sans-serif similar to Geist, weight 600.
- **Axis / series labels**: 28px, same sans, weight 500.
- **Annotation**: 26px, same sans, weight 400, italic allowed.
- **Small-multiple titles**: 22px.
- **Data labels on bars/dots**: 24px, monospaced similar to Geist Mono (so decimals align).

Quote all label strings literally inside the prompt. If a number has a unit, include it (`4.2×`, `62%`, `$1.2M`).

## Required slots

| # | Slot | Example | Notes |
|---|---|---|---|
| 1 | **Headline finding** | `"Small teams ship 4× more often once they cross three engineers."` | The *point*, quoted. |
| 2 | **Chart type** | `horizontal bar chart, sorted descending` | From the table above. |
| 3 | **Data shape** | `Six bars: labels "1–2 engs", "3–5 engs", "6–10 engs", "11–20 engs", "21–50 engs", "51+ engs". Values: 1.0, 4.2, 3.8, 2.1, 1.4, 0.9 deploys/day.` | Exact values + labels. |
| 4 | **Annotation(s)** | `Callout arrow from the "3–5 engs" bar reading "4.2 deploys/day — the inflection point".` | Where + what they say. |
| 5 | **Axis treatment** | `X-axis: deploys per day, ticks at 0, 1, 2, 3, 4, 5 — thin gray 0.5px. Y-axis: no line, labels right-aligned directly beside each bar.` | Minimal scaffolding. |
| 6 | **Palette** | `Primary bar violet oklch(0.55 0.18 280); the "3–5 engs" bar slightly brighter oklch(0.62 0.20 280); gridlines oklch(0.85 0.01 280). Background oklch(0.98 0.01 85).` | Accent the story bar. |
| 7 | **Typography** | `Headline 64px Geist-like sans 600; axis labels 28px Geist-like sans 500; annotation 26px italic; data labels 24px Geist-Mono-like.` | Sizes + faces. |
| 8 | **Layout** | `Headline spans the top 18% of the canvas. Chart occupies the center 66%. Source/caption bottom 10%, 18px Geist-like sans 400, muted gray oklch(0.55 0.02 280), reading "Source: internal survey, 2026".` | Spatial budget. |
| 9 | **Style anchor** | `In the manner of an FT Analysis graphic — restrained, typographically disciplined, white background, no chartjunk.` | Grounding reference. |
| 10 | **Negative clause** | `Avoid: drop shadows, 3D, gradients on bars, decorative icons, legends, gridlines heavier than 0.5px, pie-chart metaphors.` | Always include. |

## Exemplars

### 1 — Annotated bar with story

```
Draw a 1536×1024 editorial data-viz infographic with the headline "Small teams ship 4× more often once they cross three engineers." Chart type: horizontal bar chart, sorted descending by value.

Data (six bars, labels and values exactly as written):
- "1–2 engs": 1.0 deploys/day
- "3–5 engs": 4.2 deploys/day
- "6–10 engs": 3.8 deploys/day
- "11–20 engs": 2.1 deploys/day
- "21–50 engs": 1.4 deploys/day
- "51+ engs": 0.9 deploys/day

Callout: a thin arrow from the "3–5 engs" bar extending to a right-margin annotation reading "4.2 deploys/day — the inflection point". The "3–5 engs" bar is slightly brighter than the others.

Axes: X-axis shows deploys per day with ticks at 0, 1, 2, 3, 4, 5 — thin 0.5px gray. Y-axis has no line; bar labels sit directly to the right of each bar. No legend.

Palette: primary bars violet oklch(0.55 0.18 280); the "3–5 engs" bar at oklch(0.62 0.20 280). Gridlines oklch(0.85 0.01 280). Background oklch(0.98 0.01 85). Axis labels and annotation in oklch(0.35 0.02 280).

Typography: headline 64px sans-serif similar to Geist, weight 600. Axis labels 28px Geist-like 500. Annotation 26px italic. Data labels on bars 24px monospaced similar to Geist Mono, right-aligned inside the bar end.

Layout: headline in the top 18% of the canvas; chart occupies the center 66%; a 10% caption strip at the bottom reads "Source: internal survey, 2026" in 18px muted gray oklch(0.55 0.02 280).

Style anchor: in the manner of an FT Analysis graphic — restrained, typographically disciplined, off-white background, no chartjunk. Avoid: drop shadows, 3D, gradients on bars, decorative icons, legends, gridlines heavier than 0.5px, pie-chart metaphors.
```

### 2 — Slope chart (two time points, two series)

```
Draw a 1536×1024 editorial slope chart titled "Two years of CI: the lines never crossed." Two series, each a line connecting a point at 2024 to a point at 2026.

Series A — "Main branch CI": starts at 14 minutes in 2024, ends at 3 minutes in 2026. Accent violet oklch(0.55 0.18 280).
Series B — "PR CI": starts at 9 minutes in 2024, ends at 11 minutes in 2026. Neutral gray oklch(0.6 0.02 280).

Point labels (right side): "Main: 3m" and "PR: 11m" in 28px sans-serif-similar-to-Geist, placed directly to the right of each endpoint. Year labels "2024" and "2026" at the bottom left and right, 26px Geist-like sans 500 muted gray.

Annotation: a 26px italic line below the Main series reading "Main CI fell 79%."

Axes: no box. Thin horizontal baseline only.

Background oklch(0.98 0.01 85). Headline 60px Geist-like 600 centered in the top 18%. Caption at bottom reading "Source: internal build metrics" 18px gray.

Style: FT-Analysis restraint. Avoid drop shadows, gradients, 3D, pie chart vibes, decorative icons.
```

### 3 — Sankey (flow)

```
Draw a 1536×1024 Sankey diagram titled "Where the engineering week actually goes." Flow reads left to right across three columns.

Left column (single source node): "100 engineer-weeks" — rectangle 18% wide × 60% tall of the canvas, filled violet oklch(0.55 0.18 280), bordered thin.

Middle column (five primary categories, stacked top to bottom, sum = 100):
- "Shipping features" 32
- "Reviews & meetings" 24
- "Oncall & incidents" 18
- "Code review" 14
- "Infra & tooling" 12

Right column (secondary breakdown of "Shipping features" only): "Coding 18", "Testing 8", "Waiting for CI 6". Other categories flow to a single aggregated right-node labeled "Other work 68".

Flow ribbons blended violet→neutral, semi-transparent. Ribbon widths proportional to value. Labels to the right of each node in 26px Geist-like sans 500, showing category name + numeric value (monospaced similar to Geist Mono).

Background oklch(0.98 0.01 85). Headline 60px 600 centered in top 15%. Caption "Source: internal time-tracking, 2026-Q1" 18px muted gray.

Style: restrained, typographically disciplined, no 3D, no shadows, no decorative icons inside ribbons.
```

## Before you send

1. Does the headline state the *finding*, not the topic?
2. Is the chart type right for the relationship you're showing?
3. Is every important data point annotated by name?
4. Is the palette colorblind-safe and tied to OKLch tokens?
5. Are in-image text sizes large enough to survive a 50% thumbnail?
6. Is there a `Source:` caption?
7. Is the negative clause literal?
8. Would this chart work *without* color (a screenshot on a B&W printout)? If not, redesign.

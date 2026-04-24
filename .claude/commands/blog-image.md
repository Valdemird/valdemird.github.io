---
description: Genera o edita una imagen del blog con gpt-image-2 (hero, inline, infografía). Reporta costo explícito.
argument-hint: --slug <slug> --slot <hero|inline|infographic> --prompt "<architected prompt>" [--size WxH] [--quality low|medium|high] [--name stem] [--variations N] [--promote N] [--edit <path>] [--mask <path>] [--budget USD] [--dry-run]
allowed-tools: Bash(node:*), Read, Edit, Write
---

# /blog-image — gpt-image-2 generation & editing for the blog

Esta herramienta es un **tool de autoría local**, no corre en CI/CD. Siempre se llama a discreción del skill `/blog-writer`.

## Contrato

Invoca `scripts/blog/generate-image.mjs` con los flags que recibas. Pasa cada flag explícitamente (nunca concatenes en shell scripts).

```bash
node scripts/blog/generate-image.mjs $ARGUMENTS
```

## Antes de llamar

1. **Interactividad primero.** Si el contenido puede expresarse con un componente interactivo (`InteractiveChart`, `MermaidDiagram`, `FileTree`, `Tabs`, `StepThroughDiagram` cuando exista), **no generes imagen**. La imagen es el último recurso.
2. **Prompt architect obligatorio.** Si el `--prompt` viene del usuario en crudo, pásalo primero por la plantilla adecuada en `.claude/skills/blog-writer/prompts/`:
   - `hero-editorial.md` para `--slot hero`
   - `infographic-dataviz.md` para `--slot infographic`
   - `inline-illustration.md` para `--slot inline`
3. **Dry-run primero en posts nuevos.** Llama con `--dry-run` para ver el costo estimado antes de gastar créditos. Si el usuario autoriza, repite sin `--dry-run`.
4. **Tamaño correcto para el slot.**
   - `hero` → `1536x1024` (2:1 encaja con el `.hero-image` del layout: `width={1020} height={510}`).
   - `infographic` → `1536x1024` (calidad `high` por defecto para texto legible).
   - `inline` → `1024x1024`.
   - Respeta las restricciones de gpt-image-2 (múltiplo de 16, ratio ≤ 3:1, pixeles 655,360–8,294,400).

## Flags

| Flag | Tipo | Default | Notas |
|---|---|---|---|
| `--slug <slug>` | required | — | Determina `public/images/blog/<slug>/`. El slug no tiene que existir aún. |
| `--slot <hero\|inline\|infographic>` | required | — | Elige filename, tamaño y template de prompt architect. |
| `--prompt "<texto>"` | required | — | Prompt **arquitectado**, no crudo. |
| `--raw-intent "<texto>"` | optional | — | La intención original del autor (se guarda en sidecar para auditoría). |
| `--size <WxH\|landscape\|portrait\|square\|2k-*>` | optional | por slot | Acepta cualquier tamaño válido. |
| `--quality <low\|medium\|high\|auto>` | optional | por slot | `low` $0.005–$0.006, `medium` $0.041–$0.053, `high` $0.165–$0.211. |
| `--name <stem>` | inline only | — | Filename inline (sin extensión). Hero siempre es `hero.webp`. |
| `--variations <1..3>` | optional | 1 | Escribe N candidatos en `.candidates/`; el skill hace Read y elige. |
| `--promote <1..3>` | optional | — | Mueve el candidato elegido al filename final y limpia el resto. No llama a la API. |
| `--edit <path>` | optional | — | Llama `/v1/images/edits` con esta imagen existente. |
| `--mask <path>` | optional | — | PNG con canal alpha que delimita la zona a editar. |
| `--budget <usd>` | optional | — | Aborta si el run haría que `total_usd` del post supere este cap. |
| `--dry-run` | optional | false | Echoes payload + costo estimado, no llama a la API. |

## Salida

Single-line JSON en stdout. En éxito:

```json
{"ok":true,"path":"/images/blog/<slug>/hero.webp","cost_usd":0.041,"bytes":182340,"meta":"...","post_total_usd":0.082}
```

En error (exit 2):

```json
{"ok":false,"error":"...","hint":"..."}
```

## Flujo tras la llamada

1. **Lee el JSON de stdout.** Parsea `cost_usd`, `path`, `post_total_usd`.
2. **Single-image (`variation_run: false`)**: inserta el `path` en el MDX:
   - Hero: agrega `heroImage: "<path>"` al frontmatter (tanto EN como ES).
   - Inline: inserta `![alt descriptivo](<path>)` donde corresponda.
3. **Variation run (`variation_run: true`)**: lee cada candidato con la herramienta Read (son webp, se ven bien multimodalmente). Elige el mejor y llama otra vez con `--promote <n>`. Explica al usuario por qué elegiste ese.
4. **Reporta al usuario en chat** exactamente una línea:
   ```
   Imagen generada: <path> · tamaño <WxH> · calidad <q> · costo $<c> · total del post $<t>.
   ```

## Regla de oro sobre costo

Nunca ocultes el costo. Cada vez que `/blog-image` corra, reporta el costo real al usuario en la línea de confirmación. Esto es innegociable.

## Ejemplos

**Hero editorial con architect:**

```bash
node scripts/blog/generate-image.mjs \
  --slug agentic-evals \
  --slot hero \
  --size 1536x1024 \
  --quality medium \
  --raw-intent "evaluaciones agénticas, cómo saber si un agente realmente funciona" \
  --prompt "Draw a 1536x1024 landscape editorial illustration for a senior-engineering audience. Subject: a brass-and-obsidian mechanical judge's gavel striking a translucent glass sphere that holds a nested clockwork city. Composition: rule-of-thirds, gavel entering from upper-right, sphere centered-left, ~25% negative space on the bottom-right for overlay text. Lighting: chiaroscuro, warm amber key from upper-left, cool violet rim light. Palette: deep indigo background (oklch-range), accent amber (oklch 0.75 0.15 60) and violet (oklch 0.55 0.18 280). Style anchor: editorial illustration in the manner of The Atlantic magazine covers, painterly but precise. Mood: considered, weighty, quietly tense. No text anywhere in the image. Avoid clichés: no scales of justice, no robot heads, no glowing blue circuits."
```

**Variaciones y promote:**

```bash
# Paso 1
node scripts/blog/generate-image.mjs --slug agentic-evals --slot hero --variations 3 --prompt "..." --quality low
# [Read cada candidato en .candidates/, elegir visualmente]
# Paso 2
node scripts/blog/generate-image.mjs --slug agentic-evals --slot hero --promote 2
```

**Edit de hero existente:**

```bash
node scripts/blog/generate-image.mjs \
  --slug agentic-evals \
  --slot hero \
  --edit public/images/blog/agentic-evals/hero.webp \
  --prompt "Desaturate the palette to a near-monochrome; preserve composition and all subject detail." \
  --quality medium
```

**Inline infografía:**

```bash
node scripts/blog/generate-image.mjs \
  --slug spec-driven \
  --slot infographic \
  --size 1536x1024 \
  --quality high \
  --name spec-funnel \
  --prompt "Draw a 1536x1024 editorial infographic titled 'Where spec-driven work pays off' showing a funnel diagram with 4 stages..."
```

**Dry-run para estimar costo:**

```bash
node scripts/blog/generate-image.mjs --slug foo --slot hero --prompt "..." --dry-run
```

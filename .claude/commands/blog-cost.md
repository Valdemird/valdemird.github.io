---
description: Reporta el costo acumulado de imágenes generadas por post o de todo el blog.
argument-hint: --slug <slug> | --all
allowed-tools: Bash(node:*), Read
---

# /blog-cost — image-generation spend report

Imprime lo que se ha gastado en imágenes de `gpt-image-2` por post o across el blog. Lee los `.budget.json` que escribe `/blog-image`.

```bash
node scripts/blog/cost-report.mjs $ARGUMENTS
```

## Ejemplos

**Por post:**

```
/blog-cost --slug agentic-evals
```

Salida:

```
agentic-evals  —  total $0.0820
──────────────────────
  hero.webp     $0.0410  2026-04-23T17:...
  diagram-1.webp  $0.0410  2026-04-23T17:...
```

**Todo el blog:**

```
/blog-cost --all
```

Salida:

```
Blog image spend — 3 posts
════════════════════════════
  agentic-evals    $0.0820
  spec-driven      $0.0500
  intro            $0.0050
────────────────────────────
  TOTAL            $0.1370
```

## Reglas

- Este comando es **solo lectura**. Nunca edita ni borra `.budget.json`.
- Reporta el número al usuario verbatim. No redondees más allá de 4 decimales.
- Si el usuario pregunta "¿cuánto llevamos gastado?", corre `/blog-cost --all` y comparte el total + top 5.

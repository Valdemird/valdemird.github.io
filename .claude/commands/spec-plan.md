---
description: Lee el spec auditado y genera un plan de implementación por fases con checkpoints
argument-hint: <nombre-feature>
allowed-tools: Read, Grep, Glob
---

# Plan de Implementación

Lee el spec completo en `.claude/specs/$ARGUMENTS.md` — incluyendo el análisis técnico.

## Tu tarea

Genera un plan de implementación detallado por fases. Cada fase debe ser pequeña,
verificable y entregar algo concreto.

## Formato del plan

```
## Plan: [Nombre Feature]

### Fase 1 — [Nombre descriptivo]
**Objetivo:** qué queda funcionando al terminar esta fase
**Archivos que se tocan:**
- crear: ...
- modificar: ...
**Tests a escribir:** ...
**Cómo verifico que está bien:** ...

### Fase 2 — [Nombre descriptivo]
...

### Fase N — [Nombre descriptivo]
...

---
### Decisiones de implementación tomadas
- [Cosas que Claude decidirá y por qué]

### Fuera del scope de este plan
- [Cosas que NO se van a implementar ahora]
```

## Reglas del plan

- Máximo 3-4 fases para features medianas
- Cada fase debe poder revisarse antes de continuar con la siguiente
- Los tests van en la misma fase que el código, no al final
- Si hay algo ambiguo, explícitamente dime qué supuesto estás tomando

Al terminar pregúntame:

> "¿Apruebas este plan o quieres ajustar algo antes de empezar la Fase 1?"

**No escribas código todavía. Espera mi aprobación.**

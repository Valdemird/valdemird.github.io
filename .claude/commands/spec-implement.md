---
description: Implementa una fase específica del plan y espera revisión antes de continuar
argument-hint: <nombre-feature> <numero-fase>
allowed-tools: Read, Write, Edit, Bash(npm test:*), Bash(npx:*), Bash(python:*), Bash(pytest:*)
---

# Implementar Fase $2

Lee el spec en `.claude/specs/$1.md` y el plan que acordamos.

## Tu tarea

Implementa **únicamente la Fase $2** del plan.

## Reglas de implementación

- Sigue exactamente los patrones detectados en el análisis técnico del spec
- Si encuentras algo inesperado que cambia el plan, **detente y avísame** antes de improvisar
- Escribe los tests de esta fase junto con el código, no después
- Commits pequeños y descriptivos por cada pieza lógica
- Usa el estilo de código que ya existe en el proyecto, no el tuyo propio

## Al terminar la fase

1. Corre los tests relevantes y muéstrame el resultado
2. Dame un resumen de:
   - Archivos creados/modificados
   - Decisiones que tomaste (y por qué)
   - Algo que encontraste diferente a lo planeado (si aplica)
3. Pregúntame:
   > "Fase $2 completada. ¿Revisas el código y me das luz verde para la Fase siguiente,
   > o hay algo que ajustar?"

**Espera mi revisión antes de continuar con la siguiente fase.**

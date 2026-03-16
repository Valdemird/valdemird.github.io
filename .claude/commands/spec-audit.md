---
description: Audita un spec contra el código actual y lo enriquece con contexto técnico real
argument-hint: <nombre-feature>
allowed-tools: Read, Write, Grep, Glob, Bash(find:*), Bash(ls:*)
context: fork
agent: Explore
---

# Auditar Spec contra el Código

Voy a auditar el spec de la feature: **$ARGUMENTS**

## Tu tarea

### Paso 1 — Lee el spec

Lee el archivo `.claude/specs/$ARGUMENTS.md` y entiende qué se quiere construir.

### Paso 2 — Explora el proyecto a fondo

Sin escribir código, explora:

- Estructura general del proyecto (carpetas, módulos, capas)
- Patrones de arquitectura usados (MVC, controller/service, feature-based, etc.)
- Convenciones de nombrado de archivos y funciones
- Cómo se manejan los errores actualmente
- Cómo están organizados los tests
- Dependencias relevantes en package.json o requirements.txt
- Archivos similares a lo que se quiere construir (para seguir el mismo patrón)

### Paso 3 — Enriquece el spec

Actualiza `.claude/specs/$ARGUMENTS.md` agregando una sección al final:

```markdown
---

## Análisis Técnico (generado por Claude)

### Archivos a modificar

| Archivo | Razón |
| ------- | ----- |
|         |       |

### Archivos nuevos a crear

| Archivo | Contenido |
| ------- | --------- |
|         |           |

### Patrones del proyecto a respetar

-

### Dependencias existentes relevantes

-

### Riesgos o conflictos detectados

-

### Edge cases adicionales detectados en el código

-

### Preguntas que debes responder antes de implementar

-
```

### Paso 4 — Resumen para el developer

Al terminar dime:

1. ¿El spec original tiene gaps o ambigüedades importantes?
2. ¿Hay algo en el código actual que pueda complicar la implementación?
3. ¿Qué decisiones necesito tomar yo antes de continuar?

**No escribas código. Solo analiza y enriquece el spec.**

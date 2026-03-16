---
description: Crea un spec inicial en .claude/specs/ basado en un prompt simple
argument-hint: <nombre-feature> <descripcion breve>
allowed-tools: Read, Write, Bash(mkdir:*)
---

# Crear Spec Inicial

Quiero crear un spec para la feature: **$ARGUMENTS**

## Tu tarea

1. Crea el directorio `.claude/specs/` si no existe
2. Toma el input que te di y genera un spec estructurado
3. Guárdalo en `.claude/specs/<nombre-feature>.md`

## Estructura del spec que debes generar

```markdown
# Spec: [Nombre de la Feature]

## Contexto

[Por qué se necesita esta feature, qué problema resuelve]

## Qué quiero

[Descripción clara del objetivo en 2-3 oraciones]

## Comportamiento esperado

### Caso normal

-

### Edge cases

-
-

## Lo que NO debe hacer

-

## Restricciones conocidas

- [Librerías preferidas, patrones a seguir, etc.]

## Criterios de aceptación

- [ ]
- [ ]

## Preguntas abiertas

- [Cosas que aún no están definidas y hay que decidir antes de implementar]
```

4. Al terminar, muéstrame el spec generado y dime exactamente:
   - Nombre del archivo creado
   - Qué preguntas abiertas detectaste que yo debería responder antes del siguiente paso

**No explores el código todavía. Solo crea el spec con lo que te dí.**

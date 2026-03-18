---
description: Crea branch, hace commit de todos los cambios, y pushea. Escribe el nombre del branch y el mensaje del commit automáticamente.
argument-hint: <descripcion breve de lo que se hizo (opcional)>
allowed-tools: Bash(git:*), Bash(echo:*)
---

# Ship it

Quiero commitear y pushear todo lo que se hizo en esta sesión.

## Tu tarea

1. **Analiza los cambios** — Corre `git status` y `git diff --stat` para entender qué se modificó.

2. **Genera el nombre del branch** siguiendo este formato:
   - `feat/<slug>` para features nuevas o funcionalidad
   - `fix/<slug>` para bug fixes
   - `docs/<slug>` para cambios de documentación o contenido
   - `refactor/<slug>` para refactors sin cambio de comportamiento
   - `chore/<slug>` para configs, CI, dependencias
   - El `<slug>` debe ser corto (2-4 palabras con guiones), en inglés, y describir qué se hizo. Ejemplo: `fix/dark-mode-persistence`, `feat/blog-audit-es`.

3. **Genera el mensaje del commit** siguiendo conventional commits:
   - Primera línea: `type: descripcion corta` (max 72 chars, en inglés, minúsculas después del tipo)
   - Línea en blanco
   - Cuerpo opcional: qué se cambió y por qué, en 2-5 líneas si los cambios son grandes
   - El tipo debe coincidir con el prefijo del branch (feat, fix, docs, refactor, chore)

4. **Ejecuta en orden:**
   ```
   git checkout -b <nombre-branch>
   git add -A
   git commit -m "<mensaje>"
   git push -u origin <nombre-branch>
   ```

5. **Muéstrame** el nombre del branch, el commit message, y los archivos incluidos.

## Si recibiste argumentos

Usa `$ARGUMENTS` como contexto extra para decidir el tipo y escribir el mensaje. Si no recibiste argumentos, infiere todo de los cambios.

## Reglas

- El branch siempre se crea desde el estado actual (no hagas checkout a main primero).
- Nunca hagas force push.
- Si el branch ya existe, agrega un sufijo numérico (`feat/blog-audit-2`).
- Si no hay cambios (working tree limpio), dilo y no hagas nada.
- Incluye todos los archivos modificados y nuevos. No dejes nada fuera.

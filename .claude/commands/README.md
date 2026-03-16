# Claude Code Custom Commands

A collection of production-ready slash commands for **spec-driven development**, **performance reviews**, and **architecture reviews**.

---

## Setup — dónde van los archivos

```
tu-proyecto/
├── .claude/
│   ├── commands/
│   │   ├── spec-create.md        ← /project:spec-create
│   │   ├── spec-audit.md         ← /project:spec-audit
│   │   ├── spec-review.md        ← /project:spec-review
│   │   ├── spec-plan.md          ← /project:spec-plan
│   │   ├── spec-implement.md     ← /project:spec-implement
│   │   └── review/
│   │       ├── performance.md    ← /review:performance
│   │       └── architecture.md  ← /review:architecture
│   └── specs/
│       └── [aquí se guardan los specs generados]
└── CLAUDE.md
```

---

## 📦 Installation

### Option A — Project-scoped (recommended, tracked in Git)

```bash
# From your project root:
mkdir -p .claude/commands/review
cp performance.md .claude/commands/review/performance.md
cp architecture.md .claude/commands/review/architecture.md
```

### Option B — Global (available in ALL your projects)

```bash
mkdir -p ~/.claude/commands/review
cp performance.md ~/.claude/commands/review/performance.md
cp architecture.md ~/.claude/commands/review/architecture.md
```

---

## Workflow de Specs

Un flujo de 6 pasos para convertir una idea en código implementado con contexto real del proyecto.

### 1. Crear el spec inicial

```
/project:spec-create auth-jwt "login con email/password que retorne JWT, rutas protegidas con 401"
```

### 2. Responder las preguntas abiertas que Claude detectó

Editas el spec manualmente o le respondes en el chat.

### 3. Auditar el spec contra el código actual

```
/project:spec-audit auth-jwt
```

Claude explora el proyecto y enriquece el spec con contexto técnico real.

### 4. Revisar el spec final

```
/project:spec-review auth-jwt
```

Claude te muestra un semáforo de readiness y te pide confirmación.

### 5. Generar el plan de implementación

```
/project:spec-plan auth-jwt
```

Claude genera un plan por fases. Tú lo apruebas antes de codear.

### 6. Implementar fase por fase

```
/project:spec-implement auth-jwt 1
/project:spec-implement auth-jwt 2
/project:spec-implement auth-jwt 3
```

Cada fase espera tu revisión antes de continuar.

### Regla de oro

> Nunca saltes pasos bajo presión. El tiempo que "ahorras" saltando el audit
> o el review lo pagas triple en correcciones después.

---

## 🚀 Review Commands Usage

Open Claude Code in your project and run:

```
# Full project performance review
/review:performance

# Review a specific file or directory
/review:performance src/services/UserService.ts
/review:performance src/api/

# Full project architecture review
/review:architecture

# Review a specific module
/review:architecture src/
/review:architecture backend/app/
```

---

## 📋 What Each Review Command Checks

### `/review:performance`

| Category               | What It Checks                                   |
| ---------------------- | ------------------------------------------------ |
| Algorithm & Complexity | O(n²) loops, missing indexes/maps                |
| Database & I/O         | N+1 queries, missing pagination, blocking I/O    |
| Memory Management      | Leaks, unclosed streams, unnecessary copies      |
| Caching                | Missing memoization, cache headers, hot paths    |
| Network & API          | Sequential awaits, missing parallelism, timeouts |
| Frontend               | Re-renders, bundle size, lazy loading            |
| Infrastructure         | Assets, CDN, code splitting                      |

### `/review:architecture`

| Category               | What It Checks                                    |
| ---------------------- | ------------------------------------------------- |
| Project Structure      | Folder layout, naming conventions, mixed concerns |
| Coupling & Cohesion    | Circular deps, God objects, Law of Demeter        |
| Separation of Concerns | Layers: API → Business → Data                     |
| SOLID Principles       | All five principles                               |
| Design Patterns        | Missing patterns, anti-patterns                   |
| API Design             | REST conventions, validation, DTOs                |
| Error Handling         | Silent catches, missing resilience                |
| Security Architecture  | Auth, secrets, input validation                   |
| Testability            | DI, pure functions, coverage                      |
| Scalability            | Statelessness, observability, docs                |

---

## 💡 Tips

- Both review commands **auto-detect your tech stack** before reviewing.
- Pass a file or directory as an argument to **narrow the scope** — great for PR reviews.
- Findings are **severity-ranked** (Critical → High → Medium → Low) with concrete code-level fixes.
- The architecture command includes an **ASCII diagram** of detected layers and a **refactoring roadmap**.

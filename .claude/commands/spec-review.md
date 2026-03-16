---
description: Muestra el spec final y hace preguntas de validación antes de pasar a /plan
argument-hint: <nombre-feature>
allowed-tools: Read
---

# Revisión Final del Spec

Lee el spec en `.claude/specs/$ARGUMENTS.md` y hazme una revisión estructurada.

## Tu tarea

### 1. Muéstrame el spec completo

Muéstrame el contenido del spec tal como está.

### 2. Semáforo de readiness

Evalúa qué tan listo está el spec para pasar a implementación:

**🟢 Listo:**

- [cosas que están bien definidas]

**🟡 Puede continuar con supuestos:**

- [cosas ambiguas pero que Claude puede asumir razonablemente]
- [supuesto que haría: ...]

**🔴 Bloqueante — necesita respuesta antes de implementar:**

- [decisiones críticas que faltan]

### 3. Pregunta de confirmación

Al final pregúntame:

> "¿Quieres ajustar algo del spec antes de continuar con /plan spec-$ARGUMENTS,
> o procedemos con lo que tenemos?"

Espera mi respuesta. No hagas nada más hasta que yo confirme.

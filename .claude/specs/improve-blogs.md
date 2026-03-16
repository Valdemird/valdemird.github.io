# Spec: Interactive Blog Components

## Contexto

El blog actual en valdemird.com usa MDX con componentes Astro estáticos (Callout, CodeBlock, ReadingProgress). Estos componentes enriquecen visualmente el contenido pero no tienen interactividad real — son HTML renderizado en build time sin JavaScript del lado del cliente. Para un blog técnico de un senior engineer, los posts deberían poder incluir demos interactivos, visualizaciones de datos, diagramas dinámicos, y elementos que el lector pueda manipular. Esto eleva la calidad del contenido de "artículo bonito" a "experiencia de aprendizaje".

## Qué quiero

Expandir la librería de componentes MDX del blog con componentes interactivos que usen la arquitectura de islas de Astro (client:visible / client:load). Los componentes deben ser reutilizables, coherentes con el design system existente (OKLch, Fraunces/Geist, dark mode), y cargarse solo cuando son necesarios para mantener el performance.

## Comportamiento esperado

### Caso normal

- Un autor importa componentes interactivos en un archivo `.mdx` igual que los actuales
- Los componentes estáticos (Callout, CodeBlock) siguen funcionando como antes — sin JS
- Los componentes interactivos usan `client:visible` para hidratar solo cuando el usuario scrollea hasta ellos
- Dark mode se aplica automáticamente a todos los componentes interactivos
- Los componentes respetan el spacing y tipografía del design system

### Componentes a crear

- **Tabs** — Pestañas para mostrar contenido alternativo (ej: mismo código en diferentes lenguajes, antes/después). Cambian sin recargar la página.
- **Collapsible / Accordion** — Secciones expandibles para contenido largo o detalles opcionales. Animación suave al abrir/cerrar.
- **InteractiveChart** — Wrapper para visualizaciones de datos con tooltips on-hover. Soporta bar, line, y pie charts con datos inline.
- **MermaidDiagram** — Renderiza diagramas Mermaid (flowcharts, sequence diagrams, ER diagrams) directamente en MDX.
- **CopyableCommand** — Comando de terminal con botón de copiar y feedback visual (ya existe parcialmente en CodeBlock pero este es inline, más compacto).
- **FileTree** — Visualización de estructura de archivos con expand/collapse y highlighting del archivo activo.

### Edge cases

- JavaScript deshabilitado: los componentes interactivos deben mostrar un fallback razonable (contenido visible pero sin interacción)
- Mobile: todos los componentes deben ser responsive y touch-friendly
- RSS feed: los componentes interactivos no deben romper el RSS (solo se muestra el contenido de texto)
- View Transitions: los componentes deben re-inicializarse correctamente al navegar entre páginas
- Múltiples instancias del mismo componente en un post deben funcionar independientemente

## Lo que NO debe hacer

- No agregar Tailwind CSS al proyecto — el sitio usa CSS vanilla con custom properties
- No agregar React, Vue, o Svelte como dependencia — usar componentes Astro con `<script>` tags para interactividad (mantiene el bundle mínimo)
- No romper los componentes existentes (Callout, CodeBlock, ReadingProgress)
- No agregar dependencias pesadas (chart libraries enteras) — preferir soluciones ligeras o CSS-only donde sea posible
- No cambiar la estructura de carpetas existente del blog

## Restricciones conocidas

- El proyecto usa Astro 6 con MDX ya configurado
- Design system definido en `.claude/docs/DESIGN_SYSTEM.md` — colores OKLch, fonts Fraunces/Geist/Geist Mono, easing springs
- Dark mode vía `data-theme` attribute + `prefers-color-scheme` media query
- View Transitions activas — scripts deben usar `astro:after-swap`
- El blog tiene versiones en inglés y español — los componentes no deben tener texto hardcodeado (o deben aceptar props para i18n)
- Shiki ya está configurado para syntax highlighting con temas dual (github-light/github-dark)

## Criterios de aceptación

- [ ] Tabs funciona con al menos 2 pestañas, cambia contenido sin parpadeo
- [ ] Collapsible se expande/colapsa con animación suave (no abrupta)
- [ ] MermaidDiagram renderiza un flowchart básico correctamente
- [ ] InteractiveChart muestra un bar chart con datos inline y tooltips on-hover
- [ ] FileTree muestra una estructura de carpetas con expand/collapse
- [ ] CopyableCommand copia al clipboard con feedback visual
- [ ] Todos los componentes se ven bien en dark mode
- [ ] Todos los componentes son responsive (mobile)
- [ ] `npm run build` pasa sin errores
- [ ] Un post MDX de demo usa todos los componentes juntos para verificar integración
- [ ] El skill blog-writer se actualiza para documentar los nuevos componentes

## Preguntas abiertas

- ¿Usar Mermaid.js como dependencia (~300KB) o renderizar diagramas como SVG en build time con una integración de Astro?
- ¿Para charts, usar una librería ligera (como Chart.css, roughViz) o crear charts con SVG inline generado por el componente?
- ¿Cuántos de estos componentes son prioridad para el primer release? ¿Todos 6, o empezar con los más usados (Tabs, Collapsible, FileTree)?
- ¿Los Tabs deben soportar code blocks dentro (ej: mostrar el mismo snippet en TypeScript vs JavaScript)?

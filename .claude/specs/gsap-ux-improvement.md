# Spec: GSAP & UX Improvement — Full Site Enhancement

## Contexto

El sitio actual (valdemird.com, Astro 6) tiene animaciones moderadas hechas con vanilla JS/CSS (parallax, typing terminal, Intersection Observer reveals, floating orbs, marquee), pero carece de cohesión entre páginas, no aprovecha View Transitions API a nivel de elementos, y tiene problemas de responsive generalizados (hardcoded sizes, missing dvh fallbacks, breakpoints insuficientes). Se necesita una mejora integral que unifique todas las animaciones bajo GSAP/ScrollTrigger, integre View Transitions API nativa de Astro a nivel de elementos, y corrija los problemas de responsive.

## Qué quiero

Transformar el sitio en una experiencia cohesiva donde GSAP, ScrollTrigger y View Transitions API trabajen como un sistema unificado — las animaciones de scroll, las transiciones entre páginas, y las interacciones deben sentirse como parte de un todo. Priorizar interactividad y buena experiencia de usuario sobre performance perfecta, pero siempre evaluando el impacto.

## Estado actual del sitio (auditoría)

### Animaciones existentes (vanilla JS/CSS, sin GSAP)
- **Landing**: Orbs flotantes (CSS keyframes), parallax con mouse tracking (rAF), terminal con typing animation, marquee infinito, section reveals (IntersectionObserver)
- **About**: Orbs flotantes, section reveals (IntersectionObserver), hover transforms en cards
- **Header**: Logo dot scale, nav underline animation, hamburger-to-X, scroll detection
- **ProjectCard**: Lift on hover, glow border shift, iframe fade-in, shimmer fallback
- **Blog components**: Reading progress bar (scroll-linked), tab indicator, chart bar growth, collapsible chevron
- **Global**: `fadeIn`, `slideUp`, `fadeInScale` keyframes + stagger delay utilities + spring/smooth easing tokens

### View Transitions (actual)
- `ClientRouter` activo globalmente (en BaseHead.astro)
- **15+ event listeners** para `astro:after-swap` y `astro:before-swap` (cleanup/reinit)
- **NO usa**: `transition:name`, `transition:animate`, `transition:persist` directives
- **NO usa**: `::view-transition` CSS pseudo-elements, `view-transition-name` properties
- **NO usa**: `astro:before-preparation` event
- Resultado: transiciones de página son genéricas (default browser fade)

### Problemas de responsive encontrados
| Issue | Archivos | Severidad |
|-------|----------|-----------|
| Missing `dvh` fallback para `vh` units | index.astro, 404.astro, es/index.astro | Media |
| Hardcoded pixel widths en orbs (500px, 400px, 300px) | index.astro, es/index.astro | Media |
| Hardcoded iframe 1440px width | ProjectCard.astro | Alta |
| Solo 1 breakpoint por página (640px o 768px) | Todas las páginas | Media |
| Touch targets < 44px (header buttons 32px) | Header.astro | Baja |
| Hardcoded terminal min-height (170px) | index.astro | Baja |
| Hardcoded chart height (200px) | InteractiveChart.astro | Baja |

## Comportamiento esperado

### 1. Sistema de animación cohesivo (GSAP como motor único)

**Migrar todas las animaciones vanilla a GSAP** para tener un sistema unificado:
- Reemplazar IntersectionObserver reveals → GSAP ScrollTrigger
- Reemplazar CSS keyframes de entrada → GSAP timelines
- Reemplazar parallax rAF manual → GSAP ScrollTrigger con scrub
- Mantener CSS transitions para micro-interactions (hover states) — no migrar estos
- Mantener CSS keyframes infinitos (orbs, marquee) — no migrar loops decorativos

**Patrones de animación estándar** (aplicar consistentemente en TODAS las páginas):
- **Page entrance**: Timeline GSAP que anima hero elements en secuencia (0.6-0.8s)
- **Scroll reveals**: ScrollTrigger `batch()` para grupos de elementos similares (cards, items)
- **Staggered reveals**: `stagger: 0.1` para listas, grids, cards
- **Parallax sections**: ScrollTrigger con `scrub: true` para profundidad visual
- **Pinning**: Usar solo en landing page hero si beneficia la narrativa
- Duración: 0.6-0.8s reveals, 0.3s hovers
- Easing: `power2.out` entradas, `power2.inOut` transiciones, `back.out(1.7)` para emphasis

### 2. View Transitions API (integración completa con Astro)

**Nivel 1 — Transition directives en elementos clave:**
```astro
<!-- Elementos que persisten entre páginas -->
<header transition:persist>
<img class="logo" transition:name="logo">
<h1 transition:name="page-title" transition:animate="slide">
```

**Nivel 2 — CSS view-transition customization:**
```css
::view-transition-old(page-title) {
  animation: slide-out 0.3s ease-in;
}
::view-transition-new(page-title) {
  animation: slide-in 0.3s ease-out;
}
::view-transition-group(logo) {
  animation-duration: 0.4s;
}
```

**Nivel 3 — Coordinación GSAP + View Transitions:**
- `astro:before-preparation`: Preparar estado de salida (kill ScrollTrigger instances)
- `astro:before-swap`: Cleanup completo de GSAP timelines
- `astro:after-swap`: Re-crear todas las animaciones GSAP de la nueva página
- Las animaciones de entrada de página se ejecutan DESPUÉS de que la view transition termine

**Elementos con `transition:name` (cross-page morphing):**
- Logo del header
- Título de página (hero → subpage)
- Post cards → post detail (imagen y título)
- Navigation active indicator

**Elementos con `transition:persist`:**
- Header completo (navbar)
- Theme state
- Audio/video players si existieran

### 3. Páginas con GSAP (alcance)

**Landing page (index.astro)**: Mejora significativa
- Hero entrance timeline (título, subtitle, CTA, terminal)
- Terminal parallax con ScrollTrigger scrub
- Section reveals con ScrollTrigger batch
- Staggered project cards
- Staggered blog post previews
- Considerar pinning en hero para storytelling

**About page**: Mejora significativa
- Hero entrance timeline
- Section reveals con ScrollTrigger
- Domain cards staggered reveal
- Timeline items progressive reveal
- Belief cards staggered

**Blog list (blog/index.astro)**: Mejora moderada
- Hero entrance
- Featured post reveal
- Post grid staggered reveal
- Tag filters animation

**Blog posts individuales**: Mejora sutil
- Hero entrance (título, meta, imagen)
- Heading reveals suaves al scroll (no agresivo — es contenido de lectura)
- Reading progress bar (mantener, ya funciona bien)

**404 page**: Mejora mínima
- Entrance animation simple

### 4. Layout & Responsive (fixes)

**Fixes prioritarios:**
- Agregar `dvh` fallback: `min-height: 85vh; min-height: 85dvh;`
- ProjectCard iframe: `max-width: 100%` fallback + responsive scaling
- Orbs: `width: clamp(150px, 40vw, 500px)` en vez de hardcoded pixels
- Terminal: `width: clamp(280px, 90vw, 400px)` responsive
- Chart heights: `height: clamp(150px, 40vw, 200px)`

**Breakpoints expandidos:**
```css
/* Mobile first */
/* Base: < 480px (small phones) */
@media (min-width: 480px) { /* Large phones */ }
@media (min-width: 640px) { /* Small tablets */ }
@media (min-width: 768px) { /* Tablets */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large desktop */ }
```

**Touch targets:** Aumentar header buttons a 44px en mobile

### 5. Rendering Strategy

- El proyecto ya NO usa `client:*` directives (todo es vanilla JS en `<script>` tags) — esto es bueno
- GSAP se cargará como `<script>` tag (no como island), igual que las animaciones actuales
- Crear un módulo compartido de inicialización GSAP para evitar duplicación entre páginas
- Re-inicializar en `astro:after-swap` (patrón ya establecido en el proyecto)

### Caso normal

- Usuario llega → View Transition de entrada suave → hero se anima con GSAP timeline
- Scrollea → secciones se revelan progresivamente con ScrollTrigger
- Navega a otra página → View Transition con morphing de elementos (logo, título) → nueva página se anima
- En mobile → mismas animaciones pero simplificadas (menos parallax, stagger más rápido)
- Con `prefers-reduced-motion` → sin animaciones, contenido visible estáticamente, View Transitions instant

### Edge cases

- Viewport < 320px: contenido fluye sin romper, decorativos ocultos
- JS deshabilitado: contenido visible sin animaciones (progressive enhancement — CSS no tiene `opacity: 0` por default)
- Conexión lenta: contenido legible antes de que GSAP cargue
- View Transitions + ScrollTrigger: instances se limpian en `before-swap`, se recrean en `after-swap`
- iOS Safari: `dvh` fallback para viewport units
- Scroll rápido: ScrollTrigger maneja esto nativamente, no quedan estados intermedios
- Back/forward navigation: View Transitions manejan cache, GSAP se reinicializa
- Blog post → blog post: View Transition morphea imagen hero y título entre posts

## Lo que NO debe hacer

- No crear animaciones aisladas — todo debe pertenecer al sistema cohesivo
- No animar elementos durante lectura de blog posts (headings sí, párrafos no)
- No usar alturas fijas sin fallback responsive
- No agregar dependencias fuera de GSAP/ScrollTrigger
- No crear componentes framework (React/Vue) para animaciones
- No sacrificar legibilidad de contenido por efectos visuales
- No ignorar `prefers-reduced-motion`
- No duplicar código de animación entre EN y ES pages
- No romper el patrón existente de cleanup/reinit en View Transitions
- No poner `opacity: 0` en CSS estático (solo via GSAP JS, para progressive enhancement)

## Restricciones conocidas

- Stack: Astro 6, MDX, CSS custom properties (OKLch), View Transitions (ClientRouter)
- Animaciones: GSAP + ScrollTrigger (skills disponibles en `.claude/skills/gsap-core` y `.claude/skills/gsap-scrolltrigger`)
- Fonts: Fraunces, Geist, Geist Mono (no cambiar)
- Colores: OKLch tokens en `global.css` (usar existentes)
- Deploy: GitHub Pages (estático, no SSR)
- Design system: `.claude/docs/DESIGN_SYSTEM.md`
- Dark mode: `data-theme` + `prefers-color-scheme`
- i18n: EN (default) + ES (/es/ prefix) — animaciones deben funcionar en ambos idiomas
- El copy/texto actual está bien — solo estructura y animaciones

## Criterios de aceptación

### Performance
- [ ] Core Web Vitals aceptables (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- [ ] Lighthouse Performance >= 85 en mobile
- [ ] Animaciones a 60fps sin jank visible
- [ ] GSAP bundle < 50KB gzipped (core + ScrollTrigger)

### Responsive
- [ ] Sin contenido cortado en viewports 320px a 2560px
- [ ] Sin overflow horizontal en ningún dispositivo
- [ ] Hero visible completo sin scroll en todos los dispositivos
- [ ] Touch targets >= 44px en mobile
- [ ] `dvh` fallback en todos los `vh` units

### Animaciones GSAP
- [ ] Todas las páginas tienen entrance animation cohesiva
- [ ] Secciones below the fold usan ScrollTrigger reveals
- [ ] Stagger en todos los grupos de elementos repetidos (cards, posts, items)
- [ ] `prefers-reduced-motion` respetado globalmente
- [ ] ScrollTrigger instances se limpian correctamente en navegación
- [ ] Animación cohesiva: mismos easing, timing, patrones en todo el sitio
- [ ] Sin código de animación duplicado entre EN y ES pages

### View Transitions
- [ ] `transition:name` en elementos clave (logo, títulos, post images)
- [ ] `transition:persist` en header
- [ ] CSS `::view-transition` pseudo-elements customizados
- [ ] GSAP se coordina con lifecycle events (before-preparation, before-swap, after-swap)
- [ ] Blog post cards morphean hacia blog post detail
- [ ] Sin glitches durante transiciones de página

### Integración
- [ ] GSAP + View Transitions + ScrollTrigger funcionan como sistema unificado
- [ ] Una sola función de inicialización compartida entre páginas
- [ ] Dark mode transitions no interfieren con GSAP
- [ ] Funciona correctamente con back/forward browser navigation

## Prioridades de implementación

### Fase 1: Fundación (hacer primero)
1. Instalar GSAP + ScrollTrigger
2. Corregir todos los problemas de responsive encontrados en auditoría
3. Crear módulo compartido de inicialización/cleanup GSAP
4. Agregar `prefers-reduced-motion` global check
5. Establecer baseline de Lighthouse

### Fase 2: View Transitions (antes de GSAP animations)
6. Agregar `transition:name` a elementos cross-page (logo, títulos, post images)
7. Agregar `transition:persist` al header
8. Customizar `::view-transition` CSS pseudo-elements
9. Implementar `astro:before-preparation` para coordinar con GSAP

### Fase 3: GSAP — Landing page
10. Migrar hero entrance a GSAP timeline
11. Migrar section reveals a ScrollTrigger
12. Migrar parallax a ScrollTrigger scrub
13. Staggered cards y posts
14. Evaluar pinning en hero

### Fase 4: GSAP — Resto de páginas
15. About page: entrance + section reveals + staggered cards
16. Blog list: entrance + staggered post grid
17. Blog posts: entrance sutil + heading reveals
18. 404: entrance simple

### Fase 5: Polish
19. Refinar timing y secuenciación global
20. Asegurar cohesión entre pages (misma "personalidad" de animación)
21. Performance audit final
22. Test en dispositivos reales (iOS Safari, Android Chrome)
23. Edge cases y cleanup

## Preguntas abiertas (resueltas)

1. ~~Landing vs todas las páginas~~ → **Todas donde sea mejora significativa** (landing, about, blog list, blog posts sutil)
2. ~~Responsive~~ → **Generalizado**, auditoría completada (ver tabla arriba)
3. ~~Pinning~~ → **A criterio de implementación**, evaluar en landing hero
4. ~~Copy del hero~~ → **Texto actual está bien**, solo estructura y animaciones
5. ~~Performance vs animaciones~~ → **Animaciones priorizadas** si agregan interactividad y UX, siempre evaluando impacto
6. ~~Blog posts~~ → **Sí, pero sutiles** (entrance + heading reveals, no agresivo)
7. ~~Presupuesto JS~~ → **No hay límite fijo**, Core Web Vitals deben estar bien
8. ~~Baseline~~ → **No existe**, establecer antes de empezar

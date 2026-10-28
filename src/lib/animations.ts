/**
 * Page-level motion helpers shared by the page scripts (home, about, blog
 * index, posts, learn modules, 404).
 *
 * GSAP is NOT imported at the top of this module on purpose. Every page that
 * imports this file shares one chunk, so a static `import 'gsap'` here used to
 * ship core + ScrollTrigger + SplitText (~50 KB gz) to every page, even pages
 * that only fade a hero in. Now:
 *
 * - Entrances and scroll reveals (initPageEntrance, initFocalWave,
 *   initScrollReveals, initStaggeredReveal) run on the Web Animations API +
 *   IntersectionObserver. No GSAP.
 * - The home headline split (SplitText) and the hero mouse parallax load GSAP
 *   on demand with a dynamic import.
 * - Code that really needs raw GSAP/ScrollTrigger calls `loadGsap()`.
 *   (Do not add `export { gsap } from 'gsap'` back: a re-export lands in the
 *   shared chunk and every page pays for it again.)
 *
 * Every helper is a no-op under prefers-reduced-motion, and `cleanupAll()`
 * (wired to `astro:before-swap` by the page scripts) puts every element in its
 * final state so View Transition snapshots never catch a half-hidden page.
 */

type GsapCore = (typeof import('gsap'))['gsap'];
type ScrollTriggerClass = (typeof import('gsap/ScrollTrigger'))['ScrollTrigger'];
type SplitTextClass = (typeof import('gsap/SplitText'))['SplitText'];

// --- Constants ---
export const DURATION = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.8,
} as const;

export const EASE = {
  enter: 'power2.out',
  transition: 'power2.inOut',
  emphasis: 'back.out(1.7)',
} as const;

/** CSS/WAAPI equivalent of EASE.enter (power2 = cubic). */
const EASE_ENTER_CSS = 'cubic-bezier(0.33, 1, 0.68, 1)';

export const STAGGER = 0.1;

// --- Helpers ---
export function isReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Anything with a kill() method: a GSAP timeline/tween or a helper's handle. */
export interface MotionHandle {
  kill(): void;
}

// --- Lazy GSAP ---
let _core: Promise<GsapCore> | null = null;

function loadCore(): Promise<GsapCore> {
  _core ??= import('gsap').then((m) => m.gsap);
  return _core;
}

/**
 * Loads GSAP with ScrollTrigger and SplitText registered. Use it only where a
 * page genuinely needs them; the helpers below already cover reveals.
 */
export async function loadGsap(): Promise<{
  gsap: GsapCore;
  ScrollTrigger: ScrollTriggerClass;
  SplitText: SplitTextClass;
}> {
  const [gsap, { ScrollTrigger }, { SplitText }] = await Promise.all([
    loadCore(),
    import('gsap/ScrollTrigger'),
    import('gsap/SplitText'),
  ]);
  gsap.registerPlugin(ScrollTrigger, SplitText);
  return { gsap, ScrollTrigger, SplitText };
}

/** ScrollTrigger only if something on the page already loaded it. */
function loadedScrollTrigger(): ScrollTriggerClass | null {
  const w = window as unknown as { gsap?: GsapCore; ScrollTrigger?: ScrollTriggerClass };
  const core = w.gsap?.core as { globals?: () => Record<string, unknown> } | undefined;
  const fromGlobals = core?.globals?.().ScrollTrigger as ScrollTriggerClass | undefined;
  return fromGlobals ?? w.ScrollTrigger ?? null;
}

// --- Cleanup registry ---
interface Reveal {
  play(delay: number): void;
  finish(): void;
}

let _killables: MotionHandle[] = [];
// SplitText leaves wrapper spans in the DOM; View Transitions would snapshot
// them on swap, so every split registers a revert that runs before navigation.
let _reverts: (() => void)[] = [];
let _observers: IntersectionObserver[] = [];
let _reveals = new Set<Reveal>();
// Bumped by cleanupAll so GSAP loads that resolve after a navigation bail out.
let _generation = 0;

export function trackTimeline<T extends MotionHandle>(tl: T): T {
  _killables.push(tl);
  return tl;
}

export function cleanupAll(): void {
  _generation++;
  _observers.forEach((io) => io.disconnect());
  _observers = [];
  Array.from(_reveals).forEach((r) => r.finish());
  _reveals = new Set();
  _killables.forEach((k) => k.kill());
  _killables = [];
  _reverts.forEach((revert) => revert());
  _reverts = [];
  // Components that loaded ScrollTrigger themselves still get their triggers
  // killed here, as before. Pages that never loaded it skip this entirely.
  const ST = loadedScrollTrigger();
  if (ST) {
    ST.getAll().forEach((st) => st.kill());
    ST.refresh();
  }
}

// --- WAAPI reveal primitive ---
// One element, held in its "from" state (transparent, shifted down) by a
// paused animation until play(). The animation uses fill: 'backwards', so once
// it ends nothing is left inline and CSS hover transforms keep working.
// Elements the stylesheet hides until JS reveals them (About's
// `.section { opacity: 0 }`) are pinned visible inline, with their CSS
// transition parked so it can't race the animation.
function createReveal(el: HTMLElement, y: number, duration: number): Reveal | null {
  if (typeof el.animate !== 'function') return null;

  const cs = getComputedStyle(el);
  const pinned = parseFloat(cs.opacity) < 0.01;
  const prevTransition = el.style.transition;
  if (pinned) {
    el.style.transition = 'none';
    el.style.opacity = '1';
    if (cs.transform !== 'none') el.style.transform = 'none';
  }

  const anim = el.animate(
    [
      { opacity: 0, transform: `translateY(${y}px)` },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    { duration: duration * 1000, easing: EASE_ENTER_CSS, fill: 'backwards' }
  );
  anim.pause();

  let done = false;
  const reveal: Reveal = {
    play(delay) {
      if (done) return;
      anim.effect?.updateTiming({ delay: delay * 1000 });
      anim.play();
    },
    finish() {
      if (done) return;
      done = true;
      _reveals.delete(reveal);
      try {
        anim.cancel();
      } catch {
        /* already gone */
      }
      if (pinned) el.style.transition = prevTransition;
    },
  };
  anim.finished.then(() => reveal.finish()).catch(() => {});
  _reveals.add(reveal);
  return reveal;
}

/**
 * Reveal elements as they scroll into view; the ones that enter together form
 * one staggered batch (what ScrollTrigger.batch did). `start` is the viewport
 * fraction of the trigger line (0.88 = ScrollTrigger's "top 88%").
 */
function revealOnScroll(
  elements: Element[],
  { y, duration, stagger, start }: { y: number; duration: number; stagger: number; start: number }
): void {
  const pending = new Map<Element, Reveal>();
  elements.forEach((el) => {
    const reveal = createReveal(el as HTMLElement, y, duration);
    if (reveal) pending.set(el, reveal);
  });
  if (!pending.size) return;

  const io = new IntersectionObserver(
    (entries) => {
      const line = window.innerHeight * start;
      // Anything whose top is already above the trigger line goes now. That
      // also catches elements the reader jumped past (hash links, restored
      // scroll position), which never "intersect" on the way.
      const due = new Set<Element>();
      pending.forEach((_, el) => {
        if (el.getBoundingClientRect().top <= line) due.add(el);
      });
      entries.forEach((e) => {
        if (e.isIntersecting && pending.has(e.target)) due.add(e.target);
      });
      if (!due.size) return;
      Array.from(due)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        .forEach((el, i) => {
          pending.get(el)!.play(i * stagger);
          pending.delete(el);
          io.unobserve(el);
        });
      if (!pending.size) io.disconnect();
    },
    { rootMargin: `0px 0px -${Math.round((1 - start) * 100)}% 0px` }
  );
  pending.forEach((_, el) => io.observe(el));
  _observers.push(io);
}

// --- Page Entrance ---
// Animates a sequence of elements with staggered fade-in + slide-up
export function initPageEntrance(selector: string, _container?: string): MotionHandle | null {
  if (isReducedMotion()) return null;

  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
  const reveals = elements
    .map((el) => createReveal(el, 20, DURATION.normal))
    .filter((r): r is Reveal => r !== null);
  if (!reveals.length) return null;

  reveals.forEach((r, i) => r.play(i * STAGGER));
  return trackTimeline({ kill: () => reveals.forEach((r) => r.finish()) });
}

// --- Headline Reveal ---
// Splits a headline into chars and staggers them in so the title "performs"
// on load. GSAP + SplitText load on demand; meanwhile the headline is held
// hidden so it doesn't flash in full and then re-animate. The hold is short on
// purpose: the home H1 is the likely LCP element, so if the modules aren't
// there within HEADLINE_WAIT_MS (a cold first visit) the headline just shows
// and the split animation is skipped. Warm visits (cached modules) still get
// it. The split is reverted in cleanupAll so navigation snapshots see the
// original markup.
const HEADLINE_WAIT_MS = 150;

export function initHeadlineReveal(selector: string): MotionHandle | null {
  if (isReducedMotion()) return null;

  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return null;

  const generation = _generation;
  let settled = false;
  let tl: MotionHandle | null = null;
  const prevVisibility = el.style.visibility;
  const show = () => {
    el.style.visibility = prevVisibility;
  };

  el.style.visibility = 'hidden';
  const giveUp = window.setTimeout(() => {
    settled = true;
    show();
  }, HEADLINE_WAIT_MS);

  const handle = trackTimeline({
    kill() {
      settled = true;
      window.clearTimeout(giveUp);
      tl?.kill();
      show();
    },
  });

  Promise.all([loadCore(), import('gsap/SplitText')])
    .then(([gsap, { SplitText }]) => {
      if (settled || generation !== _generation) return;
      settled = true;
      window.clearTimeout(giveUp);
      gsap.registerPlugin(SplitText);
      const split = SplitText.create(el, { type: 'chars,words', aria: 'auto' });
      _reverts.push(() => split.revert());
      show();
      tl = gsap.timeline().from(split.chars, {
        yPercent: 60,
        opacity: 0,
        duration: 0.7,
        ease: EASE.enter,
        stagger: { each: 0.025, from: 'start' },
      });
    })
    .catch(() => handle.kill());

  return handle;
}

// --- Focal Wave Entrance ---
// One directed reveal: each item's delay grows with its distance to the focal
// element, so the entrance reads as a single wave radiating from the headline
// instead of identical fade-ups.
export function initFocalWave(focalSelector: string, itemsSelector: string): void {
  if (isReducedMotion()) return;

  const focal = document.querySelector(focalSelector);
  const items = document.querySelectorAll<HTMLElement>(itemsSelector);
  if (!focal || !items.length) return;

  const fRect = focal.getBoundingClientRect();
  const fx = fRect.left + fRect.width / 2;
  const fy = fRect.top + fRect.height / 2;

  items.forEach((item) => {
    const r = item.getBoundingClientRect();
    const dist = Math.hypot(r.left + r.width / 2 - fx, r.top + r.height / 2 - fy);
    const delay = Math.min(0.45, 0.12 + (dist / 1000) * 0.4);
    createReveal(item, 18, DURATION.normal)?.play(delay);
  });
}

// --- Scroll Reveals ---
// Grouped reveals as elements scroll into view. The defaults match the
// original behavior; post headings pass a smaller offset and later trigger.
export interface ScrollRevealOptions {
  /** Slide distance in px. Default 24. */
  y?: number;
  /** Seconds. Default DURATION.slow. */
  duration?: number;
  /** Seconds between items that enter together. Default STAGGER. */
  stagger?: number;
  /** Viewport fraction of the trigger line. Default 0.88 ("top 88%"). */
  start?: number;
}

export function initScrollReveals(selector: string, options: ScrollRevealOptions = {}): void {
  if (isReducedMotion()) return;

  const elements = Array.from(document.querySelectorAll(selector));
  if (!elements.length) return;

  revealOnScroll(elements, {
    y: options.y ?? 24,
    duration: options.duration ?? DURATION.slow,
    stagger: options.stagger ?? STAGGER,
    start: options.start ?? 0.88,
  });
}

// --- Staggered Children Reveal ---
// Reveals children of a container with stagger when container scrolls into view
export function initStaggeredReveal(containerSelector: string, childSelector: string): void {
  if (isReducedMotion()) return;

  document.querySelectorAll(containerSelector).forEach((container) => {
    const reveals = Array.from(container.querySelectorAll<HTMLElement>(childSelector))
      .map((child) => createReveal(child, 20, DURATION.normal))
      .filter((r): r is Reveal => r !== null);
    if (!reveals.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const top = container.getBoundingClientRect().top;
        // Not in view and still below the trigger line: wait. Above it
        // (jumped past via a hash link): reveal now.
        if (!entries.some((e) => e.isIntersecting) && top > window.innerHeight * 0.85) return;
        reveals.forEach((r, i) => r.play(i * STAGGER));
        io.disconnect();
      },
      { rootMargin: '0px 0px -15% 0px' }
    );
    io.observe(container);
    _observers.push(io);
  });
}

// --- Mouse Parallax ---
// Tracks mouse movement on a container and applies parallax to targets.
// Skipped on touch-first devices (no hover, coarse pointer). One quickTo per
// axis is fed from mousemove only, so an idle mouse costs nothing per frame.
interface ParallaxTarget {
  element: HTMLElement;
  x: number;
  y: number;
  rotateX?: number;
  rotateY?: number;
}

export function initMouseParallax(
  containerId: string,
  targets: ParallaxTarget[]
): (() => void) | null {
  if (isReducedMotion()) return null;
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return null;

  const container = document.getElementById(containerId);
  if (!container || !targets.length) return null;

  const generation = _generation;
  let cancelled = false;
  let detach = () => {};

  loadCore()
    .then((gsap) => {
      if (cancelled || generation !== _generation) return;

      const opts = { duration: 0.6, ease: 'power2.out' };
      const movers = targets.map((t) => ({
        t,
        x: gsap.quickTo(t.element, 'x', opts),
        y: gsap.quickTo(t.element, 'y', opts),
        rx: t.rotateX ? gsap.quickTo(t.element, 'rotateX', opts) : null,
        ry: t.rotateY ? gsap.quickTo(t.element, 'rotateY', opts) : null,
      }));

      const apply = (mx: number, my: number) => {
        movers.forEach(({ t, x, y, rx, ry }) => {
          x(mx * t.x);
          y(my * t.y);
          rx?.(-my * (t.rotateX ?? 0));
          ry?.(mx * (t.rotateY ?? 0));
        });
      };

      const onMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        apply(((e.clientX - rect.left) / rect.width - 0.5) * 2, ((e.clientY - rect.top) / rect.height - 0.5) * 2);
      };
      const onLeave = () => apply(0, 0);

      container.addEventListener('mousemove', onMove);
      container.addEventListener('mouseleave', onLeave);
      detach = () => {
        container.removeEventListener('mousemove', onMove);
        container.removeEventListener('mouseleave', onLeave);
        targets.forEach((t) => gsap.killTweensOf(t.element));
      };
    })
    .catch(() => {});

  return () => {
    cancelled = true;
    detach();
  };
}

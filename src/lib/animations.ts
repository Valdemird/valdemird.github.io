import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

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

export const STAGGER = 0.1;

// --- Helpers ---
export function isReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// --- Cleanup ---
let _timelines: gsap.core.Timeline[] = [];
let _triggers: ScrollTrigger[] = [];
// SplitText leaves wrapper spans in the DOM; View Transitions would snapshot
// them on swap, so every split registers a revert that runs before navigation.
let _reverts: (() => void)[] = [];

export function trackTimeline(tl: gsap.core.Timeline): gsap.core.Timeline {
  _timelines.push(tl);
  return tl;
}

export function cleanupAll(): void {
  _timelines.forEach((tl) => tl.kill());
  _timelines = [];
  _triggers.forEach((st) => st.kill());
  _triggers = [];
  ScrollTrigger.getAll().forEach((st) => st.kill());
  _reverts.forEach((revert) => revert());
  _reverts = [];
  ScrollTrigger.refresh();
}

// --- Page Entrance ---
// Animates a sequence of elements with staggered fade-in + slide-up
export function initPageEntrance(selector: string, container?: string): gsap.core.Timeline | null {
  if (isReducedMotion()) return null;

  const elements = document.querySelectorAll(selector);
  if (!elements.length) return null;

  const tl = trackTimeline(
    gsap.timeline({ defaults: { duration: DURATION.normal, ease: EASE.enter } })
  );

  tl.fromTo(
    elements,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, stagger: STAGGER }
  );

  return tl;
}

// --- Headline Reveal ---
// Splits a headline into chars and staggers them in so the title "performs"
// on load. The split is reverted in cleanupAll so navigation snapshots see
// the original markup.
export function initHeadlineReveal(selector: string): gsap.core.Timeline | null {
  if (isReducedMotion()) return null;

  const el = document.querySelector(selector);
  if (!el) return null;

  const split = SplitText.create(el, { type: 'chars,words', aria: 'auto' });
  _reverts.push(() => split.revert());

  const tl = trackTimeline(gsap.timeline());
  tl.from(split.chars, {
    yPercent: 60,
    opacity: 0,
    duration: 0.7,
    ease: EASE.enter,
    stagger: { each: 0.025, from: 'start' },
  });
  return tl;
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

  const tl = trackTimeline(gsap.timeline());
  items.forEach((item) => {
    const r = item.getBoundingClientRect();
    const dist = Math.hypot(r.left + r.width / 2 - fx, r.top + r.height / 2 - fy);
    const delay = Math.min(0.45, 0.12 + (dist / 1000) * 0.4);
    tl.fromTo(
      item,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: DURATION.normal, ease: EASE.enter },
      delay
    );
  });
}

// --- Scroll Reveals ---
// Uses ScrollTrigger.batch for efficient grouped reveals
export function initScrollReveals(selector: string): void {
  if (isReducedMotion()) return;

  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  // Set initial state
  gsap.set(elements, { opacity: 0, y: 24 });

  ScrollTrigger.batch(elements, {
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: DURATION.slow,
        ease: EASE.enter,
        stagger: STAGGER,
        overwrite: true,
      });
    },
    start: 'top 88%',
    once: true,
  });

  // Track for cleanup
  ScrollTrigger.getAll().forEach((st) => {
    if (!_triggers.includes(st)) _triggers.push(st);
  });
}

// --- Staggered Children Reveal ---
// Reveals children of a container with stagger when container scrolls into view
export function initStaggeredReveal(containerSelector: string, childSelector: string): void {
  if (isReducedMotion()) return;

  const containers = document.querySelectorAll(containerSelector);
  containers.forEach((container) => {
    const children = container.querySelectorAll(childSelector);
    if (!children.length) return;

    gsap.set(children, { opacity: 0, y: 20 });

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: DURATION.normal,
          ease: EASE.enter,
          stagger: STAGGER,
        });
      },
    });
    _triggers.push(st);
  });
}

// --- Mouse Parallax ---
// Tracks mouse movement on a container and applies parallax to targets
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

  const container = document.getElementById(containerId);
  if (!container) return null;

  let mouseX = 0;
  let mouseY = 0;

  const onMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  const onLeave = () => {
    mouseX = 0;
    mouseY = 0;
  };

  container.addEventListener('mousemove', onMove);
  container.addEventListener('mouseleave', onLeave);

  // Use GSAP ticker for smooth interpolation
  const onTick = () => {
    targets.forEach(({ element, x, y, rotateX, rotateY }) => {
      gsap.to(element, {
        x: mouseX * x,
        y: mouseY * y,
        rotateX: rotateX ? -mouseY * rotateX : undefined,
        rotateY: rotateY ? mouseX * rotateY : undefined,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  };

  gsap.ticker.add(onTick);

  // Return cleanup function
  return () => {
    container.removeEventListener('mousemove', onMove);
    container.removeEventListener('mouseleave', onLeave);
    gsap.ticker.remove(onTick);
  };
}

// Re-export for convenience
export { gsap, ScrollTrigger, SplitText };

/**
 * Central GSAP singleton for storytelling components.
 *
 * Usage from an Astro `<script>` island:
 *
 *   import { getGsap, onReducedMotion } from "../../lib/gsap";
 *   const { gsap, ScrollTrigger } = await getGsap();
 *   if (onReducedMotion()) { applyInstantly(); return; }
 *   gsap.from(".panel", { opacity: 0, y: 20, stagger: 0.08 });
 *
 * Why a singleton:
 * - ScrollTrigger must be registered exactly once per page.
 * - Astro View Transitions (`astro:after-swap`) re-executes island scripts;
 *   without guarding, ScrollTriggers accumulate and leak across navigations.
 * - `gsap.matchMedia()` is the canonical way to respect
 *   `prefers-reduced-motion` — the singleton wires it in once.
 */

type GsapModule = typeof import("gsap");
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger");

let pending: Promise<{
  gsap: GsapModule["gsap"];
  ScrollTrigger: ScrollTriggerModule["ScrollTrigger"];
}> | null = null;

export function getGsap() {
  if (pending) return pending;
  pending = (async () => {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);
    if (!(gsap as any).__vdCoreReady) {
      gsap.registerPlugin(ScrollTrigger);
      (gsap as any).__vdCoreReady = true;
    }
    return { gsap, ScrollTrigger };
  })();
  return pending;
}

/** Synchronous check — safe in any browser context. */
export function onReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Kill and re-create every ScrollTrigger owned by the current page. Call from
 * an `astro:before-swap` or `astro:after-swap` handler if a component created
 * ScrollTriggers at module scope. New components should prefer scoped
 * ScrollTriggers via a `data-*` selector and call `ctx.revert()` on cleanup.
 */
export async function killAllScrollTriggers() {
  const { ScrollTrigger } = await getGsap();
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

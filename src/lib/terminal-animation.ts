/**
 * Replays the hero terminal transcript as a typing animation.
 *
 * The transcript is server-rendered in its final state, so the terminal reads
 * correctly without JS, under reduced motion, and in the first paint. This
 * module only replays it: it hides the entries with `visibility` (the box
 * never changes size), types each command, reveals its output, and ends on
 * the same final transcript it started from. It starts once the terminal is
 * on screen, pauses while it is off screen or the tab is hidden, and plays a
 * fixed number of cycles (default 1) instead of looping forever.
 *
 * Expected markup inside `root`:
 *   [data-term-entry]        one per command
 *     [data-term-cmd]        the command text
 *     [data-term-out]        one per output line
 *   [data-term-final]        the trailing empty prompt
 *   [data-term-cursor]       the blinking cursor (moved while typing)
 *
 * The caller decides whether motion is allowed; this module never checks it.
 */

export interface TerminalAnimation {
  stop: () => void;
  /** Finishes the current command instantly; once finished, replays one cycle. */
  poke: () => void;
}

export interface TerminalOptions {
  /** How many full playthroughs to run before resting on the final transcript. */
  cycles?: number;
}

const HIDDEN = 'is-pending';
const LINE_IN = 'is-in';

export function initTerminalAnimation(root: HTMLElement, options: TerminalOptions = {}): TerminalAnimation {
  const cycles = Math.max(1, options.cycles ?? 1);
  const entries = Array.from(root.querySelectorAll<HTMLElement>('[data-term-entry]')).map((el) => {
    const cmd = el.querySelector<HTMLElement>('[data-term-cmd]');
    return {
      el,
      cmd,
      text: cmd?.textContent ?? '',
      lines: Array.from(el.querySelectorAll<HTMLElement>('[data-term-out]')),
    };
  });
  const finalLine = root.querySelector<HTMLElement>('[data-term-final]');
  const cursor = root.querySelector<HTMLElement>('[data-term-cursor]');

  let stopped = false;
  let running = false;
  let skip = false;
  let inView = false;
  let waiters: (() => void)[] = [];

  const wakeAll = () => {
    const pending = waiters;
    waiters = [];
    pending.forEach((w) => w());
  };

  // --- Gates: on screen + tab visible ---
  const observer = new IntersectionObserver(
    (records) => {
      inView = records.some((r) => r.isIntersecting);
      if (inView) wakeAll();
    },
    { threshold: 0.35 },
  );
  observer.observe(root);

  const onVisibility = () => {
    if (!document.hidden) wakeAll();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const canPlay = () => inView && !document.hidden;

  function gate(): Promise<void> {
    if (stopped || canPlay()) return Promise.resolve();
    return new Promise((resolve) => {
      const check = () => {
        if (stopped || canPlay()) resolve();
        else waiters.push(check);
      };
      waiters.push(check);
    });
  }

  function sleep(ms: number): Promise<void> {
    if (skip || stopped) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer);
        waiters = waiters.filter((w) => w !== wake);
        resolve();
      };
      // A poke or stop ends the sleep early; a visibility wake does not.
      const wake = () => (skip || stopped ? done() : waiters.push(wake));
      const timer = setTimeout(done, ms);
      waiters.push(wake);
    });
  }

  // --- Render states ---
  function showFinal() {
    for (const e of entries) {
      e.el.classList.remove(HIDDEN);
      if (e.cmd) e.cmd.textContent = e.text;
      e.lines.forEach((l) => l.classList.remove(HIDDEN, LINE_IN));
    }
    finalLine?.classList.remove(HIDDEN);
    if (cursor && finalLine) finalLine.appendChild(cursor);
  }

  function hideAll() {
    for (const e of entries) {
      e.el.classList.add(HIDDEN);
      if (e.cmd) e.cmd.textContent = '';
      e.lines.forEach((l) => {
        l.classList.remove(LINE_IN);
        l.classList.add(HIDDEN);
      });
    }
    finalLine?.classList.add(HIDDEN);
  }

  async function playEntry(entry: (typeof entries)[number], first: boolean) {
    skip = false;
    entry.el.classList.remove(HIDDEN);
    if (cursor && entry.cmd) entry.cmd.after(cursor);
    await sleep(first ? 700 : 450);

    for (const ch of entry.text) {
      if (stopped || skip) break;
      await gate();
      if (entry.cmd) entry.cmd.textContent += ch;
      await sleep(45 + Math.random() * 35);
    }
    if (stopped) return;
    if (entry.cmd) entry.cmd.textContent = entry.text;

    await sleep(300);
    for (const line of entry.lines) {
      if (stopped) return;
      await gate();
      line.classList.remove(HIDDEN);
      line.classList.add(LINE_IN);
      await sleep(150);
    }
    await sleep(1200);
  }

  async function play(times: number) {
    if (running || stopped) return;
    running = true;
    for (let cycle = 0; cycle < times && !stopped; cycle++) {
      await gate();
      if (stopped) break;
      hideAll();
      for (let i = 0; i < entries.length && !stopped; i++) {
        await playEntry(entries[i], i === 0);
      }
      showFinal();
    }
    skip = false;
    running = false;
  }

  if (entries.length && cursor) play(cycles);

  return {
    stop() {
      stopped = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      wakeAll();
      showFinal();
    },
    poke() {
      if (stopped) return;
      if (running) {
        skip = true;
        wakeAll();
      } else {
        play(1);
      }
    },
  };
}

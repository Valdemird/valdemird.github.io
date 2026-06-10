export interface TerminalCommand {
  cmd: string;
  output: string;
}

export interface TerminalAnimation {
  stop: () => void;
  /** Skips the current waits so the loop jumps ahead to the next command. */
  poke: () => void;
}

export function initTerminalAnimation(commands: TerminalCommand[]): TerminalAnimation {
  const cmdEl = document.getElementById('typed-cmd');
  const outputEl = document.getElementById('terminal-output');
  const cursorEl = document.querySelector('.terminal-cursor') as HTMLElement | null;

  let stopped = false;
  let cmdIndex = 0;
  let pokeRequested = false;
  let pokeWaiters: (() => void)[] = [];

  function sleep(ms: number): Promise<void> {
    if (pokeRequested) return Promise.resolve();
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        pokeWaiters = pokeWaiters.filter((w) => w !== waiter);
        resolve();
      }, ms);
      const waiter = () => {
        clearTimeout(timer);
        resolve();
      };
      pokeWaiters.push(waiter);
    });
  }

  function waitForVisible(): Promise<void> {
    if (!document.hidden) return Promise.resolve();
    return new Promise((resolve) => {
      const handler = () => {
        if (!document.hidden) {
          document.removeEventListener('visibilitychange', handler);
          resolve();
        }
      };
      document.addEventListener('visibilitychange', handler);
    });
  }

  async function typeCommand(text: string) {
    if (!cmdEl) return;
    cmdEl.textContent = '';
    for (let i = 0; i < text.length; i++) {
      if (stopped) return;
      if (pokeRequested) {
        cmdEl.textContent = text;
        return;
      }
      await waitForVisible();
      cmdEl.textContent += text[i];
      await sleep(45 + Math.random() * 35);
    }
  }

  async function showOutput(text: string) {
    if (!outputEl) return;
    await sleep(300);
    if (cursorEl) cursorEl.style.display = 'none';
    for (const line of text.split('\n')) {
      if (stopped) return;
      await waitForVisible();
      const div = document.createElement('div');
      div.className = 'output-line';
      div.textContent = line;
      outputEl.appendChild(div);
      await sleep(150);
    }
  }

  async function run() {
    while (!stopped) {
      await waitForVisible();
      pokeRequested = false;
      const { cmd, output } = commands[cmdIndex % commands.length];
      if (cmdEl) cmdEl.textContent = '';
      if (outputEl) outputEl.innerHTML = '';
      if (cursorEl) cursorEl.style.display = '';
      await sleep(800);
      await typeCommand(cmd);
      await showOutput(output);
      await sleep(2500);
      cmdIndex++;
    }
  }

  if (cmdEl) run();

  return {
    stop() {
      stopped = true;
      pokeWaiters.forEach((w) => w());
      pokeWaiters = [];
    },
    poke() {
      pokeRequested = true;
      pokeWaiters.forEach((w) => w());
      pokeWaiters = [];
    },
  };
}

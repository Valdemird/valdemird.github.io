// Shared harness for posters.mjs and record.mjs: serves public/ on a throwaway
// port and drives a headless Chrome (real GPU, so the game runs at 60 fps) over
// the DevTools protocol. No dependencies beyond Node 22+ (global fetch/WebSocket).
import { createServer } from 'node:http';
import { readFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { extname, join, normalize } from 'node:path';
import { tmpdir } from 'node:os';

export const SITE = new URL('../../../', import.meta.url).pathname;
export const PUBLIC = join(SITE, 'public');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TYPES = {
	'.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm',
	'.pck': 'application/octet-stream', '.png': 'image/png', '.mp4': 'video/mp4', '.webp': 'image/webp', '.txt': 'text/plain',
};
const KEYS = {
	Space: [' ', 32], ArrowRight: ['ArrowRight', 39], ArrowLeft: ['ArrowLeft', 37],
	ArrowUp: ['ArrowUp', 38], ArrowDown: ['ArrowDown', 40], KeyX: ['x', 88], KeyC: ['c', 67],
	KeyT: ['t', 84], KeyR: ['r', 82],
};
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Runs `fn(page)` with a live page; tears everything down afterwards. */
export async function withBrowser(fn) {
	const server = createServer(async (req, res) => {
		const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
		try {
			const body = await readFile(join(PUBLIC, path));
			res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
			res.end(body);
		} catch {
			res.writeHead(404).end();
		}
	});
	await new Promise((r) => server.listen(0, '127.0.0.1', r));
	const origin = `http://127.0.0.1:${server.address().port}`;

	const port = 9400 + Math.floor(Math.random() * 400);
	const profile = join(tmpdir(), `lab-chrome-${port}`);
	const chrome = spawn(CHROME, [
		'--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
		'--window-size=1280,720', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
		'--no-first-run', '--no-default-browser-check', 'about:blank',
	], { stdio: 'ignore' });

	let wsUrl;
	for (let i = 0; i < 60 && !wsUrl; i++) {
		await sleep(200);
		try {
			const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
			wsUrl = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
		} catch {}
	}
	if (!wsUrl) throw new Error('Chrome did not start');
	const ws = new WebSocket(wsUrl);
	await new Promise((r) => ws.addEventListener('open', r));

	let nextId = 0;
	const pending = new Map();
	ws.addEventListener('message', (ev) => {
		const msg = JSON.parse(ev.data);
		if (msg.id && pending.has(msg.id)) {
			pending.get(msg.id)(msg);
			pending.delete(msg.id);
		} else if (msg.method === 'Runtime.exceptionThrown') {
			console.warn('  page exception:', msg.params.exceptionDetails.text);
		} else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
			const text = msg.params.args.map((a) => a.value ?? '').join(' ');
			if (/SCRIPT ERROR|Parse Error|Invalid call/.test(text)) console.warn('  godot:', text);
		}
	});
	const send = (method, params = {}) => new Promise((resolve, reject) => {
		const id = ++nextId;
		pending.set(id, (msg) => (msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)));
		ws.send(JSON.stringify({ id, method, params }));
	});

	const page = {
		origin,
		send,
		async evaluate(expression) {
			const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
			if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
			return r.result.value;
		},
		async key(code, holdMs = 70) {
			const [key, vk] = KEYS[code] || [code, 0];
			const base = { code, key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
			await send('Input.dispatchKeyEvent', { type: 'keyDown', ...base });
			await sleep(holdMs);
			await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
		},
		/** Opens a lab URL and waits until the engine is running (the shell removes #status). */
		async openGame(query) {
			await send('Page.navigate', { url: `${origin}/play/platformer-lab/index.html?${query}` });
			for (let i = 0; i < 240; i++) {
				await sleep(250);
				try {
					if (await page.evaluate("!document.getElementById('status')")) return true;
				} catch {}
			}
			return false;
		},
	};

	await send('Runtime.enable');
	await send('Page.enable');
	await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
	try {
		return await fn(page);
	} finally {
		ws.close();
		chrome.kill();
		server.close();
		await rm(profile, { recursive: true, force: true }).catch(() => {});
	}
}

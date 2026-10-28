/**
 * Knowledge map renderers: WebGPU (WGSL) and WebGL2 (GLSL ES 3.0), same scene,
 * three instanced draws (terrain, edges, nodes), drawn on demand only.
 *
 * Neither backend is trusted until it has painted: `verifyFrame` reads one
 * frame back and the caller only hides the static poster after it passes.
 * WebGPU also runs inside error scopes, refuses software (fallback) adapters
 * and never configures a zero-size canvas.
 */

export interface SceneData {
	/** Height field, row-major, [0, 1]. */
	hf: { f: Float32Array; gw: number; gh: number };
	/** 10 floats per edge: ax ay cx cy bx by kind emph vis len. */
	edges: Float32Array;
	edgeCount: number;
	/** 6 floats per node: x y kind r emph vis. */
	nodes: Float32Array;
	nodeCount: number;
}

export interface Renderer {
	name: 'WebGPU' | 'WebGL2';
	/** Upload a new terrain + static instance layout (on layout switch). */
	setScene(s: SceneData): void;
	/** Draw one frame; returns false if the backend is no longer usable. */
	draw(u: Float32Array, s: SceneData): boolean;
	destroy(): void;
}

export const SEG = 28;
export const EDGE_STRIDE = 10;
export const NODE_STRIDE = 6;

/* ------------------------------------------------------------------ shaders */
// U: vp(vw,vh,dpr,t) cam(x,y,k,homeK) foc(x,y,amt,levels) rev(terrain,edges,nodes,dark) ink acc warm term paper misc(W,H,flow,0)
const WGSL_HEAD = /* wgsl */ `
struct U { vp: vec4f, cam: vec4f, foc: vec4f, rev: vec4f, ink: vec4f, acc: vec4f, warm: vec4f, term: vec4f, paper: vec4f, misc: vec4f };
@group(0) @binding(0) var<uniform> u: U;
fn w2s(p: vec2f) -> vec2f { return (p - u.cam.xy) * u.cam.z + u.vp.xy * 0.5; }
fn s2clip(s: vec2f) -> vec4f { return vec4f(s.x / u.vp.x * 2.0 - 1.0, 1.0 - s.y / u.vp.y * 2.0, 0.0, 1.0); }
`;

const WGSL_TERRAIN = WGSL_HEAD + /* wgsl */ `
@group(0) @binding(1) var hs: sampler;
@group(0) @binding(2) var ht: texture_2d<f32>;
struct TO { @builtin(position) pos: vec4f };
@vertex fn vs(@builtin(vertex_index) i: u32) -> TO {
	var p = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
	var o: TO; o.pos = vec4f(p[i], 0.0, 1.0); return o;
}
@fragment fn fs(i: TO) -> @location(0) vec4f {
	let css = i.pos.xy / u.vp.z;
	let w = (css - u.vp.xy * 0.5) / u.cam.z + u.cam.xy;
	let uv = w / u.misc.xy;
	let ts = 1.0 / vec2f(textureDimensions(ht));
	let h = textureSampleLevel(ht, hs, uv, 0.0).r;
	let hx = textureSampleLevel(ht, hs, uv + vec2f(ts.x, 0.0), 0.0).r - textureSampleLevel(ht, hs, uv - vec2f(ts.x, 0.0), 0.0).r;
	let hy = textureSampleLevel(ht, hs, uv + vec2f(0.0, ts.y), 0.0).r - textureSampleLevel(ht, hs, uv - vec2f(0.0, ts.y), 0.0).r;
	let L = u.foc.w;
	let v = h * L;
	let fw = max(fwidth(v), 1e-4);
	let inside = smoothstep(0.0, 0.015, uv.x) * smoothstep(0.0, 0.015, uv.y) * smoothstep(0.0, 0.015, 1.0 - uv.x) * smoothstep(0.0, 0.015, 1.0 - uv.y);
	let lvl = floor(v + 0.5);
	let dist = abs(v - lvl) / fw;
	let isIdx = 1.0 - step(0.5, lvl - 5.0 * floor(lvl / 5.0));
	let isShore = 1.0 - step(0.5, abs(lvl - 1.0));
	let lw = mix(mix(0.45, 0.9, isIdx), 0.8, isShore);
	let line = 1.0 - smoothstep(lw - 0.5, lw + 0.6, dist);
	let crowd = 1.0 - smoothstep(0.22, 0.55, fw) * (1.0 - isIdx * 0.6);
	let shown = clamp(u.rev.x * (L + 1.5) - lvl, 0.0, 1.0);
	let land = step(0.5, lvl);
	let d = w - u.foc.xy;
	let spot = exp(-dot(d, d) / (2.0 * 240.0 * 240.0)) * u.foc.z;
	let dark = u.rev.w;
	let aLine = line * shown * land * inside * crowd * ((mix(0.075, 0.16, isIdx) + 0.07 * isShore + 0.24 * spot) * mix(1.0, 1.05, dark));
	let band = floor(v) / L;
	let tint = (smoothstep(0.02, 0.07, h) * (mix(0.012, 0.04, dark) + band * mix(0.05, 0.11, dark))) * u.rev.x * inside;
	let nrm = normalize(vec3f(-hx * 9.0, -hy * 9.0, 1.0));
	let lit = dot(nrm, normalize(vec3f(-0.55, -0.75, 0.9)));
	let shade = clamp((0.62 - lit) * 1.5, 0.0, 1.0) * smoothstep(0.02, 0.1, h) * mix(0.07, 0.16, dark) * u.rev.x * inside;
	var c = u.acc.rgb * tint;
	var a = tint;
	let sc = mix(u.ink.rgb, vec3f(0.0), dark);
	c = sc * shade + c * (1.0 - shade); a = shade + a * (1.0 - shade);
	c = u.ink.rgb * aLine + c * (1.0 - aLine);
	a = aLine + a * (1.0 - aLine);
	return vec4f(c, a);
}
`;

const WGSL_EDGES = WGSL_HEAD + /* wgsl */ `
struct EO { @builtin(position) pos: vec4f, @location(0) side: f32, @location(1) hw: f32, @location(2) arc: f32, @location(3) t: f32,
	@location(4) @interpolate(flat) kind: f32, @location(5) emph: f32, @location(6) vis: f32 };
fn baseW(k: i32) -> f32 { var w = array<f32, 8>(1.6, 1.1, 0.9, 1.2, 0.7, 0.7, 0.6, 0.8); return w[k]; }
fn baseA(k: i32) -> f32 { var a = array<f32, 8>(0.6, 0.3, 0.05, 0.24, 0.0, 0.07, 0.0, 0.0); return a[k]; }
@vertex fn vs(@location(0) tv: vec2f, @location(1) a: vec2f, @location(2) c: vec2f, @location(3) b: vec2f, @location(4) info: vec4f) -> EO {
	let t = tv.x;
	let p = mix(mix(a, c, t), mix(c, b, t), t);
	var d = 2.0 * (1.0 - t) * (c - a) + 2.0 * t * (b - c);
	d = d / max(length(d), 1e-4);
	let n = vec2f(-d.y, d.x);
	let k = i32(info.x);
	let zw = clamp(sqrt(u.cam.z / u.cam.w), 0.85, 1.7);
	let w = baseW(k) * zw * (1.0 + 1.1 * info.y);
	let hw = w * 0.5 + 1.0;
	var o: EO;
	o.pos = s2clip(w2s(p) + n * tv.y * hw);
	o.side = tv.y * hw; o.hw = w * 0.5; o.arc = t * info.w; o.t = t; o.kind = info.x; o.emph = info.y; o.vis = info.z;
	return o;
}
@fragment fn fs(i: EO) -> @location(0) vec4f {
	let k = i32(i.kind);
	let aa = 1.0 - smoothstep(i.hw - 0.5, i.hw + 0.5, abs(i.side));
	let grow = 1.0 - smoothstep(u.rev.y - 0.02, u.rev.y, i.t);
	var base = baseA(k) * i.vis;
	if (k == 5) { base = base * smoothstep(0.9, 1.6, u.cam.z); }
	var a = mix(base, 0.92, i.emph);
	if (k == 0) { a = a * mix(0.2, 1.0, step(0.42, fract(i.arc / 18.0))); }
	var col = u.acc.rgb;
	if (k == 2 || k == 7) { col = u.warm.rgb; }
	if (k == 3) { col = u.ink.rgb; }
	if (k == 4 || k == 5 || k == 6) { col = u.term.rgb; }
	let pulse = smoothstep(0.84, 1.0, fract(i.arc / 150.0 - u.vp.w * 0.5)) * i.emph * u.misc.z;
	col = mix(col, u.ink.rgb, pulse * 0.7);
	a = clamp(a + pulse * 0.5, 0.0, 1.0) * aa * grow;
	return vec4f(col * a, a);
}
`;

const WGSL_NODES = WGSL_HEAD + /* wgsl */ `
struct NO { @builtin(position) pos: vec4f, @location(0) l: vec2f, @location(1) @interpolate(flat) kind: f32, @location(2) r: f32, @location(3) emph: f32, @location(4) vis: f32 };
@vertex fn vs(@location(0) corner: vec2f, @location(1) p: vec2f, @location(2) info: vec4f) -> NO {
	let zr = clamp(pow(u.cam.z / u.cam.w, 0.45), 0.85, 2.6);
	let r = info.y * zr * (1.0 + 0.28 * info.z);
	let ext = r + 8.0;
	var o: NO;
	o.pos = s2clip(w2s(p) + corner * ext);
	o.l = corner * ext; o.kind = info.x; o.r = r; o.emph = info.z; o.vis = info.w;
	return o;
}
@fragment fn fs(i: NO) -> @location(0) vec4f {
	let d = length(i.l);
	let r = i.r;
	let k = i32(i.kind);
	var c = vec3f(0.0);
	var a = 0.0;
	var halo = u.acc.rgb;
	if (k == 0) {
		a = 1.0 - smoothstep(r - 0.8, r + 0.6, d); c = u.ink.rgb * a;
	} else if (k == 1) {
		let rr = r * 0.8;
		let fill = 1.0 - smoothstep(rr - 0.6, rr + 0.4, d);
		let ring = 1.0 - smoothstep(0.9, 1.8, abs(d - rr));
		let core = (1.0 - smoothstep(r * 0.32 - 0.6, r * 0.32 + 0.6, d)) * i.emph;
		c = u.paper.rgb * fill; a = fill;
		c = u.acc.rgb * core + c * (1.0 - core); a = core + a * (1.0 - core);
		c = u.acc.rgb * ring + c * (1.0 - ring); a = ring + a * (1.0 - ring);
	} else if (k == 2) {
		let dd = (abs(i.l.x) + abs(i.l.y)) * 0.7071;
		a = 1.0 - smoothstep(r - 0.7, r + 0.5, dd); c = u.warm.rgb * a; halo = u.warm.rgb;
	} else {
		a = (1.0 - smoothstep(r - 0.6, r + 0.6, d)) * 0.85 * max(smoothstep(0.62, 1.05, u.cam.z), i.emph); c = u.term.rgb * a;
	}
	let hr = (1.0 - smoothstep(0.5, 1.3, abs(d - (r + 4.0)))) * i.emph;
	c = halo * hr + c * (1.0 - hr); a = hr + a * (1.0 - hr);
	let m = i.vis * u.rev.z;
	return vec4f(c * m, a * m);
}
`;

const GLSL_HEAD = `#version 300 es
precision highp float;
uniform vec4 U[10];
#define VP U[0]
#define CAM U[1]
#define FOC U[2]
#define REV U[3]
#define INK U[4]
#define ACC U[5]
#define WARM U[6]
#define TERM U[7]
#define PAPER U[8]
#define MISC U[9]
vec2 w2s(vec2 p) { return (p - CAM.xy) * CAM.z + VP.xy * 0.5; }
vec4 s2clip(vec2 s) { return vec4(s.x / VP.x * 2.0 - 1.0, 1.0 - s.y / VP.y * 2.0, 0.0, 1.0); }
`;

const GL = {
	terrainVS: GLSL_HEAD + `void main() { vec2 p = vec2(float((gl_VertexID & 1) << 2) - 1.0, float((gl_VertexID & 2) << 1) - 1.0); gl_Position = vec4(p, 0.0, 1.0); }`,
	terrainFS:
		GLSL_HEAD +
		`uniform sampler2D ht; out vec4 o;
void main() {
	vec2 css = vec2(gl_FragCoord.x, VP.y * VP.z - gl_FragCoord.y) / VP.z;
	vec2 w = (css - VP.xy * 0.5) / CAM.z + CAM.xy;
	vec2 uv = w / MISC.xy;
	vec2 ts = 1.0 / vec2(textureSize(ht, 0));
	float h = texture(ht, uv).r;
	float hx = texture(ht, uv + vec2(ts.x, 0.0)).r - texture(ht, uv - vec2(ts.x, 0.0)).r;
	float hy = texture(ht, uv + vec2(0.0, ts.y)).r - texture(ht, uv - vec2(0.0, ts.y)).r;
	float L = FOC.w; float v = h * L; float fw = max(fwidth(v), 1e-4);
	float inside = smoothstep(0.0, 0.015, uv.x) * smoothstep(0.0, 0.015, uv.y) * smoothstep(0.0, 0.015, 1.0 - uv.x) * smoothstep(0.0, 0.015, 1.0 - uv.y);
	float lvl = floor(v + 0.5); float dist = abs(v - lvl) / fw;
	float isIdx = 1.0 - step(0.5, lvl - 5.0 * floor(lvl / 5.0));
	float isShore = 1.0 - step(0.5, abs(lvl - 1.0));
	float lw = mix(mix(0.45, 0.9, isIdx), 0.8, isShore);
	float line = 1.0 - smoothstep(lw - 0.5, lw + 0.6, dist);
	float crowd = 1.0 - smoothstep(0.22, 0.55, fw) * (1.0 - isIdx * 0.6);
	float shown = clamp(REV.x * (L + 1.5) - lvl, 0.0, 1.0);
	float land = step(0.5, lvl);
	vec2 d = w - FOC.xy; float spot = exp(-dot(d, d) / (2.0 * 240.0 * 240.0)) * FOC.z;
	float dark = REV.w;
	float aLine = line * shown * land * inside * crowd * ((mix(0.075, 0.16, isIdx) + 0.07 * isShore + 0.24 * spot) * mix(1.0, 1.05, dark));
	float band = floor(v) / L;
	float tint = (smoothstep(0.02, 0.07, h) * (mix(0.012, 0.04, dark) + band * mix(0.05, 0.11, dark))) * REV.x * inside;
	vec3 nrm = normalize(vec3(-hx * 9.0, -hy * 9.0, 1.0));
	float lit = dot(nrm, normalize(vec3(-0.55, -0.75, 0.9)));
	float shade = clamp((0.62 - lit) * 1.5, 0.0, 1.0) * smoothstep(0.02, 0.1, h) * mix(0.07, 0.16, dark) * REV.x * inside;
	vec3 c = ACC.rgb * tint; float a = tint;
	vec3 sc = mix(INK.rgb, vec3(0.0), dark);
	c = sc * shade + c * (1.0 - shade); a = shade + a * (1.0 - shade);
	c = INK.rgb * aLine + c * (1.0 - aLine); a = aLine + a * (1.0 - aLine);
	o = vec4(c, a);
}`,
	edgeVS:
		GLSL_HEAD +
		`layout(location=0) in vec2 tv; layout(location=1) in vec2 a; layout(location=2) in vec2 c; layout(location=3) in vec2 b; layout(location=4) in vec4 info;
out float vSide; out float vHw; out float vArc; out float vT; flat out float vKind; out float vEmph; out float vVis;
const float BW[8] = float[8](1.6, 1.1, 0.9, 1.2, 0.7, 0.7, 0.6, 0.8);
void main() {
	float t = tv.x; vec2 p = mix(mix(a, c, t), mix(c, b, t), t);
	vec2 d = 2.0 * (1.0 - t) * (c - a) + 2.0 * t * (b - c); d = d / max(length(d), 1e-4);
	vec2 n = vec2(-d.y, d.x); int k = int(info.x);
	float zw = clamp(sqrt(CAM.z / CAM.w), 0.85, 1.7);
	float w = BW[k] * zw * (1.0 + 1.1 * info.y); float hw = w * 0.5 + 1.0;
	gl_Position = s2clip(w2s(p) + n * tv.y * hw);
	vSide = tv.y * hw; vHw = w * 0.5; vArc = t * info.w; vT = t; vKind = info.x; vEmph = info.y; vVis = info.z;
}`,
	edgeFS:
		GLSL_HEAD +
		`in float vSide; in float vHw; in float vArc; in float vT; flat in float vKind; in float vEmph; in float vVis; out vec4 o;
const float BA[8] = float[8](0.6, 0.3, 0.05, 0.24, 0.0, 0.07, 0.0, 0.0);
void main() {
	int k = int(vKind);
	float aa = 1.0 - smoothstep(vHw - 0.5, vHw + 0.5, abs(vSide));
	float grow = 1.0 - smoothstep(REV.y - 0.02, REV.y, vT);
	float base = BA[k] * vVis;
	if (k == 5) base *= smoothstep(0.9, 1.6, CAM.z);
	float a = mix(base, 0.92, vEmph);
	if (k == 0) a *= mix(0.2, 1.0, step(0.42, fract(vArc / 18.0)));
	vec3 col = ACC.rgb;
	if (k == 2 || k == 7) col = WARM.rgb;
	if (k == 3) col = INK.rgb;
	if (k == 4 || k == 5 || k == 6) col = TERM.rgb;
	float pulse = smoothstep(0.84, 1.0, fract(vArc / 150.0 - VP.w * 0.5)) * vEmph * MISC.z;
	col = mix(col, INK.rgb, pulse * 0.7);
	a = clamp(a + pulse * 0.5, 0.0, 1.0) * aa * grow;
	o = vec4(col * a, a);
}`,
	nodeVS:
		GLSL_HEAD +
		`layout(location=0) in vec2 corner; layout(location=1) in vec2 p; layout(location=2) in vec4 info;
out vec2 vL; flat out float vKind; out float vR; out float vEmph; out float vVis;
void main() {
	float zr = clamp(pow(CAM.z / CAM.w, 0.45), 0.85, 2.6);
	float r = info.y * zr * (1.0 + 0.28 * info.z); float ext = r + 8.0;
	gl_Position = s2clip(w2s(p) + corner * ext);
	vL = corner * ext; vKind = info.x; vR = r; vEmph = info.z; vVis = info.w;
}`,
	nodeFS:
		GLSL_HEAD +
		`in vec2 vL; flat in float vKind; in float vR; in float vEmph; in float vVis; out vec4 o;
void main() {
	float d = length(vL); float r = vR; int k = int(vKind);
	vec3 c = vec3(0.0); float a = 0.0; vec3 halo = ACC.rgb;
	if (k == 0) { a = 1.0 - smoothstep(r - 0.8, r + 0.6, d); c = INK.rgb * a; }
	else if (k == 1) {
		float rr = r * 0.8;
		float fill = 1.0 - smoothstep(rr - 0.6, rr + 0.4, d);
		float ring = 1.0 - smoothstep(0.9, 1.8, abs(d - rr));
		float core = (1.0 - smoothstep(r * 0.32 - 0.6, r * 0.32 + 0.6, d)) * vEmph;
		c = PAPER.rgb * fill; a = fill;
		c = ACC.rgb * core + c * (1.0 - core); a = core + a * (1.0 - core);
		c = ACC.rgb * ring + c * (1.0 - ring); a = ring + a * (1.0 - ring);
	} else if (k == 2) {
		float dd = (abs(vL.x) + abs(vL.y)) * 0.7071;
		a = 1.0 - smoothstep(r - 0.7, r + 0.5, dd); c = WARM.rgb * a; halo = WARM.rgb;
	} else { a = (1.0 - smoothstep(r - 0.6, r + 0.6, d)) * 0.85 * max(smoothstep(0.62, 1.05, CAM.z), vEmph); c = TERM.rgb * a; }
	float hr = (1.0 - smoothstep(0.5, 1.3, abs(d - (r + 4.0)))) * vEmph;
	c = halo * hr + c * (1.0 - hr); a = hr + a * (1.0 - hr);
	float m = vVis * REV.z;
	o = vec4(c * m, a * m);
}`,
};

const STRIP = new Float32Array((SEG + 1) * 4);
for (let s = 0; s <= SEG; s++) STRIP.set([s / SEG, -1, s / SEG, 1], s * 4);
const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer);
function toHalf(v: number): number {
	f32[0] = v;
	const x = u32[0];
	const sign = (x >>> 16) & 0x8000;
	const e = ((x >>> 23) & 0xff) - 112;
	const m = x & 0x7fffff;
	if (e <= 0) return sign;
	if (e >= 31) return sign | 0x7c00;
	return sign | (e << 10) | (m >>> 13);
}
const halfOf = (f: Float32Array) => {
	const h = new Uint16Array(f.length);
	for (let i = 0; i < f.length; i++) h[i] = toHalf(f[i]);
	return h;
};

/* ------------------------------------------------------------------ WebGPU */
/** CPU rasterisers (SwiftShader, llvmpipe, WARP...): what --disable-gpu and blocklisted GPUs get. */
const SOFTWARE_GL = /SwiftShader|llvmpipe|softpipe|Software|Basic Render|Microsoft Basic/i;

export async function initWebGPU(
	canvas: HTMLCanvasElement,
	scene: SceneData,
	onLost: (why: string) => void,
	opts: { allowFallback?: boolean } = {},
): Promise<Renderer> {
	const gpu = (navigator as any).gpu;
	if (!gpu) throw new Error('no navigator.gpu');
	const adapter = await gpu.requestAdapter({ powerPreference: 'low-power' });
	if (!adapter) throw new Error('no adapter');
	// A software adapter is slower than WebGL2 on the same machine and is where blank-canvas bugs live.
	if (!opts.allowFallback && (adapter.info?.isFallbackAdapter || adapter.isFallbackAdapter)) throw new Error('fallback adapter');
	const ai = adapter.info ?? {};
	if (!opts.allowFallback && SOFTWARE_GL.test(`${ai.vendor ?? ''} ${ai.architecture ?? ''} ${ai.description ?? ''}`)) throw new Error('software adapter');
	const device = await adapter.requestDevice();
	let alive = true;
	device.lost.then((info: any) => {
		if (alive && info?.reason !== 'destroyed') onLost(`device lost: ${info?.message ?? ''}`);
	});
	device.addEventListener?.('uncapturederror', (e: any) => {
		if (alive) onLost(`uncaptured: ${e?.error?.message ?? 'error'}`);
	});
	device.pushErrorScope('validation');
	device.pushErrorScope('out-of-memory');
	const ctx = canvas.getContext('webgpu') as any;
	if (!ctx) throw new Error('no webgpu context');
	const format = gpu.getPreferredCanvasFormat();
	let configured = false;
	const configure = () => {
		if (canvas.width < 1 || canvas.height < 1) return false;
		if (!configured) {
			ctx.configure({ device, format, alphaMode: 'premultiplied' });
			configured = true;
		}
		return true;
	};
	const B = (globalThis as any).GPUBufferUsage;
	const TU = (globalThis as any).GPUTextureUsage;
	const ubuf = device.createBuffer({ size: 160, usage: B.UNIFORM | B.COPY_DST });
	const blend = {
		color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
		alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
	};
	const pipe = (code: string, buffers: any[], topology: string) => {
		const module = device.createShaderModule({ code });
		return device.createRenderPipeline({
			layout: 'auto',
			vertex: { module, entryPoint: 'vs', buffers },
			fragment: { module, entryPoint: 'fs', targets: [{ format, blend }] },
			primitive: { topology },
		});
	};
	const pT = pipe(WGSL_TERRAIN, [], 'triangle-list');
	const pE = pipe(
		WGSL_EDGES,
		[
			{ arrayStride: 8, stepMode: 'vertex', attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }] },
			{
				arrayStride: 40,
				stepMode: 'instance',
				attributes: [
					{ shaderLocation: 1, offset: 0, format: 'float32x2' },
					{ shaderLocation: 2, offset: 8, format: 'float32x2' },
					{ shaderLocation: 3, offset: 16, format: 'float32x2' },
					{ shaderLocation: 4, offset: 24, format: 'float32x4' },
				],
			},
		],
		'triangle-strip',
	);
	const pN = pipe(
		WGSL_NODES,
		[
			{ arrayStride: 8, stepMode: 'vertex', attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }] },
			{
				arrayStride: 24,
				stepMode: 'instance',
				attributes: [
					{ shaderLocation: 1, offset: 0, format: 'float32x2' },
					{ shaderLocation: 2, offset: 8, format: 'float32x4' },
				],
			},
		],
		'triangle-strip',
	);
	const mkBuf = (data: Float32Array, usage: number) => {
		const b = device.createBuffer({ size: Math.max(16, data.byteLength), usage: usage | B.COPY_DST });
		if (data.byteLength) device.queue.writeBuffer(b, 0, data);
		return b;
	};
	const strip = mkBuf(STRIP, B.VERTEX);
	const quad = mkBuf(QUAD, B.VERTEX);
	const samp = device.createSampler({ magFilter: 'linear', minFilter: 'linear', addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' });
	let eBuf: any, nBuf: any, tex: any, bgT: any;
	const bgE = device.createBindGroup({ layout: pE.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubuf } }] });
	const bgN = device.createBindGroup({ layout: pN.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubuf } }] });
	const setScene = (s: SceneData) => {
		eBuf?.destroy();
		nBuf?.destroy();
		tex?.destroy();
		eBuf = mkBuf(s.edges, B.VERTEX);
		nBuf = mkBuf(s.nodes, B.VERTEX);
		tex = device.createTexture({ size: [s.hf.gw, s.hf.gh], format: 'r16float', usage: TU.TEXTURE_BINDING | TU.COPY_DST });
		const half = halfOf(s.hf.f);
		// bytesPerRow must be a multiple of 256 for copies, but writeTexture allows any; keep it tight.
		device.queue.writeTexture({ texture: tex }, half, { bytesPerRow: s.hf.gw * 2, rowsPerImage: s.hf.gh }, [s.hf.gw, s.hf.gh]);
		bgT = device.createBindGroup({
			layout: pT.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: { buffer: ubuf } },
				{ binding: 1, resource: samp },
				{ binding: 2, resource: tex.createView() },
			],
		});
	};
	setScene(scene);
	const oom = await device.popErrorScope();
	const val = await device.popErrorScope();
	if (oom || val) {
		alive = false;
		device.destroy();
		throw new Error(`setup: ${(val || oom).message}`);
	}
	return {
		name: 'WebGPU',
		setScene,
		draw(u, s) {
			if (!alive) return false;
			if (!configure()) return true; // zero-size canvas: nothing to draw, not a failure
			device.queue.writeBuffer(ubuf, 0, u);
			if (s.edges.byteLength) device.queue.writeBuffer(eBuf, 0, s.edges);
			if (s.nodes.byteLength) device.queue.writeBuffer(nBuf, 0, s.nodes);
			const enc = device.createCommandEncoder();
			const pass = enc.beginRenderPass({
				colorAttachments: [{ view: ctx.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store' }],
			});
			pass.setPipeline(pT);
			pass.setBindGroup(0, bgT);
			pass.draw(3);
			pass.setPipeline(pE);
			pass.setBindGroup(0, bgE);
			pass.setVertexBuffer(0, strip);
			pass.setVertexBuffer(1, eBuf);
			pass.draw((SEG + 1) * 2, s.edgeCount);
			pass.setPipeline(pN);
			pass.setBindGroup(0, bgN);
			pass.setVertexBuffer(0, quad);
			pass.setVertexBuffer(1, nBuf);
			pass.draw(4, s.nodeCount);
			pass.end();
			device.queue.submit([enc.finish()]);
			return true;
		},
		destroy() {
			alive = false;
			try {
				ctx.unconfigure?.();
				device.destroy();
			} catch {
				/* already gone */
			}
		},
	};
}

/* ------------------------------------------------------------------ WebGL2 */
export async function initWebGL2(
	canvas: HTMLCanvasElement,
	scene: SceneData,
	onLost: (why: string) => void,
	opts: { allowSoftware?: boolean } = {},
): Promise<Renderer> {
	const gl = canvas.getContext('webgl2', {
		premultipliedAlpha: true,
		antialias: true,
		alpha: true,
		// a full-screen terrain shader on the CPU pegs the main thread; the SVG tier is the better experience there
		failIfMajorPerformanceCaveat: !opts.allowSoftware,
	}) as WebGL2RenderingContext | null;
	if (!gl) throw new Error('no webgl2');
	if (!opts.allowSoftware) {
		const info = gl.getExtension('WEBGL_debug_renderer_info');
		const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '');
		if (SOFTWARE_GL.test(name)) {
			gl.getExtension('WEBGL_lose_context')?.loseContext();
			throw new Error(`software GL (${name})`);
		}
	}
	// Compile all three programs, then let the driver finish them off the main thread when it can.
	const parallel = gl.getExtension('KHR_parallel_shader_compile');
	const pending = (
		[
			[GL.terrainVS, GL.terrainFS],
			[GL.edgeVS, GL.edgeFS],
			[GL.nodeVS, GL.nodeFS],
		] as const
	).map(([vs, fs]) => {
		const p = gl.createProgram()!;
		const shaders = ([
			[gl.VERTEX_SHADER, vs],
			[gl.FRAGMENT_SHADER, fs],
		] as const).map(([type, src]) => {
			const sh = gl.createShader(type)!;
			gl.shaderSource(sh, src);
			gl.compileShader(sh);
			gl.attachShader(p, sh);
			return sh;
		});
		gl.linkProgram(p);
		return { p, shaders };
	});
	if (parallel) {
		const done = () => pending.every(({ p }) => gl.getProgramParameter(p, parallel.COMPLETION_STATUS_KHR));
		for (let i = 0; i < 600 && !done(); i++) await new Promise((r) => requestAnimationFrame(r));
	}
	const prog = (i: number) => {
		const { p, shaders } = pending[i];
		if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
			const log = shaders.map((sh) => gl.getShaderInfoLog(sh)).join(' ') || gl.getProgramInfoLog(p);
			throw new Error(log ?? 'link');
		}
		return { p, U: gl.getUniformLocation(p, 'U') };
	};
	const T = prog(0);
	const E = prog(1);
	const N = prog(2);
	const buf = (data: Float32Array, usage: number = gl.STATIC_DRAW) => {
		const b = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, b);
		gl.bufferData(gl.ARRAY_BUFFER, data, usage);
		return b;
	};
	const attr = (loc: number, size: number, stride: number, off: number, div: number) => {
		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, off);
		gl.vertexAttribDivisor(loc, div);
	};
	const vaoT = gl.createVertexArray();
	const vaoE = gl.createVertexArray();
	const vaoN = gl.createVertexArray();
	gl.bindVertexArray(vaoE);
	buf(STRIP);
	attr(0, 2, 8, 0, 0);
	const eBuf = buf(scene.edges, gl.DYNAMIC_DRAW);
	attr(1, 2, 40, 0, 1);
	attr(2, 2, 40, 8, 1);
	attr(3, 2, 40, 16, 1);
	attr(4, 4, 40, 24, 1);
	gl.bindVertexArray(vaoN);
	buf(QUAD);
	attr(0, 2, 8, 0, 0);
	const nBuf = buf(scene.nodes, gl.DYNAMIC_DRAW);
	attr(1, 2, 24, 0, 1);
	attr(2, 4, 24, 8, 1);
	gl.bindVertexArray(null);
	const tex = gl.createTexture();
	const setScene = (s: SceneData) => {
		gl.bindBuffer(gl.ARRAY_BUFFER, eBuf);
		gl.bufferData(gl.ARRAY_BUFFER, s.edges, gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, nBuf);
		gl.bufferData(gl.ARRAY_BUFFER, s.nodes, gl.DYNAMIC_DRAW);
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 2);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, s.hf.gw, s.hf.gh, 0, gl.RED, gl.HALF_FLOAT, halfOf(s.hf.f));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	};
	setScene(scene);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	let alive = true;
	const lost = (e: Event) => {
		e.preventDefault();
		if (alive) onLost('webgl context lost');
	};
	canvas.addEventListener('webglcontextlost', lost);
	if (gl.getError() !== gl.NO_ERROR) throw new Error('webgl setup error');
	return {
		name: 'WebGL2',
		setScene,
		draw(u, s) {
			if (!alive || gl.isContextLost()) return false;
			if (canvas.width < 1 || canvas.height < 1) return true;
			gl.viewport(0, 0, canvas.width, canvas.height);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.useProgram(T.p);
			gl.uniform4fv(T.U, u);
			gl.bindVertexArray(vaoT);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
			gl.useProgram(E.p);
			gl.uniform4fv(E.U, u);
			gl.bindVertexArray(vaoE);
			gl.bindBuffer(gl.ARRAY_BUFFER, eBuf);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, s.edges);
			gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (SEG + 1) * 2, s.edgeCount);
			gl.useProgram(N.p);
			gl.uniform4fv(N.U, u);
			gl.bindVertexArray(vaoN);
			gl.bindBuffer(gl.ARRAY_BUFFER, nBuf);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, s.nodes);
			gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, s.nodeCount);
			gl.bindVertexArray(null);
			return true;
		},
		destroy() {
			alive = false;
			canvas.removeEventListener('webglcontextlost', lost);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		},
	};
}

/**
 * Did the last draw actually put pixels on this canvas? Called in the same task
 * as the draw (the drawing buffer is still current), downsampled to 64x32.
 */
export function verifyFrame(canvas: HTMLCanvasElement): boolean {
	try {
		const probe = document.createElement('canvas');
		probe.width = 64;
		probe.height = 32;
		const c = probe.getContext('2d', { willReadFrequently: true });
		if (!c || canvas.width < 1 || canvas.height < 1) return false;
		c.drawImage(canvas, 0, 0, 64, 32);
		const d = c.getImageData(0, 0, 64, 32).data;
		let lit = 0;
		for (let i = 3; i < d.length; i += 4) if (d[i] > 0) lit++;
		return lit >= 24;
	} catch {
		return false;
	}
}

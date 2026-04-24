#!/usr/bin/env node
/**
 * /blog-image backend — generate or edit blog images via gpt-image-2.
 *
 * Usage (all flags long-form; the slash command parses user input and shells
 * out to this script):
 *
 *   node scripts/blog/generate-image.mjs \
 *     --slug my-post \
 *     --slot hero \
 *     --prompt "..." \
 *     [--size 1536x1024 | landscape | ...] \
 *     [--quality low|medium|high|auto] \
 *     [--name stem]          (inline only) \
 *     [--variations 1..3] \
 *     [--promote <n>]        (no API call; promotes a prior candidate) \
 *     [--edit <path>]        (uses /v1/images/edits with an existing image) \
 *     [--mask <path>] \
 *     [--budget <usd>] \
 *     [--dry-run]            (prints payload + estimated cost, no API call) \
 *     [--raw-intent "..."]   (the pre-architect intent, logged only)
 *
 * Output: single-line JSON on stdout. ok-path prints cost + resolved path,
 * error-path prints ok:false + hint. Non-zero exit on error.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  MODEL,
  PRICING_TABLE_VERSION,
  SLOT_DEFAULTS,
  parseSize,
  resolveCostUsd,
  validateSize,
} from "./pricing-table.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

// ---------- arg parsing ----------

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next == null || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function die(message, hint) {
  process.stdout.write(
    JSON.stringify({ ok: false, error: message, hint: hint || null }) + "\n",
  );
  process.exit(2);
}

// ---------- path helpers ----------

function blogSlugExists(slug) {
  const en = path.join(REPO_ROOT, "src/content/blog", `${slug}.mdx`);
  const es = path.join(REPO_ROOT, "src/content/blog/es", `${slug}.mdx`);
  return fs.existsSync(en) || fs.existsSync(es);
}

function sanitizeStem(name) {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!clean) throw new Error(`--name "${name}" sanitizes to empty`);
  return clean;
}

function slotFilename(slot, name) {
  if (slot === "hero") return "hero";
  if (!name && slot === "infographic") return "infographic";
  if (!name) throw new Error(`--name is required for slot "${slot}"`);
  return sanitizeStem(name);
}

function outDir(slug) {
  return path.join(REPO_ROOT, "public/images/blog", slug);
}

function publicPath(slug, file) {
  return `/images/blog/${slug}/${file}`;
}

// ---------- budget ----------

function readBudget(slug) {
  const p = path.join(outDir(slug), ".budget.json");
  if (!fs.existsSync(p)) return { total_usd: 0, entries: [] };
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return { total_usd: 0, entries: [] };
  }
}

function writeBudget(slug, budget) {
  fs.mkdirSync(outDir(slug), { recursive: true });
  fs.writeFileSync(
    path.join(outDir(slug), ".budget.json"),
    JSON.stringify(budget, null, 2) + "\n",
  );
}

function appendHistory(slug, entry) {
  fs.mkdirSync(outDir(slug), { recursive: true });
  fs.appendFileSync(
    path.join(outDir(slug), ".history.jsonl"),
    JSON.stringify(entry) + "\n",
  );
}

// ---------- promote (no API call) ----------

function runPromote({ slug, slot, name, promoteIndex }) {
  const candDir = path.join(outDir(slug), ".candidates");
  const src = path.join(candDir, `${promoteIndex}.webp`);
  const srcMeta = path.join(candDir, `${promoteIndex}.json`);
  if (!fs.existsSync(src)) {
    die(`candidate ${promoteIndex} not found at ${src}`, "Generate with --variations first, then promote.");
  }
  const stem = slotFilename(slot, name);
  const finalWebp = path.join(outDir(slug), `${stem}.webp`);
  const finalMeta = path.join(outDir(slug), `${stem}.json`);
  fs.copyFileSync(src, finalWebp);
  if (fs.existsSync(srcMeta)) fs.copyFileSync(srcMeta, finalMeta);
  // Clean up all candidates.
  for (const entry of fs.readdirSync(candDir)) {
    fs.rmSync(path.join(candDir, entry), { force: true });
  }
  fs.rmdirSync(candDir, { recursive: true });
  const bytes = fs.statSync(finalWebp).size;
  process.stdout.write(
    JSON.stringify({
      ok: true,
      promoted: true,
      path: publicPath(slug, `${stem}.webp`),
      bytes,
      meta: finalMeta,
    }) + "\n",
  );
}

// ---------- API call ----------

async function callOpenAI({ prompt, size, quality, n, moderation, editPath, maskPath, apiKey }) {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });

  const sizeStr = `${size.width}x${size.height}`;

  if (editPath) {
    const { toFile } = await import("openai");
    const imageFile = await toFile(fs.createReadStream(editPath), path.basename(editPath), { type: "image/png" });
    const payload = {
      model: MODEL,
      image: imageFile,
      prompt,
      size: sizeStr,
      quality,
      n,
      ...(moderation ? { moderation } : {}),
    };
    if (maskPath) {
      payload.mask = await toFile(fs.createReadStream(maskPath), path.basename(maskPath), { type: "image/png" });
    }
    return client.images.edit(payload);
  }

  return client.images.generate({
    model: MODEL,
    prompt,
    size: sizeStr,
    quality,
    n,
    ...(moderation ? { moderation } : {}),
  });
}

// ---------- sharp: raw → webp ----------

async function encodeWebp({ base64, quality }) {
  const { default: sharp } = await import("sharp");
  const buf = Buffer.from(base64, "base64");
  const webpQuality = quality === "high" ? 88 : quality === "low" ? 72 : 82;
  return sharp(buf)
    .webp({ quality: webpQuality, effort: 6 })
    .toBuffer();
}

// ---------- main ----------

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // Validate required args.
  if (!args.slug) die("--slug is required");
  if (!args.slot) die("--slot is required", "Use hero | inline | infographic");

  const slug = String(args.slug);
  const slot = String(args.slot);
  if (!["hero", "inline", "infographic"].includes(slot)) {
    die(`invalid --slot "${slot}"`, "Use hero | inline | infographic");
  }

  // Promote-only path exits early; no API, no prompt needed.
  if (args.promote != null && args.promote !== true) {
    const promoteIndex = Number(args.promote);
    if (!Number.isInteger(promoteIndex) || promoteIndex < 1 || promoteIndex > 3) {
      die(`--promote must be 1..3 (got ${args.promote})`);
    }
    runPromote({ slug, slot, name: args.name, promoteIndex });
    return;
  }

  if (!args.prompt) die("--prompt is required");

  // Resolve size & quality.
  const defaults = SLOT_DEFAULTS[slot];
  const parsedSize = args.size ? parseSize(String(args.size)) : null;
  const size = parsedSize ?? { width: defaults.width, height: defaults.height };
  const sz = validateSize(size.width, size.height);
  if (!sz.ok) die(`size invalid: ${sz.errors.join("; ")}`);

  const quality = args.quality ? String(args.quality) : defaults.quality;
  if (!["low", "medium", "high", "auto"].includes(quality)) {
    die(`invalid --quality "${quality}"`);
  }

  // Variations.
  const variations = args.variations ? Number(args.variations) : 1;
  if (!Number.isInteger(variations) || variations < 1 || variations > 3) {
    die(`--variations must be 1..3 (got ${args.variations})`);
  }

  // Slug sanity (warn but don't block — author may be creating a new post).
  const slugExists = blogSlugExists(slug);

  // Cost preview.
  const effectiveQuality = quality === "auto" ? "medium" : quality;
  const per = resolveCostUsd({ quality: effectiveQuality, ...size });
  const estimatedCost = per.cost_usd * variations;

  // Budget check.
  const budget = readBudget(slug);
  if (args.budget != null && args.budget !== true) {
    const cap = Number(args.budget);
    if (!Number.isFinite(cap) || cap < 0) die(`--budget must be a positive USD number`);
    if (budget.total_usd + estimatedCost > cap) {
      die(
        `budget cap would be exceeded: current $${budget.total_usd.toFixed(4)} + est $${estimatedCost.toFixed(4)} > cap $${cap.toFixed(2)}`,
        "Raise --budget, use --quality low, or reduce --variations.",
      );
    }
  }

  const payloadPreview = {
    model: MODEL,
    prompt: args.prompt,
    size: `${size.width}x${size.height}`,
    quality,
    n: variations,
    ...(args.edit ? { edit_image: args.edit } : {}),
    ...(args.mask ? { mask: args.mask } : {}),
  };

  if (args["dry-run"]) {
    process.stdout.write(
      JSON.stringify({
        ok: true,
        dry_run: true,
        payload: payloadPreview,
        estimated_cost_usd: estimatedCost,
        cost_source: per.source,
        pricing_table_version: PRICING_TABLE_VERSION,
        slug_exists: slugExists,
      }) + "\n",
    );
    return;
  }

  // Load .env first so users who keep their key there don't see a spurious
  // "key not set" error. Then check the key.
  try {
    const dotenv = await import("dotenv");
    dotenv.config({ path: path.join(REPO_ROOT, ".env") });
  } catch {
    /* dotenv optional; env var may already be set */
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    die(
      "OPENAI_API_KEY is not set",
      "Create .env at repo root with OPENAI_API_KEY=sk-... (see .env.example).",
    );
  }

  // Ensure dirs.
  fs.mkdirSync(outDir(slug), { recursive: true });

  // Fire API call.
  let response;
  try {
    const moderation = args.moderation && args.moderation !== true ? String(args.moderation) : null;
    if (moderation && !["auto", "low"].includes(moderation)) {
      die(`invalid --moderation "${moderation}"`, "Use auto | low");
    }
    response = await callOpenAI({
      prompt: String(args.prompt),
      size,
      quality,
      n: variations,
      moderation,
      editPath: args.edit ? path.resolve(REPO_ROOT, String(args.edit)) : null,
      maskPath: args.mask ? path.resolve(REPO_ROOT, String(args.mask)) : null,
      apiKey,
    });
  } catch (err) {
    die(`OpenAI request failed: ${err.message || err}`, "Verify API key, quota, and prompt moderation policy.");
    return;
  }

  const stem = slotFilename(slot, args.name);
  const isVariationRun = variations > 1;
  const candDir = path.join(outDir(slug), ".candidates");
  if (isVariationRun) fs.mkdirSync(candDir, { recursive: true });

  const written = [];
  const now = new Date().toISOString();

  for (let i = 0; i < response.data.length; i++) {
    const item = response.data[i];
    const b64 = item.b64_json;
    if (!b64) {
      die(`item ${i + 1} missing b64_json in response`);
    }
    const webp = await encodeWebp({ base64: b64, quality });

    const filename = isVariationRun ? `${i + 1}.webp` : `${stem}.webp`;
    const metaName = isVariationRun ? `${i + 1}.json` : `${stem}.json`;
    const targetDir = isVariationRun ? candDir : outDir(slug);

    fs.writeFileSync(path.join(targetDir, filename), webp);

    const sidecar = {
      model: MODEL,
      slug,
      slot,
      size: `${size.width}x${size.height}`,
      quality,
      n: variations,
      variant_index: isVariationRun ? i + 1 : null,
      prompt: String(args.prompt),
      raw_intent: args["raw-intent"] ? String(args["raw-intent"]) : null,
      revised_prompt: item.revised_prompt ?? null,
      cost_usd: per.cost_usd,
      cost_source: per.source,
      pricing_table_version: PRICING_TABLE_VERSION,
      usage: response.usage ?? null,
      created_at: now,
      is_edit: Boolean(args.edit),
      edit_image: args.edit ? String(args.edit) : null,
      mask: args.mask ? String(args.mask) : null,
      bytes: webp.byteLength,
    };
    fs.writeFileSync(path.join(targetDir, metaName), JSON.stringify(sidecar, null, 2) + "\n");

    written.push({
      path: isVariationRun ? `/images/blog/${slug}/.candidates/${filename}` : publicPath(slug, filename),
      local: path.join(targetDir, filename),
      meta: path.join(targetDir, metaName),
      bytes: webp.byteLength,
      variant_index: sidecar.variant_index,
    });

    appendHistory(slug, {
      ts: now,
      action: args.edit ? "edit" : "generate",
      variant_index: sidecar.variant_index,
      file: filename,
      prompt: String(args.prompt),
      size: sidecar.size,
      quality,
      cost_usd: per.cost_usd,
    });
  }

  // Update post budget (sum of this run).
  const totalThisRun = per.cost_usd * variations;
  budget.total_usd = (budget.total_usd || 0) + totalThisRun;
  budget.entries = budget.entries || [];
  for (const w of written) {
    budget.entries.push({
      file: path.basename(w.local),
      candidate: isVariationRun ? true : false,
      cost_usd: per.cost_usd,
      ts: now,
    });
  }
  writeBudget(slug, budget);

  // Success payload — for single-image runs we return the final path;
  // for variation runs we return the candidates array + a hint to promote.
  const result = {
    ok: true,
    variation_run: isVariationRun,
    cost_usd: Math.round(totalThisRun * 10000) / 10000,
    cost_source: per.source,
    pricing_table_version: PRICING_TABLE_VERSION,
    post_total_usd: Math.round(budget.total_usd * 10000) / 10000,
    images: written,
    ...(isVariationRun
      ? { next: `Call with --promote <n> (1..${variations}) --name ${args.name ?? "<stem>"} --slot ${slot} to finalize.` }
      : {
          path: written[0].path,
          bytes: written[0].bytes,
          meta: written[0].meta,
        }),
  };

  process.stdout.write(JSON.stringify(result) + "\n");
}

main().catch((err) => {
  die(`unexpected error: ${err.stack || err.message || err}`);
});

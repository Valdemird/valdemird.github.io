#!/usr/bin/env node
/**
 * /blog-cost backend — aggregate and print image-generation spend across
 * posts.
 *
 *   node scripts/blog/cost-report.mjs --slug <slug>
 *   node scripts/blog/cost-report.mjs --all
 *
 * Reads `public/images/blog/<slug>/.budget.json` files written by
 * generate-image.mjs. Output is human-readable text on stdout (not JSON)
 * because this command is for the user to read directly.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const BLOG_IMG_ROOT = path.join(REPO_ROOT, "public/images/blog");

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

function fmt(usd) {
  return `$${usd.toFixed(4)}`;
}

function readBudget(slug) {
  const p = path.join(BLOG_IMG_ROOT, slug, ".budget.json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function listSlugs() {
  if (!fs.existsSync(BLOG_IMG_ROOT)) return [];
  return fs
    .readdirSync(BLOG_IMG_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((slug) => fs.existsSync(path.join(BLOG_IMG_ROOT, slug, ".budget.json")));
}

function printSlug(slug) {
  const budget = readBudget(slug);
  if (!budget) {
    console.log(`${slug}: no budget file (no generated images yet).`);
    return 0;
  }
  console.log(`\n${slug}  —  total ${fmt(budget.total_usd || 0)}`);
  console.log("─".repeat(Math.min(72, 4 + slug.length + 20)));
  const entries = budget.entries || [];
  if (entries.length === 0) {
    console.log("  (no entries logged)");
  } else {
    const w = Math.max(...entries.map((e) => e.file.length), 12);
    for (const e of entries) {
      const tag = e.candidate ? "  [candidate]" : "";
      const ts = e.ts ? `  ${e.ts}` : "";
      console.log(`  ${e.file.padEnd(w)}  ${fmt(e.cost_usd)}${tag}${ts}`);
    }
  }
  return budget.total_usd || 0;
}

function printAll() {
  const slugs = listSlugs();
  if (slugs.length === 0) {
    console.log("No budget files under public/images/blog/*. Nothing spent yet.");
    return;
  }
  const totals = slugs.map((slug) => ({ slug, total: readBudget(slug)?.total_usd || 0 }));
  totals.sort((a, b) => b.total - a.total);

  const grand = totals.reduce((s, t) => s + t.total, 0);

  console.log(`\nBlog image spend — ${slugs.length} post${slugs.length === 1 ? "" : "s"}`);
  console.log("═".repeat(56));
  const w = Math.max(...totals.map((t) => t.slug.length), 12);
  for (const t of totals) {
    console.log(`  ${t.slug.padEnd(w)}  ${fmt(t.total)}`);
  }
  console.log("─".repeat(56));
  console.log(`  ${"TOTAL".padEnd(w)}  ${fmt(grand)}`);

  // Top 5
  if (totals.length > 5) {
    console.log(`\nTop 5 most expensive posts:`);
    for (const t of totals.slice(0, 5)) {
      console.log(`  ${t.slug.padEnd(w)}  ${fmt(t.total)}`);
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.all) {
    printAll();
    return;
  }
  if (args.slug && args.slug !== true) {
    printSlug(String(args.slug));
    return;
  }
  console.error("Usage: cost-report.mjs --slug <slug>  |  --all");
  process.exit(2);
}

main();

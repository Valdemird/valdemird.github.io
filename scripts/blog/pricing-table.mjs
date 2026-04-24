/**
 * gpt-image-2 pricing table — validated 2026-04 from
 * developers.openai.com/api/docs/guides/image-generation.
 *
 * Costs are in USD per image at the given (quality, size). Sizes outside the
 * three canonical values are priced by pixel-area interpolation against the
 * closest canonical entry — conservative overestimate, not API-authoritative.
 */

export const PRICING_TABLE_VERSION = "2026-04";
export const MODEL = "gpt-image-2";

// Canonical prices keyed by `${quality}:${w}x${h}`.
const CANONICAL = {
  "low:1024x1024": 0.006,
  "low:1024x1536": 0.005,
  "low:1536x1024": 0.005,
  "medium:1024x1024": 0.053,
  "medium:1024x1536": 0.041,
  "medium:1536x1024": 0.041,
  "high:1024x1024": 0.211,
  "high:1024x1536": 0.165,
  "high:1536x1024": 0.165,
};

const QUALITY_BASE_PIXELS = 1024 * 1024;

/**
 * Resolve a cost in USD for a given (quality, width, height). Returns the
 * canonical value when the size is one of the three published combos, else
 * scales the closest same-quality entry by pixel-count ratio.
 */
export function resolveCostUsd({ quality, width, height }) {
  if (quality === "auto") quality = "medium";
  const key = `${quality}:${width}x${height}`;
  if (CANONICAL[key] != null) {
    return { cost_usd: CANONICAL[key], source: "canonical" };
  }
  const base = CANONICAL[`${quality}:1024x1024`];
  if (base == null) {
    throw new Error(`Unknown quality tier: ${quality}`);
  }
  const pixels = width * height;
  const scaled = base * (pixels / QUALITY_BASE_PIXELS);
  return {
    cost_usd: Math.round(scaled * 10000) / 10000,
    source: "interpolated",
  };
}

/**
 * Cost from the API's own usage payload (preferred when present). OpenAI
 * publishes per-image output-token rates; they are not yet in-guide for
 * gpt-image-2, so we return null when we can't compute authoritatively and
 * let the caller fall back to resolveCostUsd.
 */
export function costFromApiUsage(_usage) {
  return null;
}

/** Default size per slot. */
export const SLOT_DEFAULTS = {
  hero: { width: 1536, height: 1024, quality: "medium" },
  inline: { width: 1024, height: 1024, quality: "medium" },
  infographic: { width: 1536, height: 1024, quality: "high" },
};

/**
 * gpt-image-2 size constraints (documented):
 *   - each edge must be a multiple of 16
 *   - max edge 3840
 *   - ratio long:short ≤ 3:1
 *   - total pixels ∈ [655_360, 8_294_400]
 */
export function validateSize(width, height) {
  const errs = [];
  if (width % 16 !== 0 || height % 16 !== 0) {
    errs.push(`size edges must be multiples of 16 (got ${width}x${height})`);
  }
  if (width > 3840 || height > 3840) {
    errs.push(`max edge is 3840 (got ${width}x${height})`);
  }
  const long = Math.max(width, height);
  const short = Math.min(width, height);
  if (long / short > 3) {
    errs.push(`aspect ratio must not exceed 3:1 (got ${long}:${short})`);
  }
  const pixels = width * height;
  if (pixels < 655_360) {
    errs.push(`total pixels must be ≥ 655,360 (got ${pixels})`);
  }
  if (pixels > 8_294_400) {
    errs.push(`total pixels must be ≤ 8,294,400 (got ${pixels})`);
  }
  return { ok: errs.length === 0, errors: errs };
}

const SIZE_ALIASES = {
  landscape: { width: 1536, height: 1024 },
  portrait: { width: 1024, height: 1536 },
  square: { width: 1024, height: 1024 },
  "2k-landscape": { width: 2048, height: 1152 },
  "2k-square": { width: 2048, height: 2048 },
  "4k-landscape": { width: 3840, height: 2160 },
  "4k-portrait": { width: 2160, height: 3840 },
};

/** Parse a --size flag into { width, height }. Supports WxH and named aliases. */
export function parseSize(input) {
  if (!input || input === "auto") return null;
  if (SIZE_ALIASES[input]) return SIZE_ALIASES[input];
  const m = /^(\d+)x(\d+)$/.exec(input);
  if (!m) throw new Error(`Invalid size "${input}". Use WxH or an alias (landscape/portrait/square/2k-*/4k-*).`);
  return { width: Number(m[1]), height: Number(m[2]) };
}

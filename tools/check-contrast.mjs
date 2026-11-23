#!/usr/bin/env node
// Verifies the wishlist contrast contract in index.html.
// Three layers, because each catches a different regression:
//   1. token literals      - a typo or palette edit
//   2. wiring              - a stage mapped to the wrong muted token
//   3. measured contrast   - the actual ink/fill pairs
// It also fails if the removed dimming mechanism reappears.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const target = process.argv[2] ?? join(root, "index.html");
const html = readFileSync(target, "utf8");

const STAGES = [
  ["Harbourflap", "#F6F08A", "#969269"],
  ["Orbit", "#F396A0", "#AF868A"],
  ["Park", "#98F5D4", "#74988A"],
  ["Robot", "#F9F49B", "#95926E"],
  ["Polytechnic", "#F49CA6", "#AE878A"],
  ["Minkymax", "#9DF4D3", "#75988A"],
];
const INK = "#001A14";

const MIN_TEXT = 4.5;
const MIN_LAYER = 1.45;
const MIN_MUTED_PAGE = 2.85;

const failures = [];

function token(name) {
  const m = html.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  return m ? m[1].toUpperCase() : null;
}

function ruleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = html.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : null;
}

function channel(v) {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function expect(label, actual, wanted) {
  if (actual !== wanted) failures.push(`${label}: expected ${wanted}, found ${actual ?? "missing"}`);
}

// 1. Token literals
const ink = token("card-ink");
expect("--card-ink", ink, INK);

// Surface the cards actually sit on; read from the file so a palette change
// cannot leave this measuring a stale colour.
const PAGE = token("card-bg");
if (!PAGE) failures.push("--card-bg: missing");

// 2. Wiring: each stage class must bind both fills to its own tokens
for (const [name, , muted] of STAGES) {
  const slug = name.toLowerCase();
  expect(`--color-${slug}`, token(`color-${slug}`), STAGES.find(([n]) => n === name)[1]);
  expect(`--color-${slug}-muted`, token(`color-${slug}-muted`), muted);

  const body = ruleBody(`.stage-${name}`);
  if (!body) {
    failures.push(`.stage-${name}: rule missing`);
    continue;
  }
  const fill = body.match(/--stage-fill:\s*var\(--color-([a-z]+)\)/);
  const fillMuted = body.match(/--stage-fill-muted:\s*var\(--color-([a-z]+)-muted\)/);
  if (!fill || fill[1] !== slug) failures.push(`.stage-${name}: --stage-fill wires to ${fill ? fill[1] : "nothing"}`);
  if (!fillMuted || fillMuted[1] !== slug) failures.push(`.stage-${name}: --stage-fill-muted wires to ${fillMuted ? fillMuted[1] : "nothing"}`);
}

// 3. The base rule must consume the tokens and the ink
const base = ruleBody(".artist-block");
if (!base) failures.push(".artist-block: rule missing");
else {
  if (!/color:\s*var\(--card-ink\)/.test(base)) failures.push(".artist-block: does not consume --card-ink");
  if (!/background-color:\s*var\(--stage-fill/.test(base)) failures.push(".artist-block: does not consume --stage-fill");
  if (!/border:\s*2px solid transparent/.test(base)) failures.push(".artist-block: missing reserved transparent border");
}

// 4. The focused rule must set the muted fill and carry no dimming
const focused = ruleBody(".schedule-grid.has-wishlist .artist-block");
if (!focused) failures.push(".schedule-grid.has-wishlist .artist-block: rule missing");
else {
  if (!/background-color:\s*var\(--stage-fill-muted/.test(focused)) failures.push("focused rule: missing muted background");
  if (/opacity/.test(focused)) failures.push("focused rule: opacity reappeared");
  if (/filter/.test(focused)) failures.push("focused rule: filter reappeared");
}

// 5. The wishlisted rule must restore the shipped fill explicitly
const wishlisted = ruleBody(".schedule-grid.has-wishlist .artist-block.wishlisted");
if (!wishlisted) failures.push("wishlisted rule: missing");
else if (!/background-color:\s*var\(--stage-fill/.test(wishlisted))
  failures.push("wishlisted rule: does not redeclare background-color (cards would render muted)");

// 6. Measured contrast
const rows = [];
for (const [name, shipped, muted] of STAGES) {
  const shippedToken = token(`color-${name.toLowerCase()}`);
  const mutedToken = token(`color-${name.toLowerCase()}-muted`);
  if (shippedToken !== shipped || mutedToken !== muted || ink !== INK) {
    rows.push([name, shippedToken, mutedToken, null, null, null, null]);
    continue;
  }
  const onShipped = contrast(shipped, ink);
  const onMuted = contrast(muted, ink);
  const layer = contrast(shipped, muted);
  const againstPage = contrast(muted, PAGE);

  if (onShipped < MIN_TEXT) failures.push(`${name}: ink on shipped ${onShipped.toFixed(2)} < ${MIN_TEXT}`);
  if (onMuted < MIN_TEXT) failures.push(`${name}: ink on muted ${onMuted.toFixed(2)} < ${MIN_TEXT}`);
  if (layer < MIN_LAYER) failures.push(`${name}: layer margin ${layer.toFixed(2)} < ${MIN_LAYER}`);
  if (againstPage < MIN_MUTED_PAGE) failures.push(`${name}: muted vs page ${againstPage.toFixed(2)} < ${MIN_MUTED_PAGE}`);

  rows.push([name, shippedToken, mutedToken, onShipped, onMuted, layer, againstPage]);
}

const pad = (v, n) => String(v).padEnd(n);
console.log(pad("stage", 12), pad("shipped", 9), pad("muted", 9), pad("ink/ship", 9), pad("ink/mute", 9), pad("layer", 7), "mute/page");
for (const [name, s, m, a, b, c, d] of rows) {
  console.log(
    pad(name, 12),
    pad(s ?? "-", 9),
    pad(m ?? "-", 9),
    pad(a === null ? "-" : a.toFixed(2), 9),
    pad(b === null ? "-" : b.toFixed(2), 9),
    pad(c === null ? "-" : c.toFixed(2), 7),
    d === null ? "-" : d.toFixed(2),
  );
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\nOK: tokens, wiring, and contrast verified for 6 stages.`);

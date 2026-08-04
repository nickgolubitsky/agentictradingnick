#!/usr/bin/env node
/* Pre-publish gate. Runs in CI and should be run locally before any commit.
 *
 * Two jobs:
 *   1. Leak scan  — refuse to publish anything that identifies the operator,
 *                   the brokerage account, or any account outside the sandbox.
 *   2. Data sanity — refuse to publish numbers the board would render
 *                   misleadingly (fabricated baselines, rates off a tiny sample).
 *
 * Exit code 1 fails the Vercel/GitHub build. That is the point: an agent writes
 * to this repo unattended, so the gate has to be automatic, not a habit.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const errors = [];
const warnings = [];

/* ---------- 1. leak scan ---------- */
const LEAK_RULES = [
  // No leading \b: bullets and dots are non-word chars, so a boundary never
  // matches before them and the rule would silently pass "\u2022\u20227476".
  { re: /(?:\u2022{2,}|\u00b7{2,}|\.{2,}|x{2,}|X{2,}|\*{2,})\s?\d{4}\b/g, msg: "masked account number (last four digits)" },
  { re: /\baccount\s*(?:#|no\.?|number)\s*[:=]?\s*\d{3,}/gi, msg: "account number" },
  { re: /\b\d{3}-\d{2}-\d{4}\b/g, msg: "SSN-shaped string" },
  { re: /\b(?:\d[ -]?){13,19}\b/g, msg: "card-number-shaped string" },
  { re: /[\w.+-]+@[\w-]+\.[\w.]{2,}/g, msg: "email address" },
  { re: /\b(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/g, msg: "phone number" },
  { re: /\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{8,}/g, msg: "API key" },
  { re: /\bBearer\s+[A-Za-z0-9._-]{20,}/g, msg: "bearer token" },
  { re: /\b(?:api[_-]?key|secret|passwd|password|token)\s*[:=]\s*["'][^"']{8,}/gi, msg: "hardcoded credential" },
  // Out-of-scope account balances. The sandbox is a sub-$10k account; any
  // five-or-six-figure balance in this repo came from an account that is not
  // supposed to be readable, let alone publishable.
  { re: /\$\s?\d{2,3}(?:,\d{3})+(?:\.\d{2})?\b/g, msg: "large balance (possible out-of-scope account)" },
  { re: /\b\d{2,3}k\b(?=[^\n]{0,40}(?:account|portfolio|balance|book))/gi, msg: "abbreviated large balance" }
];

const SCAN_EXT = new Set([".json", ".html", ".js", ".css", ".md", ".yml", ".yaml", ".txt"]);
const SKIP_DIR = new Set(["node_modules", ".git", ".vercel"]);
// The validator necessarily contains the patterns it searches for.
const SELF = "scripts/validate.mjs";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (SCAN_EXT.has(extname(name))) out.push(p);
  }
  return out;
}

for (const file of walk(ROOT)) {
  const rel = file.slice(ROOT.length);
  if (rel === SELF) continue;
  const text = readFileSync(file, "utf8");
  for (const rule of LEAK_RULES) {
    rule.re.lastIndex = 0;
    const hits = text.match(rule.re);
    if (hits) {
      errors.push(`LEAK  ${rel}: ${rule.msg} \u2014 ${[...new Set(hits)].slice(0, 3).join(", ")}`);
    }
  }
}

/* ---------- 2. data sanity ---------- */
const read = (n) => JSON.parse(readFileSync(join(ROOT, "data", n + ".json"), "utf8"));
let state, perf, bench, moves, why;
try {
  state = read("state"); perf = read("perf"); bench = read("bench");
  moves = read("moves"); why = read("why");
} catch (e) {
  errors.push(`DATA  could not parse: ${e.message}`);
}

if (perf) {
  const min = perf.minSampleForRates ?? 20;
  if (perf.totalTrades < min && perf.publishRates) {
    errors.push(`DATA  perf.publishRates is set with n=${perf.totalTrades} (below ${min}). A win rate off a tiny sample is a lie told with arithmetic.`);
  }
  if (perf.agentTrades > perf.totalTrades) {
    errors.push("DATA  perf.agentTrades exceeds perf.totalTrades");
  }
  const netFromTrades = (perf.closedTrades ?? []).reduce((n, t) => n + t.pl, 0);
  const netFromGross = perf.grossWins - perf.grossLosses;
  if (Math.abs(netFromTrades - netFromGross) > 0.005) {
    errors.push(`DATA  closedTrades sum to ${netFromTrades.toFixed(2)} but gross fields imply ${netFromGross.toFixed(2)}`);
  }
  const graded = (why?.entries ?? []).filter((e) => e.kind === "did" && e.grade).length;
  if (graded === 0 && perf.totalTrades > 0) {
    warnings.push("DATA  closed trades exist but no 'did' entry carries a grade \u2014 the retro has not run");
  }
}

if (bench) {
  if (bench.baseline === null && (bench.series ?? []).length > 0) {
    errors.push("DATA  bench.series has rows but bench.baseline is null \u2014 every rebased number would be undefined");
  }
  if (bench.baseline) {
    for (const k of ["spy", "qqq", "smh", "account"]) {
      if (!(k in bench.baseline) || bench.baseline[k] == null) {
        errors.push(`DATA  bench.baseline is missing ${k}`);
      }
    }
  }
}

if (moves) {
  for (const m of moves.moves ?? []) {
    if (m.impliedMove != null && (m.impliedMove <= 0 || m.impliedMove > 1)) {
      errors.push(`DATA  ${m.ticker}: impliedMove ${m.impliedMove} is not a decimal fraction`);
    }
    for (const b of m.branches ?? []) {
      if (!b.why) errors.push(`DATA  ${m.ticker}: a branch has no reasoning. Every action carries its reason or it does not ship.`);
    }
  }
}

if (why) {
  for (const e of why.entries ?? []) {
    if (!["did", "will"].includes(e.kind)) errors.push(`DATA  why entry has kind '${e.kind}'`);
    if (!e.body) errors.push(`DATA  why entry '${e.head}' has no reasoning body`);
  }
}

if (state) {
  const t = new Date(state.lastRefreshUtc);
  if (Number.isNaN(+t)) errors.push("DATA  state.lastRefreshUtc is not a valid timestamp");
  else if ((Date.now() - t) / 36e5 > 96) {
    warnings.push(`DATA  last refresh is ${Math.floor((Date.now() - t) / 36e5 / 24)}d old \u2014 the board will render a stale badge`);
  }
  for (const c of state.candidates ?? []) {
    if (!["watch", "nofly", "ok"].includes(c.flag)) errors.push(`DATA  candidate ${c.sym} has unknown flag '${c.flag}'`);
  }
}

/* ---------- 3. account scope ---------- */
/* One account, never any other. See docs/SCOPE.md. The agent-side layers are
 * behavioural; this one is not, which is why it is the layer that matters. */
if (state) {
  if ("accounts" in state) {
    errors.push("SCOPE data/state.json has an 'accounts' key. This project publishes exactly one account.");
  }
  if (Array.isArray(state.account)) {
    errors.push("SCOPE data/state.account is an array. It must be a single object.");
  }
  const label = String(state.accountLabel ?? "");
  if (/\d{3,}/.test(label)) {
    errors.push(`SCOPE state.accountLabel contains digits ('${label}'). The label must not identify the account.`);
  }
  // A second balance-shaped object anywhere in state is the shape a leak takes
  // when a run summarises the whole account list instead of just the target.
  const balanceKeys = JSON.stringify(state).match(/"(?:total|equity|balance|portfolioValue)"\s*:/g) ?? [];
  if (balanceKeys.length > 1) {
    errors.push(`SCOPE data/state.json contains ${balanceKeys.length} balance fields. Exactly one account may be described.`);
  }
}

/* ---------- report ---------- */
for (const w of warnings) console.warn("warn  " + w);
if (errors.length) {
  console.error("\n" + errors.map((e) => "FAIL  " + e).join("\n"));
  console.error(`\n${errors.length} blocking issue(s). Nothing published.\n`);
  process.exit(1);
}
console.log(`ok    ${warnings.length} warning(s), 0 blocking issues. Safe to publish.`);

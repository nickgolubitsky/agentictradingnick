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
import { join, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, not .pathname: on Windows the latter yields "/C:/a%20b/" —
// leading slash and percent-encoded spaces, both of which break join().
const ROOT = fileURLToPath(new URL("..", import.meta.url));
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
  // Normalise separators so SELF matches on Windows too — otherwise the
  // validator scans itself and reports its own patterns as leaks.
  const rel = file.slice(ROOT.length).split(sep).join("/");
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
let state, perf, bench, moves, why, runs;
try {
  state = read("state"); perf = read("perf"); bench = read("bench");
  moves = read("moves"); why = read("why"); runs = read("runs");
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
  /* Attribution is the autonomy claim, so it gets gated like one. The failure this
   * blocks is an assisted order drifting into the unattended column — which would
   * turn "a human clicked it on the agent's advice" into "the system ran itself". */
  const PLACED_BY = ["agent", "directed", "assisted", "hand"];
  const assisted = perf.assistedTrades ?? 0;
  if (assisted < 0 || !Number.isInteger(assisted)) {
    errors.push("DATA  perf.assistedTrades must be a non-negative integer");
  }
  if (perf.agentTrades + assisted > perf.totalTrades) {
    errors.push(`DATA  agentTrades (${perf.agentTrades}) + assistedTrades (${assisted}) exceeds totalTrades (${perf.totalTrades})`);
  }
  for (const t of perf.closedTrades ?? []) {
    if (t.placedBy != null && !PLACED_BY.includes(t.placedBy)) {
      errors.push(`DATA  ${t.sym}: placedBy '${t.placedBy}' is not one of ${PLACED_BY.join(" | ")}`);
    }
    if (t.placedBy === "agent" && t.byAgent === false) {
      errors.push(`DATA  ${t.sym}: placedBy says 'agent' but byAgent is false. The two disagree about who placed it.`);
    }
  }
  /* The mandate's two arms. Counting them wrong is how an experiment quietly
   * stops testing anything, so the totals have to reconcile against the trades. */
  const f = perf.forced;
  if (f) {
    for (const k of ["entries", "wins", "discretionaryEntries", "discretionaryWins"]) {
      if (f[k] != null && (!Number.isInteger(f[k]) || f[k] < 0)) {
        errors.push(`DATA  perf.forced.${k} must be a non-negative integer`);
      }
    }
    if ((f.wins ?? 0) > (f.entries ?? 0)) {
      errors.push(`DATA  perf.forced.wins (${f.wins}) exceeds perf.forced.entries (${f.entries})`);
    }
    if ((f.discretionaryWins ?? 0) > (f.discretionaryEntries ?? 0)) {
      errors.push(`DATA  perf.forced.discretionaryWins exceeds discretionaryEntries`);
    }
    const closed = (perf.closedTrades ?? []).length;
    if ((f.entries ?? 0) + (f.discretionaryEntries ?? 0) > closed) {
      errors.push(`DATA  perf.forced arms sum to ${(f.entries ?? 0) + (f.discretionaryEntries ?? 0)} but only ${closed} trade(s) have closed`);
    }
  }

  const tagged = (perf.closedTrades ?? []).filter((t) => t.placedBy === "agent").length;
  if (tagged > perf.agentTrades) {
    errors.push(`DATA  ${tagged} closed trade(s) are tagged placedBy 'agent' but perf.agentTrades is ${perf.agentTrades}`);
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
  /* A catalyst more than a session behind is not "anticipated" and its spot price
   * is a quote from a day that is over. The board marks it PASSED so it cannot
   * read as a forecast; this nags the run that owns the file to prune it. */
  const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
  for (const m of moves.moves ?? []) {
    const d = String(m.when ?? "").match(/(\d{4})-(\d{2})-(\d{2})/);
    if (d) {
      const days = (midnight - new Date(+d[1], +d[2] - 1, +d[3])) / 864e5;
      if (days >= 2) {
        warnings.push(`DATA  moves: ${m.ticker} '${m.event}' was ${Math.floor(days)} days ago and is still listed as an anticipated move — the pre-close run should prune it`);
      }
    }
  }
  for (const m of moves.moves ?? []) {
    if (m.impliedMove != null && (m.impliedMove <= 0 || m.impliedMove > 1)) {
      errors.push(`DATA  ${m.ticker}: impliedMove ${m.impliedMove} is not a decimal fraction`);
    }
    for (const b of m.branches ?? []) {
      if (!b.why) errors.push(`DATA  ${m.ticker}: a branch has no reasoning. Every action carries its reason or it does not ship.`);
    }
  }
}

/* Run health is the headline number now, so the gate has to cover it. The
 * failure this blocks is flattering arithmetic: a run counted as connected
 * without having fired, or a blind run quietly dropped from the denominator. */
if (runs) {
  const SLOTS = ["open", "hourly", "preclose", "retro"];
  const list = runs.runs ?? [];
  for (const r of list) {
    if (!SLOTS.includes(r.slot)) {
      errors.push(`DATA  run ${r.date ?? "?"} has unknown slot '${r.slot}' (expected ${SLOTS.join(" | ")})`);
    }
    if (typeof r.fired !== "boolean" || typeof r.connected !== "boolean") {
      errors.push(`DATA  run ${r.date ?? "?"} ${r.slot ?? ""}: fired and connected must both be booleans`);
    }
    if (r.connected && !r.fired) {
      errors.push(`DATA  run ${r.date ?? "?"} ${r.slot ?? ""} is connected but not fired. A run cannot reach the broker without running.`);
    }
    if (r.actions != null && (!Number.isInteger(r.actions) || r.actions < 0)) {
      errors.push(`DATA  run ${r.date ?? "?"} ${r.slot ?? ""}: actions must be a non-negative integer`);
    }
    if (!r.connected && r.actions > 0) {
      errors.push(`DATA  run ${r.date ?? "?"} ${r.slot ?? ""} placed ${r.actions} action(s) with no broker connection. One of the two fields is wrong.`);
    }
    if (Number.isNaN(+new Date(r.date))) {
      errors.push(`DATA  run has an unparseable date '${r.date}'`);
    }
    /* trigger and declined decide what run health counts. Both failures below
     * inflate the metric, which is the direction that needs a gate. */
    if (r.trigger != null && !["scheduled", "manual"].includes(r.trigger)) {
      errors.push(`DATA  run ${r.date ?? "?"} ${r.slot ?? ""}: trigger '${r.trigger}' is not scheduled | manual`);
    }
    if (r.declined != null && typeof r.declined !== "boolean") {
      errors.push(`DATA  run ${r.date ?? "?"} ${r.slot ?? ""}: declined must be a boolean`);
    }
    if (r.declined && r.connected) {
      errors.push(`DATA  run ${r.date ?? "?"} ${r.slot ?? ""} is marked declined but also connected. A run that stopped on a guard never reached the broker.`);
    }
    if (r.declined && r.actions > 0) {
      errors.push(`DATA  run ${r.date ?? "?"} ${r.slot ?? ""} declined but recorded ${r.actions} action(s)`);
    }
  }
  /* The failure this catches: a manual invocation quietly relabelled scheduled,
   * which is how a number that has proven nothing starts looking like evidence. */
  if (list.length && list.every((r) => r.trigger == null)) {
    warnings.push("DATA  no run row carries a trigger field — run health cannot tell a scheduled firing from a manual one");
  }
  const SLOT_IDS = (runs.slots ?? []).map((s) => s.id);
  for (const s of runs.slots ?? []) {
    if (!SLOTS.includes(s.id)) {
      errors.push(`DATA  runs.slots has unknown id '${s.id}'`);
    }
    if (!s.does || !s.writes) {
      errors.push(`DATA  slot '${s.id}' is missing does/writes. A slot with no stated job cannot be checked against what it did.`);
    }
  }
  for (const r of list) {
    if (SLOT_IDS.length && !SLOT_IDS.includes(r.slot)) {
      errors.push(`DATA  run ${r.date ?? "?"} uses slot '${r.slot}', which is not in runs.slots`);
    }
  }
  /* A board about autonomy must not imply a scheduler it does not have. */
  if (runs.scheduler?.configured === true && list.length === 0) {
    errors.push("DATA  runs.scheduler.configured is true but no run has ever recorded a row. Set it true only once a real scheduler has fired.");
  }
  if (runs.scheduler && typeof runs.scheduler.configured !== "boolean") {
    errors.push("DATA  runs.scheduler.configured must be a boolean");
  }

  const p = runs.priorSummary;
  if (p) {
    if (p.connected > p.fired) {
      errors.push(`DATA  runs.priorSummary claims ${p.connected} connected of ${p.fired} fired`);
    }
    if (!p.note) {
      errors.push("DATA  runs.priorSummary has no note. An aggregate with no explanation is an unsourced number.");
    }
  }
  const fired = (p?.fired ?? 0) + list.filter((r) => r.fired).length;
  if (fired === 0 && (perf?.totalTrades ?? 0) > 0) {
    warnings.push("DATA  trades exist but no run has ever been recorded — run history is not being written");
  }
}

/* ---------- 2b. order proposals ----------
 * The analyst runs have no order authority: they publish a spec a human executes.
 * That makes the spec the thing worth gating, so docs/RULES.md is enforced here
 * rather than trusted to a run that has read it. A proposal that breaks the
 * rulebook does not get to reach the page and be argued with later. */
/* Every still-open specification, collected so the book can be checked as a book.
 * Under the 2026-08-10 four-position rule the dangerous failure is no longer a single
 * bad spec — it is four individually valid ones that cannot coexist. */
const openSpecs = [];

if (why) {
  for (const e of why.entries ?? []) {
    if (!["did", "will"].includes(e.kind)) errors.push(`DATA  why entry has kind '${e.kind}'`);
    if (!e.body) errors.push(`DATA  why entry '${e.head}' has no reasoning body`);

    const o = e.order;
    if (!o) continue;
    const at = `why entry '${e.head}'`;

    if (e.kind !== "will") {
      errors.push(`RULE  ${at}: an order spec belongs on a 'will' entry. A 'did' entry records what happened.`);
    }
    if (o.requiresHuman !== true) {
      errors.push(`RULE  ${at}: order.requiresHuman must be true. No run in this project has order authority, and a spec that implies otherwise misrepresents what placed it.`);
    }
    if (o.orderType !== "limit") {
      errors.push(`RULE  ${at}: orderType '${o.orderType}' — the rulebook is limit orders only (fractional equity is the one exception and is not proposable).`);
    }
    for (const k of ["limit", "target", "stop"]) {
      if (typeof o[k] !== "number" || !(o[k] > 0)) {
        errors.push(`RULE  ${at}: order.${k} must be a positive number. An exit that is not a number is not an exit.`);
      }
    }
    if (typeof o.limit === "number" && typeof o.target === "number" && typeof o.stop === "number") {
      const buy = o.action === "buy";
      if (buy && !(o.target > o.limit)) errors.push(`RULE  ${at}: buy target ${o.target} is not above the limit ${o.limit}`);
      if (buy && !(o.stop < o.limit)) errors.push(`RULE  ${at}: buy stop ${o.stop} is not below the limit ${o.limit}`);
      if (!buy && !(o.target < o.limit)) errors.push(`RULE  ${at}: sell target ${o.target} is not below the limit ${o.limit}`);
    }
    if (!o.timeStop) {
      errors.push(`RULE  ${at}: no time stop. Checklist item 6 requires target, stop AND a time stop written before entry — if nothing happens the thesis was wrong even if the stop never hits.`);
    }
    /* Under the 2026-08-05 daily entry mandate a failed checklist no longer blocks
     * the entry — it obliges the entry to declare itself. The gate moved from
     * "you may not" to "you may not do it quietly", which is the only version of
     * this that leaves the record still worth reading. */
    const failed = Object.entries(e.checklist ?? {})
      .filter(([, v]) => v === "fail").map(([k]) => k);
    if (failed.length && !o.forced) {
      errors.push(`RULE  ${at}: carries an order spec while checklist item(s) ${failed.join(", ")} are marked fail, but is not marked forced. Under the daily entry mandate a failing entry may be published; it may not be published as though it passed.`);
    }
    if (o.forced) {
      if (!o.forcedReason) {
        errors.push(`RULE  ${at}: marked forced with no forcedReason. A forced entry has to say what it would have failed on.`);
      }
      const named = (o.forcedItems ?? []).map(String).sort().join(",");
      if (failed.length && named !== failed.slice().sort().join(",")) {
        errors.push(`RULE  ${at}: forcedItems [${named || "none"}] does not match the checklist items actually marked fail [${failed.join(", ")}]`);
      }
      if (!failed.length && (o.forcedItems ?? []).length) {
        errors.push(`RULE  ${at}: marked forced and names failing items, but no checklist item is marked fail`);
      }
    }
    /* Options carry their own rulebook, and it is the one this project has already
     * broken once — delta 0.032 against a 0.40 floor, three days to expiry. */
    if (o.kind === "option") {
      /* A contract has to exist before it can be bought. The board cannot reach the
       * broker, so it cannot confirm one — but it can refuse a specification that
       * shows no evidence of having looked. instrumentId is the broker's own contract
       * id: a run that pulled the chain has it, and a run that assembled a plausible
       * ticker from a strike and a date does not.
       *
       * A date check would not have caught this. UPST lists 2026-10-16 and then
       * 2026-12-18 with no November monthly, so an invented "11/20" contract is a
       * real third Friday and still not tradeable. Only the chain knows. */
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(o.instrumentId ?? "")) {
        errors.push(`RULE  ${at}: option spec has no broker instrumentId. Pull the chain and use a contract that exists — a strike and an expiry that look plausible are not evidence the contract is listed.`);
      }
      const bid = o.bid, ask = o.ask;
      if (typeof bid !== "number" || typeof ask !== "number" || !(bid > 0) || !(ask >= bid)) {
        errors.push(`RULE  ${at}: option spec needs a quoted bid and ask from the chain, with ask >= bid > 0`);
      } else {
        const mark = (bid + ask) / 2;
        if ((ask - bid) / mark > 0.10) {
          errors.push(`RULE  ${at}: spread is ${(((ask - bid) / mark) * 100).toFixed(1)}% of mark, over the ~10% ceiling in docs/RULES.md`);
        }
        if (typeof o.limit === "number" && (o.limit < bid || o.limit > ask)) {
          errors.push(`RULE  ${at}: limit ${o.limit} sits outside the quoted spread ${bid}–${ask}. A limit off the book is either a typo or unfillable.`);
        }
      }
      if (!Number.isInteger(o.oi) || o.oi <= 0) {
        errors.push(`RULE  ${at}: option spec has no open interest from the chain. Checklist item 4 is liquidity, and the entry this project already graded 0/6 had an open interest of 34.`);
      }

      /* The instrument string is what a human reads and acts on; the machine fields
       * are what the run pulled from the chain. If those two disagree, one of them is
       * wrong and there is no way to tell which from the outside — so they have to
       * agree. This is what catches a valid contract id pasted next to the wrong
       * ticker, which the id check alone cannot see. */
      if (!o.underlying) errors.push(`RULE  ${at}: option spec has no underlying`);
      if (!["call", "put"].includes(String(o.right ?? "").toLowerCase())) {
        errors.push(`RULE  ${at}: option spec must state right as call or put`);
      }
      if (typeof o.strike !== "number" || !(o.strike > 0)) {
        errors.push(`RULE  ${at}: option spec has no numeric strike from the chain`);
      }

      const label = String(o.instrument ?? "");
      const parsed = label.match(/^([A-Za-z.]{1,6})\s+(?:(\d{4})-(\d{2})-(\d{2})|(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?)\s+\$?([\d.]+)\s*(c|p|call|put)\b/i);
      if (!parsed) {
        errors.push(`RULE  ${at}: instrument '${label}' is not parseable as "<TICKER> <expiry> $<strike><c|p>". The label is what a person reads before executing, so it cannot be freeform.`);
      } else {
        const [, tick, y, mo, d, m2, d2, strikeTxt, rightTxt] = parsed;
        const exp = String(o.contractExpiry ?? "");
        const expParts = exp.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (o.underlying && tick.toUpperCase() !== String(o.underlying).toUpperCase()) {
          errors.push(`RULE  ${at}: instrument names '${tick.toUpperCase()}' but underlying is '${o.underlying}'`);
        }
        if (expParts) {
          const em = +expParts[2], ed = +expParts[3];
          const lm = y ? +mo : +m2, ld = y ? +d : +d2;
          if (lm !== em || ld !== ed) {
            errors.push(`RULE  ${at}: instrument label says ${lm}/${ld} but contractExpiry is ${exp}. The label and the chain date must be the same contract.`);
          }
        }
        if (typeof o.strike === "number" && Math.abs(parseFloat(strikeTxt) - o.strike) > 0.005) {
          errors.push(`RULE  ${at}: instrument label strike ${strikeTxt} does not match strike ${o.strike}`);
        }
        const lr = /^(c|call)$/i.test(rightTxt) ? "call" : "put";
        if (o.right && lr !== String(o.right).toLowerCase()) {
          errors.push(`RULE  ${at}: instrument label reads a ${lr} but right is '${o.right}'`);
        }
      }
      if (typeof o.delta !== "number") {
        errors.push(`RULE  ${at}: option spec has no delta. The 0.40 floor cannot be checked against a missing number.`);
      } else if (o.delta < 0.40) {
        errors.push(`RULE  ${at}: option delta ${o.delta} is below the 0.40 floor in docs/RULES.md`);
      }
      const exp = new Date(o.contractExpiry);
      if (Number.isNaN(+exp)) {
        errors.push(`RULE  ${at}: option spec has no parseable contractExpiry`);
      } else {
        const days = (exp - new Date(e.date)) / 864e5;
        if (days < 21) {
          errors.push(`RULE  ${at}: contract expires in ${Math.round(days)} days. The rulebook floor is 3 weeks — theta on short-dated contracts can exceed the position value per week.`);
        }
      }
      if (o.throughEarnings === true) {
        errors.push(`RULE  ${at}: proposes holding an option through earnings. IV crush kills even a correct call; the rulebook forbids it outright.`);
      }
    }
    /* A specification the account cannot pay for is not a specification. Checked
     * here because the failure is silent otherwise: every field is individually
     * valid and only the total is impossible. An option multiplies by 100, which
     * is exactly where a $128 account and a $2.70 contract stop being compatible. */
    /* Only for a specification still open. Affordability is the one check that
     * depends on the account as it is RIGHT NOW rather than on data captured when
     * the spec was written, so applying it to an expired proposal retroactively
     * fails a spec that was correct at the time — as happened the first hour this
     * rule existed, when a 09:41 entry priced against 126.06 deployable was still
     * being checked after the cash had been spent elsewhere. An expired proposal is
     * a record of a decision, not an instruction anyone can still act on. */
    const stillOpen = !Number.isNaN(+new Date(o.expiresAt)) && new Date(o.expiresAt) > new Date();
    if (stillOpen && typeof o.limit === "number" && typeof o.qty === "number") {
      const mult = o.kind === "option" ? 100 : 1;
      const cost = o.limit * o.qty * mult;
      openSpecs.push({ at, spec: o, cost });
      if (state?.account?.deployable != null && cost > state.account.deployable + 0.005) {
        errors.push(`RULE  ${at}: costs ${cost.toFixed(2)} against ${state.account.deployable.toFixed(2)} deployable. Settled cash sets the size before the thesis does.`);
      }
      /* 2026-08-10: no name is the account. At a four-position ceiling the natural
       * size is 25%, and 40% is the room to be uneven without one spec owning it. */
      const acct = state?.account?.total;
      if (acct != null && acct > 0) {
        const share = cost / acct;
        if (share > 0.40 + 1e-9) {
          errors.push(`RULE  ${at}: ${cost.toFixed(2)} is ${(share * 100).toFixed(1)}% of the ${acct.toFixed(2)} account, over the 40% single-name ceiling in docs/RULES.md`);
        } else if (share < 0.10) {
          warnings.push(`RULE  ${at}: ${cost.toFixed(2)} is ${(share * 100).toFixed(1)}% of the account — a full +20% winner on this adds ${(share * 20).toFixed(1)}%, which cannot move the day and costs the same attention as a real position`);
        }
      }
    }

    const exp = new Date(o.expiresAt);
    if (Number.isNaN(+exp)) {
      errors.push(`RULE  ${at}: order.expiresAt is not a parseable timestamp. A proposal with no expiry is a standing instruction, which is not what a run is allowed to leave behind.`);
    } else if (exp <= new Date(e.date)) {
      errors.push(`RULE  ${at}: order.expiresAt is not after the entry time`);
    }
  }
}

/* ---------- 2c. the book as a book ----------
 * Added 2026-08-10 with the four-position rule. Every check here passes trivially on a
 * one-position book, which is exactly why none of them existed before and why they have
 * to exist now: each specification below can be individually valid while the set of them
 * is impossible. An open spec is a claim on the same settled cash as a filled position,
 * so specs and positions are counted together throughout. */
{
  const positions = state?.positions ?? [];
  const book = [
    ...positions.map((p) => ({ label: `position ${p.sym ?? "?"}`, complex: p.complex, cost: null })),
    ...openSpecs.map((s) => ({ label: s.at, complex: s.spec.complex, cost: s.cost }))
  ];

  const CEILING = 4;
  if (book.length > CEILING) {
    errors.push(`RULE  the book would be ${book.length} names (${positions.length} open, ${openSpecs.length} proposed) against a ceiling of ${CEILING} in docs/RULES.md. A published spec is a claim on the same cash as a fill and is counted like one.`);
  }

  /* The failure the per-spec check cannot see: four affordable specs that are not
   * affordable together. Positions are already paid for and are not in this sum. */
  const committed = openSpecs.reduce((n, s) => n + s.cost, 0);
  if (openSpecs.length > 1 && state?.account?.deployable != null && committed > state.account.deployable + 0.005) {
    errors.push(`RULE  ${openSpecs.length} open specifications commit ${committed.toFixed(2)} against ${state.account.deployable.toFixed(2)} deployable. Each one fits; together they do not, and a cash account cannot fill the second half.`);
  }

  /* Two names in one complex is a position and a hedge against nothing; three is one
   * position at triple size paying three spreads, whose stops all gap together. The
   * field is required rather than inferred — a taxonomy this gate guessed at would be
   * the gate deciding what is correlated, which is the run's job to state and defend. */
  if (book.length > 1) {
    const byComplex = new Map();
    for (const b of book) {
      const c = String(b.complex ?? "").trim().toLowerCase();
      if (!c) {
        errors.push(`RULE  ${b.label}: no complex named. With more than one name in the book every entry states which complex it belongs to, because the concentration limit is per complex and cannot be checked against a blank.`);
        continue;
      }
      byComplex.set(c, [...(byComplex.get(c) ?? []), b.label]);
    }
    for (const [c, members] of byComplex) {
      if (members.length > 2) {
        errors.push(`RULE  ${members.length} names in the '${c}' complex (${members.join(", ")}), over the limit of 2 in docs/RULES.md. Correlated names are not diversification — the stops gap together.`);
      }
    }
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
  /* Watch states drive a CSS class. An unknown one renders as an unstyled chip,
   * which is how "dead" and "armed" shipped looking like every other state. */
  const WATCH_STATES = ["wait", "watch", "armed", "dead"];
  for (const w of state.entryWatch ?? []) {
    if (!WATCH_STATES.includes(w.state)) {
      errors.push(`DATA  entryWatch '${w.setup}' has unknown state '${w.state}' (expected ${WATCH_STATES.join(" | ")})`);
    }
    if (!w.trigger || !w.why) {
      errors.push(`DATA  entryWatch '${w.setup}' is missing a trigger or its reasoning. A setup reaches this list only with both written down.`);
    }
    if (w.level != null && !(typeof w.level === "number" && w.level > 0)) {
      errors.push(`DATA  entryWatch '${w.setup}': level must be a positive number when present`);
    }
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

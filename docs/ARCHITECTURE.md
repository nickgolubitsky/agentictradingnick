# Architecture

## Shape

```
  four scheduled runs  ──propose──▶  why.json order spec  ──human executes──▶  broker
         │                                  │
         └──────────writes────────▶  data/*.json  ──renders──▶  index.html  ──▶  site
                                            │
                                            └──gated by──▶  scripts/validate.mjs
```

**All four slots are wired. None can place an order.** The runs analyse and publish an
order specification; a person executes it or discards it. The broker arrow above is the
only step no software in this repo performs.

That split is the architecture, not a limitation working around one. It puts the
reasoning — catalyst, checklist, sizing, exits — under automation and grading, where
repetition and an outcome-blind auditor make it better over time, and keeps a human on
the single irreversible action. It also means the **specification** is the artefact, so
the specification is what the gate checks.

`scripts/validate.mjs` enforces [RULES.md](RULES.md) on every proposal: limit orders
only, target above and stop below a buy, a time stop present, no failed checklist item,
and for options delta ≥ 0.40, three weeks minimum to expiry, never through earnings. A
proposal that breaks the rulebook fails the build rather than reaching the page to be
argued with later. This is the same reasoning as the leak scan — the outermost layer is
the one that does not rely on an agent behaving well.

**There is no human merge step.** Runs commit and push to `main`, and the site is live
within a minute. That was a deliberate removal: a specification that expires in 40
minutes is worthless waiting in a branch for someone to review it, and the operator
reading a stale proposal is a worse failure than the one review was guarding against.

The trade is explicit. A behavioural check was removed and an automatic one now carries
the whole load. Every agent commit is public the instant it lands, with no staging URL to
catch it in, so the validator is not a formality — it is the entire remaining defence,
and weakening it to make a commit pass would remove the last check on an unattended
writer. Each run prompt says so in those terms.

Two properties of the trigger matter as much as its existence:

- **It is not a server.** A desktop scheduled task fires only while the Claude app is
  open, and a missed window runs late on next launch. For a market-hours run, late is
  worse than never: a proposal built on stale quotes still looks actionable. Each run
  therefore compares the clock to its slot and writes no specification when it has
  fired too late — 25 minutes for the open, 20 mid-session, and hard-stopped at 15:55
  for the pre-close.
- **Order authority is absent by construction, not by policy.** `order.requiresHuman`
  must be `true` or the build fails, so a run cannot publish a spec that implies it
  placed anything itself.

`.github/workflows/validate.yml` still has no `schedule:` trigger; it runs on push,
pull_request and workflow_dispatch. Everything from `data/*.json` rightward is real and
running today.

No server, no database, no build step beyond the validator. The site is static files;
the "state" is JSON in git, which means every change to the board is a reviewable diff
with an author and a timestamp. That is the audit trail.

## Ownership

Exactly one writer per file. Two runs never edit the same block.

| File | Writer | Never touched by |
|---|---|---|
| `state.json` | trading runs | retro |
| `moves.json` | trading runs | retro |
| `why.json` | trading runs append; retro adds `grade` only | anyone else |
| `perf.json` | retro | trading runs |
| `bench.json` | retro | trading runs |
| `runs.json` | every run appends its own row | any run editing another's row |

`runs.json` is the exception to one-writer-per-file, and deliberately so: a run
records *itself*. A run that cannot reach the broker still writes its row before it
stops, because the difference between a run that failed and a run that never fired
is invisible otherwise — and that difference is the whole autonomy measure.

## The retro is read-only

The after-close run grades the day and **never places an order**. It sees the rules and
the log; it grades entries against the checklist *outcome-blind*, meaning a profitable
trade with a bad entry grades as a bad entry. This separation is load-bearing. A single
run that both trades and grades its own trades will always find a reason it was right.

## Invariants

**Reasoning is immutable.** A `why` entry cannot be edited after it is written. The
retro appends `grade`. Nothing else may change. Enforce this in review: any diff that
modifies an existing `body` or `checklist` should be rejected.

**Missing data renders as missing.** `bench.baseline: null` means the chart does not
draw. `impliedMove: null` renders "straddle not pulled." The board never fills a gap
with a plausible number, because a plausible number is indistinguishable from a real
one once it is committed.

**The baseline is written once.** Every rebased benchmark figure divides by it. Editing
it later silently rewrites history.

## Known failure modes

These have all happened and are documented rather than hidden.

- **Connector outage.** During setup, five consecutive test firings reached no brokerage. Those were tests rather than live runs and are excluded from run health, but the failure mode they exposed is real and the guard against it stands: every run's first action is a tool-availability check, and a run with no connection must log the failure, notify, and stop — it must not reason about positions from the log as if the log were live data. A failure found in a test still counts as a failure mode found.
- **Stale board.** Cloud runs have no path to some display surfaces. The board shows a stale badge computed from `lastRefreshUtc` rather than pretending to be current.
- **Reconciliation drift.** The log recorded a balance six cents off the brokerage's, from a regulatory fee. Small, but it is exactly the kind of gap that compounds. The retro reconciles against the API, not against the log.
- **Sequence risk.** A small book has no diversification to smooth a losing streak. Three consecutive stops is a −22% drawdown. The checklist exists to raise the win rate; the stops exist to cap the damage. The 2026-08-10 move from a two-position ceiling to four does **not** reduce this, and assuming it does is the trap: the watched universe is one correlated complex, so four names off it stop together and the drawdown is the same −8% at four times the size. That is why the ceiling arrived with a two-per-complex cap attached and why the gate refuses a spec that will not name its complex.

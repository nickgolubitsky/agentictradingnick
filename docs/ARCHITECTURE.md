# Architecture

## Shape

```
   retro run (16:32 ET)  ──writes──▶
   trading runs (unwired)            data/*.json  ──renders──▶  index.html  ──deploys──▶  static site
                                          │
                                          └──gated by──▶  scripts/validate.mjs
```

**One of the four slots is wired.** The read-only retro runs weekdays at 16:32 ET as a
desktop scheduled task. The three trading slots are specification only — nothing fires
them, and their writes are made by hand. `.github/workflows/validate.yml` still has no
`schedule:` trigger; it runs on push, pull_request and workflow_dispatch.

Two properties of that trigger matter more than the fact it exists:

- **It is not a server.** It fires only while the Claude desktop app is open. A missed
  window runs late on next launch, which for a market-hours run is worse than not
  running — a run acting on stale prices is the failure mode the open-slot preflight
  exists to prevent. This is why the retro, whose inputs are settled end-of-day numbers,
  is the safe one to schedule this way and the trading slots are not.
- **It has no order authority.** The retro is read-only by construction. Scheduling a
  run that *can* trade is a separate decision, and it should not be taken until the
  preflight assertion in [SCOPE.md](SCOPE.md) exists as code rather than as prose.

Everything from `data/*.json` rightward is real and running today.

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

- **Connector outage.** Scheduled runs lost brokerage access for five consecutive firings. Every run's first action is now a tool-availability check; a run with no connection must log the failure, notify, and stop — it must not reason about positions from the log as if the log were live data.
- **Stale board.** Cloud runs have no path to some display surfaces. The board shows a stale badge computed from `lastRefreshUtc` rather than pretending to be current.
- **Reconciliation drift.** The log recorded a balance six cents off the brokerage's, from a regulatory fee. Small, but it is exactly the kind of gap that compounds. The retro reconciles against the API, not against the log.
- **Sequence risk.** A one-or-two-position account has no diversification to smooth a losing streak. Three consecutive stops is a −22% drawdown. The checklist exists to raise the win rate; the stops exist to cap the damage.

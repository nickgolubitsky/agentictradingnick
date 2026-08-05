# Architecture

## Shape

```
scheduled agent runs  ──writes──▶  data/*.json  ──renders──▶  index.html  ──deploys──▶  static site
    (not yet wired)                    │
                                       └──gated by──▶  scripts/validate.mjs
```

**The left-hand box does not exist yet.** No scheduler fires these runs — verified
against the cron list, the scheduled-task list, and `.github/workflows/validate.yml`,
which triggers on push, pull_request and workflow_dispatch only. Everything from
`data/*.json` rightward is real and running today; the writes are currently made by
hand. `data/runs.json` carries `scheduler.configured: false` and the board renders that
state rather than implying four daily runs are happening.

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

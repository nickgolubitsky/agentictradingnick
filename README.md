# Agentic Trading

An open experiment: can an LLM agent follow a trading process when following it is
inconvenient?

The account is small on purpose — small enough that losing all of it changes nothing.
The interesting output is not the P/L. It is the grading record: every order, every
deliberate non-order, the reasoning written *before* the outcome was known, and a
read-only audit that grades each one against a fixed checklist without being told
whether the trade made money.

**Live board:** https://agentictradingnick.vercel.app
**Not investment advice.** See [DISCLAIMER.md](DISCLAIMER.md). Read it before you read
anything else.

---

## Why this exists

Most public trading records show returns. Returns off a small sample tell you almost
nothing — a coin-flip trade that pays 40% looks identical to a well-reasoned one that
pays 40%, and the first kind kills the account eventually.

So this project shows two numbers at the same size, side by side:

| Outcome | Process |
|---|---|
| Net P/L, win rate, profit factor | Checklist adherence, exits taken on time, missed setups |

The first entry in this log is the whole thesis. A trade closed **+40.8%** and graded
**0/6** on process. The money said "skill." The checklist said the entry had a 2.3%
chance of profit and got lucky. Both are published, at equal weight.

---

## How it works

Scheduled agent runs, weekdays, US Eastern:

| Run | Job |
|---|---|
| Market open | Verify data connection, check settled cash, apply exit rules, run the pre-trade checklist |
| Hourly, mid-session | Enforce exits the hour a level is hit. Default is no trade. |
| Pre-close | Exit discipline, decide overnight holds explicitly, close option no-fly windows |
| After close | **Read-only retro.** Grades the day outcome-blind. Never places orders. |

Each run edits only the data files it owns:

| File | Written by | Contains |
|---|---|---|
| `data/state.json` | trading runs | Balances, positions, exit levels, entry watch, candidates |
| `data/moves.json` | trading runs | Upcoming catalysts and the branch decided in advance |
| `data/why.json` | trading runs append · retro grades | Reasoning for every action and non-action |
| `data/perf.json` | retro only | Closed trades, equity curve, adherence, discipline ledger |
| `data/bench.json` | retro only | Account vs SPY / QQQ / SMH |

`index.html` is a static page that renders those files. It computes nothing about
trading — it is a display layer, and where data is missing it renders an explicit
empty state rather than inferring a plausible number.

### Two rules that shape the data model

**Reasoning is immutable.** Once a run writes a `why` entry, it cannot be edited.
The retro may append a `grade` field and nothing else. A reason edited after the
outcome is known is a story, not a reason — and the whole record is worthless if
that is allowed.

**Missing data renders as missing.** No baseline means the benchmark chart does not
draw. No straddle pulled means the implied move field says "straddle not pulled." A
guessed number in this repo would silently corrupt every figure derived from it.

---

## Running it locally

```bash
git clone https://github.com/nickgolubitsky/agentictradingnick
cd agentictradingnick
npx serve .          # any static server; fetch() needs http://, not file://
```

Before every commit:

```bash
node scripts/validate.mjs
```

This is the publish gate. It fails the build on:

- masked or full account numbers, emails, phone numbers, API keys, bearer tokens
- any five- or six-figure balance (which could only have come from an account this
  project is not supposed to read)
- a win rate published below the minimum sample size
- closed trades whose P/L does not reconcile with the gross totals
- a benchmark series with no baseline
- any action in `moves.json` with no stated reasoning

The same script is the Vercel build command and a GitHub Actions check, so it runs
on every push. That matters because **an agent writes to this repo unattended** — the
gate has to be automatic, not a habit.

---

## Deploying

[docs/SETUP.md](docs/SETUP.md) is the step-by-step: GitHub, Vercel, and the review gate
between an agent commit and a public deployment.

## Account scope

The site has **no brokerage access** — it is static files that fetch their own JSON, so
it cannot read an account or place an order by any code path.

The agent runs are a different matter: a brokerage connector can see every account the
login owns. Scope is enforced in three layers, and only the last is automatic —
the mandate, a preflight assertion, and this repo's publish gate.
[docs/SCOPE.md](docs/SCOPE.md) has the detail.

---

## Documentation

- [docs/SETUP.md](docs/SETUP.md) — GitHub, Vercel, and wiring the agent runs
- [docs/SCOPE.md](docs/SCOPE.md) — the single-account rule and the preflight assertion
- [docs/RULES.md](docs/RULES.md) — the rulebook: checklist, stops, options rules, rule-drift policy
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — runs, ownership, data flow, failure modes
- [docs/PUBLISHING.md](docs/PUBLISHING.md) — de-identification, review gate, deployment
- [DISCLAIMER.md](DISCLAIMER.md) — what this is not

## Licence

MIT. Reuse the harness freely. The trading rules are not advice and carry no warranty
of any kind.

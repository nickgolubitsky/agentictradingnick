# Backtest pre-registration: round 3

Written and committed **before** any round-3 code ran (2026-10-26). Rounds 1–2 rules apply unless
changed here. Every test listed gets reported.

## Why this round

Two decisions changed what has to be true:
1. **Nick places every real order by hand in Robinhood** (approvals on). Close fills aren't
   realistic, but queuing orders the evening before for the **next open** is. RSI(2) has only been
   tested with close fills.
2. **The trader is multi-asset.** The research (`docs/research/agentic-traders-2026-10.md`) points
   to ETF trend-following as the core sleeve: Faber's GTAA rules have published out-of-sample
   results since 2006, and they trade once a month.

## Data

Yahoo daily bars with explicit `period1`/`period2` bounds (lesson: `range=max` returns monthly bars),
split- and dividend-adjusted, and checked for gaps over 5 days. T-bill yield is ^IRX. ETFs: SPY,
QQQ, EFA, IEF, VNQ, DBC.

## Costs

Same schedule as round 2: 10 bp per side before 2001-04-09, 2 bp after (sensitivity 20/5).
Rebalance trades pay the cost on the traded value only.

## Tests

### R3-1. RSI(2) with next-open fills (SPY, QQQ)

Same signal as rounds 1–2. When it fires at day t's close, **enter at day t+1's open**. When the exit
fires at day u's close, **exit at day u+1's open**. Idle money earns T-bills (D1 form).

- Verdict on 1993-10 → 2016-10 (SPY) and 1999 → 2016-10 (QQQ), as in round 2. Recent window descriptive.
- **Pass:** net mean trade > 0, t ≥ 3.0, ≥ 100 trades. Also reported: how much of the close-fill
  edge survives (next-open mean trade ÷ close-fill mean trade).

This isn't a fresh out-of-sample test. The SPY signal dates are the ones round 2 already saw;
only the fill changes. It measures implementation cost, not new evidence.

### R3-2. ETF trend, Faber GTAA-5

- Assets: SPY (US stocks), EFA (international stocks), IEF (Treasuries), VNQ (REITs), DBC
  (commodities). 20% target each.
- At each **month-end close**, an asset is held if its close is above the average of its last 10
  month-end closes (including the current one); otherwise its 20% sits in T-bills.
- Trades fill at the **next trading day's open**. Holdings are rebalanced to 20% each per month and
  drift in between.
- Window: the first month-end with 10 month-ends of history for all five (DBC starts 2006-02) →
  2026-10-23. Faber published the rule in 2006–2007, so essentially the whole window is
  out-of-sample for the rule itself.
- Baselines: SPY buy-and-hold, and an equal-weight GTAA-5 buy-and-hold, rebalanced monthly with
  the same fills and costs.
- **Pass:** CAGR/max-DD better than **both** baselines at primary costs.

### R3-3. The blend: GTAA-5 + RSI(2)-SPY

- 50% R3-2, 50% R3-1-SPY (D1, next-open), reset to 50/50 at each month start.
- Same window as R3-2.
- Reported: correlation of the two sleeves' monthly returns, CAGR, max DD, CAGR/DD, against SPY
  buy-and-hold.
- **Pass:** CAGR/max-DD better than SPY buy-and-hold, and better than the better of the two
  sleeves alone. Diversification has to earn something.

## Not tested this round

**Large-cap stock momentum.** A fair test needs point-in-time index membership and price data for
delisted stocks. Yahoo has neither, and momentum on today's survivors is badly biased upward. It
waits for a data decision: Norgate, Massive or similar. It won't be tested on survivor-only data.

## Assumptions to verify before Phase 3

- Robinhood queues market orders entered outside market hours for the next open, and supports
  fractional shares for these ETFs. To be confirmed read-only, through the connector or Robinhood's
  documentation, before any ticket list is published.

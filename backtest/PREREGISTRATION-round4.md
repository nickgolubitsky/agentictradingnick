# Backtest pre-registration: round 4

Written and committed **before** any round-4 code ran (2026-10-26). Rounds 1–3 rules apply unless
changed here. Every test listed gets reported.

## Why this round

Nick's direction (2026-10-26): the trader should **push for the best short-term trades it can and
make money daily**. Round 1 already showed that intraday breakouts lose after costs. The
short-term edge that has held up in rounds 2–3 is buying sharp pullbacks inside an uptrend, held for
days. This round turns that into a daily, multi-position engine: every evening it scans a basket,
ranks the pullbacks, and fills the free slots at the next open.

## Universes

| id | universe | span | role |
| --- | --- | --- | --- |
| **U-ETF** | the 20 round-1 ETFs: SPY QQQ IWM DIA XLK XLF XLE XLV XLY XLP XLI XLU XLB XLRE XLC SMH GLD TLT EEM EFA | each ETF's full Yahoo history; the portfolio starts 2000-01-03 and each ETF joins after 200 days of history | **verdicts**: ETFs have no survivorship bias |
| U-STK | the 99 round-1 large caps (MMC missing) | 10 years to 2026-10-23 | **descriptive only**: today's survivors flatter dip-buying, so this is an upper bound |

## Signals (each is one test on U-ETF)

Both require **close > 200-day SMA** and both exit at the **next open after close > 5-day SMA**.

| id | entry when | rank (most oversold first) |
| --- | --- | --- |
| S1 | RSI(2) < 10 | lowest RSI(2) |
| S2 | IBS < 0.2, where IBS = (close − low) / (high − low) | lowest IBS |

## Portfolio rules (no margin, cash-account style)

- At most **5 positions** at once, each sized at **20% of equity** (marked at the prior close) when it
  opens, and capped by available cash.
- Evening: queue exits for held names that hit the exit rule, then queue entries for the top-ranked
  signals that fit the free slots. One position per symbol.
- Morning: **all fills at the next open**: exits first, then entries.
- Idle cash earns T-bills (^IRX).
- Costs: 10 bp per side before 2001-04-09, 2 bp after (sensitivity 20/5).

## What gets reported

CAGR, max drawdown, CAGR/DD, Sharpe (0% risk-free), trades per week, share of days with at least
one fill, **share of days with positive P&L**, and the trade-level mean and t. Windows: full
(2000-01 → 2026-10) and the last 10 years (2016-10-24 → 2026-10-23). Compared against SPY buy-and-hold
over the same window.

## Pass bar (U-ETF only, full window, primary costs)

- **Edge:** trade-level net mean > 0 with t ≥ 3.0 and ≥ 100 trades, **and** a positive mean over the
  last 10 years.
- Then the label depends on what Nick asked for:
  - **PASS: beats SPY:** CAGR above SPY buy-and-hold's.
  - **PASS: lower risk only:** CAGR below SPY but CAGR/DD above SPY's.
  - **FAIL:** anything else.

## Known limits

- In a broad selloff most of the basket signals at once, so 5 slots will often be full of correlated
  positions.
- Next-open fills assume Nick queues the orders each evening and approves them in the app (Option 2).
  A missed evening means a missed or late trade, and the shadow run will measure how often that happens.

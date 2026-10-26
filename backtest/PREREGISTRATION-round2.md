# Backtest pre-registration: round 2

Written and committed **before** any round-2 code ran or any pre-2016 result was looked at
(2026-10-25). Round 1's rules ([PREREGISTRATION.md](PREREGISTRATION.md)) still apply unless
changed here. Every test listed gets reported.

## Why this round

Round 1's only promising result was RSI(2) on SPY (t = 3.30) and QQQ (t = 3.38), which fell
short of the 100-trade minimum with 46 and 45 trades. Round 1 only used data from 2016-10-24 on.
Everything before that has never been looked at, so it's a clean out-of-sample test.

## Data

Yahoo v8 daily bars, `range=max`, split- and dividend-adjusted.

| series | from | used for |
| --- | --- | --- |
| SPY | 1993-01-29 | signal + returns |
| QQQ | 1999-03-10 | signal + returns |
| ^IRX (13-week T-bill yield, % annualized) | before 1993 | idle cash yield (D1) and margin cost (D2) |

**Untouched window (primary):** first tradable day (after the 200-day warm-up) → **2016-10-21**.
**Recent window (descriptive only, no verdicts):** 2016-10-24 → 2026-10-23.

## Costs

SPY and QQQ traded in 1/8 and 1/16 increments until decimalization (2001-04-09), with much wider
spreads than today.

- **Primary:** 10 bp per side before 2001-04-09, 2 bp per side from then on.
- **Sensitivity:** 20 bp before, 5 bp after.

## Strategies

The signal is unchanged from round 1: buy at the close when RSI(2) < 10 and close > 200-day SMA;
sell at the close when close > 5-day SMA. Signal and trades use the same symbol.

| id | what it holds | idea |
| --- | --- | --- |
| **C** | the ETF during a signal, **cash earning 0%** otherwise | round 1's rule on new data |
| **D1** | the ETF during a signal, **T-bills** (^IRX) otherwise | the same, but idle money earns interest |
| **D2** | **always 1× the ETF**, plus a second 1× unit (2× total, on margin) during a signal. Margin costs T-bill + 2.5%/yr on the borrowed unit | "hold SPY while idle": buy-and-hold with RSI(2) as an add-on |

A note on D2: for SPY, "hold SPY while idle" taken literally is just buy-and-hold, since the
signal and the idle asset are the same thing. The meaningful form is the overlay above: always
long, and lever up during the signal. D2 is run on SPY and QQQ.

## Pass bar

**Signal test (C on the untouched window, SPY and QQQ = 2 tests):** net mean trade > 0, trade-level
t ≥ 3.0 (kept at round 1's bar; tests accumulate across rounds), and ≥ 100 trades.

**Portfolio test (D1, D2 on the untouched window):** reported against buy-and-hold on CAGR, max
drawdown and CAGR/max-DD. D1 passes if its CAGR/max-DD beats buy-and-hold. D2 passes if its CAGR
beats buy-and-hold **and** its CAGR/max-DD is at least buy-and-hold's.

## What a pass means

If C passes on SPY or QQQ, RSI(2) moves to Phase 2 (paper trading) on that symbol. The portfolio
form used for paper trading is whichever of C, D1 or D2 passed with the best CAGR/max-DD on the
untouched window. If no D variant passes, it's C with idle cash in T-bills where the broker allows.
If C fails on both, RSI(2) is dropped and round 3 starts from the lessons file.

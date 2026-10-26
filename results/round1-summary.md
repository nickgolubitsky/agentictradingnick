# Round 1: what it says

Full tables: [round1.md](round1.md). Rules: [PREREGISTRATION.md](../backtest/PREREGISTRATION.md).
Nothing passed. One family is promising.

## A. Opening-range breakout: fails

All four variants lose money after costs, in both halves (OOS mean −0.03R to −0.09R per trade at
2 bp, and worse at 5 bp). The breakout does beat the control (just being long at 9:40 loses
−0.29R), so the filter does something. It just doesn't beat costs. The tight range-midpoint stop
(the repo's default) is the worst: at 2 bp a side, costs alone eat about 0.08R per trade.

Caveat: 60 sessions is one regime. Alpaca's multi-year 5-minute history could overturn this, but
the result is negative in both halves and across every variant, so there's no reason to expect it.

## B. Daily scanner setups: no stock-picking edge

None of the five setups beats a random entry on the same day by a meaningful amount.
`oversold` looks good in raw terms (+1.04% per 5 days against +0.24% baseline), but almost all of
that is the market bouncing after broad selloffs, not the stock. Once the same-day baseline is
subtracted, the edge is about zero. `bull_flag` is the best at +0.18% with t = 1.3: noise.

**What this does tell us:** the oversold effect is a *market-timing* effect, not a stock-picking
one. That's what strategy C trades directly.

## C. RSI(2) on index ETFs: promising, not passed

| | OOS mean trade | t | CAGR | max DD | time in market |
| --- | --- | --- | --- | --- | --- |
| SPY | +0.59% | 3.30 | 5.5% | 6.5% | 12% |
| QQQ | +0.78% | 3.38 | 7.2% | 6.9% | 12% |
| DIA | +0.38% | 2.14 | 3.9% | 4.9% | 14% |
| IWM | +0.15% | 0.39 | 0.9% | 16.9% | 11% |

SPY and QQQ clear t ≥ 3.0 but have only 45–46 OOS trades (the bar is 100), so they're PROMISING,
not PASS. They make **less** money than buy-and-hold (5.5% vs 12.3% CAGR for SPY) while being in
the market 12% of the time, with a quarter of the drawdown. It's a risk-adjusted edge, not a
"beat the market" edge. IWM fails.

## What's next (round 2, pre-registered before it runs)

1. **More RSI(2) trades:** SPY and QQQ daily history goes back to 1993 and 1999. Those years were
   never touched in round 1, so they're a genuine extra out-of-sample test.
2. **Use the idle 88%:** RSI(2) sits in cash most of the time. A version that holds SPY or T-bills
   in between could keep the edge and close the return gap.
3. Drop ORB and the daily scanner setups unless new data says otherwise.

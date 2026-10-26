# Round 2: what it says

Full tables: [round2.md](round2.md). Rules: [PREREGISTRATION-round2.md](../backtest/PREREGISTRATION-round2.md).

**RSI(2) on SPY passes** on 23 years of data that rounds 1 and 2 never tuned on. QQQ is promising
but doesn't pass. Under the pre-registered rule, **SPY moves to Phase 2 (paper trading) in the D1
form: RSI(2) trades, with idle cash in T-bills.**

## The signal (untouched window, 1993–2016)

| | trades | mean trade | win % | t | verdict |
| --- | --- | --- | --- | --- | --- |
| SPY | 179 | +0.61% | 77% | 5.31 | **PASS** (also passes at double costs: t = 4.32) |
| QQQ | 127 | +0.53% | 70% | 2.78 | PROMISING (short of t ≥ 3.0) |

Average hold is 3–4 trading days. The SPY result is consistent across both windows: +0.59% per
trade in round 1 (2017–2026) and +0.61% here (1993–2016).

## The portfolio forms (SPY, untouched window, primary costs)

| form | CAGR | max drawdown | CAGR / DD |
| --- | --- | --- | --- |
| buy & hold | 8.9% | 55% | 0.16 |
| C: RSI(2), cash idle | 4.8% | 15% | 0.32 |
| **D1: RSI(2), T-bills idle** | **7.1%** | **15%** | **0.48** |
| D2: always long, 2× during signals | 13.0% | 55% | 0.23 |

The two passing forms are really two different products:
- **D1** gives up about 1.8 points a year against buy-and-hold for a quarter of the drawdown. It's in
  the market about 12% of the time, so 2008 barely touches it.
- **D2** beats buy-and-hold by about 4 points a year, but carries the same 55% drawdown and needs
  margin.

The pre-registered pick is the best CAGR/DD, which is **D1**. Switching to D2 would be a rule change
that you'd make deliberately and log with a date. The recent decade shows the same shape: D1 at
6.9% with an 8% drawdown, D2 at 19.5% against buy-and-hold's 15.3%.

## Open risks before paper trading

1. **Close-to-close timing.** The backtest computes RSI(2) on the close and trades *at* that close.
   Live, the price has to be read a few minutes before the bell, with a market-on-close or late
   limit order placed. Paper trading measures this gap directly. A quick round-3 check ("signal at
   15:50, fill at the close") would size it in advance.
2. **This is a famous strategy.** RSI(2) on SPY has been public since about 2008, and the 2016–2026
   numbers held up anyway. That's good evidence, but crowding can still erode it.
3. **Yahoo data:** dividend-adjusted closes and a T-bill discount yield are approximations. The
   errors are small next to a t-stat of 5.
4. **It's not exciting.** About 8 trades a year, each held for a few days. That's not day trading.
   It's what survived.

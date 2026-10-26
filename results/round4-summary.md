# Round 4: what it says

Full table: [round4.md](round4.md). Rules: [PREREGISTRATION-round4.md](../backtest/PREREGISTRATION-round4.md).

**The daily engine works, and one version beats SPY over the full 26 years.** The IBS pullback
engine on 20 ETFs (S2) trades about 5 times a week, fills orders on 70% of trading days, and made
9.2% a year against SPY's 8.2% from 2000, with a 16% worst drawdown against SPY's 55%. Two big
caveats: it is **very sensitive to trading costs**, and over the **last 10 years it lagged SPY**
(11.9% vs 15.3%).

## The two signals on 20 ETFs (2000-01 → 2026-10, 2 bp per side)

| | S1: RSI(2) pullbacks | **S2: IBS pullbacks** | SPY buy & hold |
| --- | --- | --- | --- |
| CAGR | 6.9% | **9.2%** | 8.2% |
| Worst drawdown | 15.6% | 15.8% | 55% |
| Sharpe | 0.85 | 0.86 | |
| Trades per week | 1.8 | 4.7 | |
| Days with a fill | 38% | 70% | |
| Invested days that were up | 55% | 54% | |
| Mean trade / t | +0.30% / 5.0 | +0.18% / 6.3 | |
| Verdict | PASS: lower risk only | **PASS: beats SPY** | |

## The caveats that matter

1. **Costs decide it.** At 5 bp per side instead of 2, S2 drops from 9.2% to 5.9% a year and falls
   below SPY. Each trade averages about +0.18%, so every basis point of slippage at the open counts.
   This is the first thing the shadow run has to measure: real Robinhood fills against the modelled
   open price.
2. **It hasn't beaten SPY recently.** Over 2016–2026 it made 11.9% against SPY's 15.3%. The full-window
   win comes from going through 2000–02 and 2008 at a 16% worst drawdown rather than SPY's 55%. In a
   long bull market it lags. It's still positive, with a lot less risk, but it lags.
3. **"Daily" means mostly daily.** It's invested and trading on most days, but only about 54% of
   invested days are up. No version makes money every day.
4. **Manual approvals:** about 5 orders a week, queued in the evening and approved in the app.
   That's workable, but a missed evening is a missed trade.
5. **Individual stocks** (descriptive, survivor-biased): 13–14% a year but a 31–34% drawdown. Not
   tradeable until it's tested on survivorship-free data.

## Next

S2 on the ETF basket is the first engine that passes on return. The next gate is a **shadow run**:
live Robinhood quotes, simulated next-open fills, and a nightly ticket list, with slippage measured
against the model before any real order.

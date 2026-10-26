# Round 3: what it says

Full tables: [round3.md](round3.md). Rules: [PREREGISTRATION-round3.md](../backtest/PREREGISTRATION-round3.md).

**Hand-placed next-open orders work.** RSI(2) keeps its edge when you fill at the next open
instead of the close. ETF trend passes. The 50/50 blend passes at normal costs and fails narrowly
at double costs. But everything that passes makes about **half of SPY's return**, with about a
**quarter of its drawdown**. That trade-off is the real decision now.

## R3-1. RSI(2) filled at the next open

| | trades | mean trade | t | edge kept vs close fills | verdict |
| --- | --- | --- | --- | --- | --- |
| SPY 1993–2016 | 179 | +0.59% | 4.64 | 96% | **PASS** (also passes at double costs) |
| QQQ 2000–2016 | 127 | +0.53% | 3.05 | ~100% | **PASS** (PROMISING at double costs) |
| SPY 2016–2026 | 87 | +0.37% | 2.30 | 69% | descriptive |
| QQQ 2016–2026 | 86 | +0.43% | 2.44 | 70% | descriptive |

Queuing orders the evening before costs little over 1993–2016 and about 30% of the edge over the
last decade. The edge still holds, so manual next-open orders are workable.

## R3-2 / R3-3. ETF trend and the blend (Dec 2006 → Oct 2026, primary costs)

| | CAGR | max DD | CAGR/DD | Sharpe | verdict |
| --- | --- | --- | --- | --- | --- |
| SPY buy & hold | 10.9% | 55% | 0.20 | 0.63 | |
| GTAA-5, always in | 6.1% | 47% | 0.13 | 0.48 | |
| **GTAA-5 trend** | 5.1% | 15% | 0.35 | 0.66 | **PASS** |
| RSI(2) SPY, next open | 4.6% | 15% | 0.31 | 0.74 | |
| **Blend 50/50** | 4.9% | 13% | 0.37 | **0.82** | **PASS** (FAIL at double costs: 0.34 vs GTAA's 0.34) |

- The two sleeves are only loosely related (monthly correlation 0.37), so the blend has the best
  Sharpe and the smallest drawdown of anything tested.
- GTAA-5 sits in T-bills about a third of the time. That's where the drawdown protection comes from,
  and also why it lags SPY in a bull market.

## The decision this raises

Every passing strategy so far is a **lower-risk** strategy, not a **higher-return** one. Over the
last 20 years:
- The blend made 4.9% a year with a worst drop of 13%.
- SPY made 10.9% a year but fell 55% at one point.

Two honest paths:
1. **Defensive:** run the blend as is. Smoother, and survives a 2008, but below SPY in a bull market.
2. **Return-seeking:** hold SPY as a core and use RSI(2) to add exposure on dips. Round 2's D2 form
   beat buy-and-hold (13.0% vs 8.9% in 1993–2016), but it needs margin, carries SPY-sized drawdowns,
   and Robinhood's agentic account is reportedly cash-only. A no-margin version would keep part of
   the book in cash for dips. That needs its own pre-registered test.

Separately, large-cap stock momentum is still untested. It needs survivorship-free data (Norgate,
Massive or similar), so it waits on a data decision.

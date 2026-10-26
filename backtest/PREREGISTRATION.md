# Backtest pre-registration: round 1

Written and committed **before** any strategy code ran (2026-10-25). Every variant listed here
gets reported, whatever it shows. If a rule changes after seeing results, it becomes round 2 and
gets its own file. This one doesn't get edited.

## Data

| set | source | span | universe |
| --- | --- | --- | --- |
| Intraday | Yahoo v8 chart, 5-minute bars | the last ~60 sessions Yahoo serves (it serves no more) | 100 liquid US large caps (`backtest/universe.py`) |
| Daily | Yahoo v8 chart, 1-day bars, split- and dividend-adjusted | 10 years to 2026-10-23 | the same 100 stocks + 20 ETFs |

**Known biases, stated up front:**
- **Survivorship:** the stock list is today's large caps, so names that fell out of the index over
  10 years are missing. That flatters long-only results. ETFs don't have this problem.
- **Short intraday window:** 60 sessions is one market regime. The effective sample is about 60
  days, not thousands of trades, because breakouts across names cluster on the same days.
- **Yahoo data is unofficial.** Fetch failures are reported, never silently dropped.

## Splits

- **Intraday:** first half of sessions = in-sample (IS), second half = out-of-sample (OOS).
- **Daily:** 2016-10 → 2021-10 = IS, 2021-10 → 2026-10 = OOS.

## Costs

2 bps slippage per side (4 bps round trip), commission $0 (Alpaca). A sensitivity run at 5 bps per
side is also reported.

## Strategies

### A. Opening-range breakout (day-trader-skill's rule)

- Opening range = the 9:30, 9:35 and 9:40 five-minute bars (high of highs, low of lows).
- Entry: long at the close of the first 5-minute bar after 9:45 that **closes** above the range
  high. No entries after 15:30.
- Exit: stop or target, checked on each later bar's high/low. If one bar touches both, the stop
  counts (conservative). A gap through the stop fills at the bar's open. Anything still open exits
  at the 15:50 bar's close (flat by 15:55).
- One trade per symbol per day. Skip sessions that are half days or missing bars.

| id | stop | target |
| --- | --- | --- |
| A1 | range midpoint | 1R (the repo's default) |
| A2 | range midpoint | 2R |
| A3 | range low | 1R |
| A4 | range low | 2R |
| A0 | **control:** buy every name at the 9:40 bar's close, stop at range low, target 1R | |

A0 checks whether the breakout condition adds anything over just being long in the morning.

### B. Daily scanner setups (day-trader-skill's `scan.py daily`, rules on closes)

`breakout_20d`, `bull_flag`, `reclaim_ma20`, `oversold` (RSI14 < 30), `oversold_bounce`, all
defined exactly as in the repo. The scanner has no exit rule, so the pre-registered one is: **enter
at the next session's open, exit at the close of the 5th session**.

- Baseline: the same 5-session hold entered on **every** day, for every symbol. A setup's edge is
  its mean return minus the baseline's.

### C. RSI(2) mean reversion (Connors, the well-known public baseline)

- Buy at the close when RSI(2) < 10 and close > 200-day SMA; sell at the close when close > 5-day SMA.
- Run on SPY, QQQ, IWM and DIA. Compared with buying and holding each one.

## Pass bar

14 strategy tests in total (A0–A4, B×5, C×4), so the threshold is adjusted for multiple testing.

- **Pass:** OOS net expectancy > 0, **day-clustered t-stat ≥ 3.0** (Bonferroni-adjusted 5% across
  14 tests), ≥ 100 OOS trades, and, where an equity curve applies, a better return/max-drawdown
  ratio than buy-and-hold over the same window.
- **Promising:** OOS t-stat between 2.0 and 3.0. That needs more data (Alpaca's multi-year
  intraday history) before paper trading.
- **Fail:** anything else.

Day-clustered t-stat means: average the net R (or return) of all trades on each day, then compute
the t-stat across days. Trades on the same day aren't independent, and counting them as if they
were inflates confidence.

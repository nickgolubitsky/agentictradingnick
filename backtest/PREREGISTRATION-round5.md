# Backtest pre-registration: round 5

Written and committed **before** any round-5 code ran (2026-10-26). Rounds 1–4 rules apply unless
changed here. Every test listed gets reported.

## Why this round

Nick's idea (2026-10-26): crypto swings up and down within a day; with patience you can buy dips and
make 1–2% a trade. This round tests that idea in the form he could actually run under Option 2
(he approves every order in the Robinhood app, in the evening).

## Costs: the number that decides it

Robinhood crypto quotes on market-maker routing showed a **1.89–1.92% bid/ask spread** on BTC, ETH,
SOL and DOGE, read twice on 2026-10-26 around 00:35 ET. The quotes came without an account, so the
agentic account's own routing may differ.

- **Primary: 1.9% spread.** Buys fill on the ask (mid + 0.95%) and sells on the bid (mid − 0.95%).
- **Sensitivity: 1.0% and 0.5%**, which is what tighter routing would have to deliver.
- Reported: the **break-even spread** for each variant.

## Data

Coinbase Exchange public hourly candles (mid-market proxy). BTC-USD and ETH-USD from 2017-01-01;
SOL-USD and DOGE-USD from their Coinbase listing (2021-06). All end 2026-10-25.

- **In-sample:** before 2023-01-01. **Out-of-sample (verdicts):** 2023-01-01 → 2026-10-25.
- **Survivorship:** these four coins survived and became large. Dead coins aren't in the test, which
  flatters any long-only dip-buying. This is disclosed, not fixed.

## The routine (what Nick would actually do)

Every evening at **00:00 UTC (8 pm ET in summer)**, for each coin with no open position:
1. Place a **limit buy at D% below the current mid price**, good for 24 hours, sized at 25% of
   equity (four coins, no leverage).
2. If it fills (Robinhood's ask touches the limit), immediately place a **limit sell at the target**:
   entry × (1 + target). Because the buy already paid the ask and the sell receives the bid, the
   target is a **net** gain.
3. Optional **stop**: sell when the bid falls to entry × (1 − 10%). If the hour opens below that, it
   fills at the open.
4. **Time stop:** anything still open 7 days after entry is sold at the bid.

Order of events: a fill can't exit in the same hour it entered. If one hour touches both the target
and the stop, the stop counts. One position per coin at a time. A coin is available again at the
next 00:00 UTC after it exits. Idle cash earns 0%.

## Variants (10 tests)

| id | dip D | target (net) | stop |
| --- | --- | --- | --- |
| C1 | 3% | 1% | none |
| C2 | 3% | 2% | none |
| C3 | 6% | 1% | none |
| C4 | 6% | 2% | none |
| C5 | 3% | 1% | −10% |
| C6 | 3% | 2% | −10% |
| C7 | 6% | 1% | −10% |
| C8 | 6% | 2% | −10% |
| K1 | **control:** market buy at 00:00 on the ask, no dip | 1% | none |
| K2 | **control:** same | 2% | none |

The controls show whether waiting for a dip adds anything over simply being long and patient.

## What gets reported

Per variant, pooled across the four coins, for OOS (and IS for reference): trades, win rate, mean net
trade, **worst trade**, average hours held, day-clustered t, portfolio CAGR, max drawdown (marked at
the bid every hour), and the break-even spread. Benchmarks: equal-weight buy-and-hold of the four
coins and BTC buy-and-hold over the same window, each paying the spread once.

## Pass bar (OOS, primary 1.9% spread)

- **Edge:** mean net trade > 0, day-clustered t ≥ 3.0, ≥ 100 trades.
- Then:
  - **PASS: beats buy & hold:** portfolio CAGR above the equal-weight buy-and-hold.
  - **PASS: lower risk only:** CAGR below it, but CAGR/max-DD above it.
  - **FAIL:** anything else.

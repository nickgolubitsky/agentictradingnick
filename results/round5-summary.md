# Round 5: what it says

Full table: [round5.md](round5.md). Rules: [PREREGISTRATION-round5.md](../backtest/PREREGISTRATION-round5.md).

**Short-term crypto dip-buying loses money, badly, in every version tested, including the ones
with high win rates.** Over 2023–2026, a stretch where simply holding the four coins made about 48% a
year, every variant lost 16–65% a year at Robinhood's 1.9% spread.

## Out-of-sample, 2023-01 → 2026-10, 1.9% spread

| | win rate | mean trade | worst trade | per year | worst drawdown |
| --- | --- | --- | --- | --- | --- |
| Limit −3%, take +1% (C1) | 76% | −1.60% | −30% | −55% | −96% |
| Limit −6%, take +1% (C3) | 82% | −1.11% | −28% | −21% | −65% |
| Limit −6%, take +2% (C4) | 77% | −0.83% | −28% | −16% | −59% |
| Same with a −10% stop (C5–C8) | 64–76% | −1.3% to −1.8% | −11% | −27% to −65% | −73% to −98% |
| Control: buy every evening, take +1% (K1) | 72% | −1.63% | −31% | −84% | −100% |
| Equal-weight buy & hold | | | | **+48.5%** | −72% |
| BTC buy & hold | | | | **+51.2%** | −54% |

## Why a 76% win rate still loses

- Winners are capped at +1–2%. Losers aren't: a coin that keeps falling for a week gets sold at the
  7-day time stop, often 10–30% down. One loser wipes out 5–15 winners.
- The 1.9% spread is paid on every round trip, so the coin has to move about 3–4% just for a +1–2% net.
- The −10% stop limits the worst trade but cuts off more of the trades that would have recovered,
  so overall it's no better.
- **Even with no spread at all**, the −3% variants don't make money. The best variant (C3) would need
  Robinhood's spread at **0.65% or below** just to break even. At 0.5% it makes 4.9% a year, still far
  below buying and holding.
- The controls lose about as much as the dip versions, so waiting for the dip adds little.

## Data note

Coinbase's hourly history had two bad opening prints (BTC at $0.06 on 2017-04-15 23:00, and one ETH
open), both in-sample. `crypto_data.clean` resets an open more than 25% away from the previous close.
That changes the in-sample column only: out-of-sample results are identical. This is a data fix, not
a rule change.

## What this means

Short-term crypto trading on Robinhood is out. If crypto belongs in the system, it's as a slow
holding (buy and hold or a monthly trend rule) that pays the spread rarely. That would need its own
pre-registered test.

# The rulebook

Fixed in advance. Changes are dated and logged, and the rule-drift policy at the bottom
exists because rules that loosen after a win are the most common way a process dies.

## Pre-trade checklist

Run in order before every open. An unlogged check counts as **not done**.

1. **Catalyst** — why does this move meaningfully, soon? "It has been going up" is not a catalyst.
2. **Don't buy the +8% day.** Better entries are the day-2/3 pullback after strength, not the spike. If the whole list is green 5–10%, that is a wait signal, not a buy signal.
3. **Implied move** — before any earnings hold, pull the at-the-money straddle. Holding through earnings is a coin flip on that number. Do it deliberately or not at all.
4. **Liquidity** — meaningful market cap, tight spread, real volume. Quote the **bid**, never the mark.
5. **Expectations vs positioning** — crowded bulls and raised price targets into a print means a merely-good report sells off.
6. **Exits written down before entry** — target, stop, and a **time stop**. If nothing happens in about five sessions the thesis was wrong, even if the stop never hits.

## Exits

| Rule | Value |
|---|---|
| Take profit | +20%. Not more. |
| Equity stop | −8% |
| Option stop | −40% of premium (−8% is noise on a contract) |
| Time stop | ~5 sessions |
| Concentration | 1–2 positions at a time |

## Options

- Strike at or near the money, **delta ≥ 0.40**. Never deep out-of-the-money lottery strikes.
- **Expiry 3–6 weeks out minimum.** Never hold into the final week — theta on short-dated contracts can exceed the position value per week.
- **No holding options through earnings.** IV crush kills even a correct call.
- Spread under ~10% of mark, real open interest. Limit orders at or near the midpoint.
- Exit rules decided at entry, not discovered later.

## Order handling

- Limit orders only, except fractional shares in mega-liquid names (fractional is market-order-only, regular hours only).
- Cash account: proceeds settle T+1. Buying with unsettled proceeds and selling again before settlement is a good-faith violation. Check settled cash before every open.

## Setups that fit

Post-earnings day-2 continuation · sympathy laggards (find what has *not* moved in the
chain) · breakout pullbacks.

**Does not fit:** chasing green candles, averaging down.

## Rule-drift policy

Rules may be changed by the operator. They may not be changed by the agent, and they
may not quietly loosen.

The trigger to watch for: **loosenings that follow wins.** On day one this project
reinstated options, granted full order autonomy, and added hourly runs with full
authority — three loosenings in a single day, all after a profitable trade. Each was
deliberate and each came with real constraints attached, which is the difference
between a rule change and tilt. But three in one day after a win is a pattern.

So: if a fourth loosening appears after the next win — a size increase, a widened stop,
a waived checklist item — the agent says so out loud before executing it. The daily
retro carries a standing drift check for exactly this.

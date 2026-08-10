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
| Concentration | up to 4 positions at a time · max 2 in one complex · no name over 40% |

## Options

- Strike at or near the money, **delta ≥ 0.40**. Never deep out-of-the-money lottery strikes.
- **Expiry 3–6 weeks out minimum.** Never hold into the final week — theta on short-dated contracts can exceed the position value per week.
- **No holding options through earnings.** IV crush kills even a correct call.
- Spread under ~10% of mark, real open interest. Limit orders at or near the midpoint.
- **The contract must come from the live chain, not be constructed.** Pull the chain,
  take the broker's own contract id, and quote its actual bid, ask and open interest.
  A plausible-looking ticker is not evidence a contract is listed: UPST expirations run
  2026-10-16 then 2026-12-18, so an invented "11/20" contract is a genuine third Friday
  and still does not exist. The publish gate rejects an option specification with no
  contract id, no quoted spread, or no open interest.
- **The label must agree with the chain data.** Write the instrument as
  `TICKER M/D $STRIKE` plus `c` or `p`, and carry `underlying`, `strike`, `right` and
  `contractExpiry` as separate fields. The gate checks them against each other. This is
  the one that catches a correct contract id sitting beside the wrong ticker, which no
  amount of chain-pulling would otherwise reveal — the id is right, the words a person
  reads before executing are not, and only the disagreement between them shows it.
- Exit rules decided at entry, not discovered later.

## Order handling

- Limit orders only, except fractional shares in mega-liquid names (fractional is market-order-only, regular hours only).
- Cash account: proceeds settle T+1. Buying with unsettled proceeds and selling again before settlement is a good-faith violation. Check settled cash before every open.

## Size before instrument — checked 2026-08-05

At this account size, **options are usually unavailable to this rulebook**, and that
is arithmetic rather than opinion. Deployable cash was $128.90, so one contract has to
price under about $1.28. Every contract cheap enough was on a small, low-priced name,
and every one of those carried a spread far outside the 10% ceiling:

| Contract | Cost | Delta | OI | Spread |
|---|---|---|---|---|
| SOUN 9/11 $6.50c | $91.50 | 0.57 | 73 | 44.8% |
| SMR 9/11 $9.50c | $115.50 | 0.54 | 52 | 14.7% |
| UPST 9/11 $32c | $270 — unaffordable | 0.52 | 26 | 25.5% |

The names with tight option markets have contracts that cost more than the account
holds. This is the shape of the universe, not three unlucky picks.

**Updated 2026-08-10:** the account was funded to about $1,000, which answers the
affordability half of this finding and none of the spread half. See the rule change
dated 2026-08-10 below. The section stands as written because it is the record of what
was true at $128.90, and because the constraint it identified second is the one still
binding.

So check affordability and spread **before** building a thesis around a contract.
Equity on the same names quotes at 0.09–0.16% spreads and is the instrument that
actually fits. The publish gate now rejects any specification whose total cost exceeds
deployable settled cash — for an option that is limit × quantity × 100.

## Setups that fit

Post-earnings day-2 continuation · sympathy laggards (find what has *not* moved in the
chain) · breakout pullbacks.

**Does not fit:** chasing green candles, averaging down.

## Rule changes

### 2026-08-05 — Daily entry mandate. Operator decision.

**The open run must publish an order specification every trading day.** Standing aside
is no longer an available outcome for that slot. Trading daily is the challenge the
operator set; a process that produces nothing on most days does not test it.

This overrides the standing default of no trade **for the open slot only**. The
mid-session and pre-close runs keep their defaults — mid-session remains exits-only,
and the pre-close still may not open a position in the last thirty minutes.

**It does not suspend the checklist. It changes what a failed checklist does.**

Before: a failed item meant no entry.
Now: a failed item means the entry is published **marked `forced`**, with the failing
items named on the specification, and it is measured separately.

Every mechanical rule still binds and is still enforced by the publish gate. A forced
entry is still limit-only, still carries target, stop and time stop, and options still
require delta ≥ 0.40, three weeks to expiry, and no earnings hold. The mandate makes an
entry compulsory; it does not make a bad instrument permissible.

**What this costs, recorded here so it is not discovered later.** A forced entry grades
against the checklist it failed, so adherence will fall — and it should. The number stops
measuring only the agent's judgement and starts measuring how often the mandate overrode
it. That is the point of marking them: `forced` and discretionary entries are counted
separately, so the log can answer whether patience or the mandate produced better
outcomes rather than blending the two into one unreadable average.

**This is a loosening, and it follows a win.** The drift policy below says to name that
out loud rather than let a retro discover it. Naming it: the operator decided it, on
2026-08-05, the day after a +40.8% trade, with the constraint that forced entries are
labelled and separately measured. That constraint is what distinguishes it from tilt.

### 2026-08-10 — Funded to ~$1,000. Four positions. Multi-day holds. Operator decision.

**The drift check goes first, because the policy below says a fourth loosening gets
named out loud before it is executed.** Naming it: this raises deployable cash roughly
ten-fold and doubles the position ceiling, and it is the fourth logged loosening.

It does **not** follow a win. The last closed trade was SMR on 8/6, −14.0%. The most
recent specification, the forced JOBY entry at 8.85, was never executed and expired
unfilled — and it would have been green. So this is a size increase arriving after a
loss and after a missed winner, which is a different shape from the tilt-after-a-win the
policy watches for and is not obviously a safer one: more size after a loss is the other
standard way an account dies. What makes it a rule change rather than tilt is that the
constraints below were written at the same time as the licence, and every one of them
is enforced by `scripts/validate.mjs` rather than remembered.

**1. The deposit is the operator's, and it is spendable.** The 10:22 hourly on 8/10 read
$1,009.88 settled against the $109.88 this board had carried since 8/7, found no order
in the broker's history that could explain the $900.00 difference, and escalated it
instead of sizing against it. That was correct and the escalation is now answered: it is
an operator deposit. Sizing still works off settled cash as read at the open. Only the
number changed.

**What the deposit does not change: the option finding.** Its two halves were
affordability and spread, and this answers only the first. Options have now been refused
three sessions running on **spread** — most recently at 36% of mark against a 10%
ceiling, on the tightest of eight live quotes, with several of those contracts affordable
outright at $109.88. No balance narrows a spread. Options become available when a chain
quotes inside 10%, not when the account grows.

**2. Concentration: up to four positions, from one or two.** With three limits attached,
and each is arithmetic rather than preference.

- **Four concurrent, counting open positions and unexpired specifications together.**
  A published spec is a claim on the same settled cash as a filled one; the gate now
  sums the cost of every still-open spec against deployable rather than checking each
  one alone, because four individually affordable specs can be collectively impossible.
- **No single name over 40% of account value at entry.** At four positions the natural
  size is 25%; 40% is the room to be uneven without one name being the account.
- **No more than two open positions in the same complex.** Every specification *and*
  every open position carries a `complex` field, and once the book holds more than one
  name the gate refuses any entry that leaves it blank — a taxonomy the validator
  guessed at would be the gate deciding what is correlated, which is the run's call to
  make and defend. This is the limit that matters, and the numbers say so. Into Friday's bell
  OKLO was +14.9%, SOUN +13.4%, IONQ +10.6%, and breadth read 10 green of 12; by 09:46 on
  Monday it was 10 red of 12 and the names that led hardest were unwound hardest. Four
  names off that list is not four positions. It is one position at four times the size,
  paying four spreads, with a stop that all four gap through together. Diversification
  across a single correlated complex is leverage wearing the word diversification.

A position below about 10% of the account gets a warning rather than a block: at that
size a full +20% winner adds 2%, which cannot move the day, and it costs the same
attention as a real one.

**3. Overnight holds were already allowed. Nothing here changes.** The time stop has
always been ~5 sessions and the pre-close slot's stated job is to *decide overnight
holds explicitly*. A position is not closed because the day ended; it is closed when the
target, the stop, or the time stop says so. What "short term only" fixes in place is the
other side: **the ~5 session time stop is not extendable by conviction.** A thesis that
needs longer than a week is not this account's trade, and a hold is not a decision made
once — the pre-close writes down each day the level that would change it.

**4. Exits are per-position, and nothing has to be sold all at once.** Each position
carries its own target, stop and time stop struck off its own fill; one name hitting a
level says nothing about another, and there is no rule anywhere in this book that ever
required closing the book together. Partial exits are permitted where a position is
large enough to divide usefully — at these sizes it often is not; twelve shares of a $9
stock does not halve into anything. What is **not** permitted: selling part of a position
at the stop and holding the rest. That is a widened stop with a disguise on.

**5. The target is ~10% a day, and it is recorded with its arithmetic.** This is the
operator's objective, not a rule, and it is written down so that no run has to infer it
and no later rule change can quietly claim it as justification.

$1,009.88 at 10% is about **$101 a day**. Take-profit is +20% and the ceiling is four
positions, so a fully deployed book needs to average **+10% across every open position,
within the day**, to reach it — while the setups this rulebook actually buys, the day-2/3
pullback and the breakout pullback, do not typically pay 10% in a session. Compounded,
10% a day is roughly 14× in a month, which no process sustains and none of the record so
far resembles: three closed trades in a week — +40.8%, −2.3% and −14.0%, netting +$10.16
on $29.00 of gross wins against $18.84 of gross losses — with the winner graded 0/6.

The ordering when they conflict, decided now rather than at 10:30 on a red morning:
**the rulebook wins and the retro records the shortfall.** The target may not widen a
stop, waive a checklist item, raise the position ceiling, or lengthen the time stop.

**6. Numbers over narrative — standing tiebreak.** Operator instruction, and largely a
restatement of how this board already works. **When a quoted number and a written thesis
disagree, the number decides**, and the thesis is discarded rather than argued with.
This week supplied three clean instances: SMCI refused because a 14.2% implied move
swallows an 8% stop, options refused because 36% of mark is not 10%, JOBY not re-struck
because it was 9.05 bid against an 8.85 limit. The other half of the same rule, already
enforced by the gate: **a number that was not pulled does not exist.** No inferred price,
no assumed fill, no derived balance, no straddle described without having been quoted.

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

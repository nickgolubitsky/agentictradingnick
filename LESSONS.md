# Lessons

What the first attempt (`agentictradingnick`, 2026-08-04 → 2026-09-07, 236 commits) taught,
plus anything learned since. Append new lessons at the bottom with a date. Don't rewrite old ones.

## From the first run

**1. Measure the edge before building the process.**
Five weeks, 236 commits, zero closed trades. Nearly all the effort went into checklists, publish
gates and narration. None of it went into whether any setup made money. The new order is:
backtest → paper → real money. Each stage has to pass a bar that's written down before it starts.

**2. One trade tells you nothing.**
The first trade closed +40.8% and graded 0/6 on process: the entry had about a 2% modelled chance
and got lucky. Judge a strategy on 100+ trades, never on a streak.

**3. Rules that loosen after a result are drift.**
A daily entry mandate and "forced" entries were added the day after the +40.8% win. Rule changes
only happen between evaluation windows, never mid-window, and every one is logged with its date.

**4. The scheduler has to be a server.**
Runs fired from the Claude desktop app only while it was open. One closed app wiped out five
slots in a single day. Use a cloud schedule (GitHub Actions or Claude cloud routines).

**5. Don't put a human click between the signal and the order.**
Four specs in a row expired unexecuted because "publish to a commit" wasn't "tell Nick," and
Nick wasn't watching at 9:41. Paper trading is fully autonomous. For live trading, delivery is
part of the system, measured like everything else.

**6. Never trust the machine clock.**
On the Windows box, `TZ=America/New_York` returned UTC, and the system clock ran hours slow on
three separate days. Time and market status come from the broker's clock endpoint (Alpaca
`/v2/clock`), never from the host.

**7. The scheduler doesn't know about holidays.**
On Labor Day the open slot fired into a closed market, and the run spent five hourly slots
"re-proving" it. Ask the broker clock/calendar whether the market is open, and exit cleanly if
not. That's one API call.

**8. Concurrent runs clobber each other.**
Slots fired simultaneously when the scheduler fell behind. One run's `git add data` swept up the
other's half-written edits, and a stale read produced a false claim. Serialize runs (one
concurrency group) and re-read state right before writing.

**9. Data files are append-only and written by code.**
A whole-array reassignment silently deleted 10 of 11 watchlist rows and passed the gate. Prose
edited through text tools landed as literal `\n`. Logs are append-only JSONL written by scripts,
and a deletion count in a data diff is a red flag.

**10. Keep the narration short.**
Commit messages ran 500+ characters. Logs are structured fields plus one short sentence.

**11. Options don't fit a small account.**
Contracts cheap enough to afford had 15–45% spreads, and liquid ones cost more than the account
held. Stocks and ETFs only until the account is big enough.

**12. Pin the account.**
The brokerage connector sees every account on the login. Every run selects one account by exact
id from private config, uses it explicitly on every call, and never mentions other accounts.

**13. Cash accounts settle T+1.**
Selling, then rebuying with unsettled proceeds, then selling again is a good-faith violation.
Check settled cash, or use a margin account for day trading (the PDT $25K minimum is gone as of
2026-06-04 under FINRA RN 26-10, phased in by broker through 2027-10-20).

**14. Claude can't edit its own permission allowlist.**
The classifier blocks it even with chat approval. Permission JSON is handed to Nick to paste.
Prefer scripts with fixed names in the repo, so allowlist rules stay stable.

## Since the restart

**2026-10-25: the popular day-trading setups don't survive costs.** day-trader-skill's
opening-range breakout lost money in every variant over 60 sessions × 98 large caps, and its five
daily scanner setups showed no edge over a random same-day entry across 10 years. Popularity
(1,600+ stars in five days) isn't evidence. The only promising signal in round 1 was market-level
mean reversion (RSI(2) on SPY/QQQ). See `results/round1-summary.md`.

**2026-10-25: ticker lists rot.** MMC returned 404 from Yahoo. Fetches report failures by name
instead of shrinking the universe silently.

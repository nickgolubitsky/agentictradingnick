# Roadmap

Each phase has a bar written down **before** it starts. Missing the bar means we stop or
change the strategy. We don't change the bar.

## Phase 1: Backtest (now)

Test candidate setups on historical data with realistic costs. Candidates start with the setups
in [day-trader-skill](https://github.com/Jakeschincariol/day-trader-skill) (opening-range
breakout and its daily scanner setups), plus well-known baselines.

- Pre-registered in `backtest/PREREGISTRATION.md`. Every variant tested gets reported, including
  the losers.
- **Bar to advance:** positive expectancy after costs on the out-of-sample half, at least 100
  trades, and a better return/drawdown than buying and holding SPY over the same period.

## Phase 2: Autonomous paper trading

- Alpaca paper account, run on a cloud schedule (GitHub Actions or Claude cloud routines).
- Claude places every paper order itself. No hand-clicking.
- Sub-agents: **scanner** (finds setups), **risk** (PASS/BLOCK every order against hard limits
  in code), **executor** (places and manages orders), **reviewer** (end-of-day, outcome-blind
  grading, appends to LESSONS.md).
- **Bar to advance:** 60 trading days or 100 trades, whichever is later. Live paper results within
  the backtest's expected range, no unexplained missed runs, and zero risk-limit breaches.

## Phase 3: Small real money

- Same system. Claude prepares the exact order ticket, and Nick places or approves it himself.
- Small fixed risk per trade. Hard daily loss limit in code.

## Phase 4: The board and daily Instagram

- **Site:** equity curve against SPY, trade log, run health. Built once there's real data.
- **Instagram:** one short motion-graphic recap per trading day, generated from the day's data
  (trades, P&L, what the system saw, what it skipped). The recap is a pure function of
  `data/`, so it can't invent numbers.
- **Nothing posts without Nick's explicit approval.** Claude drafts the render and caption; Nick
  approves; then it posts.
- Every post carries a "not investment advice" line, and we never post a trade as a
  recommendation for others to copy.
- This can start as soon as Phase 2 produces daily data. The paper-trading journey is the content.

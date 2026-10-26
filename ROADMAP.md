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

- **Broker: Robinhood, through its MCP connector** (decided 2026-10-25). Robinhood has no paper
  account, so Phase 2 is **shadow trading**: the run reads live Robinhood quotes and the pinned
  account (lesson 12), decides, and logs the order it *would* place plus a simulated fill at the
  quoted price. Every step is real except the order itself.
- Runs on a cloud schedule. Whether the Robinhood connector works from a cloud routine is
  unverified, so that gets tested first.
- The scheduled run executes the engine, applies risk checks, and logs every simulated order itself.
  No hand-clicking.
- **Engine (decided 2026-10-26, from `docs/research/agentic-traders-2026-10.md`):** a deterministic
  multi-sleeve engine in code. ETF trend (monthly), large-cap momentum (monthly; needs
  survivorship-free data first), and RSI(2) mean reversion. Code computes every number; the LLM
  can't override sizing or risk limits.
- Sub-agents: **signals** (runs the engine and writes the day's target book), **risk** (PASS/BLOCK
  every order against hard limits in code), **shadow executor** (logs shadow orders and fills,
  reconciles), **reviewer** (end of day, outcome-blind grading, appends to LESSONS.md).
- **Bar to advance:** 60 trading days or 100 trades, whichever is later. Live paper results within
  the backtest's expected range, no unexplained missed runs, and zero risk-limit breaches.

## Phase 3: Small real money

- **Route (decided 2026-10-26): Robinhood, with trade approvals ON.** Each evening the engine and the
  shadow run publish the next day's order list. Nick enters and approves each order in the app.
  Claude never submits real-money orders, not even into the approval queue.
- Because a human places every order, fills are modelled at the **next open** (orders queued the
  evening before), not at the close. The strategies are slow on purpose, so the ticket list
  stays short: a handful of orders a month, plus RSI(2) entries and exits.
- Delivery is measured: time from ticket to fill, slippage against the modelled fill, and tickets
  missed. Lesson 5 was missed tickets, so a missed ticket counts as a failure, not as noise.
- **Promotion gate:** at least 50 completed shadow trades, zero unreconciled ledger breaks, and
  live Sharpe within about 0.2 of the backtest. Start small.

## Phase 4: The board and daily Instagram

- **Site:** a full redo, built once there's real data. **Charts first, very little text**: equity
  curve against SPY, drawdown, each trade drawn on the price chart, run health as a strip. Design
  follows [impeccable.style](https://impeccable.style): a chroma-neutral dark base, large thin
  display type, high contrast, no warm greys. Inspect the actual site rather than working from
  memory.
- **Instagram:** one short motion-graphic recap per trading day, generated from the day's data
  (trades, P&L, what the system saw, what it skipped). The recap is a pure function of
  `data/`, so it can't invent numbers.
- **Nothing posts without Nick's explicit approval.** Claude drafts the render and caption; Nick
  approves; then it posts.
- Every post carries a "not investment advice" line, and we never post a trade as a
  recommendation for others to copy.
- This can start as soon as Phase 2 produces daily data. The paper-trading journey is the content.

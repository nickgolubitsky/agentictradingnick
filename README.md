# Agentic Trading

Can a Claude agent find a trading edge that survives honest testing, and then run it by itself?

This is a restart. The first attempt ([agentictradingnick](https://github.com/nickgolubitsky/agentictradingnick))
built a lot of process and closed zero trades. What it taught is in [LESSONS.md](LESSONS.md).

The plan is in [ROADMAP.md](ROADMAP.md): backtest → autonomous paper trading → small real money.
A daily board and Instagram recaps come once there's real data.

## Layout

```
LESSONS.md        what we've learned; append-only
ROADMAP.md        phases and the bar each one must pass
backtest/         engine, strategies, pre-registration, results
data/             trade log and run log (append-only, written by code)
.claude/          skills and sub-agents, added in Phase 2
```

## Running the backtests

Python 3.10+, standard library only.

```bash
python -m backtest.fetch          # download and cache price history
python -m backtest.run            # run every pre-registered strategy
python -m unittest discover -s tests
```

**Not investment advice.** This is an experiment, and most people who trade actively lose money.

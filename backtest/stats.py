"""Summary statistics. The t-stat is computed on per-day means (trades on one day are not
independent), with an optional Newey-West correction for overlapping multi-day holds."""

import math


def mean(xs):
    return sum(xs) / len(xs) if xs else float("nan")


def newey_west_t(xs, lag=0):
    """t-stat of the mean of xs with a Newey-West (Bartlett) variance. lag=0 is the plain t-stat."""
    n = len(xs)
    if n < 3:
        return float("nan")
    m = mean(xs)
    d = [x - m for x in xs]
    var = sum(v * v for v in d) / n
    for k in range(1, min(lag, n - 1) + 1):
        w = 1 - k / (lag + 1)
        var += 2 * w * sum(d[i] * d[i - k] for i in range(k, n)) / n
    if var <= 0:
        return float("nan")
    return m / math.sqrt(var / (n - 1))


def by_day(trades, key="date", value="net"):
    days = {}
    for t in trades:
        days.setdefault(t[key], []).append(t[value])
    return [mean(v) for _, v in sorted(days.items())]


def max_drawdown(curve):
    peak, mdd = float("-inf"), 0.0
    for v in curve:
        peak = max(peak, v)
        mdd = max(mdd, peak - v)
    return mdd


def summarize(trades, value="net", lag=0):
    """trades: dicts with 'date' and value. Returns counts, expectancy, win rate, PF and day-clustered t."""
    xs = [t[value] for t in trades]
    wins = [x for x in xs if x > 0]
    losses = [x for x in xs if x <= 0]
    daily = by_day(trades, value=value)
    return {
        "trades": len(xs),
        "days": len(daily),
        "mean": mean(xs),
        "win_rate": len(wins) / len(xs) if xs else float("nan"),
        "profit_factor": sum(wins) / -sum(losses) if losses and sum(losses) < 0 else float("inf"),
        "t_day": newey_west_t(daily, lag),
        "total": sum(xs),
    }


def verdict(s, min_trades=100):
    if not s["trades"] or math.isnan(s["t_day"]) or s["mean"] <= 0:
        return "FAIL"
    if s["t_day"] >= 3.0 and s["trades"] >= min_trades:
        return "PASS"
    if s["t_day"] >= 2.0:
        return "PROMISING"
    return "FAIL"

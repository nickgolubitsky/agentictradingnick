"""Round 2: RSI(2) trades and the C / D1 / D2 portfolio forms, simulated close to close.

held[i] means the signal position is held from close i-1 to close i. Entry and exit happen at
closes, so the entry day's own return is idle and the exit day's return is held."""

import bisect
import datetime as dt

from .daily import rsi_series, sma

DECIMALIZATION = dt.date(2001, 4, 9)
MARGIN_SPREAD = 0.025  # borrowed unit costs T-bill + 2.5%/yr


def cost_schedule(before_bps, after_bps):
    return lambda d: (before_bps if d < DECIMALIZATION else after_bps) / 1e4


def rsi2_trades(c):
    """[(entry_index, exit_index or None)] with round 1's rule: buy the close when RSI2 < 10 and
    close > SMA200, sell the close when close > SMA5."""
    r2 = rsi_series(c, 2)
    out, entry = [], None
    for i in range(200, len(c)):
        if entry is not None and c[i] > sma(c, i, 5):
            out.append((entry, i))
            entry = None
        elif entry is None and r2[i] is not None and r2[i] < 10 and c[i] > sma(c, i, 200):
            entry = i
    if entry is not None:
        out.append((entry, None))
    return out


def held_flags(n, trades):
    held = [False] * n
    for a, b in trades:
        for i in range(a + 1, (b if b is not None else n - 1) + 1):
            held[i] = True
    return held


def irx_lookup(irx_bars):
    """date -> annualized T-bill yield as a fraction, carrying the last value forward."""
    table = sorted((b[0], b[4] / 100.0) for b in irx_bars)
    keys = [t[0] for t in table]

    def at(d):
        return table[max(0, bisect.bisect_right(keys, d) - 1)][1]
    return at


def simulate(bars, mode, cost, rate=None, start=None, end=None):
    """mode in 'C', 'D1', 'D2', 'BH'. Returns (dates, equity) over [start, end).
    cost(date) -> fraction per side; rate(date) -> annual T-bill yield (needed for D1, D2).
    D2 keeps the extra unit's exposure at 1x equity (daily-rebalanced approximation)."""
    c = [b[4] for b in bars]
    d = [b[0] for b in bars]
    trades = rsi2_trades(c)
    held = held_flags(len(c), trades)
    entries = {a for a, _ in trades}
    exits = {b for _, b in trades if b is not None}
    first = next(i for i in range(200, len(c)) if not start or d[i] >= start)
    eq, dates, curve = 1.0, [d[first]], [1.0]
    for i in range(first + 1, len(c)):
        if end and d[i] >= end:
            break
        r = c[i] / c[i - 1] - 1
        days = (d[i] - d[i - 1]).days
        if mode == "BH":
            eq *= 1 + r
        elif mode == "C":
            eq *= 1 + (r if held[i] else 0.0)
        elif mode == "D1":
            eq *= 1 + (r if held[i] else rate(d[i - 1]) * days / 365)
        elif mode == "D2":
            fin = (rate(d[i - 1]) + MARGIN_SPREAD) * days / 365
            eq *= 1 + r + ((r - fin) if held[i] else 0.0)
        if mode != "BH":
            if i in exits and held[i]:
                eq *= 1 - cost(d[i])
            if i in entries:
                eq *= 1 - cost(d[i])
        dates.append(d[i])
        curve.append(eq)
    return dates, curve


def trade_list(bars, cost, start=None, end=None):
    """Closed trades whose entry and exit both fall in [start, end): net = return - both sides' costs."""
    c = [b[4] for b in bars]
    d = [b[0] for b in bars]
    out = []
    for a, b in rsi2_trades(c):
        if b is None or (start and d[a] < start) or (end and d[b] >= end):
            continue
        out.append({"date": d[a], "exit_date": d[b], "days": b - a,
                    "net": c[b] / c[a] - 1 - cost(d[a]) - cost(d[b])})
    return out

"""Round 3 (PREREGISTRATION-round3.md): RSI(2) with next-open fills, Faber GTAA-5 with next-open
rebalances, and the 50/50 blend. Every fill is at an open, because Nick places every order by hand
the evening before."""

from .portfolio import rsi2_trades

GTAA = ["SPY", "EFA", "IEF", "VNQ", "DBC"]
TREND_MONTHS = 10


def rsi2_next_open_trades(bars, cost, start=None, end=None):
    """Closed trades: signal at a close, fill at the next open, both ways."""
    o = [b[1] for b in bars]
    c = [b[4] for b in bars]
    d = [b[0] for b in bars]
    out = []
    for a, b in rsi2_trades(c):
        if b is None or b + 1 >= len(bars):
            continue
        ea, eb = a + 1, b + 1
        if (start and d[ea] < start) or (end and d[eb] >= end):
            continue
        out.append({"date": d[ea], "exit_date": d[eb], "days": eb - ea,
                    "net": o[eb] / o[ea] - 1 - cost(d[ea]) - cost(d[eb])})
    return out


def rsi2_next_open_curve(bars, cost, rate):
    """Daily close-marked equity for RSI(2) D1 with next-open fills: T-bills when idle.
    Returns (dates, equity) over the whole history after the 200-day warm-up."""
    o = [b[1] for b in bars]
    c = [b[4] for b in bars]
    d = [b[0] for b in bars]
    entry_day, exit_day, held = {}, {}, [False] * len(bars)
    for a, b in rsi2_trades(c):
        ea = a + 1
        eb = b + 1 if b is not None else None
        if ea >= len(bars):
            continue
        entry_day[ea] = True
        if eb is not None and eb < len(bars):
            exit_day[eb] = True
        for i in range(ea + 1, (eb if eb is not None and eb < len(bars) else len(bars) - 1) + 1):
            held[i] = True  # held from close i-1 (exit days are trimmed below)
    eq, dates, curve = 1.0, [d[200]], [1.0]
    for i in range(201, len(bars)):
        days = (d[i] - d[i - 1]).days
        if i in entry_day:
            eq *= (1 + rate(d[i - 1]) * days / 365) * (1 - cost(d[i])) * (c[i] / o[i])
        elif i in exit_day:
            eq *= (o[i] / c[i - 1]) * (1 - cost(d[i]))
        elif held[i]:
            eq *= c[i] / c[i - 1]
        else:
            eq *= 1 + rate(d[i - 1]) * days / 365
        dates.append(d[i])
        curve.append(eq)
    return dates, curve


def align(bars_by_symbol, symbols):
    """Dates on which every symbol has a bar, from the latest first bar -> {sym: [(o, c)]}, dates."""
    common = set.intersection(*({b[0] for b in bars_by_symbol[s]} for s in symbols))
    dates = sorted(common)
    rows = {s: {b[0]: (b[1], b[4]) for b in bars_by_symbol[s]} for s in symbols}
    return dates, {s: [rows[s][x] for x in dates] for s in symbols}


def month_end_indices(dates):
    """Indices of the last trading day of each complete month (the final, partial month is excluded)."""
    return [i for i in range(len(dates) - 1) if dates[i].month != dates[i + 1].month]


def gtaa(bars_by_symbol, cost, rate, symbols=GTAA, always_in=False):
    """Faber GTAA: equal target weights; an asset is held when its month-end close is above its
    10-month average, else that slice sits in T-bills. Rebalance at the next open.
    Returns (dates, equity, exposure history)."""
    dates, px = align(bars_by_symbol, symbols)
    ends = month_end_indices(dates)
    w = 1.0 / len(symbols)
    signals = {}  # rebalance index -> {sym: bool}
    for k in range(TREND_MONTHS - 1, len(ends)):
        i = ends[k]
        if i + 1 >= len(dates):
            break
        sig = {}
        for s in symbols:
            closes = [px[s][ends[j]][1] for j in range(k - TREND_MONTHS + 1, k + 1)]
            sig[s] = always_in or px[s][i][1] > sum(closes) / TREND_MONTHS
        signals[i + 1] = sig
    first = min(signals)
    units = {s: 0.0 for s in symbols}
    cash = 1.0
    out_d, out_e, exposure = [], [], []
    for i in range(first, len(dates)):
        if i > first:
            cash *= 1 + rate(dates[i - 1]) * (dates[i] - dates[i - 1]).days / 365
        if i in signals:
            equity_open = cash + sum(units[s] * px[s][i][0] for s in symbols)
            for s in symbols:
                target = w * equity_open if signals[i][s] else 0.0
                trade = target - units[s] * px[s][i][0]
                cash -= trade + abs(trade) * cost(dates[i])
                units[s] = target / px[s][i][0]
            exposure.append((dates[i], sum(signals[i].values()) / len(symbols)))
        out_d.append(dates[i])
        out_e.append(cash + sum(units[s] * px[s][i][1] for s in symbols))
    return out_d, out_e, exposure


def blend(curve_a, curve_b, weight_a=0.5):
    """Two (dates, equity) sleeves on the same calendar, reset to the target mix at each month start."""
    da, ea = curve_a
    db, eb = curve_b
    b_at = dict(zip(db, eb))
    dates = [x for x in da if x in b_at]
    a_at = dict(zip(da, ea))
    total, part_a = 1.0, weight_a
    out = [1.0]
    for k in range(1, len(dates)):
        prev, cur = dates[k - 1], dates[k]
        if cur.month != prev.month:
            part_a = weight_a * total
        part_b = total - part_a
        part_a *= a_at[cur] / a_at[prev]
        part_b *= b_at[cur] / b_at[prev]
        total = part_a + part_b
        out.append(total)
    return dates, out


def monthly_returns(dates, equity):
    ends = month_end_indices(dates)
    return {(dates[i].year, dates[i].month): equity[i] / equity[j] - 1 for j, i in zip(ends, ends[1:])}


def correlation(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sxx = sum((x - mx) ** 2 for x in xs)
    syy = sum((y - my) ** 2 for y in ys)
    return sxy / (sxx * syy) ** 0.5

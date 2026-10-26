"""Strategy B (day-trader-skill's daily scanner setups, 5-session hold) and strategy C (RSI(2)).
Bars are (date, o, h, l, c), split- and dividend-adjusted."""

HOLD = 5
WARMUP = 60


def rsi_series(closes, n):
    """Wilder RSI for every index (None until n changes exist)."""
    out = [None] * len(closes)
    if len(closes) <= n:
        return out
    g = [max(0.0, closes[i] - closes[i - 1]) for i in range(1, len(closes))]
    lo = [max(0.0, closes[i - 1] - closes[i]) for i in range(1, len(closes))]
    ag, al = sum(g[:n]) / n, sum(lo[:n]) / n
    out[n] = 100 - 100 / (1 + ag / al) if al else 100.0
    for i in range(n, len(g)):
        ag = (ag * (n - 1) + g[i]) / n
        al = (al * (n - 1) + lo[i]) / n
        out[i + 1] = 100 - 100 / (1 + ag / al) if al else 100.0
    return out


def setups_at(c, i, r14):
    """The scanner's five rules, evaluated on closes up to and including index i."""
    last = c[i]
    hi20 = max(c[i - 20:i])
    ma20 = sum(c[i - 19:i + 1]) / 20.0
    ma20_prev = sum(c[i - 20:i]) / 20.0
    run = c[i - 5] / c[i - 15] - 1
    rng5 = (max(c[i - 4:i + 1]) - min(c[i - 4:i + 1])) / last
    tags = []
    if last > hi20:
        tags.append("breakout_20d")
    if run > 0.10 and rng5 < 0.05:
        tags.append("bull_flag")
    if c[i - 1] < ma20_prev and last > ma20:
        tags.append("reclaim_ma20")
    if r14[i] is not None and r14[i] < 30:
        tags.append("oversold")
    if r14[i - 1] is not None and r14[i - 1] < 30 and last > c[i - 1]:
        tags.append("oversold_bounce")
    return tags


SETUPS = ["breakout_20d", "bull_flag", "reclaim_ma20", "oversold", "oversold_bounce"]


def scan_events(bars_by_symbol, cost_bps):
    """-> (setup trades by setup key, baseline trades). Every trade enters at the next open and
    exits at the close of the HOLD-th session. 'excess' is net minus the same-day baseline mean."""
    events = {k: [] for k in SETUPS}
    baseline = []
    for sym, bars in bars_by_symbol.items():
        c = [b[4] for b in bars]
        r14 = rsi_series(c, 14)
        for i in range(WARMUP, len(bars) - HOLD):
            entry = bars[i + 1][1]
            exit_px = bars[i + HOLD][4]
            net = exit_px / entry - 1 - 2 * cost_bps / 1e4
            row = {"symbol": sym, "date": bars[i + 1][0], "net": net}
            baseline.append(row)
            for tag in setups_at(c, i, r14):
                events[tag].append(dict(row))
    base_by_day = {}
    for r in baseline:
        base_by_day.setdefault(r["date"], []).append(r["net"])
    base_mean = {d: sum(v) / len(v) for d, v in base_by_day.items()}
    for rows in events.values():
        for r in rows:
            r["excess"] = r["net"] - base_mean[r["date"]]
    return events, baseline


def sma(xs, i, n):
    return sum(xs[i - n + 1:i + 1]) / n if i >= n - 1 else None


def rsi2(bars, cost_bps, start=None, end=None):
    """Connors RSI(2): buy the close when RSI2 < 10 and close > SMA200, sell the close when
    close > SMA5. Returns (trades, strategy equity curve, buy-and-hold curve, dates)."""
    c = [b[4] for b in bars]
    r2 = rsi_series(c, 2)
    trades, eq, bh, dates = [], [], [], []
    cash_eq, pos_entry, entry_date = 1.0, None, None
    first = None
    for i in range(200, len(bars)):
        d = bars[i][0]
        if (start and d < start) or (end and d >= end):
            continue
        if first is None:
            first = c[i]
        if pos_entry is not None:
            mark = cash_eq * c[i] / pos_entry
        else:
            mark = cash_eq
        if pos_entry is not None and c[i] > sma(c, i, 5):
            net = c[i] / pos_entry - 1 - 2 * cost_bps / 1e4
            cash_eq *= 1 + net
            mark = cash_eq
            trades.append({"date": entry_date, "exit_date": d, "net": net})
            pos_entry = None
        elif pos_entry is None and r2[i] is not None and r2[i] < 10 and c[i] > sma(c, i, 200):
            pos_entry, entry_date = c[i], d
        eq.append(mark)
        bh.append(c[i] / first)
        dates.append(d)
    return trades, eq, bh, dates

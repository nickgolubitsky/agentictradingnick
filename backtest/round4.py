"""Round 4 (PREREGISTRATION-round4.md): a daily multi-position pullback engine. Each evening it
queues exits and the top-ranked entries; each morning it fills them at the open, exits first."""

from .daily import rsi_series

SLOTS = 5
SIZE = 0.20


def indicators(bars):
    """date -> dict(o, h, l, c, rsi2, sma200, sma5, ibs) for every bar with a 200-day history."""
    c = [b[4] for b in bars]
    r2 = rsi_series(c, 2)
    out, run = {}, 0.0
    for i, (d, o, h, l, cl) in enumerate(bars):
        run += cl
        if i >= 200:
            run -= c[i - 200]
        if i < 199:
            continue
        out[d] = {"o": o, "h": h, "l": l, "c": cl, "rsi2": r2[i],
                  "sma200": run / 200, "sma5": sum(c[i - 4:i + 1]) / 5,
                  "ibs": (cl - l) / (h - l) if h > l else None}
    return out


def s1_rsi2(x):
    """-> rank score (lower is more oversold) or None when there's no entry."""
    if x["rsi2"] is not None and x["rsi2"] < 10 and x["c"] > x["sma200"]:
        return x["rsi2"]
    return None


def s2_ibs(x):
    if x["ibs"] is not None and x["ibs"] < 0.2 and x["c"] > x["sma200"]:
        return x["ibs"]
    return None


SIGNALS = {"S1": s1_rsi2, "S2": s2_ibs}


def simulate(ind_by_symbol, calendar, signal, cost, rate, slots=SLOTS, size=SIZE):
    """ind_by_symbol: {sym: indicators(...)}; calendar: trading dates in order.
    Returns dict(dates, equity, trades, fills_by_day, invested_by_day)."""
    cash, equity = 1.0, 1.0
    pos = {}                   # sym -> {units, entry_date, entry_px, last_c}
    pend_exit, pend_entry = set(), []
    dates, curve, trades, fills, invested = [], [], [], [], []
    prev = None
    for d in calendar:
        if prev is not None:
            cash *= 1 + rate(prev) * (d - prev).days / 365
        n_fill = 0
        was_invested = bool(pos)
        # morning: exits, then entries, all at the open
        for sym in sorted(pend_exit):
            x = ind_by_symbol[sym].get(d)
            if x is None:
                continue  # no bar today: stays queued
            p = pos.pop(sym)
            cash += p["units"] * x["o"] * (1 - cost(d))
            trades.append({"symbol": sym, "date": p["entry_date"], "exit_date": d,
                           "net": x["o"] / p["entry_px"] - 1 - cost(p["entry_date"]) - cost(d)})
            pend_exit.discard(sym)
            n_fill += 1
        for sym in pend_entry:
            x = ind_by_symbol[sym].get(d)
            if x is None or sym in pos:
                continue
            alloc = min(size * equity, cash)
            if alloc <= 1e-12:
                continue
            pos[sym] = {"units": alloc / (x["o"] * (1 + cost(d))), "entry_date": d,
                        "entry_px": x["o"], "last_c": x["o"]}
            cash -= alloc
            n_fill += 1
        pend_entry = []
        # close: mark the book
        for sym, p in pos.items():
            x = ind_by_symbol[sym].get(d)
            if x is not None:
                p["last_c"] = x["c"]
        equity = cash + sum(p["units"] * p["last_c"] for p in pos.values())
        # evening: queue exits, then rank entries into the free slots
        for sym in pos:
            x = ind_by_symbol[sym].get(d)
            if x is not None and x["c"] > x["sma5"]:
                pend_exit.add(sym)
        free = slots - (len(pos) - len(pend_exit))
        if free > 0:
            cands = []
            for sym, ind in ind_by_symbol.items():
                x = ind.get(d)
                if x is None or sym in pos:
                    continue
                score = signal(x)
                if score is not None:
                    cands.append((score, sym))
            pend_entry = [s for _, s in sorted(cands)[:free]]
        dates.append(d)
        curve.append(equity)
        fills.append(n_fill)
        invested.append(was_invested or bool(pos))
        prev = d
    return {"dates": dates, "equity": curve, "trades": trades, "fills": fills, "invested": invested}


def day_stats(res):
    """Share of days with a fill, and share of invested days with positive P&L."""
    eq, inv = res["equity"], res["invested"]
    pnl_days = [(b > a) for a, b, i in zip(eq, eq[1:], inv[1:]) if i]
    n = len(res["dates"])
    return {"fill_day_share": sum(1 for f in res["fills"] if f) / n,
            "invested_share": sum(inv) / n,
            "positive_invested_days": sum(pnl_days) / len(pnl_days) if pnl_days else float("nan"),
            "trades_per_week": len(res["trades"]) / (n / 5)}

"""Round 5 (PREREGISTRATION-round5.md): evening dip-buy limit orders on crypto with net targets.
Hourly bars are [t, o, h, l, c] mid prices; Robinhood's ask is mid * (1 + s/2), its bid mid * (1 - s/2)."""

import datetime as dt

DAY = 86400
HOLD_MAX = 7 * DAY

VARIANTS = {
    "C1": {"dip": 0.03, "target": 0.01, "stop": None},
    "C2": {"dip": 0.03, "target": 0.02, "stop": None},
    "C3": {"dip": 0.06, "target": 0.01, "stop": None},
    "C4": {"dip": 0.06, "target": 0.02, "stop": None},
    "C5": {"dip": 0.03, "target": 0.01, "stop": 0.10},
    "C6": {"dip": 0.03, "target": 0.02, "stop": 0.10},
    "C7": {"dip": 0.06, "target": 0.01, "stop": 0.10},
    "C8": {"dip": 0.06, "target": 0.02, "stop": 0.10},
    "K1": {"dip": None, "target": 0.01, "stop": None},
    "K2": {"dip": None, "target": 0.02, "stop": None},
}


def simulate(bars_by_pair, variant, spread, start=None, end=None):
    """Returns dict(times, equity, trades). start/end are unix seconds (end exclusive)."""
    v = VARIANTS[variant]
    half = spread / 2
    size = 1.0 / len(bars_by_pair)
    by_t = {}
    for pair, rows in bars_by_pair.items():
        for r in rows:
            if (start is None or r[0] >= start) and (end is None or r[0] < end):
                by_t.setdefault(r[0], {})[pair] = r
    times = sorted(by_t)
    cash, reserved = 1.0, 0.0
    order, pos, last_bid, cooldown = {}, {}, {}, {}
    out_t, out_e, trades = [], [], []
    day = None

    def equity():
        return cash + reserved + sum(p["units"] * last_bid[k] for k, p in pos.items())

    for t in times:
        bars = by_t[t]
        if t // DAY != day:                                # the evening routine, at the day's first hour
            day = t // DAY
            for pair, o in list(order.items()):           # yesterday's unfilled orders expire
                cash += o["alloc"]
                reserved -= o["alloc"]
                del order[pair]
            eq = equity()
            for pair, r in bars.items():
                if pair in pos or cooldown.get(pair, 0) > t:
                    continue
                alloc = min(size * eq, cash)
                if alloc <= 1e-12:
                    continue
                if v["dip"] is None:                      # control: market buy on the ask now
                    px = r[1] * (1 + half)
                    pos[pair] = _open(alloc, px, t, v)
                    cash -= alloc
                else:
                    order[pair] = {"limit": r[1] * (1 - v["dip"]), "alloc": alloc}
                    cash -= alloc
                    reserved += alloc
        for pair, r in bars.items():
            _, o, h, l, c = r
            p = pos.get(pair)
            if p is not None and p["t"] < t:
                px, why = _exit(p, o, h, l, c, t, half)
                if px is not None:
                    cash += p["units"] * px
                    trades.append({"pair": pair, "date": dt.datetime.utcfromtimestamp(p["t"]).date(),
                                   "net": px / p["entry"] - 1, "hours": (t - p["t"]) // 3600 + 1, "why": why})
                    del pos[pair]
                    cooldown[pair] = (t // DAY + 1) * DAY
            q = order.get(pair)
            if q is not None and l * (1 + half) <= q["limit"]:
                px = min(q["limit"], o * (1 + half))
                pos[pair] = _open(q["alloc"], px, t, v)
                reserved -= q["alloc"]
                del order[pair]
            last_bid[pair] = c * (1 - half)
        out_t.append(t)
        out_e.append(equity())
    return {"times": out_t, "equity": out_e, "trades": trades}


def _open(alloc, px, t, v):
    return {"units": alloc / px, "entry": px, "t": t,
            "target": px * (1 + v["target"]),
            "stop": px * (1 - v["stop"]) if v["stop"] else None}


def _exit(p, o, h, l, c, t, half):
    """-> (fill price, reason) or (None, None). The stop wins an hour that touches both."""
    bid_o, bid_h, bid_l, bid_c = (x * (1 - half) for x in (o, h, l, c))
    if p["stop"] is not None:
        if bid_o <= p["stop"]:
            return bid_o, "stop_gap"
        if bid_l <= p["stop"]:
            return p["stop"], "stop"
    if bid_o >= p["target"]:
        return bid_o, "target_gap"
    if bid_h >= p["target"]:
        return p["target"], "target"
    if t + 3600 >= p["t"] + HOLD_MAX:
        return bid_c, "time"
    return None, None


def buy_and_hold(bars_by_pair, spread, start, end=None):
    """Equal weight across the pairs, bought on the ask at the window's first common hour, marked at the bid."""
    half = spread / 2
    series = {k: {r[0]: r for r in v if r[0] >= start and (end is None or r[0] < end)} for k, v in bars_by_pair.items()}
    common = sorted(set.intersection(*(set(s) for s in series.values())))
    t0 = common[0]
    units = {k: (1.0 / len(series)) / (series[k][t0][1] * (1 + half)) for k in series}
    last = {k: series[k][t0][4] for k in series}
    times = sorted(set().union(*(set(s) for s in series.values())))
    out_t, out_e = [], []
    for t in times:
        if t < t0:
            continue
        for k in series:
            if t in series[k]:
                last[k] = series[k][t][4]
        out_t.append(t)
        out_e.append(sum(units[k] * last[k] * (1 - half) for k in series))
    return out_t, out_e

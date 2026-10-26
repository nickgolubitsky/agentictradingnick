"""Strategy A: opening-range breakout, as pre-registered. Bars are (time, o, h, l, c) keyed by
bar start time in New York; a bar is complete 5 minutes after its start."""

import datetime as dt

OR_BARS = 3                      # 9:30, 9:35, 9:40
LAST_ENTRY_START = dt.time(15, 25)  # bar ending 15:30
FLAT_START = dt.time(15, 50)        # exit at this bar's close (15:55)

VARIANTS = {
    "A1": {"stop": "mid", "target_r": 1.0},
    "A2": {"stop": "mid", "target_r": 2.0},
    "A3": {"stop": "low", "target_r": 1.0},
    "A4": {"stop": "low", "target_r": 2.0},
    "A0": {"stop": "low", "target_r": 1.0, "control": True},
}


def manage(bars, start, entry, stop, target):
    """Walk bars from index start. Returns (exit_price, reason). Stop wins a bar that touches both."""
    for t, o, h, l, c in bars[start:]:
        if o <= stop:
            return o, "stop_gap"
        if o >= target:
            return o, "target_gap"
        if l <= stop:
            return stop, "stop"
        if h >= target:
            return target, "target"
        if t >= FLAT_START:
            return c, "flat"
    return bars[-1][4], "flat"


def trade(bars, stop_rule, target_r, control=False):
    """One session for one symbol -> trade dict or None."""
    rng = bars[:OR_BARS]
    hi = max(b[2] for b in rng)
    lo = min(b[3] for b in rng)
    if control:
        i = OR_BARS - 1
        entry = bars[i][4]
    else:
        i = next((k for k in range(OR_BARS, len(bars))
                  if bars[k][0] <= LAST_ENTRY_START and bars[k][4] > hi), None)
        if i is None:
            return None
        entry = bars[i][4]
    stop = (hi + lo) / 2 if stop_rule == "mid" else lo
    risk = entry - stop
    if risk <= 0:
        return None
    target = entry + target_r * risk
    exit_px, reason = manage(bars, i + 1, entry, stop, target)
    return {"entry_time": bars[i][0], "entry": entry, "stop": stop, "target": target,
            "exit": exit_px, "reason": reason, "risk": risk}


def run(sessions_by_symbol, variant, cost_bps):
    v = VARIANTS[variant]
    out = []
    for sym, sessions in sessions_by_symbol.items():
        for day, bars in sessions.items():
            t = trade(bars, v["stop"], v["target_r"], v.get("control", False))
            if not t:
                continue
            gross = (t["exit"] - t["entry"]) / t["risk"]
            cost = cost_bps / 1e4 * (t["entry"] + t["exit"]) / t["risk"]
            t.update(symbol=sym, date=day, gross=gross, net=gross - cost,
                     ret=(t["exit"] - t["entry"]) / t["entry"] - cost_bps / 1e4 * 2)
            out.append(t)
    return out

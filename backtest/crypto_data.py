"""Coinbase Exchange public hourly candles, paged 300 at a time and cached. Standard library only.
Coinbase rows are [time, low, high, open, close, volume]; the cache stores [time, o, h, l, c]."""

import datetime as dt
import json
import os
import sys
import time
import urllib.error
import urllib.request

from .data import CACHE, UA

API = "https://api.exchange.coinbase.com/products/%s/candles?granularity=3600&start=%s&end=%s"
PAIRS = {"BTC-USD": dt.datetime(2017, 1, 1), "ETH-USD": dt.datetime(2017, 1, 1),
         "SOL-USD": dt.datetime(2021, 6, 1), "DOGE-USD": dt.datetime(2021, 6, 1)}
END = dt.datetime(2026, 10, 26)
PAGE = dt.timedelta(hours=300)


def path(pair):
    return os.path.join(CACHE, "crypto", pair + ".json")


def _get(url):
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except (urllib.error.URLError, OSError) as e:
            last = e
            time.sleep(2 * (attempt + 1))
    raise RuntimeError("Coinbase fetch failed after retries: %s (%s)" % (url, last))


def fetch(pair):
    if os.path.exists(path(pair)):
        with open(path(pair), encoding="utf-8") as f:
            return json.load(f)
    rows, t = {}, PAIRS[pair]
    while t < END:
        u = min(t + PAGE, END)
        for r in _get(API % (pair, t.isoformat() + "Z", u.isoformat() + "Z")):
            rows[r[0]] = [r[0], r[3], r[2], r[1], r[4]]
        t = u
        time.sleep(0.15)
    out = [rows[k] for k in sorted(rows)]
    os.makedirs(os.path.dirname(path(pair)), exist_ok=True)
    with open(path(pair), "w", encoding="utf-8") as f:
        json.dump(out, f)
    return out


def clean(rows, max_gap=0.25):
    """A 24/7 market's hourly open sits next to the prior close. An open more than max_gap away is a
    bad print (e.g. BTC-USD 2017-04-15 23:00 opens at $0.06 between $1,183 closes), so it's reset to
    the prior close and the high/low widened to contain it. Lows are left alone: flash-crash lows
    (ETH 2017-06-21, DOGE 2025-10-10) really traded, and a limit order only fills at its own price."""
    out = [list(rows[0])]
    for t, o, h, l, c in rows[1:]:
        prev = out[-1][4]
        if abs(o / prev - 1) > max_gap:
            o = prev
        out.append([t, o, max(h, o, c), min(l, o, c), c])
    return out


def main():
    for pair in PAIRS:
        rows = fetch(pair)
        first = dt.datetime.utcfromtimestamp(rows[0][0])
        last = dt.datetime.utcfromtimestamp(rows[-1][0])
        expected = int((last - first).total_seconds() // 3600) + 1
        gaps = [(rows[i - 1][0], rows[i][0]) for i in range(1, len(rows)) if rows[i][0] - rows[i - 1][0] > 6 * 3600]
        print("%s %d hourly bars %s -> %s, %.2f%% of hours present, gaps > 6h: %d" % (
            pair, len(rows), first, last, 100 * len(rows) / expected, len(gaps)), flush=True)
        for a, b in gaps[:5]:
            print("   gap", dt.datetime.utcfromtimestamp(a), "->", dt.datetime.utcfromtimestamp(b))
    sys.stdout.flush()


if __name__ == "__main__":
    main()

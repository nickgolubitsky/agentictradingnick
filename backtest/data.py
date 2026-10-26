"""Yahoo v8 chart download, cache and parsing. Standard library only.

Times are converted to New York with an explicit US DST rule rather than the host's
timezone database (lesson 6: never trust the machine clock or its tz lookup)."""

import datetime as dt
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "cache")
HOSTS = ("https://query2.finance.yahoo.com", "https://query1.finance.yahoo.com")
UA = "Mozilla/5.0 (agentic-trading backtest; contact nick@mig-dev.com)"


class FetchError(Exception):
    pass


def _nth_sunday(year, month, n):
    d = dt.date(year, month, 1)
    d += dt.timedelta(days=(6 - d.weekday()) % 7)
    return d + dt.timedelta(weeks=n - 1)


def to_eastern(ts):
    """Unix seconds -> naive New York datetime. DST: 2nd Sunday of March 2:00 to 1st Sunday of Nov 2:00."""
    utc = dt.datetime(1970, 1, 1) + dt.timedelta(seconds=ts)
    y = utc.year
    start = dt.datetime.combine(_nth_sunday(y, 3, 2), dt.time(7))   # 2:00 EST = 7:00 UTC
    end = dt.datetime.combine(_nth_sunday(y, 11, 1), dt.time(6))    # 2:00 EDT = 6:00 UTC
    return utc + dt.timedelta(hours=-4 if start <= utc < end else -5)


def _get(path):
    last = "no answer"
    for attempt in range(3):
        for host in HOSTS:
            req = urllib.request.Request(host + path, headers={"User-Agent": UA})
            try:
                with urllib.request.urlopen(req, timeout=30) as r:
                    return r.read().decode("utf-8")
            except urllib.error.HTTPError as e:
                last = "HTTP %d" % e.code
                if e.code not in (429,) and e.code < 500:
                    raise FetchError("%s for %s" % (last, path))
            except (urllib.error.URLError, OSError) as e:
                last = str(getattr(e, "reason", e))
        time.sleep(5 * (attempt + 1))
    raise FetchError("%s for %s" % (last, path))


def cache_path(sym, kind):
    return os.path.join(CACHE, kind, sym + ".json")


def fetch(sym, kind, refresh=False):
    """kind 'daily' (10y of 1d), 'max' (all of 1d) or 'intraday' (60d of 5m). Returns the raw chart result."""
    path = cache_path(sym, kind)
    if os.path.exists(path) and not refresh:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    # range=max silently downsamples to monthly bars; explicit bounds keep it daily
    q = {"daily": "range=10y&interval=1d",
         "max": "period1=0&period2=%d&interval=1d" % int(time.time()),
         "intraday": "range=60d&interval=5m"}[kind]
    doc = json.loads(_get("/v8/finance/chart/%s?%s" % (urllib.parse.quote(sym), q)))
    res = (doc.get("chart") or {}).get("result")
    if not res:
        raise FetchError("no data for %s: %s" % (sym, (doc.get("chart") or {}).get("error")))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(res[0], f)
    return res[0]


def _rows(res):
    q = res["indicators"]["quote"][0]
    return zip(res.get("timestamp") or [], q["open"], q["high"], q["low"], q["close"])


def daily_bars(res):
    """[(date, o, h, l, c)] split- and dividend-adjusted, null rows dropped, one bar per date."""
    adj = (res["indicators"].get("adjclose") or [{}])[0].get("adjclose")
    out = {}
    for i, (ts, o, h, l, c) in enumerate(_rows(res)):
        if None in (o, h, l, c) or c <= 0:
            continue
        f = adj[i] / c if adj and adj[i] else 1.0
        out[to_eastern(ts).date()] = (o * f, h * f, l * f, c * f)
    return [(d,) + v for d, v in sorted(out.items())]


def intraday_sessions(res):
    """{date: [(time, o, h, l, c)]} regular-session 5-minute bars keyed by bar start time.
    Only complete sessions (all 78 bars, 9:30 to 15:55) are kept."""
    days = {}
    for ts, o, h, l, c in _rows(res):
        if None in (o, h, l, c):
            continue
        t = to_eastern(ts)
        if t.minute % 5 or t.second:
            continue  # off-grid live tick
        if dt.time(9, 30) <= t.time() <= dt.time(15, 55):
            days.setdefault(t.date(), {})[t.time()] = (o, h, l, c)
    out = {}
    for d, bars in days.items():
        if len(bars) == 78:
            out[d] = [(k,) + bars[k] for k in sorted(bars)]
    return out

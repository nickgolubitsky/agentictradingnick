import datetime as dt
import math
import random
import unittest

from backtest import daily, data, orb, stats


def session(closes_after_range, rng=((100, 101, 99.5, 100.5),) * 3):
    """78 bars: three range bars, then bars built from (o, h, l, c) tuples, padded flat."""
    t0 = dt.datetime(2026, 10, 19, 9, 30)
    rows = list(rng) + list(closes_after_range)
    last = rows[-1][3]
    rows += [(last, last, last, last)] * (78 - len(rows))
    return [((t0 + dt.timedelta(minutes=5 * i)).time(),) + r for i, r in enumerate(rows)]


class Orb(unittest.TestCase):
    def test_no_breakout_no_trade(self):
        self.assertIsNone(orb.trade(session([(100.5, 100.9, 100.2, 100.8)]), "mid", 1.0))

    def test_target_hit(self):
        # range 99.5-101, mid 100.25; entry 101.25 -> risk 1.0, target 102.25
        bars = session([(101, 101.3, 100.9, 101.25), (101.3, 102.5, 101.2, 102.4)])
        t = orb.trade(bars, "mid", 1.0)
        self.assertEqual((t["entry"], t["stop"], t["exit"], t["reason"]), (101.25, 100.25, 102.25, "target"))

    def test_stop_wins_a_bar_that_touches_both(self):
        bars = session([(101, 101.3, 100.9, 101.25), (101.3, 102.5, 100.0, 101.0)])
        t = orb.trade(bars, "mid", 1.0)
        self.assertEqual((t["exit"], t["reason"]), (100.25, "stop"))

    def test_gap_through_stop_fills_at_open(self):
        bars = session([(101, 101.3, 100.9, 101.25), (99.0, 99.5, 98.8, 99.2)])
        t = orb.trade(bars, "mid", 1.0)
        self.assertEqual((t["exit"], t["reason"]), (99.0, "stop_gap"))

    def test_flat_at_1555(self):
        bars = session([(101, 101.3, 100.9, 101.25)])
        t = orb.trade(bars, "low", 2.0)
        self.assertEqual(t["reason"], "flat")

    def test_control_enters_at_range_end(self):
        t = orb.trade(session([]), "low", 1.0, control=True)
        self.assertEqual((t["entry"], t["stop"]), (100.5, 99.5))

    def test_cost_is_charged_in_r(self):
        bars = session([(101, 101.3, 100.9, 101.25), (101.3, 102.5, 101.2, 102.4)])
        t = orb.run({"X": {dt.date(2026, 10, 19): bars}}, "A1", cost_bps=2)[0]
        self.assertAlmostEqual(t["gross"], 1.0)
        self.assertAlmostEqual(t["net"], 1.0 - 0.0002 * (101.25 + 102.25))


class Daily(unittest.TestCase):
    def test_rsi_matches_scanner_math(self):
        random.seed(3)
        c = [100.0]
        for _ in range(80):
            c.append(c[-1] * (1 + random.uniform(-0.03, 0.03)))
        # day-trader-skill's rsi(): Wilder seeded on the first n changes, run to the end
        n = 14
        g = [max(0.0, c[i] - c[i - 1]) for i in range(1, len(c))]
        lo = [max(0.0, c[i - 1] - c[i]) for i in range(1, len(c))]
        ag, al = sum(g[:n]) / n, sum(lo[:n]) / n
        for i in range(n, len(g)):
            ag, al = (ag * (n - 1) + g[i]) / n, (al * (n - 1) + lo[i]) / n
        self.assertAlmostEqual(daily.rsi_series(c, 14)[-1], 100 - 100 / (1 + ag / al))

    def test_breakout_and_reclaim(self):
        c = [100.0] * 40 + [99.0, 103.0]
        r = daily.rsi_series(c, 14)
        # the flat run then a drop leaves RSI14 at 0 the day before, so the up close is also a bounce
        self.assertEqual(set(daily.setups_at(c, len(c) - 1, r)),
                         {"breakout_20d", "reclaim_ma20", "oversold_bounce"})

    def test_bull_flag(self):
        c = [100.0] * 30 + [100 + 1.5 * k for k in range(1, 11)] + [115.0, 115.5, 114.8, 115.2, 115.1]
        r = daily.rsi_series(c, 14)
        self.assertIn("bull_flag", daily.setups_at(c, len(c) - 1, r))


class Stats(unittest.TestCase):
    def test_lag0_is_plain_t(self):
        xs = [0.1, -0.2, 0.3, 0.05, 0.12]
        m = sum(xs) / 5
        sd = math.sqrt(sum((x - m) ** 2 for x in xs) / 4)
        self.assertAlmostEqual(stats.newey_west_t(xs, 0), m / (sd / math.sqrt(5)))

    def test_clusters_by_day(self):
        trades = [{"date": 1, "net": 1.0}, {"date": 1, "net": 3.0}, {"date": 2, "net": -1.0}]
        self.assertEqual(stats.by_day(trades), [2.0, -1.0])


class Clock(unittest.TestCase):
    def test_dst_boundaries(self):
        # 2026-03-08 07:00 UTC is the switch to EDT; 2026-11-01 06:00 UTC back to EST
        edt = dt.datetime(2026, 7, 1, 13, 30) - dt.datetime(1970, 1, 1)
        est = dt.datetime(2026, 12, 1, 14, 30) - dt.datetime(1970, 1, 1)
        self.assertEqual(data.to_eastern(edt.total_seconds()).time(), dt.time(9, 30))
        self.assertEqual(data.to_eastern(est.total_seconds()).time(), dt.time(9, 30))


if __name__ == "__main__":
    unittest.main()

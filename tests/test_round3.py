import datetime as dt
import random
import unittest

from backtest import portfolio, round3


def walk(n=900, seed=11, start=dt.date(2000, 1, 3)):
    """Weekday bars with real opens: open = previous close * small gap."""
    random.seed(seed)
    bars, c, d = [], 100.0, start
    while len(bars) < n:
        if d.weekday() < 5:
            o = c * (1 + random.gauss(0, 0.004))
            c = o * (1 + random.gauss(0.0004, 0.01))
            bars.append((d, o, max(o, c), min(o, c), c))
        d += dt.timedelta(days=1)
    return bars


ZERO = lambda d: 0.0  # noqa: E731


class NextOpen(unittest.TestCase):
    def test_curve_compounds_the_trades(self):
        bars = walk()
        trades = round3.rsi2_next_open_trades(bars, ZERO)
        self.assertGreater(len(trades), 5)
        last_exit = trades[-1]["exit_date"]
        dates, eq = round3.rsi2_next_open_curve(bars, ZERO, ZERO)
        prod = 1.0
        for t in trades:
            prod *= 1 + t["net"]
        self.assertAlmostEqual(eq[dates.index(last_exit)] / prod, 1.0, places=9)

    def test_fills_are_one_bar_after_the_signal(self):
        bars = walk()
        c = [b[4] for b in bars]
        a, b = portfolio.rsi2_trades(c)[0]
        t = round3.rsi2_next_open_trades(bars, ZERO)[0]
        self.assertEqual((t["date"], t["exit_date"]), (bars[a + 1][0], bars[b + 1][0]))
        self.assertAlmostEqual(t["net"], bars[b + 1][1] / bars[a + 1][1] - 1)


class Gtaa(unittest.TestCase):
    def setUp(self):
        self.bars = {s: walk(700, seed=k) for k, s in enumerate(round3.GTAA)}

    def test_month_ends_skip_the_partial_month(self):
        dates = [dt.date(2020, 1, 30), dt.date(2020, 1, 31), dt.date(2020, 2, 3), dt.date(2020, 2, 4)]
        self.assertEqual(round3.month_end_indices(dates), [1])

    def test_always_in_with_zero_cost_tracks_the_assets(self):
        d, eq, _ = round3.gtaa(self.bars, ZERO, ZERO, always_in=True)
        self.assertGreater(len(d), 100)
        self.assertTrue(all(x > 0 for x in eq))

    def test_all_out_earns_only_tbills(self):
        falling = {s: [(b[0], 1000 - i, 1000 - i, 1000 - i, 1000 - i) for i, b in enumerate(v)]
                   for s, v in self.bars.items()}
        d, eq, exp = round3.gtaa(falling, ZERO, lambda x: 0.05)
        self.assertTrue(all(e == 0 for _, e in exp))
        years = (d[-1] - d[0]).days / 365
        self.assertAlmostEqual(eq[-1], 1.0, delta=0.06 * years + 0.01)
        self.assertGreater(eq[-1], 1.0)

    def test_costs_reduce_equity(self):
        _, free, _ = round3.gtaa(self.bars, ZERO, ZERO)
        _, paid, _ = round3.gtaa(self.bars, lambda d: 0.001, ZERO)
        self.assertLess(paid[-1], free[-1])


class Blend(unittest.TestCase):
    def test_blend_of_identical_sleeves_is_the_sleeve(self):
        bars = walk(400)
        curve = ([b[0] for b in bars], [b[4] / bars[0][4] for b in bars])
        d, eq = round3.blend(curve, curve)
        self.assertAlmostEqual(eq[-1], curve[1][-1])

    def test_correlation_bounds(self):
        self.assertAlmostEqual(round3.correlation([1, 2, 3], [2, 4, 6]), 1.0)
        self.assertAlmostEqual(round3.correlation([1, 2, 3], [3, 2, 1]), -1.0)


if __name__ == "__main__":
    unittest.main()

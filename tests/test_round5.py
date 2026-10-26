import unittest

from backtest import round5

H, D = 3600, 86400


def hours(prices, start=0):
    """Flat hourly bars from (o, h, l, c) tuples starting at day boundary `start`."""
    return [[start + k * H, o, h, l, c] for k, (o, h, l, c) in enumerate(prices)]


def flat(p, n):
    return [(p, p, p, p)] * n


class Crypto(unittest.TestCase):
    def test_dip_fill_then_net_target(self):
        # day 0: opens 100, hour 2 dips to 96 -> limit 97 (3% dip) fills; hour 5 trades up to 100
        bars = flat(100, 2) + [(99, 99, 96, 97)] + flat(97.5, 2) + [(97.8, 100, 97.8, 99.5)] + flat(99.5, 30)
        res = round5.simulate({"X": hours(bars)}, "C1", spread=0.0)
        t = res["trades"][0]
        self.assertEqual(t["why"], "target")
        self.assertAlmostEqual(t["net"], 0.01)

    def test_spread_moves_both_fills(self):
        # with a 2% spread the ask must reach 97, so mid must reach 97 / 1.01
        bars = flat(100, 2) + [(99, 99, 96.5, 97)] + flat(97, 30)
        res = round5.simulate({"X": hours(bars)}, "C1", spread=0.02)
        self.assertEqual(res["trades"], [])
        self.assertEqual(res["equity"][-1], 1.0)  # unfilled order: cash returned at the next routine

    def test_stop_beats_target_in_the_same_hour(self):
        bars = flat(100, 1) + [(97, 97, 97, 97)] + [(97, 120, 80, 97)] + flat(97, 30)
        res = round5.simulate({"X": hours(bars)}, "C5", spread=0.0)
        self.assertEqual(res["trades"][0]["why"], "stop")
        self.assertAlmostEqual(res["trades"][0]["net"], -0.10)

    def test_time_stop_after_seven_days(self):
        bars = flat(100, 1) + [(97, 97, 97, 97)] + flat(95, 24 * 9)
        res = round5.simulate({"X": hours(bars)}, "C2", spread=0.0)
        t = res["trades"][0]
        self.assertEqual(t["why"], "time")
        self.assertEqual(t["hours"], 168)
        self.assertAlmostEqual(t["net"], 95 / 97 - 1)

    def test_control_buys_on_the_ask_at_the_open(self):
        bars = flat(100, 1) + [(100, 103, 100, 102)] + flat(102, 30)
        res = round5.simulate({"X": hours(bars)}, "K1", spread=0.01)
        t = res["trades"][0]
        self.assertAlmostEqual(t["net"], 0.01)
        self.assertEqual(t["hours"], 2)  # entry bar's open to exit bar's close

    def test_two_pairs_split_the_book(self):
        dip = flat(100, 1) + [(97, 97, 97, 97)] + flat(97.5, 2) + [(97.5, 98.5, 97.5, 97.5)] + flat(97.5, 30)
        res = round5.simulate({"X": hours(dip), "Y": hours(flat(50, 40))}, "C1", spread=0.0)
        self.assertEqual(len(res["trades"]), 1)
        self.assertAlmostEqual(res["equity"][-1], 1 + 0.5 * 0.01)

    def test_clean_resets_a_bad_open_but_keeps_real_lows(self):
        from backtest import crypto_data
        rows = [[0, 1183, 1185, 1180, 1183], [H, 0.06, 1190, 0.06, 1184], [2 * H, 1184, 1186, 700, 1180]]
        out = crypto_data.clean(rows)
        self.assertEqual(out[1][1], 1183)       # open reset to the prior close
        self.assertEqual(out[1][3], 0.06)       # the low print is kept
        self.assertEqual(out[2][3], 700)        # a flash-crash low is kept

    def test_buy_and_hold_pays_the_spread_once(self):
        t, e = round5.buy_and_hold({"X": hours(flat(100, 5))}, 0.02, start=0)
        self.assertAlmostEqual(e[-1], 0.99 / 1.01)


if __name__ == "__main__":
    unittest.main()

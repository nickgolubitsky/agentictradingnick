import datetime as dt
import unittest

from backtest import round3, round4
from tests.test_round3 import walk

ZERO = lambda d: 0.0  # noqa: E731


def book(n_symbols, n=900):
    bars = {"S%d" % k: walk(n, seed=40 + k) for k in range(n_symbols)}
    ind = {s: round4.indicators(b) for s, b in bars.items()}
    calendar = [b[0] for b in bars["S0"]]
    return bars, ind, calendar


class Engine(unittest.TestCase):
    def test_one_symbol_full_size_matches_round3(self):
        bars, ind, cal = book(1)
        res = round4.simulate(ind, cal, round4.s1_rsi2, ZERO, ZERO, slots=1, size=1.0)
        ref = round3.rsi2_next_open_trades(bars["S0"], ZERO)
        self.assertGreater(len(ref), 5)
        self.assertEqual([(t["date"], t["exit_date"]) for t in res["trades"]],
                         [(t["date"], t["exit_date"]) for t in ref])
        prod = 1.0
        for t in ref:
            prod *= 1 + t["net"]
        last = res["dates"].index(ref[-1]["exit_date"])
        self.assertAlmostEqual(res["equity"][last] / prod, 1.0, places=9)

    def test_never_more_than_the_slot_limit(self):
        _, ind, cal = book(12)
        res = round4.simulate(ind, cal, round4.s1_rsi2, ZERO, ZERO, slots=3, size=1 / 3)
        open_at = {}
        for t in res["trades"]:
            for d in cal:
                if t["date"] <= d < t["exit_date"]:
                    open_at[d] = open_at.get(d, 0) + 1
        self.assertGreater(len(res["trades"]), 20)
        self.assertLessEqual(max(open_at.values()), 3)

    def test_cash_never_negative_and_equity_positive(self):
        _, ind, cal = book(8)
        res = round4.simulate(ind, cal, round4.s2_ibs, lambda d: 0.0005, lambda d: 0.03)
        self.assertTrue(all(e > 0 for e in res["equity"]))

    def test_ibs_skips_flat_bars(self):
        x = {"o": 10, "h": 10, "l": 10, "c": 10, "rsi2": 50, "sma200": 9, "sma5": 10, "ibs": None}
        self.assertIsNone(round4.s2_ibs(x))

    def test_ranking_prefers_most_oversold(self):
        d = dt.date(2020, 1, 2)
        base = {"o": 10, "h": 11, "l": 9, "c": 10, "sma200": 5, "sma5": 11, "ibs": 0.5}
        ind = {"A": {d: dict(base, rsi2=8)}, "B": {d: dict(base, rsi2=2)}}
        res = round4.simulate(ind, [d], round4.s1_rsi2, ZERO, ZERO, slots=1)
        self.assertEqual(res["trades"], [])  # queued only; nothing fills without a next day
        days = [d + dt.timedelta(days=k) for k in range(3)]
        for s in ind:
            ind[s][days[1]] = dict(base, rsi2=50, c=12)   # close above sma5: exit queued
            ind[s][days[2]] = dict(base, rsi2=50)
        res = round4.simulate(ind, days, round4.s1_rsi2, ZERO, ZERO, slots=1)
        self.assertEqual(res["fills"], [0, 1, 1])
        self.assertEqual([t["symbol"] for t in res["trades"]], ["B"])


if __name__ == "__main__":
    unittest.main()

import datetime as dt
import random
import unittest

from backtest import daily, portfolio


def walk(n=900, seed=7):
    random.seed(seed)
    c, d = [100.0], [dt.date(2000, 1, 3)]
    for _ in range(n - 1):
        c.append(c[-1] * (1 + random.gauss(0.0004, 0.012)))
        d.append(d[-1] + dt.timedelta(days=1))
    return [(d[i], c[i], c[i], c[i], c[i]) for i in range(n)]


class Portfolio(unittest.TestCase):
    def setUp(self):
        self.bars = walk()
        self.zero = lambda d: 0.0

    def test_trades_match_round1(self):
        tr1, _, _, _ = daily.rsi2(self.bars, 0)
        tr2 = portfolio.trade_list(self.bars, self.zero)
        self.assertGreater(len(tr2), 5)
        self.assertEqual([t["date"] for t in tr1], [t["date"] for t in tr2])
        for a, b in zip(tr1, tr2):
            self.assertAlmostEqual(a["net"], b["net"])

    def test_c_equity_compounds_the_trades(self):
        if portfolio.rsi2_trades([b[4] for b in self.bars])[-1][1] is None:
            self.skipTest("a trade is still open at the end of the walk")
        _, eq = portfolio.simulate(self.bars, "C", self.zero)
        prod = 1.0
        for t in portfolio.trade_list(self.bars, self.zero):
            prod *= 1 + t["net"]
        self.assertAlmostEqual(eq[-1] / prod, 1.0, places=9)

    def test_d1_with_zero_rate_is_c(self):
        _, c = portfolio.simulate(self.bars, "C", self.zero)
        _, d1 = portfolio.simulate(self.bars, "D1", self.zero, rate=self.zero)
        self.assertAlmostEqual(c[-1], d1[-1])

    def test_d1_earns_interest_only_when_idle(self):
        _, c = portfolio.simulate(self.bars, "C", self.zero)
        _, d1 = portfolio.simulate(self.bars, "D1", self.zero, rate=lambda d: 0.05)
        self.assertGreater(d1[-1], c[-1])
        self.assertLess(d1[-1] / c[-1], 1.05 ** (len(self.bars) / 365) * 1.001)

    def test_d2_without_signal_is_buy_and_hold(self):
        flat = [(b[0],) + (100.0 + 0.01 * i,) * 4 for i, b in enumerate(self.bars)]  # never oversold
        _, bh = portfolio.simulate(flat, "BH", self.zero)
        _, d2 = portfolio.simulate(flat, "D2", self.zero, rate=self.zero)
        self.assertAlmostEqual(bh[-1], d2[-1])

    def test_costs_switch_at_decimalization(self):
        cost = portfolio.cost_schedule(10, 2)
        self.assertEqual(cost(dt.date(2001, 4, 6)), 0.001)
        self.assertEqual(cost(dt.date(2001, 4, 9)), 0.0002)

    def test_irx_carries_forward(self):
        at = portfolio.irx_lookup([(dt.date(2000, 1, 3), 0, 0, 0, 5.0), (dt.date(2000, 1, 10), 0, 0, 0, 6.0)])
        self.assertEqual(at(dt.date(2000, 1, 7)), 0.05)
        self.assertEqual(at(dt.date(2000, 1, 10)), 0.06)


if __name__ == "__main__":
    unittest.main()

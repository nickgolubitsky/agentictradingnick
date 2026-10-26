# Systematic Multi-Stock Strategies with Replicated Out-of-Sample Evidence (for a $1k-$25k autonomous retail agent, as of Oct 2026)

Research scope note: 17 search/fetch calls. Most hits were secondary summaries (Alpha Architect, CXO Advisory, Quantpedia, ETF.com/Swedroe), not full papers. Exact figures are only as good as those summaries; flagged where relevant. Context from our own work: ORB and simple daily scanner setups (20d breakout, bull flag, MA20 reclaim, RSI14 oversold) lost after costs on 100 large caps; Connors RSI(2) on SPY passed OOS (1993-2016, 179 trades, +0.61%/trade, t=5.3).

## Q1. How much of the published anomaly literature survives replication and publication? (the base rate)

### Takeaway
Roughly half of a published anomaly's in-sample edge disappears after publication, and most of the "factor zoo" is either microcap-driven or not significant once microcaps are value-weighted away. But a core set of factor *themes* (momentum, value, low-risk, quality, etc.) does replicate globally. The engine should be built on those few themes, at large-cap, value-weighted, implementable scale, with an expected edge about half the backtest.

### Cited Findings
- Hou, Xue & Zhang, "Replicating Anomalies" (RFS 2020): with microcaps mitigated via NYSE breakpoints and value-weighted returns, 65% of 452 anomalies fail a |t| >= 1.96 hurdle; at the multiple-testing hurdle of t = 2.78, failure rises to 82%. — [Alpha Architect summary](https://alphaarchitect.com/replicating-anomalies/); [IDEAS/RFS listing](https://ideas.repec.org/a/oup/rfinst/v33y2020i5p2019-2133..html)
- The 2017 NBER version: 286 of 447 anomalies (64%) insignificant at 5%, including 95 of 102 liquidity variables (93%). — [NBER w23394](https://www.nber.org/papers/w23394.pdf)
- Microcaps are only about 3% of NYSE-AMEX-Nasdaq market cap but about 60% of the stock count, which is why equal-weighted anomaly backtests are dominated by untradeable names. — [Alpha Architect](https://alphaarchitect.com/replicating-anomalies/)
- Commentators note HXZ returns are gross, not net of costs, so the implementable failure rate is higher. — [ETF.com / Swedroe](https://www.etf.com/node/93984.md)
- McLean & Pontiff, "Does Academic Research Destroy Stock Return Predictability?" (JF 2016), 97 predictors: anomaly returns decay about 58% from in-sample to post-publication (roughly 0.58% to 0.26% monthly hedge-portfolio return), with decay peaking 3-4 years after publication. — [CXO Advisory](https://www.cxoadvisory.com/big-ideas/effects-of-market-adaptation)
- The "post-publication returns are ~50% smaller" result has been replicated by Jacobs & Müller (2020), Chen & Zimmermann (2020) and Jensen et al. — [Chen/Zimmermann et al., arXiv 2209.13623](https://arxiv.org/pdf/2209.13623)
- Jensen, Kelly & Pedersen, "Is There a Replication Crisis in Finance?" (JF 2023, vol. 78(5)): using a Bayesian framework, most factors replicate; over 80% of US equity factors stay significant after consistent, implementable construction and multiple-testing adjustment; factors cluster into themes and hold up out-of-sample across 93 countries. — [NBER w28432](https://www.nber.org/papers/w28432); [Alpha Architect](https://alphaarchitect.com/is-there-a-replication-crisis-in-finance/)

### Inferences
- HXZ and JKP are not contradictory: HXZ shows most *individual* anomalies are fragile (microcap-driven, gross of costs); JKP shows the major *themes* survive when built carefully. For a small agent, this means: trade themes, not single exotic signals, and always value-weight or restrict to liquid large/mid caps.
- Planning rule: haircut any published backtest Sharpe/return by ~50% (McLean-Pontiff), then subtract realistic costs. Anything that needs the full in-sample edge to clear costs is not worth building.
- Our own failed scanner setups (breakout, bull flag, MA20 reclaim, RSI14 oversold) fit the base rate: un-published or practitioner-only single-stock technical rules with short holds have no replicated academic support and are cost-sensitive.

### Gaps
- Could not retrieve JKP's per-theme post-2010 US returns (their public factor data site was not fetched).
- No net-of-cost replication database for retail-scale accounts was found.

## Q2. Momentum: cross-sectional 12-1, industry momentum, time-series momentum / trend, dual momentum (GEM)

### Takeaway
Momentum is the most-replicated theme, but US stock-level cross-sectional momentum has been weak since 2000 and is crash-prone; industry/sector-ETF momentum has weak post-2000 evidence. Asset-class trend-following (Faber GTAA, TSMOM, GEM) has genuine out-of-sample records but with roughly half the backtested CAGR. Volatility-scaling momentum is the best-supported fix for crashes.

### Cited Findings
- Cross-sectional stock momentum (US): US momentum has performed poorly over the last two decades, partly explained by a severe factor-specific crash in 2009. — [HedgeFundAlpha / FactorResearch](https://hedgefundalpha.com/strategies/improving-the-momentum-factor/)
- Momentum rebounded in 2024: the iShares MSCI USA Momentum ETF led US factor ETFs early in 2024 (+6.1% YTD at the time) after a weak 2023. — [Seeking Alpha](https://seekingalpha.com/article/4665020-momentum-leads-us-equity-factor-returns-so-far-in-2024)
- AQR's public US momentum index ranks on prior 12-month return excluding the last month, holds the top third, cap-weighted, reconstituted quarterly (a long-only, low-turnover template). — [AQR momentum indices](https://www.aqr.com/Insights/Datasets/Momentum-Indices-Monthly)
- Momentum crashes: after major market declines, past-loser betas can exceed 3 and past-winner betas fall below 0.5, so a fast market rebound crashes the long-short strategy (Daniel & Moskowitz, JFE 2016, 1927-2013). — [Alpha Architect](https://alphaarchitect.com/avoiding-momentum-crashes/)
- Barroso & Santa-Clara (JFE 2015): momentum risk is predictable from its own realized variance; constant-volatility targeting (12%) virtually eliminated crashes and nearly doubled momentum's Sharpe. Daniel-Moskowitz's dynamic version reportedly improves on that further. — [ETF.com / Swedroe](https://www.etf.com/sections/index-investor-corner/swedroe-downside-momentum); [Alpha Architect](https://alphaarchitect.com/avoiding-momentum-crashes/)
- Momentum profits are earned almost entirely overnight, while most other anomalies earn their profit intraday, often with opposite signs across the two (Lou, Polk & Skouras, JFE 2019); patterns are stronger in large-cap and high-price stocks. — [LSE Research Online](https://researchonline.lse.ac.uk/id/eprint/87481); [LSE PDF](https://personal.lse.ac.uk/polk/research/TugOfWar.pdf)
- Industry momentum (Moskowitz & Grinblatt 1999): sector ETF momentum after 2000 shows no momentum (Du, Denning & Zhao 2014; Tse 2015); 1998-2018 industry momentum not profitable at 3-digit SIC but still significant at 2-digit SIC / FF48; a CBS thesis could not reproduce the original 1963-1995 "industry beats stock momentum" result; Arnott et al. argue industry momentum is a by-product of factor momentum. — [Alpha Architect](https://alphaarchitect.com/industry-classification-and-the-momentum-factor/); [CBS student project](https://research.cbs.dk/en/studentProjects/clustering-in-momentum-strategies/); [Research Affiliates, Factor Momentum](https://www.researchaffiliates.com/insights/journal-papers/709-factor-momentum)
- Time-series trend following (Hurst, Ooi & Pedersen, AQR / JPM 2017): positive returns and low correlation to traditional assets back to 1880, with diversification value in equity bear markets; the paper also discusses headwinds from rising cross-market correlations since the credit crisis and growing AUM. — [AQR](https://www.aqr.com/Insights/Research/Journal-Article/A-Century-of-Evidence-on-Trend-Following-Investing)
- Faber GTAA (5 asset classes, each held at 20% when above its 10-month / ~200-day MA, monthly rebalance): in-sample 1972-2005 CAGR 11.7%, Sharpe 0.81, max DD 9.5%; true out-of-sample 2006-Mar 2025 with unchanged rules CAGR 6.05%, Sharpe 0.68, max DD 11.7% (monthly-observation DD, so true intra-month DD likely deeper; page does not state cost treatment). — [Concretum Group](https://concretumgroup.substack.com/p/global-tactical-asset-allocation); [CXO Advisory on Zarattini 2025](https://www.cxoadvisory.com/strategic-allocation/extension-of-a-quantitative-approach-to-tactical-asset-allocation)
- Faber published his own 10-year out-of-sample review in JPM (2018). — [ETF.com / Swedroe](https://www.etf.com/sections/index-investor-corner/swedroe-why-financial-trends-persist)
- Dual Momentum / GEM (Antonacci): 12-month trailing return picks US vs ex-US equity, with absolute momentum switching to bonds; original test 1974-2011, later extended to 1950-2018; ReSolve's independent rebuild tracked the author's results closely and reported attractive in- and out-of-sample results. — [Advisor Perspectives / ReSolve](https://www.advisorperspectives.com/articles/2019/05/06/global-equity-momentum-a-craftsmans-perspective)
- GEM is highly implementation-sensitive: year-to-year return differences of hundreds to thousands of bps depending on rebalance-day choices ("timing luck"); it stayed mostly aggressive through the Q4 2018 drawdown before shifting defensive in early 2019. — [Newfound Research](https://blog.thinknewfound.com/tag/gem/)

### Inferences
- For a small account, the cleanest momentum implementations are ETF-level (GTAA/GEM-style trend, monthly) and long-only top-tercile stock momentum, rebalanced monthly or quarterly. Both have low turnover, so costs are small even with $1k-$25k.
- Long-only stock momentum still carries the crash problem through its high-beta tilt after rebounds. Scaling exposure by trailing realized volatility (Barroso & Santa-Clara) is a well-supported, simple overlay.
- Tranche the rebalance (e.g., split capital across 4 weekly sub-portfolios) to cut GEM/GTAA timing luck. This is our inference from the Newfound finding, not a tested result here.
- Expect GTAA-type trend to roughly halve its backtested CAGR, as it did 2006-2025, while keeping drawdown control. Its job is crash protection, not alpha.
- Sector-ETF rotation by relative strength has weak post-2000 evidence. Do not make it a core sleeve.

### Gaps
- No verified 2010-2025 return series for US UMD, or for long-only momentum ETFs (MTUM) vs SPY. Ken French or AQR data would settle it.
- No tracked post-2014 GEM performance series found (Allocate Smartly pages not surfaced by search).
- MOP 2012 time-series momentum paper and 2010s managed-futures/trend ETF results not retrieved.

## Q3. Short-term reversal and mean reversion on stock baskets (RSI(2), IBS)

### Takeaway
Weekly/monthly short-term reversal is academically robust, but gross profits are mostly eaten by costs unless restricted to large caps with turnover control. Residual (factor-adjusted) reversal is the version that survives. Connors-style RSI(2) has post-publication support on SPY (consistent with our own t=5.3 result), but I found no survivorship-free published test on individual S&P 500 constituents. That test must be built by us.

### Cited Findings
- de Groot, Huij & Zhou (J. Banking & Finance 2012): the cost drag on reversal strategies comes mostly from excessive trading in small caps. Restricting to large caps cuts costs sharply, turnover-aware construction cuts them further, and net returns of 30-50 bp per week remain. — [Erasmus repository](https://repub.eur.nl/pub/25718); [Quantpedia](https://quantpedia.com/strategies/short-term-reversal-in-stocks)
- Blitz, Huij, Lansdorp & Verbeek: residual reversal strategies earn statistically and economically significant profits net of trading costs even in large caps. — [CXO Advisory](https://www.cxoadvisory.com/?p=6251)
- Contrary practitioner evidence: QuantConnect's large-cap short-term reversal implementation underperformed the S&P 500 in all backtest periods except the 2020 crash; Quantpedia warns reversal is dangerous in crises because it forces buying the worst performers on high-volatility days. — [QuantConnect](https://www.quantconnect.com/learning/articles/investment-strategy-library/short-term-reversal-strategy-in-stocks); [Quantpedia](https://quantpedia.com/strategies/short-term-reversal-in-stocks)
- Reversal profits are earned overnight in the Lou-Polk-Skouras decomposition (same as momentum), with intraday components of the opposite sign. — [LSE PDF](https://personal.lse.ac.uk/polk/research/TugOfWar.pdf)
- RSI(2) post-publication on ETFs: CXO's out-of-sample test of TradingMarkets/Connors 2-day RSI rules (Jan 2007-Mar 2009) found SPY averaging +0.69%/trade (83% win rate) and XLK +0.25%/trade (70% win). — [CXO Advisory](https://www.cxoadvisory.com/technical-trading/out-of-sample-tests-of-bullish-regime-2-day-rsi-signals)
- RSI(2) 10/90 on the leveraged SSO, 2006-2019: CAGR 4.9% vs 11.6% buy-and-hold, worst trade -40.4% (Sep-Nov 2008), showing the tail risk of no-stop mean reversion and of leverage. — [CXO Advisory](https://www.cxoadvisory.com/?p=26735)
- Connors & Alvarez's original rules (Short Term Trading Strategies That Work, 2008) were tested on index/ETF data. No search hit provided a survivorship-corrected constituent-level RSI(2) or IBS study. — [CXO Advisory](https://www.cxoadvisory.com/technical-trading/out-of-sample-tests-of-bullish-regime-2-day-rsi-signals)

### Inferences
- Our SPY RSI(2) result agrees with independent post-publication tests (CXO's +0.69%/trade on SPY 2007-09 is close to our +0.61%). Index-level mean reversion appears to be one of the few short-horizon edges that survive. Note that it is a long-volatility-of-the-index bet that buys into crashes.
- Moving RSI(2)/IBS from SPY to S&P 500 constituents is plausible (the academic reversal literature says large-cap residual reversal survives costs) but unproven. A constituent-level backtest needs point-in-time index membership (to avoid survivorship bias), next-open or close-auction fills, and per-trade costs of at least 5-10 bp round-trip. The "residual" version (reversal relative to sector/market) is the one with academic backing.
- Mean reversion and momentum are naturally negatively correlated in sign of bet (buy losers vs buy winners), which makes a short-horizon MR sleeve a good diversifier for a monthly trend/momentum core.

### Gaps
- No peer-reviewed or survivorship-free study of RSI(2)/IBS on individual S&P 500 stocks found. IBS (internal bar strength) evidence was not retrieved at all.
- No post-2015 net-of-cost replication of large-cap residual reversal found.

## Q4. Post-earnings-announcement drift (PEAD) and overnight vs intraday returns

### Takeaway
PEAD is contested and likely dead in large caps: Martineau (2022) finds no large-cap drift since about 2006, while two 2025 papers claim it is alive. It is not a safe core engine for a small agent. The overnight/intraday decomposition is a robust descriptive fact, but it is a timing insight, not a standalone tradable strategy for retail.

### Cited Findings
- Martineau, "Rest in Peace Post-Earnings Announcement Drift" (Critical Finance Review 2022): prices now absorb earnings surprises on announcement day; for large stocks PEAD has been non-existent since 2006, and has only recently disappeared in microcaps. — [Now Publishers / CFR](https://nowpublishers.com/article/Details/CFR-0122); [CFR PDF](https://cfr.ivo-welch.info/published/papers/martineau2021rest.pdf)
- UCLA Anderson summary: non-microcap drift began fading in 2001 and was gone by 2006, credited to decimalization and post-2005 high-frequency trading. Two 2025 accepted papers contradict Martineau and say PEAD is alive; a Subrahmanyam working paper attributes the disagreement to research-design choices. — [UCLA Anderson Review](https://anderson-review.ucla.edu/is-post-earnings-announcement-drift-a-thing-again/)
- A 2026 MSc dissertation on S&P 500 firms (2022-2024) found PEAD small and sensitive to the benchmark used, and gradually weakening in large caps (student work, weak evidence). — [Universidade Católica repository](https://repositorio.ucp.pt/bitstreams/c9033501-675d-4fda-a389-c1b18a4ffc6a/download)
- Overnight vs intraday (Lou, Polk & Skouras, JFE 2019): momentum and reversal profits are earned overnight; most other anomalies earn intraday; institutions trade during the day and against momentum, creating a "tug of war." The pattern is extremely robust across subsamples and stronger in large-cap, high-price stocks. — [LSE Research Online](https://researchonline.lse.ac.uk/id/eprint/87481)

### Inferences
- For our agent, PEAD should at most be a tie-breaker or filter (e.g., avoid initiating mean-reversion longs into a negative earnings surprise), not a sleeve.
- The overnight result suggests momentum/trend entries are better executed near the close (to capture the overnight leg) than at the open. That matches our finding that opening-range breakouts lost money.
- A pure "buy close, sell open" overnight strategy doubles turnover (two trades per day). Costs and spread at the open likely dominate for retail, but I found no net-of-cost retail study.

### Gaps
- The two 2025 pro-PEAD papers were not identified by name or retrieved.
- No net-of-cost evidence for an overnight-holding strategy at retail scale.

## Q5. Low-volatility, seasonality (turn-of-month), and volatility-managed exposure

### Takeaway
Low-volatility is well replicated across regions and seems to have persisted after publication, but part of it may be bond/term-premium exposure. Turn-of-month has mixed evidence (strong historically, said to fade in S&P futures after 1990 in one study, re-confirmed in others), so treat it as a weak overlay. Volatility-managed exposure has a strong in-sample alpha but generally fails out-of-sample as a timing rule (Cederburg et al. 2020), except for momentum, where vol-scaling is robust.

### Cited Findings
- Low-vol: Blitz & van Vliet (2007), 1986-2006: lowest-volatility decile (ranked on 3-year volatility) had the highest Sharpe ratio. "The Volatility Effect Revisited" (Blitz, van Vliet, Baltussen 2019) updated it; a Blitz et al. 2019 study found results consistent across US, developed-international and emerging markets. — [HedgeFundAlpha](https://hedgefundalpha.com/strategies/the-volatility-effect-revisited/); [Wikipedia: Low-volatility anomaly](https://en.wikipedia.org/wiki/Low-volatility_anomaly)
- An Erasmus thesis covering 1963-2019 found the volatility anomaly robust and stronger over time (student thesis; supportive only). — [Erasmus thesis](https://thesis.eur.nl/pub/55635/Master-Thesis-Final-432751EM.pdf)
- Caution: low-vol performance is partly explained by exposure to the term premium (interest-rate sensitivity). — [Advisor Perspectives](https://www.advisorperspectives.com/articles/2019/06/17/low-volatility-investing-works-sometimes); [ETF.com / Swedroe](https://www.etf.com/sections/index-investor-corner/swedroe-low-vol-advantage-not-what-youd-expect)
- Turn-of-month: Maberly & Waggoner (Atlanta Fed WP 2000) found the effect vanished after 1990 in S&P 500 futures and spot, warning that in-sample regularities shift with microstructure; Hensel, Sick & Ziemba (2012) report it present in cash and futures as an out-of-sample confirmation of Ariel's 1963-1981 finding; McConnell & Xu call it "a puzzle in search of an answer"; Quantpedia says it exists in large caps as well as small. — [Atlanta Fed](https://fedinprint.org/item/fedawp/13394/original); [IDEAS / Hensel-Sick-Ziemba](https://ideas.repec.org/h/wsi/wschap/9789814405461_0016.html); [Quantpedia](https://quantpedia.com/strategies/turn-of-the-month-in-equity-indexes)
- A 401(k) flow study found the TOM effect still present, but stocks with larger end-of-month retirement inflows did not show a stronger effect, undermining the flow explanation. — [AEA 2022](https://aeaweb.org/conference/2022/preliminary/paper/iQikdBKZ)
- Volatility-managed portfolios (Moreira & Muir 2017): Cederburg, O'Doherty, Wang & Yan (JFE 2020), 103 equity strategies: spanning-regression alphas are significantly positive, but real-time out-of-sample versions generally earn *lower* Sharpe ratios and certainty-equivalent returns than the unmanaged portfolios, because of structural instability in the regressions. Barroso & Detzel find they do not survive transaction costs. DeMiguel, Martín-Utrera & Uppal (JF 2024) argue a conditional multifactor version does beat its unconditional counterpart out-of-sample and net of costs. — [Alpha Architect](https://alphaarchitect.com/does-portfolio-timing-based-on-volatility-signals-outperform-buy-and-hold/); [Lehigh PDF (Cederburg et al.)](https://www.lehigh.edu/~xuy219/research/COWY.pdf); [LBS / DeMiguel et al. JF 2024](https://lbsresearch.london.edu/id/eprint/3716)

### Inferences
- Low-vol is a good *defensive sleeve* for a long-only small account (long-only by construction, low turnover, quarterly rebalance via a handful of low-vol stocks or an ETF). It should be counted as partly a rate bet.
- Use volatility scaling for risk control (position sizing, max-loss budgeting, especially on momentum), not as an alpha source. Do not expect a vol-timed market sleeve to beat buy-and-hold.
- Turn-of-month is cheap (about one round trip per month on SPY) and can be a filter (e.g., bias mean-reversion entries toward the last day / first 3 days of the month), but evidence is too mixed to size it as a standalone sleeve.

### Gaps
- No post-2010 US low-vol return figure (e.g., USMV/SPLV vs SPY) retrieved.
- McConnell & Xu's sample and method, and recent (post-2010) turn-of-month results on SPY, not retrieved.
- Moreira-Muir's rebuttal to Cederburg not retrieved.

## Q6. Which combine into a multi-strategy, multi-stock portfolio for a small account; rebalance frequency; failure modes

### Takeaway
A defensible small-account engine is a monthly-rebalanced core of (a) ETF trend/dual momentum and (b) long-only, vol-scaled large-cap stock momentum and/or low-vol, plus (c) a short-horizon index/large-cap mean-reversion sleeve (RSI(2)-type) that has negative bet-sign correlation with the momentum core. Main failure modes: post-publication decay (~50%), microcap/survivorship-inflated backtests, momentum crashes, and cost drag from high turnover.

### Cited Findings
- Trend following has delivered low correlation to traditional asset classes and diversification in equity bear markets for over a century. — [AQR / Hurst-Ooi-Pedersen](https://www.aqr.com/Insights/Research/Journal-Article/A-Century-of-Evidence-on-Trend-Following-Investing)
- Momentum profits are earned overnight while most other anomalies earn intraday, often with opposite signs. Different anomaly families draw on different return components and clienteles. — [LSE Research Online](https://researchonline.lse.ac.uk/id/eprint/87481)
- Monthly rebalancing is the standard for GTAA (5 assets, monthly) and GEM (12-month lookback, monthly); AQR's momentum index reconstitutes quarterly. — [Concretum](https://concretumgroup.substack.com/p/global-tactical-asset-allocation); [Advisor Perspectives](https://www.advisorperspectives.com/articles/2019/05/06/global-equity-momentum-a-craftsmans-perspective); [AQR](https://www.aqr.com/Insights/Datasets/Momentum-Indices-Monthly)
- Rebalance-date "timing luck" can move annual GEM results by hundreds to thousands of bps. — [Newfound Research](https://blog.thinknewfound.com/tag/gem/)
- Failure mode, decay: ~50-58% post-publication decay, peaking 3-4 years after publication. — [CXO Advisory](https://www.cxoadvisory.com/big-ideas/effects-of-market-adaptation); [arXiv 2209.13623](https://arxiv.org/pdf/2209.13623)
- Failure mode, microcaps: most anomaly significance comes from microcaps (about 60% of names, about 3% of cap). — [Alpha Architect](https://alphaarchitect.com/replicating-anomalies/)
- Failure mode, costs: reversal's cost drag comes from small-cap trading; large-cap restriction and turnover control are what make it survive. — [Erasmus / de Groot et al.](https://repub.eur.nl/pub/25718)
- Failure mode, crowding/AUM: trend following faces headwinds from growing strategy assets and rising cross-market correlations since the credit crisis. — [AQR](https://www.aqr.com/Insights/Research/Journal-Article/A-Century-of-Evidence-on-Trend-Following-Investing)
- Failure mode, crashes: momentum crashes in sharp rebounds after bear markets (2009 is the modern example). — [Alpha Architect](https://alphaarchitect.com/avoiding-momentum-crashes/); [HedgeFundAlpha](https://hedgefundalpha.com/strategies/improving-the-momentum-factor/)
- Failure mode, tail risk in mean reversion: RSI(2) on SSO had a -40.4% single trade in late 2008. — [CXO Advisory](https://www.cxoadvisory.com/?p=26735)
- Failure mode, out-of-sample instability of timing rules (volatility-managed). — [Alpha Architect](https://alphaarchitect.com/does-portfolio-timing-based-on-volatility-signals-outperform-buy-and-hold/)

### Inferences (proposed engine; our synthesis, not a tested result)
- Sleeve A, ETF trend / dual momentum (~30-40%): GTAA-5 or GEM, monthly, tranched across rebalance days. Expect about 6% CAGR and about 12% max DD on monthly data (2006-2025 OOS). Role: crash protection.
- Sleeve B, long-only large-cap equity factor (~30-40%): 12-1 momentum top names (S&P 500 universe, value- or equal-weighted among about 10-20 names) with realized-vol scaling, possibly blended with low-vol names. Monthly or quarterly rebalance. Role: equity premium plus factor tilt.
- Sleeve C, short-horizon mean reversion (~20-30%): RSI(2)/IBS on SPY/QQQ (validated) and, only after a survivorship-free constituent backtest, on liquid S&P 500 names in an uptrend (e.g., above a 200-day MA, the Connors regime filter). Hard time stop plus catastrophic stop. Role: uncorrelated, high-hit-rate return stream that profits from the pullbacks that hurt momentum.
- Overlays: vol-based position sizing everywhere; optional turn-of-month and earnings-date filters. No PEAD sleeve, no sector-rotation sleeve, no ORB/intraday breakout.
- Small-account mechanics: with $1k-$25k, use fractional shares or ETFs so 10-20 names are feasible. Monthly sleeves cost little; the MR sleeve is where costs matter and it must be tested with realistic slippage. PDT rules (under $25k, margin account) constrain same-day round trips but not overnight-holding MR trades. Cash accounts face settlement limits. (Regulatory specifics not researched here; check current rules.)
- Validation standard for anything new: the published edge halved, value-weighted / large-cap only, survivorship-free universe, net of costs, and post-2010 OOS positive. Our SPY RSI(2) passes. Most of our scanner setups do not.

### Gaps
- No direct correlation matrix between trend, stock momentum, low-vol and RSI(2) mean-reversion sleeves was found. It needs to be computed from our own backtests.
- Allocate Smartly's combined-strategy results (multi-strategy blends with tracked post-publication performance) were not retrieved by search.
- Retail-specific execution costs (PFOF spread capture, odd-lot fills, fractional-share execution quality) for 2025-2026 not researched.
- Current PDT rule status as of Oct 2026 not verified (FINRA had proposals to change the $25k threshold; not confirmed in this session).

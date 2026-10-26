# Academic evidence: do LLM-based trading agents beat simple benchmarks over long horizons? (as of Oct 2026)

Status legend: [PEER-REVIEWED] = accepted at a venue; [PREPRINT] = arXiv/SSRN only; [WITHDRAWN].

## 1. FINSABER: setup, findings vs buy-and-hold over ~20 years, regime findings

### Takeaway
Once you test over 2004-2024 on bias-controlled universes, the advantages reported for FinMem and FinAgent disappear. Buy-and-hold beats both LLM agents on Sharpe with high statistical significance, and neither agent shows significant CAPM alpha. The failure depends on regime: the agents are too conservative in bull markets and too aggressive in bear markets.

### Cited Findings
- Paper: "Can LLM-based Financial Investing Strategies Outperform the Market in Long Run?" by Weixian Waylon Li, Hyeonjun Kim, Mihai Cucuringu and Tiejun Ma (Edinburgh, SKKU, UCLA/Oxford). arXiv 2505.07078, v5 revised 12 Feb 2026. Listed for KDD '26 (Aug 9-13 2026, Jeju) [PEER-REVIEWED, KDD]. Code is at github.com/waylonli/FINSABER. — [arXiv v5](https://arxiv.org/html/2505.07078v5); [SKKU repository record](https://scholarx.skku.edu/item/1dd87e13-87fc-48e2-8a02-387082647bd1)
- **Data:** more than 7,000 US equities, including delisted S&P 500 members, over 2000-2024. The long evaluation runs 2004-01-01 to 2024-01-01. — [arXiv v5](https://arxiv.org/html/2505.07078v5)
- **Strategies:** two LLM timing agents, FinMem (GPT-4o-mini and GPT-4o) and FinAgent. They are compared with rule-based strategies (B&H, SMA/WMA cross, ATR band, Bollinger, trend following, turn-of-month), ML (ARIMA, XGBoost) and RL from FinRL (A2C, PPO, SAC, TD3). — [arXiv v5](https://arxiv.org/html/2505.07078v5)
- **Costs:** a Moomoo-style commission of $0.0049/share with a $0.99 minimum per order, a 3% risk-free rate, long-only. The paper does not model slippage. — [arXiv v5](https://arxiv.org/html/2505.07078v5)
- **Replicating the original window:** on TSLA from 2022-10-06 to 2023-04-10, FinMem with GPT-4o-mini scored Sharpe 0.927 and return 19.94%. The FinMem authors had reported Sharpe 2.679 and return 61.78% for that window, and B&H scored Sharpe -0.342 and return -20.48%. The original headline results came from a short, favorable window. — [arXiv v5](https://arxiv.org/html/2505.07078v5)
- **Same four stocks over 20 years (Sharpe):**
  - NFLX: B&H 0.622 vs FinMem 0.293.
  - AMZN: B&H 0.551 vs FinMem 0.188.
  - MSFT: B&H 0.461 vs FinAgent 0.285.
  - TSLA: B&H 0.630 vs FinMem 0.641, roughly a tie.
  - Source: [arXiv v5](https://arxiv.org/html/2505.07078v5)
- **Composite universes:** historical S&P 500 constituents, reselected every rolling window.
  - Random-5 selector (91 symbols): B&H Sharpe 0.315, FinMem -0.253, FinAgent 0.094.
  - Momentum selector (84 symbols): B&H 0.384, ARIMA 0.542 (best), FinAgent 0.104.
  - Low-volatility selector (63 symbols): B&H 0.703, PPO 0.514, FinAgent 0.241.
  - FinCon selector (80 symbols): B&H 0.389, ARIMA 0.532.
  - Source: [arXiv v5](https://arxiv.org/html/2505.07078v5)
- **Significance:** paired t-tests of B&H vs the LLM agents give p between 3e-6 and 0.0117. Neither LLM has significant CAPM alpha. The best is FinAgent under the momentum selector at +6.57%, p=0.345. FinMem's alpha is negative in every scenario. — [arXiv v5](https://arxiv.org/html/2505.07078v5)
- **Regimes:** bull and bear are defined as S&P 500 annual return of at least +20% or at most -20%.
  - Bull-market Sharpe: B&H 0.61, FinAgent 0.12, FinMem -0.19. No active strategy beats B&H in bull markets.
  - Bear-market Sharpe: B&H -0.28, FinAgent -0.38, FinMem -0.97.
  - Source: [arXiv v5](https://arxiv.org/html/2505.07078v5)
- **Recommendations from the authors:** regime awareness and adaptive risk control matter more than adding architectural complexity. — [arXiv abstract/search summary](https://arxiv.org/abs/2505.07078)
- **Leakage:** the authors acknowledge possible pretraining leakage and argue it would favor the LLMs, so it strengthens their negative conclusion rather than weakening it. — [arXiv v5](https://arxiv.org/html/2505.07078v5)

### Inferences
- This is the strongest long-horizon evidence available. Its result is that published LLM timing agents don't beat buy-and-hold on a risk-adjusted basis. Cheap baselines such as ARIMA and buy-and-hold on a low-volatility universe beat them.
- Even with leakage pushing results in the LLMs' favor, they still lose. A clean test is therefore unlikely to look better.
- The comparison covers only FinMem and FinAgent with GPT-4o-class models. Frontier models from 2026 aren't tested over 20 years, and that kind of test is impossible without leakage.

### Gaps
- The abstract says "100+ symbols", but each composite selector uses 63-91 distinct symbols. The total across selectors probably exceeds 100, but I couldn't confirm the union count.
- Number of runs and seeds per LLM agent: not visible in the pages I read; it may be in appendices C-G.
- FinAgent's backbone LLM is not stated in the text I read.

## 2. Benchmarks: StockBench, InvestorBench, FinBen, Agent Market Arena, LiveTradeBench, AI-Trader, CLQT and other 2025-2026 live or contamination-free benchmarks

### Takeaway
Live and post-cutoff benchmarks use short windows of 2-12 months and few names. Most ignore transaction costs and run only 1-3 seeds. Within those limits, results range from roughly matching buy-and-hold to losing to it. Model rank shows little relation to general LLM capability. The agent scaffold (framework or structured mode) matters more than the backbone model. No benchmark shows durable outperformance of the cap-weighted index.

### Cited Findings
- **StockBench** (Tsinghua and BUPT; arXiv 2510.02209, v2 2 Mar 2026) [PREPRINT]
  - Setup: a contamination-free window of 3 Mar to 30 Jun 2025 (82 trading days), the top 20 DJIA stocks by weight, $100k starting cash, 13 LLMs, 3 seeds per agent. News is limited to the prior 48 hours.
  - No transaction costs, slippage or liquidity costs are modeled.
  - The passive baseline returned 0.4% with max drawdown -15.2% and Sortino 0.0155. The best agents returned about 1.9-2.5%: Qwen3-235B-Think 2.5%, Qwen3-235B-Ins 2.4%, Kimi-K2 1.9% (Sortino 0.042). GPT-5 returned 0.3%, below the baseline, and GPT-OSS-20B returned -2.8%.
  - Every agent underperformed the baseline in the Jan-Apr downturn and outperformed it in the May-Aug upturn.
  - Performance degrades as the universe grows. Reasoning models are not consistently better.
  - The paper contradicts itself: the abstract says "most models struggle to outperform" the baseline, while Section 3.2 says most outperform.
  - Source: [StockBench arXiv v2](https://arxiv.org/html/2510.02209v2)
- **InvestorBench** (Li et al., arXiv 2412.18174) [PEER-REVIEWED, ACL 2025 main, Long Papers]
  - Covers single-asset tasks on stocks, crypto and ETFs with 13 LLM backbones.
  - Finding: proprietary and larger open models tend to earn better returns, but all models struggle in highly volatile markets.
  - Uses buy-and-hold as the passive baseline, per a third-party listing that I did not verify against the paper.
  - Source: [ACL Anthology author page](https://aclanthology.org/people/yueru-he); [arXiv](https://arxiv.org/html/2412.18174v1); [benchmarklist (unverified)](https://benchmarklist.com/benchmarks/investorbench/)
  - CLQT notes that InvestorBench has no cost modeling and no point-in-time enforcement. — [CLQT](https://arxiv.org/html/2606.29771v1)
- **Agent Market Arena** ("When Agents Trade", Qian et al., 17 authors; arXiv 2510.11695, v2 30 Oct 2025) [PREPRINT]
  - A live, lifelong benchmark across crypto and stocks. It tests 4 agents (InvestorAgent, TradeAgent, HedgeFundAgent, DeepFundAgent) on GPT-4o, GPT-4.1, Claude-3.5-haiku, Claude-sonnet-4 and Gemini-2.0-flash.
  - Main finding: the agent framework drives behavior, from aggressive to conservative, much more than the backbone model does.
  - Source: [arXiv abs](https://arxiv.org/abs/2510.11695)
- **LiveTradeBench** (Yu, Li, You, UIUC; arXiv 2511.03628, Nov 2025) [PREPRINT]
  - Live, 50 trading days (18 Aug to 24 Oct 2025), 21 LLMs.
  - Universe: 15 US large caps plus cash, and 10 Polymarket markets.
  - No fees, spreads or slippage are modeled, and there is no significance testing.
  - Best stock results: GPT-4.1 CR 6.25% (Sharpe 2.64) and o3 CR 6.04%. On Polymarket, some models lost 53-58%.
  - The LMArena score does not predict trading results (Spearman 0.054 for stocks, -0.38 for Polymarket). Cross-market Sharpe correlation is about zero, and reasoning models did not outperform.
  - I did not find a buy-and-hold or SPY baseline in the main text I read.
  - Source: [LiveTradeBench arXiv](https://arxiv.org/html/2511.03628v1)
- **AI-Trader** (University of Hong Kong; arXiv 2512.10971, Dec 2025) [PREPRINT]
  - A fully automated, live, data-uncontaminated benchmark covering US stocks, China A-shares and crypto, with 6 LLMs at multiple frequencies.
  - Finding: most agents had poor returns and weak risk management. Excess returns came more easily in highly liquid markets, and risk control determined robustness across markets.
  - Source: [econpapers listing](https://econpapers.repec.org/paper/arxpapers/2512.10971.htm); [hyper.ai summary](https://hyper.ai/en/papers/2512.10971)
- **CLQT** (Bo Qu and Mingguang Chen; arXiv 2606.29771, 29 Jun 2026) [PREPRINT]
  - Design: closed-loop, cost-aware (four market-impact models, including square-root and Almgren-Chriss, plus financing) and point-in-time. Agents start with $1M NAV on an S&P 100-derived universe of 72 symbols.
  - Backtest: 26 bi-weekly rounds from Jun 2025 to Jun 2026. Live track: 9 days in Jun 2026.
  - Reliable structured runs beat a median of about 6 of 8 passive baselines, but those are mostly bonds, risk parity, equal-weight and 60/40. The authors state that agents do not clearly beat the cap-weighted index. Autonomous (less scaffolded) runs beat only 1 of 8.
  - The noise floor across repeated runs is about ±0.42 Sharpe. The highest Sharpe (9.82) rested on only 5 rounds and was judged an artifact.
  - Source: [CLQT arXiv](https://arxiv.org/html/2606.29771v1)
- **PolyBench** (arXiv 2604.14199, 2026) [PREPRINT]: tested on live Polymarket data across 38,666 binary markets. Only 2 of 7 models earned positive returns. — [PolyBench arXiv](https://arxiv.org/html/2604.14199) (search snippet only, not fetched)

### Inferences
- These benchmarks are too short to settle the long-horizon question. Their windows run 50 days to about 12 months, and CLQT's noise floor (about ±0.42 Sharpe) is larger than most gaps between models and baselines.
- The pattern from StockBench is consistent with FINSABER. Agents lose more than buy-and-hold in downturns and lag or match it in upturns, so the "outperformance" is mostly beta and timing within a single regime.
- Scaffolding (structured mode, framework choice) matters more than which frontier model sits underneath. A disciplined, rule-constrained harness is a better lever than chasing the newest model.

### Gaps
- FinBen (the trading task within the FinBen/PIXIU suite): I did not retrieve its results within the tool budget. It needs a separate lookup.
- Agent Market Arena: I did not retrieve the exact live period, asset list or numbers against buy-and-hold. They are in the full PDF, not the abstract.
- AI-Trader: no buy-and-hold figures retrieved.
- InvestorBench: per-model returns, test windows and cost assumptions were not verified.
- No live benchmark I found has run for more than about 12 months, so true long-horizon live evidence does not exist yet.

## 3. Look-ahead bias, training-data leakage, survivorship and selection bias

### Takeaway
Pretrained LLMs memorize market history: GPT-4o recalls pre-cutoff S&P 500 levels at 0.61% error. Agent backtests run inside the training window are inflated. Returns and Sharpe of published agents fall by about 50-70% once the test moves past the cutoff. Prompting the model to ignore the future and masking company names do not fix this. The fixes are post-cutoff or live evaluation and chronologically consistent (point-in-time) models.

### Cited Findings
- **"The Memorization Problem"** (Lopez-Lira, Tang, Zhu; arXiv 2504.14765, latest version 24 Aug 2026) [PREPRINT]
  - Model tested: GPT-4o, cutoff Oct 2023.
  - S&P 500 recall: pre-cutoff MAPE 0.61% with 80.58% directional accuracy. Post-cutoff MAPE 16.87% with 45.70% directional accuracy.
  - WSJ headline dating: exact-date accuracy 47.03% before the cutoff vs 7.86% after.
  - Instructions to ignore post-cutoff data fail. With a fake pre-2010 cutoff, post-cutoff accuracy stayed at 98%, which the authors call implausible.
  - Masking fails. The model identified anonymized earnings calls for Apple, Meta and Microsoft 100% of the time, and every Magnificent 7 firm more than 85% of the time.
  - Recommendations: make post-cutoff data the primary analysis, treat any memorization test as a lower bound, and avoid pre-cutoff use for judgment tasks such as sentiment and forecasting.
  - Source: [arXiv 2504.14765v2](https://arxiv.org/html/2504.14765v2)
- **"Profit Mirage"** (Li, Zeng, Xing, Xu, Xu; arXiv 2510.07920, 9 Oct 2025) [PREPRINT]
  - Setup: NASDAQ-100 universe with a GPT-4o backbone (cutoff Oct 2023). The backtest window is Q2-Q3 2021, where the market returned +13.79%. The post-cutoff window is Q3-Q4 2024, at +13.35%.
  - Agents tested: FinMem, FinAgent, QuantAgent, FinCON and TradingAgents.
  - Sharpe decayed 51-62% and total return decayed 50-72%; FinMem's total return fell 71.85%.
  - FinLake-Bench QA: GPT-4o, Claude-3.7 and Grok-3 answered 2022-H1 2023 price, trend and event questions with 85-93% accuracy.
  - Caveat: the paper also promotes its own FactFin method, and its "leakage-robust" QA window overlaps the models' training data.
  - Source: [arXiv 2510.07920](https://arxiv.org/html/2510.07920v1)
- **Look-Ahead-Bench** (Mostapha Benhenda; arXiv 2601.13770, 20 Jan 2026) [PREPRINT]
  - Setup: the open-source AI Hedge Fund agent framework, trading 5 mega-cap tech stocks.
  - Periods: P1 (Apr-Sep 2021, in-sample) with B&H +25.32%, and P2 (Jul-Dec 2024, out-of-sample) with B&H +24.75%.
  - DeepSeek 3.2 had P1 alpha of +20.73pp and the worst alpha decay, -21.77pp. Standard LLMs decayed by more than 15pp.
  - A simple 3-month momentum baseline earned +7.96pp alpha in P1 and +5.75pp in P2, decaying only 2.21pp.
  - Proprietary point-in-time "Pitinf" models (the author's affiliation/vendor, PiT-Inference) were stable.
  - Caveat: the benchmark has a commercial conflict of interest, a tiny universe and 6-month windows.
  - Source: [arXiv 2601.13770](https://arxiv.org/pdf/2601.13770)
- **Glasserman & Lin** (Columbia; arXiv 2309.17322, Sep 2023) [PREPRINT]
  - The paper splits bias into look-ahead (knowing the outcome) and distraction (general knowledge of a firm interfering with sentiment reading).
  - Anonymized headlines outperformed in-sample, especially for large firms, so distraction was the bigger effect there.
  - Out of sample, look-ahead is not a concern, but distraction remains. The authors suggest anonymization even when trading live.
  - Source: [arXiv 2309.17322](https://arxiv.org/abs/2309.17322); [IDEAS](https://ideas.repec.org/p/arx/papers/2309.17322.html)
- **Chronologically consistent models: ChronoBERT and ChronoGPT** (He, Lv, Manela, Wu, WashU; arXiv 2502.21206) [PREPRINT, AEA 2026 program]
  - Models are trained only on text available at each date. Weights are on Hugging Face as manelalab/chrono-gpt.
  - In a test predicting next-day returns from news, their real-time Sharpe was comparable to a much larger Llama. The authors conclude that look-ahead bias is modest for that task.
  - A follow-up instruction-tuned family was released as arXiv 2510.11677.
  - Source: [arXiv 2502.21206](https://arxiv.org/html/2502.21206v2); [AEA 2026](https://www.aeaweb.org/conference/2026/program/paper/BrRDGQHe); [HF model card](https://huggingface.co/manelalab/chrono-gpt-v1-20111231/blob/main/README.md)
- Other time-sliced or point-in-time models cited in the literature: Time Machine GPT (Drinkall et al. 2024) and DatedGPT (Yan & Tang 2026). — [Look-Ahead-Bench related work](https://arxiv.org/pdf/2601.13770)
- Other mitigations:
  - Merchant & Levy (arXiv 2512.06607) adjust logits at inference time using small "forget" and "retain" models. — [arXiv 2512.06607](https://arxiv.org/html/2512.06607v1)
  - FinCAD (arXiv 2605.24564, May 2026) uses context-aware decoding against "parametric look-ahead bias". — [arXiv 2605.24564](https://arxiv.org/pdf/2605.24564)
  - Gao et al. (2025) propose a test based on Lookahead Propensity (LAP), built on membership inference. — [Look-Ahead-Bench related work](https://arxiv.org/pdf/2601.13770)
- Sarkar & Vafa (2024), "Lookahead bias in pretrained language models": cited as showing that models recognize firms from contextual clues even when identifiers are masked. — [Look-Ahead-Bench related work](https://arxiv.org/pdf/2601.13770)
- **Survivorship and selection bias:** FINSABER shows that earlier agent papers used narrow windows and a handful of hand-picked mega-caps (TSLA, NFLX, AMZN, MSFT). Their conclusions reverse on universes that include delisted names and use rolling reselection. The choice of selector alone moves buy-and-hold Sharpe from 0.315 to 0.703. — [FINSABER v5](https://arxiv.org/html/2505.07078v5)
- StockBench gives a concrete example: GPT-5 described AAPL's 2021 trend correctly without search, which is why the authors chose a post-cutoff window. — [StockBench](https://arxiv.org/html/2510.02209v2)

### Inferences
- Any LLM agent backtest that overlaps the model's training window should be treated as uninformative about skill, whatever prompt hygiene was used.
- A practitioner running frontier models today can only get honest evidence from forward or live paper trading, or from carefully post-cutoff windows. That forward record accumulates slowly, which is why long-horizon claims for modern LLMs are currently untestable.
- Mega-cap tech names are the worst case for leakage: the most memorized and the most frequently chosen. They are also the default universe in most agent papers.

### Gaps
- I did not fetch the primary text of Sarkar & Vafa 2024 or of Somoza et al. (Economics Letters 2025). The Somoza finding is from a search snippet: smaller models and finer data granularity show negligible bias. — [ESSEC listing](https://faculty.essec.edu/research/16148-ais-predictable-memory-in-financial-analysis)
- I found no independent replication of the Pitinf claims.

## 4. LLMs as components (news, sentiment, earnings calls) vs end-to-end traders

### Takeaway
The more credible positive evidence is for LLMs as text-to-signal components: headline scoring and news embeddings feeding a conventional cross-sectional or long-short portfolio. That evidence comes with caveats. Returns are concentrated in small stocks and negative news, and they decay as LLM adoption spreads. Even post-cutoff, distraction effects persist. The best-known end-to-end claim from financial statements has been withdrawn.

### Cited Findings
- **Lopez-Lira & Tang**, "Can ChatGPT Forecast Stock Price Movements?" (arXiv 2304.07619; v1 Apr 2023, v6 28 Oct 2025; previously on SSRN) [PREPRINT on arXiv]
  - v6 acknowledges an editor and two referees, suggesting journal review, but no journal reference is listed.
  - Using headlines after the knowledge cutoff, GPT-4 captures the initial market reaction with about 90% portfolio-day hit rates on that move, which is not tradable.
  - GPT-4 scores significantly predict subsequent drift, especially in small stocks and negative news. Ability rises with model size.
  - Strategy returns fall as LLM adoption rises, consistent with improved price efficiency.
  - v1 reported that GPT-1, GPT-2 and BERT could not forecast returns.
  - Source: [arXiv abs v6](https://arxiv.org/abs/2304.07619v6); [search summary](https://arxiv.org/abs/2304.07619v1)
- **Chen, Kelly, Xiu, "Expected Returns and Large Language Models"** (working paper, 2023-2024 seminars) [PREPRINT/working paper]
  - Contextual LLM embeddings of news, from models such as BERT, RoBERTa, OPT and LLaMA depending on the version, predict returns better than technical signals and bag-of-words sentiment. Gains are largest for articles with negation or complex narratives.
  - The paper covers 16 international markets with news in 12-13 languages.
  - Source: [Sydney seminar](https://business.sydney.edu.au/events/research/2024/finance/dacheng-xiu); [ANU seminar](https://rsfas.anu.edu.au/node/21554); [ESSEC webinar](https://essec-amundi-chair.essec.edu/webinars/webinar-1-september-2024)
  - A 2026 follow-up uses LLM embeddings for supply-chain propagation of text signals in the cross-section. — [arXiv 2606.29290](https://arxiv.org/pdf/2606.29290)
- **ChronoBERT and ChronoGPT** show that next-day news-return predictability survives with leakage-free models, at Sharpe comparable to Llama. So the news-signal channel is not purely an artifact of look-ahead. — [arXiv 2502.21206](https://arxiv.org/html/2502.21206v2)
- **Kim, Muhn, Nikolaev**, "Financial Statement Analysis with Large Language Models" (Chicago Booth; arXiv 2407.17866) [WITHDRAWN]
  - Claimed that GPT-4 beats analysts at predicting the direction of earnings changes, and that strategies built on it achieve higher Sharpe and alpha.
  - The arXiv v3 (Feb 2025) was withdrawn after a co-author found inconsistencies in data and analyses during replication.
  - Source: [arXiv 2407.17866v3](https://arxiv.org/abs/2407.17866v3)
- **Earnings calls:** the Memorization Problem paper shows that anonymized earnings calls are re-identified, the Magnificent 7 at more than 85%. Any pre-cutoff earnings-call study is suspect. — [arXiv 2504.14765v2](https://arxiv.org/html/2504.14765v2)
- **StockBench ablation:** removing news and fundamentals cut Kimi-K2's return from 1.9% to 0.6%. Text inputs do contribute inside agents, though over a tiny sample. — [StockBench](https://arxiv.org/html/2510.02209v2)
- **LiveTradeBench:** news was the rationale agents cited most, ahead of price history. — [LiveTradeBench](https://arxiv.org/html/2511.03628v1)

### Inferences
- The durable-value case is narrow. LLMs serve as feature extractors (sentiment, event classification, embeddings) inside a disciplined, diversified, cost-aware portfolio, evaluated post-cutoff. They have not been shown to work as discretionary end-to-end timers of a few mega-caps.
- The edge lives where trading is costly (small caps, negative news and short sales) and is being arbitraged away as adoption rises. Net-of-cost and capacity-adjusted numbers are the open question.

### Gaps
- I did not retrieve exact Lopez-Lira & Tang sample periods, the size of the decline over time, or net-of-cost results. Final journal status is unconfirmed.
- I found no rigorous peer-reviewed study of LLM earnings-call signals that used only post-cutoff data within the tool budget.
- I did not confirm whether the Kim, Muhn, Nikolaev review has concluded.

## 5. Recommended evaluation protocol (time splits, costs, runs/seeds, benchmarks)

### Takeaway
Across papers, the recommendations converge:
- Test only outside the training window, or live.
- Use long, multi-regime horizons with survivorship-free, rolling-reselected universes.
- Benchmark against buy-and-hold, cap-weighted and equal-weight portfolios, and simple quant rules such as momentum, SMA and ARIMA, plus a random control.
- Model real costs.
- Use repeated runs with a reported noise floor, and report risk-adjusted metrics, alpha tests and regime breakdowns.

### Cited Findings
- **FINSABER:**
  - Use historically accurate constituent lists that include delisted names, and rolling windows with reselection.
  - Horizons: at least 3 years for daily strategies and 10-20+ years for weekly or monthly strategies.
  - Report AR, CR, volatility, max drawdown, Sharpe and Sortino, plus CAPM alpha/beta and regime splits.
  - Include traditional benchmarks beyond buy-and-hold.
  - Source: [FINSABER v5](https://arxiv.org/html/2505.07078v5)
- **Memorization Problem:**
  - Post-cutoff tests should be the primary analysis, with enough statistical power.
  - Test each setting for memorization and treat a pass as a lower bound.
  - Prefer chronologically consistent models.
  - Do not trust "ignore the future" prompts or entity masking.
  - Source: [arXiv 2504.14765v2](https://arxiv.org/html/2504.14765v2)
- **Look-Ahead-Bench:**
  - Use a dual-period design (in-sample vs out-of-sample with similar buy-and-hold returns) and measure alpha decay.
  - Baselines: B&H, equal-weight monthly rebalance, 3-month momentum, 3-month mean reversion, 50/100 MA crossover, and a random-weights control.
  - Source: [arXiv 2601.13770](https://arxiv.org/pdf/2601.13770)
- **CLQT:**
  - Enforce point-in-time access with a hash-chained audit trail.
  - Use cost tiers calibrated to broker paper fills, including square-root and Almgren-Chriss impact and financing.
  - Run repeated runs and report the noise floor (about ±0.42 Sharpe).
  - Use a cross-family judge.
  - Flag contamination when backtest Sharpe exceeds live Sharpe by more than about 0.2.
  - Report a capability profile rather than a single leaderboard number.
  - Source: [CLQT](https://arxiv.org/html/2606.29771v1)
- **Observed practice falls short:**
  - StockBench used 3 seeds and no costs.
  - LiveTradeBench used 50 days, no costs and no significance tests.
  - FINSABER used only a flat commission and no slippage.
  - Sources: [StockBench](https://arxiv.org/html/2510.02209v2); [LiveTradeBench](https://arxiv.org/html/2511.03628v1); [CLQT Table 1](https://arxiv.org/html/2606.29771v1)

### Inferences
- A practical protocol for a live agent:
  - Forward-only paper or live record.
  - Benchmark against SPY or a cap-weighted universe, an equal-weight universe, and a momentum rule on the same universe.
  - Report net of realistic costs.
  - Track Sharpe gaps against a noise floor of about ±0.4 per year-scale sample before claiming skill.
  - Break out results by regime (up and down months).
  - Expect to need years of forward data before any claim of beating buy-and-hold is statistically meaningful.
- A useful internal check is the ratio of drawdown in down-regime months to capture in up-regime months. The documented LLM failure mode is lagging in rallies while taking full losses in selloffs.

### Gaps
- None of the sources gives a formal power calculation for the minimum track-record length needed to detect a given Sharpe difference for LLM agents.
- FinBen's recommended trading protocol was not retrieved.

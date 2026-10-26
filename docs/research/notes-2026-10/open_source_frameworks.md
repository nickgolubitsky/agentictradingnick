# Open-source LLM / multi-agent stock trading frameworks (state as of 2026-10-25)

Method note: GitHub stats below were pulled live from the GitHub REST API on 2026-10-25 (stars, forks, open_issues = issues+PRs, last push, license). READMEs were read from each repo's HEAD on the same day. Paper claims come from arXiv. "Self-reported" means the authors' own backtest with no independent replication found.

## 1. Architecture, data, decision loop, risk controls, and execution, per framework

### Takeaway
Nearly every framework copies the "trading firm" shape: parallel analysts, then a bull/bear debate, then a trader, then a risk review or portfolio manager. Almost none send real orders. The two most-starred projects (TradingAgents, ai-hedge-fund) produce ratings or paper fills only. Real broker execution exists mainly in newer agent-runtime projects (Vibe-Trading: Alpaca live orders behind an order gate, plus read-only IBKR/Robinhood) and a few research labs (AgenticTrading: Alpaca + Robinhood adapters). The best newer code has converged on one pattern: the LLM emits a bounded signal, and deterministic code owns sizing, limits, costs and the ledger.

### Cited Findings

**Repo snapshot (GitHub API, 2026-10-25)**
- TauricResearch/TradingAgents: 114,789 stars, 22,144 forks, 151 open issues+PRs, last push 2026-10-16, Apache-2.0, created 2024-12-28 — [GitHub API](https://api.github.com/repos/TauricResearch/TradingAgents)
- virattt/ai-hedge-fund: 64,260 stars, 11,278 forks, 183 open, last push 2026-10-24, MIT — [GitHub API](https://api.github.com/repos/virattt/ai-hedge-fund)
- AI4Finance-Foundation/FinRobot: 8,311 stars, 77 open, last push 2026-10-24, Apache-2.0 — [GitHub API](https://api.github.com/repos/AI4Finance-Foundation/FinRobot)
- AI4Finance-Foundation/FinGPT: 21,469 stars, 53 open, last push 2026-10-25, MIT — [GitHub API](https://api.github.com/repos/AI4Finance-Foundation/FinGPT)
- AI4Finance-Foundation/FinRL (DRL, not LLM): 16,819 stars, 310 open, last push 2026-10-25, MIT — [GitHub API](https://api.github.com/repos/AI4Finance-Foundation/FinRL)
- pipiku915/FinMem-LLM-StockTrading: 967 stars, last push **2024-08-18** (stale), MIT — [GitHub API](https://api.github.com/repos/pipiku915/FinMem-LLM-StockTrading)
- DVampire/FinAgent: 76 stars, last push **2024-08-31** (stale), MIT — [GitHub API](https://api.github.com/repos/DVampire/FinAgent)
- The-FinAI/FinCon: 70 stars, 6 forks, last push 2026-10-08, MIT — [GitHub API](https://api.github.com/repos/The-FinAI/FinCon)
- HKUDS/Vibe-Trading: 36,697 stars, 24 open, last push 2026-10-25, MIT, **created 2026-04-01** (fastest-growing new entrant) — [GitHub API](https://api.github.com/repos/HKUDS/Vibe-Trading)
- hsliuping/TradingAgents-CN: 32,492 stars, 296 open, last push 2026-09-22, hybrid license (Apache-2.0 core + proprietary source-available app layer) — [GitHub API](https://api.github.com/repos/hsliuping/TradingAgents-CN); [README](https://github.com/hsliuping/TradingAgents-CN)
- HKUDS/AI-Trader: 22,956 stars, last push 2026-06-11, no license detected by the API — [GitHub API](https://api.github.com/repos/HKUDS/AI-Trader)
- simonlin1212/TradingAgents-astock (A-share TradingAgents fork): 3,792 stars, Apache-2.0, pushed 2026-10-25 — [GitHub search API](https://api.github.com/search/repositories?q=llm+trading+agent+created:>2025-01-01&sort=stars)
- TradeMaster-NTU/TradeMaster (RL platform from FinAgent's lab): 3,110 stars, last push 2025-06-04 — [GitHub API](https://api.github.com/repos/TradeMaster-NTU/TradeMaster)
- wquguru/nof0 (open reproduction of the nof1 Alpha Arena): 2,754 stars, last push 2025-12-07 — [GitHub search API](https://api.github.com/search/repositories?q=llm+trading+agent+created:>2025-01-01&sort=stars)
- ginlix-ai/LangAlpha ("Claude Code for Financial Market"): 2,126 stars, Apache-2.0, pushed 2026-10-26 — [GitHub search API](https://api.github.com/search/repositories?q=llm+trading+agent+created:>2025-01-01&sort=stars)
- Open-Finance-Lab/AgenticTrading: 785 stars, 128 open, pushed 2026-10-23 — [GitHub API](https://api.github.com/repos/Open-Finance-Lab/AgenticTrading)
- FinStep-AI/ContestTrade: 680 stars, last push 2025-12-22, Apache-2.0 — [GitHub API](https://api.github.com/repos/FinStep-AI/ContestTrade)
- Y-Research-SBU/QuantAgent now redirects to Y-Research-SBU/QuantHarness ("Price-Driven Multi-Agent LLMs for High-Frequency Trading", arXiv 2509.09995) — [GitHub API redirect](https://api.github.com/repos/Y-Research-SBU/QuantAgent); [README](https://github.com/Y-Research-SBU/QuantHarness)

**TradingAgents (Tauric Research; paper arXiv 2412.20138)**
- Roles: Fundamentals, Sentiment (StockTwits/Reddit/headlines), News (global news + macro), and Technical (MACD, RSI, etc.) analysts run in parallel. Bull and bear researchers then debate, a Trader proposes timing and size, a risk-management team debates, and a Portfolio Manager approves or rejects. "If approved, the order will be sent to the simulated exchange" — no live broker — [README](https://github.com/TauricResearch/TradingAgents)
- Two model tiers: a "quick" model serves analysts, researchers, debaters and trader, and a "deep" model serves the research and portfolio managers. Each tier can use a different provider (since v0.6.0, 2026-10). Debate and risk rounds are configurable (`max_debate_rounds`, `TRADINGAGENTS_MAX_RISK_ROUNDS`) — [README](https://github.com/TauricResearch/TradingAgents)
- Memory/reflection: an always-on markdown decision log (`~/.tradingagents/memory/trading_memory.md`). On later runs it "settles" each past decision whose holding period has passed, computes raw return and alpha vs a regional benchmark, and writes a one-paragraph reflection. The PM reads recent same-ticker decisions plus cross-ticker lessons — [README](https://github.com/TauricResearch/TradingAgents)
- Cadence: one `propagate(ticker, date)` call yields one decision for one ticker on one date. Portfolio-aware runs (pass your holdings) came in v0.5.0 (2026-09). A backtest grid runner scores decisions "on realized alpha… entered at the first close after its date" (v0.7.0, 2026-10) — [README](https://github.com/TauricResearch/TradingAgents)
- Data sources in the current README: yfinance/Yahoo, Alpha Vantage, SEC EDGAR fundamentals "as filed" (v0.5.0), FRED macro, Polymarket, StockTwits, Reddit, and optional TypeSafe "Jev" post screening — [README](https://github.com/TauricResearch/TradingAgents)
- Data sources in the paper: Bloomberg, Yahoo, EODHD, FinnHub, Reddit, X/Twitter, SEDI insider transactions, and 60 technical indicators — [arXiv v7 HTML](https://arxiv.org/html/2412.20138)
- Correctness history (self-reported in the changelog): v0.3.1 (2026-07) "Alpha Vantage look-ahead filtering"; v0.4.0 (2026-08) "look-ahead / point-in-time fixes across FRED macro, social sentiment, and the decision-log memory"; v0.5.0 (2026-09) "point-in-time integrity across every dated path"; v0.5.2 "backtests that see only data published by each analysis date" — [README](https://github.com/TauricResearch/TradingAgents)
- README admits news and social sources "still reflect 'now'" even when the analysis date is pinned, so historical runs are not fully point-in-time. It also says earlier reports of "different companies" or fabricated price levels across runs prompted deterministic ticker resolution and a verified price snapshot — [README](https://github.com/TauricResearch/TradingAgents)

**ai-hedge-fund (virattt)** — rewritten into an installable `aihf` app by 2026-10
- README still says "the system does not actually make any trades" and is "educational" only. Modes: **paper trading** ("real market days and fake money", per-session approval step, kill switch, "hash-chained ledger… so NAV is a track record, not a reset") and **backtesting** against a benchmark. Data comes from the Financial Datasets API. LLM providers: Anthropic, OpenAI, DeepSeek, Google, xAI, Kimi, TypeSafe — [README](https://github.com/virattt/ai-hedge-fund)
- Code layout: `signals/` (buffett, druckenmiller, graham, lynch, munger persona LLM agents, plus `pead`, i.e. post-earnings drift), `portfolio/construction.py`, `risk/limits.py`, `brokers/{paper,sim,costs}.py`, `scorecard/` (analyst and strategy scorecards), `paper/ledger.py` — [repo tree via GitHub API](https://api.github.com/repos/virattt/ai-hedge-fund/git/trees/HEAD?recursive=1)
- Risk design: "Conviction requests, risk disposes… the LLM's influence over the book ends at the Signal, and no clamp is ever negotiable." The two hard limits are `max_position_pct` and `max_gross_exposure`. Clamped exposure goes to cash, never to other names, and every clamp is logged as a `ClampEvent` — [risk/limits.py](https://raw.githubusercontent.com/virattt/ai-hedge-fund/HEAD/hedge_fund/risk/limits.py)
- Cost model defaults: 5 bps half-spread per side plus $0.005/share (IBKR fixed). Market impact is "a later addition" — [brokers/costs.py](https://raw.githubusercontent.com/virattt/ai-hedge-fund/HEAD/hedge_fund/brokers/costs.py)
- LLM agent contract: data errors propagate (fail loud). LLM or parse failures **abstain** (signal 0, `abstained=True`). Every prompt+response is persisted, and an unchanged snapshot is never re-billed (prompt cache). A **"blind" backtest mode** withholds ticker, industry, dates and dollar values, so "a backtest can't lean on what the LLM remembers about the company" — [signals/llm_agent.py](https://raw.githubusercontent.com/virattt/ai-hedge-fund/HEAD/hedge_fund/signals/llm_agent.py)

**FinMem (Stevens; arXiv 2311.13743, v1 2023-11-23, v2 2023-12-03, preprint)**
- Single agent with three modules: profiling (agent "character"), layered memory ("layered message processing" with an adjustable "cognitive span"), and decision-making — [arXiv abs](https://arxiv.org/abs/2311.13743)
- Reported TSLA result: train Aug 2021–Oct 2022, test Oct 2022–Apr 2023, cumulative return 61.78% and Sharpe 2.68 vs FinGPT −7.46% / −0.28 (single ticker, ~6-month test, self-reported) — [FinMem PDF via search result](https://arxiv.org/pdf/2311.13743)

**FinAgent (NTU; arXiv 2402.18485, KDD 2024)**
- Multimodal "market intelligence" module (numeric, text, and visual K-line charts), dual-level reflection (low-level on price moves, high-level on past decisions), diversified memory retrieval, and tool augmentation (classic rule-based strategies as tools) — [arXiv](https://arxiv.org/pdf/2402.18485); [KDD24 PDF](https://personal.ntu.edu.sg/boan/papers/KDD24_FinAgent.pdf)
- Claim: 6 datasets (stocks + crypto), beats 9 baselines on 6 metrics, with "92.27% return (a 84.39% relative improvement)" on one dataset (self-reported) — [arXiv](https://arxiv.org/pdf/2402.18485)

**FinCon (arXiv 2407.06567, v3 2024-11-07; NeurIPS 2024 slides on nips.cc)**
- Manager–analyst hierarchy modeled on an investment firm. "Conceptual verbal reinforcement" (CVRF): episodic self-critique updates investment beliefs, which are propagated only to the relevant agents to cut peer-to-peer chatter. Covers single-stock and portfolio tasks — [arXiv abs](https://arxiv.org/abs/2407.06567)
- Portfolio 1 (TSLA, MSFT, PFE): 113.836% CR, Sharpe 3.269, MDD 16.163% vs Markowitz MV 12.636% / 0.614, FinRL-A2C 19.461% / 0.831, equal-weight 9.344% / 0.492 (self-reported, 3 tickers) — [NeurIPS 2024 slides](https://nips.cc/media/neurips-2024/Slides/94352_FOt8cLF.pdf)

**FinRobot / FinGPT (AI4Finance)**
- FinRobot is now "three projects": V0 AutoGen (educational, the whitepaper code), V1 OpenAI Agents SDK equity research, and V2 PydanticAI desktop app ("Production"). V2 runs a lead orchestrator, 5 pipeline agents (Data → Analysis → Modeling → Synthesis → Report) and a Bull ↔ Bear → Judge debate. Motto: "models reason, software computes, agents orchestrate, and systems verify." Focus is equity research reports, not order execution. Trading appears only as V0 notebooks (e.g. `agent_trade_strategist.ipynb`, SMA-crossover tuning) — [README](https://github.com/AI4Finance-Foundation/FinRobot)
- FinGPT is described by FinRobot's README as the "single-model paradigm" (fine-tuned finance LLMs, e.g. sentiment and forecaster), in contrast to FinRobot's agentic workflows — [FinRobot README](https://github.com/AI4Finance-Foundation/FinRobot)

**Vibe-Trading (HKUDS, created 2026-04)** — general "personal trading agent" runtime with Swarm (multi-agent), MCP, backtests and live runners
- Brokers named in the README: Alpaca (live orders through an "order gate" that "durably owns every Alpaca submission before the broker write" and recovers lost responses, 2026-08-26), IBKR official MCP (read-only portfolio source, 2026-08-24), Robinhood (read-only account source; "Robinhood options execution remains unavailable"), Futu, Longbridge, Tiger (paper/live SDKs), Binance, OKX — [README](https://github.com/HKUDS/Vibe-Trading)
- Safety features: kill-switch cancel-and-flatten sweep that survives restarts and "stops trusting a flaky broker" (2026-08-27/29); live runners with "configurable cadence and persistent daily usage budgets" for LLM spend (2026-10-15); a "grounding gate" that blocks unverified numbers in answers (2026-09-05/15); hashed run cards for backtests (2026-09-27) — [README](https://github.com/HKUDS/Vibe-Trading)
- Its changelog doubles as a catalogue of LLM-trader failure modes, all self-reported:
  - a live gate that "refused every real order while its tests passed" (2026-09-17)
  - an MCP order gate that sized a limit order off the quote, so a limit at 2x market could fill at 2x (2026-09-06)
  - a broker reply "in the wrong shape that counted as an empty account" (2026-09-13)
  - loaders that "booked dividends as losses" (2026-09-02)
  - options signals filled at the same bar's close, giving "phantom edge in every options backtest" (2026-09-01)
  - a momentum factor "that read today's price" (2026-09-30)
  - a model-invented price that passed the grounding check in English (2026-09-05)

  Source: [README](https://github.com/HKUDS/Vibe-Trading)
- Release cadence: v0.1.17 (2026-10-21) had "638 commits and 228 merged pull requests since 0.1.16… from 33 contributors"; v0.1.18 followed on 2026-10-22 — [README](https://github.com/HKUDS/Vibe-Trading)

**Other newer frameworks**
- TradingAgents-CN: A-share adaptation of TradingAgents. Roadmap v1.0 multi-agent single-stock and batch analysis, v2.0 "research loop" with position analysis and trade review, v2.1 repositioned as "research assistance" for compliance. Includes paper trading. Hybrid license: `app/`, `frontend/`, `core/` are proprietary source-available, for personal/evaluation/educational use only — [README](https://github.com/hsliuping/TradingAgents-CN)
- AI-Trader (HKUDS): pivoted from a benchmark (arXiv 2512.10971, Dec 2025) into a hosted "agent-native trading platform" (ai4trade.ai). Agents register by reading a SKILL.md, then publish signals and copy-trade. It offers $100K paper trading and claims broker sync (Binance, Coinbase, IBKR). US price data from Alpha Vantage with a yfinance fallback (2026-06-08). Polymarket paper trading since 2026-03-03 — [README](https://github.com/HKUDS/AI-Trader)
- ContestTrade (arXiv 2508.00554): event-driven stock selection in two stages. A data team of parallel agents distills raw data into "text factors", and a research team of agents, each with a configured "trading belief", outputs up to 5 signals per belief. Internal "contests" pick the factors and signals that survive. Output is "asset allocation suggestions", not orders — [README](https://github.com/FinStep-AI/ContestTrade)
- AgenticTrading / "Agentic Trading Lab" (Open-Finance-Lab): research and education platform. Prototype agents, backtest, inspect decision logs, leaderboard. Layout shows `infrastructure/` with "Alpaca + Robinhood brokers" and execution backends ("backtest live; paper stub") — [README](https://github.com/Open-Finance-Lab/AgenticTrading)

### Inferences
- The "firm org chart" (analysts → bull/bear → trader → risk → PM) is now commodity scaffolding. TradingAgents, FinRobot V2, TradingAgents-CN/astock forks, FinCon, and ContestTrade all use variants. Copying the org chart buys interpretability, not edge.
- The mature projects moved, independently, toward the same shape: LLM → bounded signal or rating → deterministic portfolio construction and hard risk clamps → cost-modeled fill → append-only ledger. ai-hedge-fund's `risk/limits.py` and FinRobot's "software computes" are the clearest statements. For a solo autonomous trader, that layer is the part most worth copying.
- Vibe-Trading's changelog is the best free source of real-execution gotchas: broker error envelopes read as empty accounts, order-gate pricing, kill-switch idempotency, dividend adjustment, and same-bar fills. It is worth reading in full before wiring a broker.
- Older academic repos (FinMem, FinAgent) are effectively unmaintained since 2024. Treat them as idea sources, not code to depend on.

### Gaps
- I did not read FinMem's full paper for the exact memory-tier and decay formulas, or FinCon's CVaR-based risk-control details. The arXiv abstract pages did not include them.
- FinGPT's current (2026) repo contents were not inspected beyond stars and activity.
- No primary source found for Vibe-Trading's or AI-Trader's own performance claims (if any).
- Couldn't confirm the exact agent list of the old (pre-rewrite) ai-hedge-fund or when the rewrite happened. The current tree shows only 5 persona agents plus PEAD.

## 2. Performance claims, how they were measured, and independent replication or criticism

### Takeaway
Every headline number from these frameworks is a self-reported, short-window (3–6 month), few-ticker backtest, mostly with no transaction costs and with LLMs whose training data overlaps the test period. Independent work in 2025–2026 shows the advantages shrink sharply or vanish under longer windows, broader universes, post-cutoff data, and costs: FINSABER (KDD 2026), Profit Mirage (Oct 2025), and The Alpha Illusion (May 2026). Live arenas show mostly losses.

### Cited Findings

**TradingAgents claims (self-reported, 3 tickers, ~3–5 months, no cost model stated)**
- Paper Table 1 TradingAgents rows (CR% / AR% / Sharpe / MDD%):
  - AAPL 26.62 / 30.5 / 8.21 / 0.91
  - GOOGL 24.36 / 27.58 / 6.39 / 1.69
  - AMZN 23.21 / 24.90 / 5.60 / 2.11

  Baselines: Buy&Hold, MACD, KDJ+RSI, ZMR, SMA. Models: gpt-4o-mini / gpt-4o quick, o1-preview deep. No transaction costs are stated — [arXiv v7 HTML (v7, 2025-06-03)](https://arxiv.org/html/2412.20138)
- **Internal inconsistency in the stated window.** v1 (2024-12-28) says the simulation runs "from June 19, 2024, to November 19, 2024" in Simulation Setup, but gives January 1 to March 29, 2024 in the Back Trading section — [arXiv v1 HTML](https://arxiv.org/html/2412.20138v1). v7 states January 1 to March 29, 2024 ("3 months") with identical result numbers — [arXiv v7 HTML](https://arxiv.org/html/2412.20138).
- v1 Buy&Hold AAPL row: −5.23% CR, Sharpe −1.29 — [arXiv v1 HTML](https://arxiv.org/html/2412.20138v1)
- An independent recomputation of AAPL buy-and-hold for 2024-06-20 → 2024-11-19 found **+9.12%** (adjusted close 207.88 → 226.83), not −5.23%. The post also flags Sharpe 8.21 with 0.91% MDD as a likely evaluation artifact. It is a blog post (~Jul 2026), not peer-reviewed — [DEV Community](https://dev.to/trow126/the-most-starred-llm-trading-paper-claims-buy-and-hold-lost-523-it-actually-gained-912-1jj6)
- The authors themselves note the AAPL Sharpe "exceeds their expected empirical range" and say the short window was due to LLM cost — [arXiv v7 HTML](https://arxiv.org/html/2412.20138)
- GitHub issue #203 "Clear look ahead bias" (opened 2025-08-17, closed 2026-03-29): a user replicating AAPL 2024-01-02 → 2024-03-29 with o4-mini/gpt-4o-mini saw real-time information retrieved during the backtest. They suggested this explains why "every day's decision… is 'BUY'" — [Issue #203](https://github.com/TauricResearch/TradingAgents/issues/203)
- Other correctness issues:
  - #805 "Temporal Knowledge Leakage in LLM Backtesting (Model-Level Future Information Contamination)", opened 2026-05-11, still open
  - #1224 "Avoid look-ahead bias in historical sentiment analysis", closed 2026-08-11
  - #1520 "exclude decision-day look-ahead from settlement", closed 2026-10-13

  Source: [GitHub issue search](https://api.github.com/search/issues?q=repo:TauricResearch/TradingAgents+look-ahead+OR+lookahead+OR+leakage)
- The current README disclaims: "Backtest results are not guaranteed to match any published figure… Treat the framework as a research scaffold… not as a strategy with a fixed, replicable return" — [README](https://github.com/TauricResearch/TradingAgents)

**The Alpha Illusion (Ye et al., arXiv 2605.16895v1, 2026-05-16, preprint)**
- Reproduced TradingAgents and QuantAgent for one year (2025-01 → 2026-01) on an equal-weight portfolio of TSLA, NVDA, KO, XOM and MSTR with $100K. "Net" includes commission, token cost, spread, and market impact.
  - TradingAgents portfolio Sharpe went from 0.43 gross to 0.22 net, ending at $106.4K gross / $102.3K net vs buy-and-hold $104.8K.
  - QuantAgent went from −0.96 to −1.15 ($81.4K → $77.9K).
  - Net B&H beat both agents on 4 of 5 tickers.

  Source: [alphaXiv](https://www.alphaxiv.org/abs/2605.16895.md)
- Per-asset TradingAgents (gross → net): TSLA −2.01% → −10.17%; NVDA +16.32% → +11.49%; KO −10.84% → −17.17%; XOM +11.26% → +10.71%; MSTR +17.41% → +16.89% — [alphaXiv](https://www.alphaxiv.org/abs/2605.16895.md)
- "35 of 40 system × friction-component cells are unmodeled" across five reviewed frameworks (FinMem, FinAgent, FinCon, FLAG-Trader, FinBen, etc.). Lists failure modes: temporal contamination, look-ahead, unmodeled frictions, short-window Sharpe uncertainty, researcher degrees of freedom, miscalibrated verbal confidence, numerical execution gaps, parametric prior lock-in, multi-agent non-independence ("debate is not equivalent to aggregating independent experts"), survivorship. Recommends evidence protocols P1–P6 and keeping LLMs as "auditable upstream information interfaces" while separate risk and execution modules hold final authority. Harness: github.com/hj1650782738/Trading — [alphaXiv](https://www.alphaxiv.org/abs/2605.16895.md)

**Profit Mirage (Li et al., arXiv 2510.07920v1, 2025-10-09)**
- Tested FinMem, FinAgent, QuantAgent, FinCon and TradingAgents on GPT-4o (cutoff Oct 2023): pre-cutoff Q2–Q3 2021 vs post-cutoff Q3–Q4 2024 on NASDAQ-100 constituents.
  - Sharpe decay ranged from 51.48% (QuantAgent) to 62.23% (FinCon); TradingAgents' Sharpe fell 55.68%.
  - Total-return decay ranged from 50.18% (TradingAgents) to 71.85% (FinMem).
  - Counterfactual leakage scores were high for FinMem (PC 0.8213) and lowest for TradingAgents (PC 0.6903).

  Source: [arXiv HTML](https://arxiv.org/html/2510.07920v1)
- Caveats noted on reading: the pre- and post-cutoff periods are 3 years apart, the paper's naming is inconsistent (FinLake/FinLeak), and its own FactFin results (e.g. TSLA 165% TR, Sharpe 1.83, Jul 2024–Jun 2025) are again self-reported — [arXiv HTML](https://arxiv.org/html/2510.07920v1)

**FINSABER (Li, Kim, Cucuringu, Ma; arXiv 2505.07078, v1 2025-05-11, v6 2026-06-26; KDD 2026 Datasets & Benchmarks, Oral)**
- Two decades of data and 100+ symbols, with survivorship and data-snooping bias controlled. Previously reported LLM advantages "deteriorate significantly under broader cross-section and over a longer-term evaluation." LLM strategies are too conservative in bull markets (underperform passive) and too aggressive in bear markets (heavy losses). The authors recommend prioritizing trend detection and regime-aware risk controls "rather than adding framework complexity." FinAgent results were corrected in a later revision — [arXiv abs](https://arxiv.org/abs/2505.07078)

**Live or forward tests**
- Alpha Arena Season 1.5 (nof1, US stocks, about two weeks ending early Dec 2025, $320K total, 8 models): only the "mystery model" (Grok 4.20) finished positive, +12.11% on $10K stakes. GPT-5.1 and Gemini 3 placed 2nd and 3rd with losses. The Season 1 winner, Qwen 3 Max, fell to 6th — [ForkLog](https://forklog.com/en/ai-model-grok-4-2-triumphs-in-trading-tournament/amp); [aihola](https://aihola.com/article/grok-wins-alpha-arena-trading). The arena is a raw single-LLM contest, not a framework, and the sample is tiny.
- LiveTradeBench (UIUC, arXiv 2511.03628, Nov 2025): 21 LLMs over 50 live days on US stocks and Polymarket. It found that high LMArena scores do not imply better trading — [arXiv](https://arxiv.org/html/2511.03628v1) (search-summary level only)
- "When Agents Trade" (arXiv 2510.11695, Oct 2025): in live stock and crypto tests, agent frameworks showed distinct behavior while the model backbone mattered less — [arXiv](https://arxiv.org/abs/2510.11695) (search-summary level only)
- AI-Trader benchmark (arXiv 2512.10971, Dec 2025): "most agents exhibit poor returns and weak risk management" across US stocks, A-shares and crypto — [EconPapers](https://econpapers.repec.org/paper/arxpapers/2512.10971.htm) (search-summary level only)

### Inferences
- Treat every framework's headline numbers as unverified marketing. The TradingAgents numbers specifically:
  - rest on 3 tickers over about 3 months with no costs and a pre-cutoff LLM
  - carry contradictory window statements across sections and versions
  - have a disputed buy-and-hold baseline
  - had a documented look-ahead leak in the codebase at the time
- The strongest independent result is negative but nuanced. Over 2025 with costs, TradingAgents roughly matched buy-and-hold (net Sharpe 0.22; ended $102.3K vs B&H $104.8K). That is not alpha, but not a disaster either.
- For a solo builder, the evaluation recipe is the asset: post-model-cutoff windows only, point-in-time data, blind or masked prompts, full friction including token cost, multi-year and broad universe, and a buy-and-hold / regime baseline. That recipe matters more than any framework's architecture.

### Gaps
- No independent replication found for FinCon's NeurIPS numbers or FinAgent's 92.27%, beyond the Profit Mirage aggregate decay figures.
- No published performance record found for ai-hedge-fund (its README makes no return claims). Its 2025 issue #203 "Backtesting result calculation is weird" exists, but I did not read it.
- Could not locate Alpha Arena's official per-model leaderboard page (only press coverage).

## 3. Running costs, latency, model dependence

### Takeaway
No framework publishes an official cost per decision. TradingAgents costs roughly $0.20–$0.80 per ticker per run with gpt-4o/4o-mini and one debate round (vendor estimate), and cost scales linearly with debate rounds, tickers and dates. Model choice changes results materially, and reasoning models make runs non-reproducible.

### Cited Findings
- Railway's deploy page estimates "roughly $0.20–$0.80 per ticker" for one TradingAgents analysis (gpt-4o deep, gpt-4o-mini quick, one debate round). It says doubling debate rounds roughly doubles cost and hosting runs under ~$10/month — [Railway](https://railway.com/deploy/trading-agents) (vendor estimate)
- An API reseller notes a 50-ticker × 20-date sweep is 1,000 `propagate()` calls, so the quick-think model dominates spend — [apisrouter](https://apisrouter.com/financial-agent-api-costs) (vendor, low reliability)
- TradingAgents issues:
  - #291 / #310: news data alone was "6–7k tokens per analysis even with top-5 articles" (closed 2025-11/12)
  - #750: "Zero LLM API prompt cache hit rate due to prompt construction architecture" (open since 2026-05-06)
  - #542: proposes "Let Code Handle Math, Let LLM Handle Interpretation" (closed 2026-04-15)

  Source: [GitHub issue search](https://api.github.com/search/issues?q=repo:TauricResearch/TradingAgents+cost+token+in:title,body+is:issue)
- Latency: v0.5.2 (2026-09) added "parallel analysts for a faster analysis". There is no published wall-clock figure — [README](https://github.com/TauricResearch/TradingAgents)
- Model dependence: the TradingAgents README says "reasoning models (the default GPT-6 family…) vary the most". Temperature is "largely ignored" by the curated reasoning models, so the README recommends non-reasoning models for reproducibility — [README](https://github.com/TauricResearch/TradingAgents)
- The paper itself said it limited the backtest to ~3 months because of LLM cost — [arXiv v7](https://arxiv.org/html/2412.20138)
- ai-hedge-fund caches every prompt+response and never re-bills an unchanged snapshot. Intraday context is "bucketed so quiet bars stay cache hits" — [llm_agent.py](https://raw.githubusercontent.com/virattt/ai-hedge-fund/HEAD/hedge_fund/signals/llm_agent.py)
- Vibe-Trading added per-runner "persistent daily usage budgets" and token-usage views (2026-10-15/17) — [README](https://github.com/HKUDS/Vibe-Trading)
- The Alpha Illusion includes token cost in its net P&L but does not itemize it — [alphaXiv](https://www.alphaxiv.org/abs/2605.16895.md)

### Inferences
- A rough estimate for a multi-stock daily trader on the TradingAgents pattern: 50 tickers × ~$0.20–0.80 is about $10–40/day at gpt-4o-class prices, more with extra debate rounds or deep models on every node. Prompt caching (stable prefix, volatile data last) and content-hash caching are the main levers. This is extrapolated, not measured.
- Debate rounds multiply cost with no independent evidence that they add accuracy. The Alpha Illusion flags debate non-independence.

### Gaps
- No measured tokens-per-decision figure from any maintainer or independent study.
- No latency benchmarks found.

## 4. Licensing and maintenance status

### Takeaway
TradingAgents (Apache-2.0) and ai-hedge-fund (MIT) are actively maintained, with weekly-to-daily commits in Oct 2026. Vibe-Trading (MIT) is the most active codebase. TradingAgents-CN is not fully open source. The academic originals (FinMem, FinAgent) are stale since 2024.

### Cited Findings
- TradingAgents released 7 versions from v0.2.0 (2026-02) to v0.7.0 (2026-10), with a CI gate since v0.3.0 and open look-ahead/data PRs dated 2026-10-25 (#1590, #1593) — [README](https://github.com/TauricResearch/TradingAgents); [issue search](https://api.github.com/search/issues?q=repo:TauricResearch/TradingAgents+look-ahead+OR+lookahead+OR+leakage)
- TradingAgents-CN license: core engine Apache-2.0; `app/`, `frontend/`, `core/` are proprietary source-available for personal, evaluation or educational use, with a separate commercial license — [README](https://github.com/hsliuping/TradingAgents-CN)
- AI-Trader: the API reports no license, though the README shows an MIT badge, so this is unclear — [GitHub API](https://api.github.com/repos/HKUDS/AI-Trader); [README](https://github.com/HKUDS/AI-Trader)
- AgenticTrading license is "NOASSERTION" per the API — [GitHub API](https://api.github.com/repos/Open-Finance-Lab/AgenticTrading)
- Stale repos: FinMem last push 2024-08-18, FinAgent 2024-08-31, TradeMaster 2025-06-04, ContestTrade 2025-12-22 — [GitHub API](https://api.github.com/repos/pipiku915/FinMem-LLM-StockTrading)

### Inferences
- If you vendor code, TradingAgents (Apache-2.0), ai-hedge-fund (MIT) and Vibe-Trading (MIT) are safe to borrow from. Avoid TradingAgents-CN's app layer.

### Gaps
- Did not count correctness-labeled issues per repo; the open_issues counts include PRs.

## 5. What is worth copying vs hype

### Takeaway
Copy the plumbing: point-in-time data contracts, deterministic risk clamps, cost-modeled fills, an append-only ledger, a settle-and-reflect decision log, abstain-on-failure, prompt caching, a kill switch, and an order gate. Be skeptical of the parts that get the stars: persona investors, multi-round debates, and headline Sharpe ratios.

### Cited Findings
- **Worth copying**
  - **Deterministic risk layer** that the LLM cannot override: per-name cap, gross cap, clamps go to cash, and each clamp is logged — [ai-hedge-fund limits.py](https://raw.githubusercontent.com/virattt/ai-hedge-fund/HEAD/hedge_fund/risk/limits.py). Also The Alpha Illusion's recommendation that independent risk and execution modules hold final authority — [alphaXiv](https://www.alphaxiv.org/abs/2605.16895.md)
  - **Fail-loud on data, abstain on LLM failure**, so a broken input never becomes a neutral or empty view — [llm_agent.py](https://raw.githubusercontent.com/virattt/ai-hedge-fund/HEAD/hedge_fund/signals/llm_agent.py). Vibe-Trading hit exactly this bug: a malformed broker reply "counted as an empty account" — [Vibe-Trading README](https://github.com/HKUDS/Vibe-Trading)
  - **Blind backtests** (mask ticker, dates and dollar values) to fight memorization — [llm_agent.py](https://raw.githubusercontent.com/virattt/ai-hedge-fund/HEAD/hedge_fund/signals/llm_agent.py). Leakage evidence for unmasked agents: [Profit Mirage](https://arxiv.org/html/2510.07920v1)
  - **Settle-then-reflect memory log**: score each past decision on realized alpha once its horizon passes, write a short lesson, and feed recent lessons to the PM — [TradingAgents README](https://github.com/TauricResearch/TradingAgents)
  - **Entry at the next close after the decision**, plus point-in-time fundamentals "as filed" — [TradingAgents README](https://github.com/TauricResearch/TradingAgents)
  - **Hash-chained ledger and per-session approval step** — [ai-hedge-fund README](https://github.com/virattt/ai-hedge-fund)
  - **Order gate that durably records intent before the broker write**, plus an idempotent kill switch and daily LLM-spend budgets — [Vibe-Trading README](https://github.com/HKUDS/Vibe-Trading)
  - **Code computes indicators; the LLM only interprets** — [TradingAgents issue #542](https://api.github.com/search/issues?q=repo:TauricResearch/TradingAgents+cost+token+in:title,body+is:issue); FinRobot "models reason, software computes" — [FinRobot README](https://github.com/AI4Finance-Foundation/FinRobot)
  - **Regime-aware risk control and trend detection** over more agents — [FINSABER](https://arxiv.org/abs/2505.07078)
- **Hype or unproven**
  - Headline Sharpe of 5–8 from 3-month, 3-ticker, cost-free backtests — [TradingAgents v7](https://arxiv.org/html/2412.20138); critiqued in [The Alpha Illusion](https://www.alphaxiv.org/abs/2605.16895.md) and on [DEV](https://dev.to/trow126/the-most-starred-llm-trading-paper-claims-buy-and-hold-lost-523-it-actually-gained-912-1jj6)
  - Debate as wisdom-of-crowds: "debate is not equivalent to aggregating independent experts" — [The Alpha Illusion](https://www.alphaxiv.org/abs/2605.16895.md)
  - Verbal LLM confidence used as a probability: miscalibrated — [The Alpha Illusion](https://www.alphaxiv.org/abs/2605.16895.md)
  - Framework complexity over regime awareness — [FINSABER](https://arxiv.org/abs/2505.07078)
  - GitHub stars as evidence: TradingAgents has 114K stars but no published live track record, and its own README calls it a "research scaffold" — [README](https://github.com/TauricResearch/TradingAgents)

### Inferences
- For a fully autonomous multi-stock trader, a defensible design keeps the LLM on bounded jobs: summarizing news, filings and sentiment into structured features or a rating, with a citation for every number. Portfolio construction, sizing, limits, stops, costs and execution stay deterministic and fully logged. Grade decisions against buy-and-hold over windows after the model's cutoff, with all costs.
- Persona investor agents (Buffett, Munger, etc.) are a cheap way to diversify prompts, but no evidence found shows they add out-of-sample value.

### Gaps
- No controlled ablation found that isolates the value of debate rounds, reflection memory, or persona agents on post-cutoff data with costs.

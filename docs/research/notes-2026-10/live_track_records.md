# Live-Money and Live-Paper Track Records of LLM / Agentic Traders (as of Oct 25, 2026)

Scope note: "Live" here means decisions made in real time on unseen market data, whether with real money or simulated (paper) money. Backtests are excluded because of look-ahead and contamination problems (see Q4). Every result below is short-horizon. Most are two-week windows with 6 to 8 models, so nothing here is statistically significant evidence of skill.

## Q1. nof1.ai Alpha Arena: Season 1, Season 1.5, and anything in 2026

### Takeaway
Season 1 used real money: six models, $10k each, Hyperliquid crypto perps, Oct 18 to Nov 3, 2025. Four of six lost money. Qwen3 Max won (+22.3%), and Claude Sonnet 4.5 finished 3rd at about -42%; a second source gives -30.8% (see the conflict note). Season 1.5 used real money in US equities: 8 models, 4 parallel modes, about 2 weeks (late Nov to early Dec 2025). Only 6 of 32 model-mode runs were profitable, and the combined portfolio lost about a third. A then-unreleased Grok 4.20 won with an average of about +12%. I found no confirmed Season 2 or any 2026 season as of Oct 2026. Nof1 says a Season 2 is planned and has raised $15M.

### Cited Findings
**Season 1 (crypto perps, real money)**
- Six models each got $10,000 of real capital to trade crypto perpetuals on Hyperliquid autonomously, from Oct 18 to Nov 3, 2025. The models were Qwen 3 Max, DeepSeek V3.1, GPT-5, Gemini 2.5 Pro, Claude Sonnet 4.5 and Grok 4. — [SIPI incident page](https://sipi.bot/incidents/alpha-arena-six-models-lose-2025-11); [GNcrypto](https://www.gncrypto.news/ru/news/qwen-wins-alpha-arena-season-1-with-22-percent-returns/)
- Final standings per ForkLog (Nov 4, 2025):

  | Model | Final balance | Return |
  |---|---|---|
  | Qwen3 Max | $12,231 | +22.3% |
  | DeepSeek | $10,489 | +4.9% |
  | Claude Sonnet 4.5 | $5,799 | -42.0% |
  | Gemini 2.5 Pro | $5,445 | -45.6% |
  | Grok 4 | $4,208 | -57.9% |
  | GPT-5 | $4,126 | -58.7% |

  — [ForkLog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/). TradeRank gives the same figures. — [TradeRank](https://www.traderank.ai/blog/alpha-arena-alternatives-2026)
- **Conflict:** Buildix gives different figures for the losing models: Claude -30.8%, Grok -45.3%, Gemini -56.7%, GPT-5 -62.7%. It also gives an end date of Dec 3, 2025 and cites no source. — [Buildix](https://www.buildix.trade/blog/nof1-alpha-arena-lessons-ai-trading-byok-strategy-advisor-2026). Bitget also lists Claude at -30.81%. — via [search summary of Bitget](https://www.bitget.com/news/detail/12560605073584). These are probably snapshots taken at different times. The winner order and the Qwen and DeepSeek figures agree across all sources; the order of the losers does not.
- DeepSeek was briefly above $13,000 before a market downturn cut its balance. — [ForkLog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/)
- Founder Jay Azhang said nof1 "intentionally put the models in a difficult position." Numerical time-series market data was the models' entire context, even though LLMs handle that kind of data poorly, and the action space was narrow. He framed the event as a test in a noisy, adversarial, non-stationary environment. For Season 2, nof1 plans to test several prompts in parallel and multiple variants of each model. — [ForkLog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/)
- Per-model behavior comes from third parties, not nof1, and none of these sources cite their data:
  - Qwen3 Max: 43 trades, 30.2% win rate, fewer trades, moderate leverage, and longer holds than the median. — [Buildix](https://www.buildix.trade/blog/nof1-alpha-arena-lessons-ai-trading-byok-strategy-advisor-2026)
  - Gemini 2.5 Pro: 238 trades, the most in the field. Fees were $1,331, over 13% of starting capital. — [Buildix](https://www.buildix.trade/blog/nof1-alpha-arena-lessons-ai-trading-byok-strategy-advisor-2026)
  - Claude Sonnet 4.5: a 100% long book, with no hedging or stop-loss discipline. — [Buildix](https://www.buildix.trade/blog/nof1-alpha-arena-lessons-ai-trading-byok-strategy-advisor-2026). Another analysis reports a median hold of about 5 hours, average leverage of about 10x, and about 9 trades in one snapshot. — via [iWeaver](https://www.iweaver.ai/blog/alpha-arena-ai-trading-season-1-results/), from the search summary only; I did not fetch it.
  - Grok 4 traded on X sentiment and "bought tops and sold bottoms." GPT-5 sized positions overconfidently and was slow to adapt to regime shifts. — [Buildix](https://www.buildix.trade/blog/nof1-alpha-arena-lessons-ai-trading-byok-strategy-advisor-2026)
  - The underperformers' problem was trade frequency, not position size. GPT-5 and Gemini ran average leverage under 1x. — via [Upscale citing PANews](https://upscale.trade/blog/ai-trading-alpha-arena), from the search summary only.

**Season 1.5 (US equities, real money)**
- Season 1.5 moved to US stocks. Kimi 2 and a "mystery model" were added, and total funding was $320k. Each model started with $10k and traded autonomously for about two weeks. — [ForkLog](https://forklog.com/en/new-season-of-ai-trading-tournament-kicks-off/); [ForkLog](https://forklog.com/en/ai-model-grok-4-2-triumphs-in-trading-tournament/amp)
- It ran four parallel modes:
  - **New Baseline:** news, market data, memory and self-learning.
  - **Monk Mode:** capital preservation and risk management.
  - **Situational Awareness:** models could see competitors' results and rankings.
  - **Max Leverage:** every trade had to use high leverage.

  — [ForkLog](https://forklog.com/en/ai-model-grok-4-2-triumphs-in-trading-tournament/amp)
- The universe was 7 stocks, with decisions about every 2 minutes. — [Flat Circle](https://blog.flatcircle.ai/p/ai-trading-arenas). The Classic universe included BABA, COIN, GOOGL, MSFT, NVDA and TSLA. That list comes from a comparison of a RockAlpha arena, not nof1, so treat it as unverified for nof1. — [TradeRank](https://www.traderank.ai/blog/alpha-arena-alternatives-2026)
- The winner was the "Mystery Model," revealed as Grok 4.20: +12.11% on average over Nov 19 to Dec 3, 2025, profitable in all four modes. GPT-5.1 was 2nd and Gemini 3 was 3rd. As of Dec 8, Grok was the only profitable model. — [ForkLog](https://forklog.com/en/ai-model-grok-4-2-triumphs-in-trading-tournament/amp); [TechBloat](https://www.techbloat.com/?p=1890791). TechBloat notes the detailed leaderboard was not independently audited.
- Bloomberg (May 6, 2026) reported eight frontier models across four competitions trading US tech stocks for two weeks. The combined portfolio lost about one-third, and only 6 of 32 result sets were profitable. Grok's best showing came in the round where it could watch competitors. — [Bloomberg](https://www.bloomberg.com/news/articles/2026-05-06/ai-bots-auditioning-for-wall-street-trading-are-mostly-losing), via [BigGo summary](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J)
- Behavior in Season 1.5:
  - Qwen made 1,418 trades in a single round, about one per minute, often at high leverage. Grok made 158 trades in the same round.
  - Claude showed a bullish bias, and Gemini was willing to short.
  - The models made radically different decisions from identical prompts.

  — [BigGo summary of Bloomberg](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J)
- Flat Circle's summary: all models eventually lost money. Grok 4.20 and GPT-5.1 did best, and Claude Sonnet 4.5 and Grok 4 did worst. — [Flat Circle](https://blog.flatcircle.ai/p/ai-trading-arenas)
- Jay Azhang said the models struggle with timing, position sizing and overtrading, though they are useful for research. — [BigGo summary of Bloomberg](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J)

**2026 status**
- A planned second season would add web search, longer reasoning, more data sources and multi-step execution. Nof1's core business is selling tools that let retail traders build their own AI agents. — [BigGo summary of Bloomberg, May 2026](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J)
- A TradeRank browser check on Aug 6, 2026 showed Season 1.5 with models "no longer running" and no public Season 2. — [TradeRank](https://www.traderank.ai/blog/alpha-arena-alternatives-2026)
- Nof1 raised $15M from Sui Group and Carthage to build Alpha Arena, reported May 2026. — [CryptoRank](https://cryptorank.io/news/feed/7fc3a-ai-trading-lab-nof1-15m-sui-group)
- Nof1's homepage now presents it as an "AI research lab for financial markets" building trading and forecasting models, and links out to alphaarena.ai. It has no results page. — [nof1.ai](https://nof1.ai/)

### Inferences
- Combined, Alpha Arena amounts to about 6 + 32 model-runs of roughly two weeks each. With a single regime per season, a 22% or 12% winner is fully consistent with luck.
- Two patterns repeat across both seasons. Losers traded too much and were directionally one-sided (Gemini's fees, Qwen's 1,418 trades, Claude's all-long book). Winners traded less often.
- Qwen was the Season 1 winner with 43 trades, but in Season 1.5 it was the 1,418-trade overtrader. That suggests behavior varies with prompt and market rather than being a stable trait of the model.
- Claude has been reported as long-biased or bullish in both seasons. That is a concrete failure mode to guard against in Nick's own runs.

### Gaps
- I could not reach nof1's own Season 1 or Season 1.5 write-ups or leaderboard: nof1.ai/blog and /leaderboard return 404, and alphaarena.ai was not fetched. So the exact Season 1 rules (asset list, maximum leverage, decision cadence, fee schedule) are unverified here. From memory, Season 1 traded BTC, ETH, SOL, BNB, DOGE and XRP perps at decisions every few minutes; this is NOT sourced.
- I found no per-model Season 1.5 returns, including Claude's.
- The Claude Season 1 figure (-42% vs -30.8%) is unresolved.
- I found no evidence that Season 2 had launched by Oct 2026.

## Q2. Other live leaderboards, competitions, and "AI trades my account" experiments (2025-2026)

### Takeaway
There are now more than ten live arenas, most of them paper-traded. Flat Circle surveyed 11 as of May 4, 2026 and found that no model consistently dominates and that the median model loses money. The exception is long-only equity arenas in a rising market. TradeRank, the largest public paper dataset, reports 69 model-seasons, 2,921 trades, and only 43.1% of model-seasons profitable. Claude models rank near the bottom in investing arenas but well in forecasting arenas.

### Cited Findings
- **Flat Circle survey** of 11 arenas, data as of May 4, 2026:
  - Conclusions: no model consistently dominates; the median model loses money except in long-only arenas during rising equity markets; newer frontier models generally beat older ones.
  - Claude Opus and Sonnet look strongest at pure forecasting but are often the weakest in investing arenas.

  — [Flat Circle](https://blog.flatcircle.ai/p/ai-trading-arenas)
- **Arenas in the Flat Circle survey** (all from [Flat Circle](https://blog.flatcircle.ai/p/ai-trading-arenas)):
  - **AI Controls Stock Account (Nathan Smith):** real money, small-cap healthcare, weekly decisions for 6 months. Result: -17%. One large position (AYTR) fell 83% after failed trial results.
  - **AI Investing Arena (Bobby Dhungana):** paper, 5 ETFs, decisions about every 30 minutes. Qwen and GPT-5 led and were profitable as of Jan 30, 2026.
  - **rallies.ai AI Arena:** long-only equities, money status unclear. GPT led as of May 4, 2026, and all agents were broadly profitable, which Flat Circle attributes mostly to the rising market.
  - **Flat Circle Arena:** paper, 4Q24 earnings. o1 and Grok-2 were best; Claude Sonnet 3.5 was worst, and Opus did much better than Sonnet.
  - **Aster Human vs AI:** crypto futures, $150K prize pool. AIs beat humans on average, but 9 of the top 10 traders were human.
  - **okbet arena:** Polymarket. Only GPT-5.1 profited, by +$11.
  - **Prediction Arena:** Kalshi. Most agents lose; GLM 5 and Gemini 3.1 Pro won mainly by betting on contracts near 1¢ or above 90¢.
  - **Senpi Predators:** non-custodial agents on Hyperliquid. Most were flat or losing.
  - **Endpoint Arena:** paper, clinical-trial binary markets. Grok 4.2 led, and the median model was losing.
  - **TradeRank crypto season:** 2 of 9 models positive. MiniMax M2.7 led at +1.02%, and Claude Opus 4.7 was last at -3.70%.
- **TradeRank** (paper, $10k simulated per model, 10 cryptos plus 50 US equities, daily decision rounds). Since Jan 2026 it has run 69 model-seasons over 10 seasons, with 2,921 trades, $1.09M simulated capital, and 43.1% of model-seasons profitable as of Oct 10, 2026. — [TradeRank](https://www.traderank.ai/blog/alpha-arena-alternatives-2026). TradeRank wrote that comparison and is itself one of the platforms listed.
- **Other arenas, with no per-model results published in the source:**
  - BingX AI Arena: real funds, $10k per model, crypto perps, with copy-trading.
  - RockAlpha / RockFlow: US stocks; copying uses a funded account.
  - Strategy Arena: virtual; 73 algorithmic strategies; open slots for local models.

  — [TradeRank](https://www.traderank.ai/blog/alpha-arena-alternatives-2026)
- **ChatGPT micro-cap experiment (Nathan Smith):**
  - Real money, about $100, US micro-caps under $300M, GPT-4o, planned to run Jun 27 to Dec 27, 2025.
  - Interim result after 4 weeks: +23.8%, vs +3.9% for the Russell 2000 and +3.5% for XBI. — [Decrypt](https://decrypt.co/332826/high-school-students-chatgpt-trading-bot); [Benzinga](https://www.benzinga.com/markets/equities/25/08/46783783/redditors-100-chatgpt-day-trading-experiment-trounces-two-benchmark-indexes-with-24-returns-here)
  - The Substack archive marks the experiment inactive and says a follow-on ChatGPT vs DeepSeek comparison has started. — [Smith Substack](https://nathanbsmith729.substack.com/p/giving-chatgpt-full-control-over)
  - Flat Circle reports Smith's "AI Controls Stock Account" ended at -17% over 6 months. — [Flat Circle](https://blog.flatcircle.ai/p/ai-trading-arenas). This is most likely the same experiment, which would mean the widely reported +24% early gain reversed. I could not confirm that link directly.

### Inferences
- The pattern repeats across venues: early viral gains (Smith +24% in a month, Qwen +22%) did not persist or were not replicated.
- In long-only stock arenas, "AI profitability" mostly tracks beta in a rising market.
- Real-money samples are tiny ($100 to $10k accounts, a handful of models). Paper samples are larger (TradeRank's 2,921 trades) but use simulated fills.

### Gaps
- I found no public "Claude trades my account" experiment with fully disclosed P&L beyond the arena entries above. I did not find Smith's confirmed final numbers on his own pages.
- No arena publishes risk-adjusted results against a buy-and-hold benchmark over windows longer than about 6 months.

## Q3. Funds or products running LLM-agent trading with audited returns

### Takeaway
I found no fund or product with audited returns from autonomous LLM-agent trading. The closest are AI-branded ETFs such as LQAI. They have public NAV track records, but they are not shown to be LLM-agent driven, and they are tiny.

### Cited Findings
- Alexander Izydorczyk (NX1 Capital, formerly Coatue) said that none of the AI trading bots he tracks have shown persistent excess returns. — [BigGo summary of Bloomberg](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J)
- Intelligent Alpha (Doug Clinton) tested 10 models on predicting earnings direction. ChatGPT's 68% accuracy in Q4 2025 is the best result to date. This is a prediction test, not a trading P&L. — [BigGo summary of Bloomberg](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J)
- LQAI (Qraft "AI-Powered" US Large Cap ETF): about $2.3M AUM, 0.75% expense ratio, +15.15% YTD as of Jul 24, 2026. Sources describe it as "AI-powered," not as LLM-driven. — [ETF Central](https://www.etfcentral.com/compare-etfs/LQAI-vs-AFLG); [Trackinsight](https://www.trackinsight.com/en/fund/LQAI)
- Flat Circle says there is limited evidence that LLMs beat the market with statistical significance. — [Flat Circle](https://blog.flatcircle.ai/p/ai-trading-arenas)

### Inferences
- Verified real-money LLM trading evidence today consists of short public contests plus a few hobbyist accounts, not audited multi-year fund returns.

### Gaps
- I did not search for the Intelligent Alpha ETF (e.g., "LLM-picked") performance or for hedge funds disclosing LLM-agent strategies, so this remains an open check. I found no audited LLM-agent fund.

## Q4. Lessons the live experiments surfaced

### Takeaway
Across venues the same failure modes show up: overtrading and fee drag, oversized or concentrated positions, one-sided directional bias (including Claude's long bias), weak timing, and large run-to-run divergence from identical prompts. Two-week windows cannot separate skill from regime luck.

### Cited Findings
- **Overtrading and fees:** Qwen made 1,418 trades in one Season 1.5 round, against Grok's 158. — [BigGo/Bloomberg](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J). Gemini's fees in Season 1 were $1,331, over 13% of capital, on 238 trades. — [Buildix](https://www.buildix.trade/blog/nof1-alpha-arena-lessons-ai-trading-byok-strategy-advisor-2026)
- **Timing, sizing and overtrading** are the core weaknesses, according to nof1 founder Jay Azhang. — [BigGo/Bloomberg](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J)
- **Position sizing:** one oversized position can sink a portfolio regardless of model skill. Smith's AYTR position fell 83%. — [Flat Circle](https://blog.flatcircle.ai/p/ai-trading-arenas)
- **Prompt sensitivity and variance:**
  - Identical prompts produced radically different decisions across models. — [BigGo/Bloomberg](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J)
  - Nof1 plans to run multiple prompts and model variants in parallel to address this. — [ForkLog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/)
  - Handling non-determinism is still an open tradeoff, and trading plans with fixed invalidation conditions help. — [Flat Circle](https://blog.flatcircle.ai/p/ai-trading-arenas)
- **Directional bias:** Claude was 100% long in Season 1 and showed a bullish bias in Season 1.5. — [Buildix](https://www.buildix.trade/blog/nof1-alpha-arena-lessons-ai-trading-byok-strategy-advisor-2026); [BigGo/Bloomberg](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J)
- **Information access:** Grok's best Season 1.5 round was the one where it could see competitors. — [BigGo/Bloomberg](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J). Season 1 gave models only numerical time series, which LLMs handle poorly. — [ForkLog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/)
- **Backtests are unreliable for LLMs** because of look-ahead bias: models may already know how past events played out. Live markets avoid contamination and do not saturate. — [BigGo/Bloomberg](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J); [Flat Circle](https://blog.flatcircle.ai/p/ai-trading-arenas)
- **Arena design choices are unresolved:** how many assets, how many tools, and how to manage context. — [Flat Circle](https://blog.flatcircle.ai/p/ai-trading-arenas)
- **Short windows:** two-week results are too short to rank skill, and Qwen's win was likely regime plus risk parameters. Hedging and exit discipline matter more than directional picks. This is a vendor blog's opinion. — [Buildix](https://www.buildix.trade/blog/nof1-alpha-arena-lessons-ai-trading-byok-strategy-advisor-2026)

### Inferences
- Design implications for an agentic stock trader:
  - Hard-cap trade frequency and turnover.
  - Cap the size of any single position.
  - Require explicit invalidation and exit levels at entry.
  - Force consideration of the short or flat side, or benchmark against buy-and-hold, to counter Claude's long bias.
  - Run several seeds or prompts to measure decision variance before trusting any one run.
  - Judge performance only against a beta-matched benchmark over months, not weeks.

### Gaps
- No source quantifies run-to-run variance for the same model and same prompt with repeated seeds in live trading. Nof1's parallel-variant plan for Season 2 would supply this if it runs.
- Most per-model behavioral statistics (leverage, hold times, win rates) come from uncited third-party blogs, not nof1's primary data.

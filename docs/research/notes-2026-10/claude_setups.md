# Claude-based autonomous trading setups (individuals and small teams), as of 2026-10-25

Research date: 2026-10-25. All claims dated where the source gives a date. "Self-reported" = the builder's own claim, not independently audited. No source found contained independently verified P&L for a Claude-driven stock trader.

## 1. Notable GitHub repos and write-ups of Claude-driven traders (2025-2026): architecture, scheduling, broker, guardrails, results

### Takeaway
The best-known public Claude trading repos (Jake Schincariol's trader-skill and day-trader-skill, 2026) are human-in-the-loop skill packs with risk checks in Python and a per-order "yes" gate, not unattended traders. The repos that do run unattended (e.g. satyamdas03/alpaca-trading-agent) are small, paper-only, and publish no audited results. The only multi-week outcome reports are anecdotal: an "up a small amount" $500 Robinhood test over three weeks, and a Polymarket bot whose author says it "has not made money."

### Cited Findings

**Jakeschincariol/day-trader-skill (the "Trader skill v2", Oct 2026)**
- 11 Claude skills invoked as slash commands: `/trader-scanner`, `/trader-news`, `/trader-entry`, `/trader-exit`, `/trader-timemachine`, `/trader-risk`, `/trader-budget`, `/trader-broker`, `/trader-alerts`, `/trader-analyst`, `/trader-pelosi`. MIT license. The repo page showed about 1.7k stars and 365 forks, with one commit, when fetched on 2026-10-25 — [GitHub](https://github.com/Jakeschincariol/day-trader-skill)
- Star counts differ by aggregator: about 1.1k on SkillsLLM and about 1.4-1.5k elsewhere. Created around 2026-10-20 per aggregators — [SkillsLLM](https://skillsllm.com/skill/day-trader-skill); [gitdiscover](https://gitdiscover.org/repositories/Jakeschincariol/day-trader-skill). Several forks mirror it with the identical description (kaichaoang, Yairxf, Quincy1247, madusankapremaratne) — [example fork](https://github.com/kaichaoang/day-trader-skill)
- Architecture: each skill has a `SKILL.md`, and most also have a stdlib-only Python 3.8+ script. Skills share state through a `trader/` folder (`config.json`, `plan.json`, `orders.json`), and each skill reads what the previous one wrote. Pipeline: scanner → news → entry → exit → time machine → budget → risk → broker, with alerts running while a trade is open. The README mentions no subagents or hooks. Data comes from Yahoo Finance, Nasdaq Trader, SEC EDGAR and the House Clerk — [GitHub](https://github.com/Jakeschincariol/day-trader-skill)
- Guardrails in code: `/trader-risk` runs `check.py`, which returns PASS or BLOCK with a reason. It checks max loss per trade, the daily loss limit, trades per day, reward-to-risk, the entry window, position size and cash, plus an optional `pdt_guard` that counts pattern-day-trader day trades. Options, margin, shorting and leverage are off unless enabled — [GitHub](https://github.com/Jakeschincariol/day-trader-skill)
- Approval gate: an order goes out only after a risk PASS and the user typing "yes" to that exact order in chat. The README recommends setting the broker tool to "Needs approval", not "Always allow", so Claude's permission prompt acts as a second gate. The broker is Alpaca's MCP server, paper by default (`"paper": true`) — [GitHub](https://github.com/Jakeschincariol/day-trader-skill)
- Scheduling: news, analyst and Pelosi skills "can run on a schedule", but the README gives no mechanism. The entry timer can poll bars until it triggers. Otherwise the workflow is interactive — [GitHub](https://github.com/Jakeschincariol/day-trader-skill)
- Disclosed "results" are a worked example, not a track record. On 2026-10-19 a TSLA opening-range breakout had entry 364.18, stop 358.32 and target 370.04. The Time Machine's 10,000 simulated sessions gave 29.4% target-first, 25.5% stop-first and 45.1% open at the close. A replay over 59 past sessions produced 33 signals: 13 hit the target, 15 hit the stop and 5 hit neither. The README calls this "close to a coin flip" and says most day traders lose money — [GitHub](https://github.com/Jakeschincariol/day-trader-skill)
- Author landing page: [opusjake.ai](https://opusjake.ai/r/day-trader)

**Jakeschincariol/trader-skill (the original, 2026)**
- 11 skills: `/trader-copycat` (rebuilds a 13F-HR portfolio and diffs it quarter over quarter), `/trader-news`, `/trader-budget`, `/trader-pelosi`, `/trader-analyst` (SEC XBRL), `/trader-screener`, `/trader-risk` (PASS/BLOCK), `/trader-broker` (builds the ticket and records approval but "does not place orders itself"), `/trader-tax` (lots, harvesting, wash sales), `/trader-alerts`, `/trader-rebalance`. About 623 stars and 123 forks, one commit, MIT license. Same `trader/` shared-state folder, Alpaca MCP paper default and "never place an order without your yes" gate. No performance results; the Berkshire Q2 2026 13F (filed 2026-08-14) is used only as a worked example — [GitHub](https://github.com/Jakeschincariol/trader-skill)

**satyamdas03/alpaca-trading-agent (2026, small repo)**
- Describes itself as a "24/7 Autonomous AI Trading Agent — Claude Code + Alpaca MCP + Gmail Notifications". The About line claims it "Beats S&P 500", but the README shows no returns or backtest output. At capture: 2 stars, 179 commits — [GitHub](https://github.com/satyamdas03/alpaca-trading-agent)
- Architecture: each run is a stateless Claude Code session, and learning carries over through git-tracked files. `CLAUDE.md` holds the rules. `memory/` holds `STRATEGY.md`, `PORTFOLIO_STATE.md`, `TRADE_LOG.md`, `RESEARCH_LOG.md`, `LESSONS_LEARNED.md` and `WEEKLY_REVIEW.md`. `skills/` holds research, trade execution, Gmail notification and journal. `routines/` holds prompt files. `src/` holds signals, half-Kelly sizing and a walk-forward backtester with 46 passing tests — [GitHub](https://github.com/satyamdas03/alpaca-trading-agent)
- Scheduling: five ET routines (pre-market 6:00, open 9:30, midday 12:00, close 16:00, and a Friday 16:00 weekly review). Option A is in-session CronCreate, which the README notes "auto-expire after 7 days". Option B is the OS scheduler (Windows Task Scheduler or cron) running `claude -p` with the routine prompt. Broker: Alpaca MCP via `uvx alpaca-mcp-server` with `ALPACA_PAPER_TRADE=true`. The README doesn't say which guardrails are code and which are prompt — [GitHub](https://github.com/satyamdas03/alpaca-trading-agent)

**Other Claude + Alpaca builds and tutorials (no verified results)**
- codepioneerr/Traadingbot1-bot: an "autonomous Claude-powered trading bot for a ~$100,000 Alpaca paper trading account", stocks and ETFs only, with Telegram alerts. Not fetched in detail — [GitHub](https://github.com/codepioneerr/Traadingbot1-bot)
- MindStudio tutorials on building a 24/7 agent with Claude Code (routines) and Alpaca. These are how-to material with no measured returns — [MindStudio routines guide](https://www.mindstudio.ai/blog/how-to-build-ai-trading-agent-claude-code-routines); [MindStudio Alpaca guide](https://www.mindstudio.ai/blog/build-ai-trading-agent-claude-code-alpaca)
- An "autonomous trading" Claude Code skill is listed on a marketplace. Not evaluated — [mcpmarket](https://mcpmarket.com/tools/skills/autonomous-trading)
- YouTube titles claim results ("I Built a 24/7 Claude Stock Trading Bot (It Actually Worked)"; "I Tested Letting Claude Trade For A Month and Made $102k"). The figures are unverified; only titles and descriptions were seen — [YouTube 1](https://www.youtube.com/watch?v=UGSH0nAV-o4); [YouTube 2](https://www.youtube.com/watch?v=RetsRS5u-8Q)

**"I let Claude trade my account" experiments**
- Saving to Invest ("Andy"), Robinhood agentic account. The original post appears to date from about 2026-06-22 (inferred from an image path) and was updated 2026-09-30. Setup: Claude Desktop with a custom connector to Robinhood's MCP, $500 funded, told to prioritize index exposure and avoid single biotech names, no fixed schedule. Result: 8 trades in 3 weeks (the first two on day 4, both ETFs), ending "up a small amount" with no figure given. Self-reported. From late August 2026 Claude began refusing to place trades, calling it "a standing safety rule" — [Saving to Invest](https://savingtoinvest.com/i-let-claude-trade-my-robinhood-agentic-account-heres-what-happened/)

**Chudi Nnorukam, "Polyphemus" Polymarket bot built with Claude Code (Dec 2025 – Oct 2026)**
- Claude Code writes and maintains the bot; it does not decide trades live. Memory is a CLAUDE.md under 300 tokens of hard rules plus a `CURRENT_TASK.md`, alongside Claude's auto memory. A security hook blocks DB-modifying bash. Subagents were used for parallel signal research in month 4. Gates: Gate 1 runs mypy, ruff and pytest; Gate 2 is a manual six-question checklist. A shadow dry-run instance runs in parallel, and promotion requires at least 50 completed trades. The bot runs on a QuantVPS in Amsterdam under systemd with a heartbeat. It has been in dry-run only since 2026-05-12. Codebase: 4,247 lines (Dec 2025) to 36,096 lines (Apr 2026). Published 2026-03-07, updated 2026-10-22 — [chudi.dev](https://chudi.dev/blog/claude-code-production-trading-bot)
- Results (self-reported): the author says it "has not made money" and that he has found no strategy profitable after fees. About $1,300 was lost in Feb–Mar 2026 to bugs shipped without a gate. Caveat: the author sells a $49 bot kit and earns hosting affiliate commissions — [chudi.dev](https://chudi.dev/blog/claude-code-production-trading-bot)

**Roman Blackwood, "900+ Hours of Using Claude Code for Trading" (2026-03-13)**
- Workflow: Claude Code, CLAUDE.md holding data format, broker setup, entry and exit rules and risk rules, MCP servers for data and broker, Alpaca paper only. No quantitative results disclosed — [AI in Trading Substack](https://aiintrading.substack.com/p/claude-code-trading-900-hours)

**Model-level benchmark (context, not an individual build)**
- nof1 Alpha Arena Season 1 (real money, crypto perps, ended 2025-11-04): Qwen3-Max won with +22.32%. Secondary reports say the US frontier models finished in the red, but Claude Sonnet 4.5's exact final return was not found in a reliable source. One early snapshot after 72 hours had Claude third at about $12,506 on $10k — [howaiworks](https://howaiworks.ai/blog/nof1-ai-arena-leaderboard-qwen3-max-leads); [Towards AI (paywalled)](https://pub.towardsai.net/six-frontier-ai-models-traded-60-000-in-real-money-for-17-days-the-leaderboard-lied-to-everyone-9f73591a8d4b); [banklesstimes](https://www.banklesstimes.com/articles/2025/10/20/can-ai-beat-the-market-alpha-arenas-live-trading-showdown-put-six-models-to-the-test/)

### Inferences
- The most-starred Claude trading projects deliberately do not run unattended. They put the hard risk logic in deterministic Python (PASS/BLOCK) and keep a human "yes" per order. Popularity is going to "copilot plus code-enforced risk", not to autonomous agents.
- The dominant memory pattern is file-based state in the repo: CLAUDE.md for rules, plus strategy, portfolio, trade-log and lessons markdown or JSON files committed to git. Each scheduled run is a fresh stateless session.
- No public Claude trader found has a verified, multi-month, live-money track record. Every return figure found is self-reported, a simulation or worked example, or a video title.

### Gaps
- Could not retrieve the codepioneerr repo's architecture or results.
- I found no Claude Agent SDK trading bot repo deployed as a long-running server with documented results; tutorials exist, but primary repos were not surfaced.
- I found no X or Reddit primary threads with verifiable P&L screenshots. The Reddit refusal reports are known only second-hand via Saving to Invest.
- Claude Sonnet 4.5's final Alpha Arena Season 1 return is unconfirmed; nof1.ai was not fetched.

## 2. Official broker MCP servers usable by Claude

### Takeaway
Alpaca (alpacahq/alpaca-mcp-server v2) is the de facto broker for Claude builders: paper by default, a full order-type set including options multi-leg, local-only (no OAuth or remote hosting). Robinhood launched Agentic Trading (beta) on 2026-05-27. It is a dedicated, separately funded "MCP account" that agents such as Claude can trade, and trade approvals are off by default for external agents, so unattended order placement is possible in principle. IBKR has no official MCP server; only community wrappers exist.

### Cited Findings

**Alpaca: alpacahq/alpaca-mcp-server**
- v2 is "a complete rewrite" on FastMCP and OpenAPI. Tools cover stock, crypto and options market data (Greeks, IV), account and buying power, portfolio history, place/replace/cancel orders, positions (close, exercise), option chains, watchlists, asset search, market calendar and clock, corporate actions, news, fixed-income quotes, short-sale locates (not in paper), and read-only docs lookup. The `ALPACA_TOOLSETS` env var restricts which toolsets are enabled — [GitHub](https://github.com/alpacahq/alpaca-mcp-server)
- Paper vs live: `ALPACA_PAPER_TRADE` defaults to `true`. Live requires setting it to `false` and supplying live keys — [GitHub](https://github.com/alpacahq/alpaca-mcp-server)
- Order types: stocks and ETFs support market, limit, stop, stop-limit, trailing-stop and bracket. Crypto supports market, limit and stop-limit with GTC/IOC. Options support single-leg and multi-leg — [GitHub](https://github.com/alpacahq/alpaca-mcp-server)
- Install: uvx (Claude Desktop and others), `claude mcp add` for Claude Code, or a locally built Docker image. The README says remote hosting for Claude Mobile or ChatGPT isn't supported, there is no MCP OAuth, and the server shouldn't be exposed to the public internet. Streamable HTTP defaults to localhost. It warns: "This server can place real trades" — [GitHub](https://github.com/alpacahq/alpaca-mcp-server)

**Robinhood: Agentic Trading / MCP accounts**
- Launched in beta on 2026-05-27, alongside an Agentic Credit Card. Some coverage says 2026-05-26. Users open a dedicated agentic account and connect a third-party agent (coverage names Claude, ChatGPT and Grok) via Robinhood's Trading MCP server. The agent can trade only funds deposited in that account — [Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/robinhood-now-lets-ai-trade-001000698.html); [Finovate](https://finovate.com/robinhood-lets-agents-trade-stocks-and-make-payments/); [Finder](https://www.finder.com/stock-trading/robinhood-agentic-accounts); [Crypto Briefing](https://cryptobriefing.com/robinhood-agentic-trading-crypto-equities/)
- Official help article (Ref. 6011980): external agents connect through "MCP accounts", and built-in agents are "Robinhood Agents". Agents can trade long equities, options and crypto with market (by share or by dollar), limit, stop-limit and stop-market orders. Agents cannot place multi-leg options orders, and cannot transfer, stake or lend crypto — [Robinhood Support](https://robinhood.com/us/en/support/articles/trading-with-your-agent/)
- Trade approvals are on by default for Robinhood Agents and off by default for MCP accounts. With approvals on, the agent proposes and the user places the trade manually in the app. With approvals off, the agent "can place eligible trades without per-order confirmation." The toggle is under the connected agent's Safety Controls. Approvals are "still rolling out for MCP accounts", and "certain trades may still require your approval even when trade approvals are turned off" (unspecified). California and Connecticut require approvals on for built-in agents' crypto trades — [Robinhood Support](https://robinhood.com/us/en/support/articles/trading-with-your-agent/)
- Liability: "You are ultimately responsible for the trades your AI agent places in your Agentic account." Robinhood notes agent strategies "may be difficult to monitor or stop in real time." The help page lists no dollar or order-count limits — [Robinhood Support](https://robinhood.com/us/en/support/articles/trading-with-your-agent/)
- Per a secondary source, the agent can read all of a customer's Robinhood accounts but trade only in the dedicated one, and the account is cash-only with no margin — [Finder](https://www.finder.com/stock-trading/robinhood-agentic-accounts)
- Timeline per secondary sources: options added for all US customers in early July 2026, crypto on 2026-08-17, and built-in "Robinhood Agents" announced 2026-09-29 at HOOD Summit. Still beta, with no announced exit — [Saving to Invest](https://savingtoinvest.com/i-let-claude-trade-my-robinhood-agentic-account-heres-what-happened/); [Finder](https://www.finder.com/stock-trading/robinhood-agentic-accounts)
- A Medium reviewer found the MCP workable in Claude Code but thin for building bots (one user's opinion) — [Medium via search summary](https://medium.com/p/33d3725a23e0)

**IBKR**
- No official Interactive Brokers MCP server was found, only community projects. ArjunDivecha/ibkr-mcp-server (Claude Desktop and Claude Code, with order placement) was archived 2026-04-11. mark-liu/ibkr-mcp is read-only via TWS/IB Gateway. Others wrap ib_insync or ib_async, or use a Node and browser OAuth login — [ArjunDivecha](https://github.com/ArjunDivecha/ibkr-mcp-server); [mark-liu on Glama](https://glama.ai/mcp/servers/mark-liu/ibkr-mcp); [code-rabi on Glama](https://glama.ai/mcp/servers/@code-rabi/interactive-brokers-mcp/blob/dc2095c53552b7379015dbba7a6c8ebc858032e7/README.md)

**Others**
- Public.com has a guide to trading stocks, options and crypto with Claude. Per the search summary it has no paper mode, so orders go to live accounts (not fetched directly) — [Public.com](https://public.com/learn/trade-stocks-options-crypto-using-claude)
- Questrade has an MCP and a help page that reportedly suggests turning on "Tools already loaded" (Connectors → Tool Access) when Claude refuses to place an order. The page returned 403 to my fetch, so this is known only via the search snippet — [Questrade](https://www.questrade.com/learning/using-questrade/connect-your-questrade-account-to-ai)

### Inferences
- For unattended Claude trading, Alpaca paper is the path of least resistance. It is local stdio and env-var keys, so it fits Claude Code CLI or a server. It is not a claude.ai connector, so cloud routines would need it declared in the repo's `.mcp.json` (see Q3).
- Robinhood MCP is a claude.ai connector (remote, OAuth), so it plugs into Claude Desktop and cloud scheduled tasks directly. With approvals off it permits unattended orders at the broker level, but Claude-side refusals (Q4) are a practical blocker.

### Gaps
- No Robinhood newsroom primary release was fetched; the launch date relies on secondary coverage (May 26 vs May 27 conflict).
- Robinhood's per-agent dollar or order limits, if any, are undocumented on the help page. Secondary sources mention user-set trade limits but no specifics.
- Alpaca MCP's exact version number and release date are not shown on the repo page.

## 3. Can Claude run fully unattended on a schedule with broker connectors?

### Takeaway
Yes, technically, via three routes: Claude Code cloud scheduled tasks (formerly "routines", research preview), a server or OS cron running `claude -p` or the Agent SDK, or GitHub Actions with claude-code-action. Each has constraints. Cloud tasks run at most hourly, start several minutes late on the hour, and run in auto mode, where a classifier can block or pause actions. Local in-session crons expire after 7 days. Broker MCP and network access must be wired explicitly.

### Cited Findings
- Cloud scheduled tasks (formerly routines) are in research preview. They run on Anthropic cloud on Pro, Max, Team and Enterprise plans, with schedule, API (`/fire` with a bearer token) or GitHub-event triggers. Create them at claude.ai/code/routines or with `/schedule` — [Claude Code docs](https://code.claude.com/docs/en/routines)
- Schedule limits: cron expressions that run more often than hourly are rejected. Runs exactly on the hour "can start several minutes late", so the docs advise times like 9:07. Five-field cron is in UTC unless prefixed `CRON_TZ=`; presets use local time — [Claude Code docs](https://code.claude.com/docs/en/routines)
- Hourly caps: 100 scheduled runs per hour per account. Runs also consume subscription usage, and without usage credits further runs are rejected until the window resets. A paused subscription holds tasks — [Claude Code docs](https://code.claude.com/docs/en/routines)
- Connectors: claude.ai connectors are included by default, and Claude "can use an included connector during a run, including writes." Locally added `claude mcp add` servers do not appear; they must be added as claude.ai connectors or declared in a committed `.mcp.json` for single-repo tasks. Default "Trusted" network access allows only an allowlist; other hosts get 403 `host_not_allowed`. Connector traffic routes through Anthropic and bypasses the allowlist. Keys belong in network secrets — [Claude Code docs](https://code.claude.com/docs/en/routines)
- Permissions: runs start in auto mode, where a classifier allows or blocks actions. A run still stops and waits on ask-rule matches or after repeated blocks hit the thresholds. "The fired prompt … can't act as approval or consent for actions during the run." The History status "Succeeded" means only that the session ended normally, not that the work got done, so transcripts must be read — [Claude Code docs](https://code.claude.com/docs/en/routines)
- Reliability: if the GitHub connection expires, runs are skipped for up to 72 hours, after which the task turns off. "The last run didn't start…" warnings exist for concurrency limits, environment problems and temporary failures — [Claude Code docs](https://code.claude.com/docs/en/routines)
- Local alternatives: Desktop scheduled tasks and `/loop` run on the user's machine — [Claude Code docs](https://code.claude.com/docs/en/routines). The satyamdas03 README notes that in-session CronCreate jobs "auto-expire after 7 days" and recommends OS cron or Task Scheduler with `claude -p` for uninterrupted operation — [GitHub](https://github.com/satyamdas03/alpaca-trading-agent)
- GitHub Actions: anthropics/claude-code-action v1 is built on the Agent SDK, supports scheduled automation workflows (cron example in the docs), and defaults to Sonnet — [Claude Code GitHub Actions docs](https://code.claude.com/docs/en/github-actions). No public repo combining claude-code-action, cron and Alpaca trading was found in search.
- Always-on server builds use a VPS with systemd and heartbeats (Polyphemus), with Claude Code as the developer rather than the live decision loop — [chudi.dev](https://chudi.dev/blog/claude-code-production-trading-bot)

### Inferences
- Cloud tasks can't do intraday sub-hourly loops. They suit a few fixed decision points per day (open, midday, close), each a fresh stateless session reading git-tracked state.
- Because auto mode's classifier and "fired prompt is not consent" both apply, a real-money order placed from a cloud task may be blocked or paused for approval. Builders wanting true unattended execution tend to move order placement into deterministic code the agent calls, or use paper accounts.

### Gaps
- No Anthropic doc found stating a specific policy on autonomous financial trades in cloud tasks or auto mode. The refusal reports (Q4) are anecdotal.
- Agent SDK long-running server trading deployments were not documented in fetched sources.

## 4. Common failure modes reported by builders

### Takeaway
Reported failures cluster around: Claude refusing to execute broker orders (Robinhood MCP, from late Aug 2026); code-generation bugs that reach live trading (units, sizing off-by-one, Python set quirks); context degradation and hallucinating files it hadn't loaded; token cost; and "Succeeded" scheduled runs that silently did nothing. Validated strategy edges are absent. Clock and timezone errors and missed runs are real platform constraints (UTC cron, late starts on the hour, 7-day expiry) but were not documented in builder post-mortems found here.

### Cited Findings
- **Order-execution refusals:** from late August 2026, users reported Claude saying it "wasn't allowed to execute real trades," calling it "a standing safety rule," even with explicit authorization. One Reddit user said Claude Code finished the options analysis but refused the final order call, while the same MCP worked from Cursor. Behaviour was inconsistent: some got a "Classifier block" that cleared on retry, and others were still trading daily. All anecdotal — [Saving to Invest](https://savingtoinvest.com/i-let-claude-trade-my-robinhood-agentic-account-heres-what-happened/); [Saving to Invest hub](https://savingtoinvest.com/robinhood/)
- **Bugs reaching live (Polyphemus):** a USDC-vs-cents units violation "cost a real trade". An off-by-one in position sizing passed lint and tests in month 2. On 2026-04-01 an audit caught `set("BTC")` evaluating to `{'B','T','C'}`, which would have traded the wrong assets. About $1,300 was lost Feb–Mar 2026 to ungated changes — [chudi.dev](https://chudi.dev/blog/claude-code-production-trading-bot)
- **Context degradation and hallucination:** Claude hallucinated contents of files it "remembered" but had not loaded — [chudi.dev](https://chudi.dev/blog/claude-code-production-trading-bot). Vague briefs lead Claude to "guess confidently" — [AI in Trading](https://aiintrading.substack.com/p/claude-code-trading-900-hours)
- **Token cost:** about $340 in month one, later about $136/month in API cost. Average session tokens fell from about 10k to about 4.2k with tighter CLAUDE.md and handoff notes — [chudi.dev](https://chudi.dev/blog/claude-code-production-trading-bot)
- **No edge:** the day-trader-skill author's own replay showed his headline setup is "close to a coin flip" (13 target vs 15 stop of 33 signals) — [GitHub](https://github.com/Jakeschincariol/day-trader-skill). The Polyphemus author found no strategy profitable after fees — [chudi.dev](https://chudi.dev/blog/claude-code-production-trading-bot)
- **Silent no-op runs:** a cloud task marked "Succeeded" only means the session ended normally. Blocked network requests, missing connector tools and incomplete work appear only in the transcript — [Claude Code docs](https://code.claude.com/docs/en/routines)
- **Schedule and timezone pitfalls (platform-documented):** five-field cron is UTC, on-the-hour runs start minutes late, there is no sub-hourly cadence — [Claude Code docs](https://code.claude.com/docs/en/routines). Local CronCreate jobs expire after 7 days — [GitHub](https://github.com/satyamdas03/alpaca-trading-agent)
- **Monitoring risk:** Robinhood itself warns agent strategies "may be difficult to monitor or stop in real time" — [Robinhood Support](https://robinhood.com/us/en/support/articles/trading-with-your-agent/)
- **Benchmark-level:** in Alpha Arena Season 1 (ended 2025-11-04), most frontier LLMs, reportedly including the US models, lost money trading live. Claude's exact figure was unconfirmed — [howaiworks](https://howaiworks.ai/blog/nof1-ai-arena-leaderboard-qwen3-max-leads)

### Inferences
- The mitigations builders converge on are: deterministic code for risk and sizing (PASS/BLOCK) rather than prompt rules; shadow or paper runs with a minimum trade count before promotion; small CLAUDE.md files plus handoff notes; reading run transcripts rather than trusting the run status; and pinning schedules away from the top of the hour in an explicit timezone.
- Overtrading and prompt drift were not documented with evidence in the sources found. The day-trader-skill's trades-per-day and daily-loss caps in `check.py` suggest the author anticipates overtrading.

### Gaps
- No primary source documented hallucinated prices, timezone or clock errors, or overtrading in a live Claude trader. These are plausible but unsourced here.
- The Reddit threads on refusals were not reachable directly. No Anthropic statement explaining the late-August 2026 refusal behaviour was found.

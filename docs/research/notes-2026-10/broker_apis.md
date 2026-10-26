# US Broker APIs for Autonomous Equity Trading (as of 2026-10-25)

Scope: US retail individual accounts. Brokers covered: Alpaca, Interactive Brokers, Robinhood, Charles Schwab, Tradier, tastytrade, E*TRADE, Public.com, Webull. Plus the FINRA Regulatory Notice 26-10 (PDT replacement) adoption and historical intraday data vendors.

Source-quality legend used below: **[official]** = broker/regulator's own page; **[3P]** = third-party (library docs, blogs, integrators). Several broker developer portals (Schwab, parts of IBKR) are behind login or returned 403, so some auth details rest on 3P sources and are flagged.

---

## 1. Which brokers have an official API that permits fully automated equity order placement, and how do they compare?

### Takeaway
All nine brokers now expose some official, programmatic way to place US equity orders without per-order human confirmation. They differ most in auth friction for unattended running, paper/sandbox availability, and order-type depth. For a solo developer going paper-first then small live, **Alpaca** has the least friction: a native paper API, rich order classes (bracket/OCO/OTO, MOC/LOC via `cls`, fractional, extended and overnight hours), and it implemented the new intraday margin framework on day one. **tastytrade** and **Tradier** are viable alternatives with sandboxes. **Robinhood** is the new entrant. Its agentic trading runs via MCP rather than a classic REST API, has no paper mode, and its tooling is still a young beta. **Schwab** (7-day refresh token), **E*TRADE** (token dies at midnight ET) and **IBKR** (gateway login and 2FA) carry recurring re-login burdens that work against fully unattended operation.

### Cited Findings

#### Comparison table (each cell sourced in the per-broker bullets below; "?" = not verified this session)

| Broker | Official equity order API | Automated placement permitted | Paper / sandbox | Notable order types | Stock commission | Auth friction for unattended running |
|---|---|---|---|---|---|---|
| Alpaca | Yes, Trading API (REST + websockets) | Yes (it's the product) | Yes, Paper Trading API | Market, limit, stop, stop-limit, trailing stop; bracket, OCO, OTO; `opg`/`cls` (MOO/LOO/MOC/LOC); fractional/notional (day TIF only); extended-hours and overnight (limit only) | ? (believed $0, not verified) | API key/secret (? not verified this session) |
| Interactive Brokers | Yes: TWS API, Client Portal/Web API | Yes | Paper account (? not verified this session) | ? (broad, not verified) | Pro Fixed $0.005/sh (min $1, max 1%); Pro Tiered $0.0005–0.0035/sh (min $0.35); Lite $0 | Retail Web API via Client Portal Gateway; interactive login, 2FA push, weekly or daily re-auth (3P) |
| Robinhood (equities) | Agentic Trading via MCP server (beta since 2026-05-27); no classic public equity REST API found | Yes, in a dedicated agentic account with trade approvals turned off | None found | Market (share- and dollar-based), limit, stop-limit, stop-market; "advanced orders" tool; no multi-leg options | ? | MCP connector auth; details not documented publicly |
| Robinhood (crypto) | Yes, Crypto Trading API (v1/v2) | Yes | ? | Market, limit, stop-loss, stop-limit (3P) | n/a | Ed25519-signed API key (3P) |
| Charles Schwab | Yes, Trader API (individual developer account) | Yes (? ToS not read; portal behind login) | No sandbox found | ? (portal behind login) | ? | Access token 30 min; refresh token 7 days, then full browser re-auth (3P) |
| Tradier | Yes, Brokerage API | Yes | Yes (sandbox.tradier.com; 15-min delayed per 3P) | ? | Lite $0.35/trade; Pro ($10/mo) and Pro Plus ($35/mo) $0 | Static access token (? not verified this session) |
| tastytrade | Yes, Open API (OAuth2) | Yes (official "Agent Quickstart" doc exists) | Yes (cert env api.cert.tastyworks.com) | ? | $0 stocks | Access token 15 min; refresh token reportedly never expires (3P) |
| E*TRADE | Yes (OAuth 1.0a) | ? (ToS not read) | Sandbox host exists (apisb.etrade.com) | ? | ? | Token expires at midnight ET daily; goes inactive after 2h idle (renewable); new login each day |
| Public.com | Yes, Individual API (personal, non-commercial use) | Yes, for personal use | None (per 3P) | Bracket/OCO not available via TradersPost (3P) | $0 in regular hours; extended-hours commission may apply | Secret key exchanged for bearer token; default 120 min, configurable (3P) |
| Webull | Yes, OpenAPI (application and approval required) | Yes | Yes: paperTrade via OpenAPI (announced 2026-07-21) plus a test environment | ? | ? | App Key/Secret HMAC-SHA1 signing plus a "reusable access token verified via the Webull App" |

#### Alpaca
- Order types: market, limit, stop, stop-limit, and trailing stop (day/gtc; trailing stops don't trigger outside RTH). Also opening/closing auction orders. — [Alpaca docs: Orders](https://docs.alpaca.markets/docs/orders-at-alpaca) [official]
- Advanced order classes. **Bracket**: entry plus take-profit plus stop-loss; no extended hours; day/gtc. **OCO**: exit-only on an existing position. **OTO**: entry plus one exit. — [Alpaca docs: Orders](https://docs.alpaca.markets/docs/orders-at-alpaca) [official]
- `opg` (MOO/LOO) is rejected if submitted between 9:28am and 7:00pm ET. `cls` (MOC/LOC) is rejected between 3:50pm and 7:00pm ET. `ioc`/`fok` are allowed for market and limit orders. — [Alpaca docs: Orders](https://docs.alpaca.markets/docs/orders-at-alpaca) [official]
- Fractional/notional orders: **day TIF only** (no gtc/ioc/fok/opg/cls), and notional orders cannot be replaced (cancel and resubmit instead). — [Alpaca docs: Orders](https://docs.alpaca.markets/docs/orders-at-alpaca) [official]
- Extended hours: limit orders only, day/gtc, with `extended_hours=true`. Sessions: overnight 8pm–4am ET (Sun–Fri), pre-market 4–9:30am, after-hours 4–8pm. — [Alpaca docs: Orders](https://docs.alpaca.markets/docs/orders-at-alpaca) [official]
- Paper Trading API exists and does not use real money. All accounts are opened as limited-purpose margin accounts. — [Alpaca blog: Intraday Margin Framework](https://alpaca.markets/blog/finra-retires-the-pdt-rule-introducing-alpacas-new-intraday-margin-framework/) [official]
- Market data. Basic (free) = IEX only for real-time, 30 websocket symbols, 200 historical calls/min, history from 2016 but most recent 15 min restricted. Algo Trader Plus = **$99/mo**, all US exchanges (SIP), unlimited websocket symbols, 10,000 calls/min. — [Alpaca docs: About Market Data API](https://docs.alpaca.markets/docs/about-market-data-api) [official]
- IEX is roughly 2.5% of volume. — [MarketParquet vs Alpaca](https://marketparquet.com/vs/alpaca) [3P, competitor; treat with caution]

#### Interactive Brokers
- IBKR Pro Fixed: USD 0.005/share, $1.00 minimum, cap of 1% of trade value. Tiered: USD 0.0005–0.0035/share by monthly volume, $0.35 minimum, exchange/regulatory/clearing fees passed through. Fractional shares follow the same schedule. IBKR Lite: $0 on US-listed stocks/ETFs for US residents. — [IBKR Commissions](https://www.interactivebrokers.com/commissions) [official]
- Retail clients were described (Aug 2025 IBKR staff reply, as summarized in search results) as approved for the Web API **only via the Client Portal Gateway**, with OAuth 2.0 "being considered" for individuals. Newer 3P reviews say IBKR is consolidating into a unified Web API with OAuth 2.0, "subject to eligibility." — [BrokerListings: Does IBKR have an API](https://brokerlistings.com/reviews/interactive-brokers/does-interactive-brokers-have-an-api) [3P]; [nautilus_trader issue #5069](https://github.com/nautechsystems/nautilus_trader/issues/5069) [3P]
- IB Gateway needs an interactive login, IBKR forces full re-authentication weekly, and 2FA needs a human to approve a push in IBKR Mobile. — [nautilus_trader issue #5069](https://github.com/nautechsystems/nautilus_trader/issues/5069) [3P]
- IB Gateway "requires daily restarts/re-authentication," which trips up headless servers. — [BrokerListings](https://brokerlistings.com/reviews/interactive-brokers/does-interactive-brokers-have-an-api) [3P]
- IBKR's Account Management Web API supports only `private_key_jwt` client auth. That API is for account management, not retail trading. — [IBKR Account Management Web API](https://www.interactivebrokers.com/campus/ibkr-api-page/web-api-account-management/) [official]

#### Robinhood
- **Launch:** On 2026-05-27, Robinhood announced "Robinhood is Now Open to Agents." Agentic Trading launched in beta, **equities only** at launch. Options, crypto, event contracts and futures were listed as "coming soon." Users open a **dedicated agentic trading account**, and agents can access only funds deposited into it. Disclosures say orders "may be placed by an AI agent... without your direct input on each transaction." No paper trading is mentioned; the post refers to backtesting instead. — [Robinhood Newsroom](https://robinhood.com/newsroom/robinhood-is-now-open-to-agents/) [official]
- **Current scope:** The support page (undated, © 2026) now lists **long equities, options and crypto**. Agents **cannot place multi-leg options orders**. Crypto is limited to Robinhood-tradable pairs (no transfer/stake/lend) and is unavailable in some states, including NY. — [Robinhood Support: Trading with your agent](https://robinhood.com/us/en/support/articles/trading-with-your-agent/) [official]
- **Order types:** market (share-based), market (dollar-based), limit, stop limit, stop market. A tool checks whether a symbol is fractionally tradable. Extended-hours handling is not stated. — [Robinhood Support: Trading with your agent](https://robinhood.com/us/en/support/articles/trading-with-your-agent/) [official]
- **Trade approvals:** default **ON** for built-in Robinhood Agents and **OFF** for MCP (external-agent) accounts. With approvals off, "the agent can place eligible trades without per-order confirmation," though "some trades may still require approval." The toggle is in MCP tab > Agent Settings > Safety Controls and is still "rolling out for MCP accounts." The user is "ultimately responsible" for agent trades. — [Robinhood Support: Trading with your agent](https://robinhood.com/us/en/support/articles/trading-with-your-agent/) [official]
- Crypto availability timeline conflict: Genfinity says crypto was added to agentic trading on 2026-07-20. A NexusTrade review (2026-07-08) found no crypto on the MCP at that time. The current support page includes crypto. — [Genfinity](https://genfinity.io/2026/07/21/robinhood-agentic-trading-crypto-ai-agents/) [3P]; [NexusTrade review](https://nexustrade.io/blog/robinhood-agentic-trading-mcp-review-20260708) [3P]; [Robinhood Support](https://robinhood.com/us/en/support/articles/trading-with-your-agent/) [official]
- MCP endpoint `https://agent.robinhood.com/mcp/trading`, with equity tools get_equity_quotes, get_equity_orders, review_equity_order, place_equity_order and cancel_equity_order. — [Gamut MCP listing](https://www.gamut.so/mcp/payments-finance/robinhood) [3P]
- A NexusTrade review found the MCP works in Claude Code, but it has **no multi-leg options, no scheduled agents, and no documented request/response format**. The author published captured response shapes. — [NexusTrade review](https://nexustrade.io/blog/robinhood-agentic-trading-mcp-review-20260708) [3P]
- One review says users can create **up to 10 MCP accounts**. — [search summary of Robinhood agentic reviews, e.g. getfarao.com](https://getfarao.com/blog/robinhood-agentic-trading-review) [3P, unverified]
- **Crypto Trading API (separate REST product):** official, in two versions. v1 supports only non-fee-tier orders; v2 adds fee-tier orders. Keys are created in "web classic" with per-action permissions. — [Robinhood Support: Crypto Trading API](https://robinhood.com/us/en/support/articles/crypto-api/?hcs=true) [official]. Ed25519 request signing and order types market/limit/stop_loss/stop_limit come from community clients. — [JSR robinhood-crypto-client](https://jsr.io/@albedosehen/robinhood-crypto-client) [3P]

#### Charles Schwab (Trader API)
- Access token valid **30 minutes**. Refresh token valid **7 days** and single-use (each refresh returns a new token). When it expires, the full browser authorization flow must be re-run. — [dp_exchange_schwab usage rules](https://repo.hex.pm/preview/dp_exchange_schwab/0.1.5/usage-rules.md) [3P]; [schwabr README](https://cran.nics.utk.edu/cran/web/packages/schwabr/readme/README.html) [3P: "manual Authentication refresh must be made every 7 days"]
- Note the conflict between the 3P sources. One says each refresh returns a new 7-day window (dp_exchange_schwab); others (schwabr, TradersPost) say a manual re-auth is needed every 7 days regardless. — [dp_exchange_schwab](https://repo.hex.pm/preview/dp_exchange_schwab/0.1.5/usage-rules.md); [TradersPost: thinkorswim API](https://blog.traderspost.io/article/thinkorswim-api)
- Developers register via an individual Developer account. The app must reach "Ready to use," and new keys can take days to activate. — [TradersPost](https://blog.traderspost.io/article/thinkorswim-api) [3P]
- Order write limit: "0..120 order writes per minute per account," set per app at registration. — [dp_exchange_schwab](https://repo.hex.pm/preview/dp_exchange_schwab/0.1.5/usage-rules.md) [3P]
- Schwab extended hours: pre-market orders are accepted from 8:05pm (prior day) and execute 7:00–9:25am ET; after-hours runs 4:05–8:00pm. Extended sessions are limit-only, and 24-hour overnight trading is thinkorswim-only for select securities. — [Schwab: Extended Hours Trading](https://www.schwab.com/stocks/extended-hours-trading) [official, consumer page, not API docs]

#### Tradier
- Plans: **Lite $0/mo** ($0.35/stock trade, $0.35/option contract). **Pro $10/mo** ($0 stocks, $0 equity options, $0.35 index options). **Pro Plus $35/mo** ($0 stocks/options, $0.10 index options). API access is included in all plans. Brokerage minimum is $0; the Pro promo needs a $500 deposit within 30 days. — [Tradier Pricing](https://tradier.com/individuals/pricing) [official]
- Sign-up is free and includes live and paper access. Paper base URL is `https://sandbox.tradier.com/v1/`. — [Tradier Brokerage API docs](https://docs.tradier.com/docs) [official]; [Tradier Support: paper trading](https://support.tradier.com/how-do-i-enroll-in-paper-trading) [official]
- Paper accounts use 15-minute delayed data. Account activity is unavailable in sandbox. — [TradersPost Tradier docs](https://docs.traderspost.io/docs/brokers/tradier) [3P]; [QuantConnect Tradier docs](https://www.quantconnect.com/docs/v2/cloud-platform/live-trading/brokerages/tradier) [3P]

#### tastytrade
- Official Open API with OAuth2. Sandbox/cert environment is `api.cert.tastyworks.com` and production is `api.tastyworks.com`; OAuth clients don't cross environments. Access tokens are valid **15 minutes** and are refreshed via POST /oauth/token. A `User-Agent` header is required or requests get a 401. — [tastytrade Developer: OAuth2](https://developer.tastytrade.com/docs/authentication/oauth2/) [official]; [Get started](https://developer.tastytrade.com/docs/get-started/) [official]; [FAQ](https://developer.tastytrade.com/docs/faq/) [official]
- The developer portal has an "Agent Quickstart" page. — [tastytrade Agent Quickstart](https://developer.tastytrade.com/docs/agent-quickstart/) [official; content not read]
- Refresh tokens "never expire" ("indefinite usage") per the community Python SDK, but official docs don't state this. — [tastyworks-api docs](https://tastyworks-api.readthedocs.io/en/latest/sessions.html) [3P]
- $0 commission on stocks and crypto. — [tastytrade: Trade your way](https://tastytrade.com/trade-with-tastytrade/) [official]
- Conflict: a Sept 2025 TradersPost blog claims tastytrade has "limited API access that does not support automation." Official developer docs and a QuantConnect open-source integration (cash and margin, long-lived OAuth token) contradict it. — [TradersPost](https://blog.traderspost.io/article/does-tastyworks-have-api) [3P, likely outdated]; contradicted by [QuantConnect announcement](https://www.quantconnect.com/announcements/19585/trade-smarter-tastytrade-integration-live-on-quantconnect/) and [tastytrade Developer](https://developer.tastytrade.com/docs/get-started/)

#### E*TRADE
- OAuth access tokens expire **at the end of the current US Eastern calendar day**. They go inactive after **2 hours with no requests** and must be reactivated with Renew Access Token. Once expired, "no further requests will be processed until the user logs in again." — [E*TRADE Authorization API: Get Access Token](https://apisb.etrade.com/docs/api/authorization/get_access_token.html) [official]; [Renew Access Token](https://apisb.etrade.com/docs/api/authorization/renew_access_token.html) [official]
- Developer guides are at developer.etrade.com, and the docs are served from a sandbox host (apisb.etrade.com). — [E*TRADE Developer Guides](https://developer.etrade.com/getting-started/developer-guides) [official]

#### Public.com
- The API is free (no access or call fees). Standard trading fees apply. The API is "now available to all Public members, with no approval required" (search summary of Public's API pages). — [Public: The Public API](https://public.com/get/api) [official]; [public.com/api](https://www.public.com/api) [official]
- The Individual API is "for your own personal, non-commercial use." — [Public Individual API Program terms](https://public.com/documents/individual-api-program) [official]
- $0 stock/ETF commissions in Regular Trading Hours. "Commissions on trades during extended trading hours" may apply. Options rebates of $0.06–$0.18/contract vary with whether the trade was placed via API and with volume. — [Public: The Public API](https://public.com/get/api) [official]. The $2.99 extended-hours equity fee is from a 3P source and may be outdated. — [search summary; finder.com review](https://finder.com/public-review) [3P]
- No sandbox/paper trading; trailing stops and bracket/OCO are not available through TradersPost's Public integration. — [TradersPost: automate Public.com trading](https://blog.traderspost.io/article/automate-publiccom-trading) [3P]
- Auth: an API secret key generated in app security settings is exchanged for a bearer token. Default expiry is 120 minutes and can be changed. — [rPublic vignette](https://cran.r-project.org/web/packages/rPublic/vignettes/rp_getting_started.html) [3P]
- Account types: cash, margin, IRA; entity accounts "coming later." — [search summary of Public API pages](https://public.com/get/api) [official, via search snippet]

#### Webull
- US individuals register, open a Webull US brokerage account, apply under "OpenAPI Management," then create an app and API key after approval. — [Webull OpenAPI docs](https://developer.webull.com/apis/docs/about-open-api) [official, via search summary]
- Requests are signed with HMAC-SHA1 using App Key/App Secret. The access token is described as "a reusable access token verified via the Webull App for trading and account operations." US products: stocks, options, futures, crypto, event contracts. — [About Webull OpenAPI](https://developer.webull.com/apis/docs/about-open-api) [official]
- Product-scope conflict: an older About page listed only stocks and single-stock options for US; newer CLI docs list more. — [Webull CLI docs](https://developer.webull.com/apis/docs/AI-friendly-Resources/cli/) [official]
- Real-time and historical US stock data via OpenAPI requires a **separate OpenAPI market-data subscription**; app/desktop subscriptions don't carry over. — [Webull CLI docs](https://developer.webull.com/apis/docs/AI-friendly-Resources/cli/) [official]
- On 2026-07-21 Webull announced OpenAPI access to paperTrade covering stocks, options, crypto, futures, bonds and event contracts. — [Barchart/Webull press release](https://www.barchart.com/story/news/3382513/webull-unveils-enhanced-paper-trading-experience-with-professional-grade-and-openapi-multi-asset-simulation) [official PR via wire]

### Inferences
- **Recommended path for a solo paper-to-small-live build:** Alpaca first (paper and live use the same API, rich order classes, $99/mo SIP upgrade available, PDT replacement already live). tastytrade or Tradier are fallbacks with a real sandbox. Schwab, E*TRADE and IBKR all need a human in the loop on a recurring cadence (7 days, daily, and daily/weekly respectively), which defeats "unattended" unless the system tolerates and alerts on re-auth.
- **Robinhood agentic trading is officially sanctioned automated trading, but immature as a programmatic platform.** It is MCP-only (designed for LLM clients), has no paper mode and no documented schemas (per NexusTrade), and approval settings are still rolling out. "Some trades may still require approval" means an autonomous loop can stall waiting on a human. It suits an LLM-in-the-loop agent better than a deterministic execution engine.
- Observed in this workspace (not a web source): the Robinhood MCP connector attached to this session exposes tools including `place_equity_order`, `review_equity_order`, `place_advanced_order`, `cancel_advanced_order`, `get_trade_approval_setting`, `get_trade_approvals`, `decline_trade_approval`, `get_equity_historicals`, `get_equity_tax_lots`, `get_equity_tradability`, `place_crypto_order` and `place_option_order`. That matches Robinhood's description of advanced-order and approval tools, and suggests bracket-style "advanced orders" exist via MCP. The parameters were not inspected.
- Public.com's "personal, non-commercial use" clause is fine for a personal trading system, but would bar running the same code for other people's accounts.
- Webull's dependency on an app-verified token and a separate data subscription adds friction compared with Alpaca.

### Gaps
- **Alpaca commission ($0 believed) and key-based auth with no expiry**: widely known, but not verified against an official page this session.
- **Alpaca/Schwab/E*TRADE/Tradier ToS or API agreement text on automated trading** was not read. "Permitted" is inferred from the purpose of each API, not from quoted ToS language.
- **Schwab Trader API order types** (OCO/OTO/trigger, MOC/LOC, fractional): developer portal behind login, no official source found.
- **IBKR paper trading account** and specific API order types (bracket, MOC/LOC, adaptive) were not verified this session (IBKR campus page returned 403). IBKR is generally known to offer paper accounts and the full order-type catalogue via TWS API, but this is unverified here.
- **Tradier, tastytrade and E*TRADE order types** (bracket/OCO, MOC/LOC, fractional, extended hours) were not researched.
- **E*TRADE commissions** and whether its sandbox returns realistic fills were not verified.
- **Webull commissions, OpenAPI token lifetime and rate limits** were not found.
- **Robinhood MCP auth model** (OAuth/session lifetime), rate limits, extended-hours support and funding limits are not documented on the pages read.
- **Public.com fractional/extended-hours via API** and official token rules were not found in official docs.
- **Account minimums**: only Tradier ($0) confirmed. Others are unverified, though $2,000 still applies to margin per FINRA/Alpaca (see section 3).

---

## 2. How do auth models affect unattended 24/7 operation?

### Takeaway
Auth lifetime is the biggest practical differentiator for an unattended system. Ranked from least to most human intervention, based on sources found: key-based (Alpaca, Tradier; unverified this session) < long-lived OAuth refresh (tastytrade, reportedly non-expiring) < Public (configurable bearer token from a stored secret) < Schwab (7-day refresh, then browser re-auth) < E*TRADE (new login every day) < IBKR retail (gateway login plus 2FA push, daily or weekly). Robinhood's MCP auth is undocumented.

### Cited Findings
- Schwab: 30-minute access token, 7-day refresh token, then full re-auth. — [dp_exchange_schwab](https://repo.hex.pm/preview/dp_exchange_schwab/0.1.5/usage-rules.md) [3P]; [schwabr](https://cran.nics.utk.edu/cran/web/packages/schwabr/readme/README.html) [3P]. TradersPost says the 7-day expiry "breaks fully unattended automation." — [TradersPost](https://blog.traderspost.io/article/thinkorswim-api) [3P]
- Schwab refresh tokens are single-use; persist the new one before using it and never blind-retry a refresh, because a timed-out attempt may already have spent the old token. — [dp_exchange_schwab](https://repo.hex.pm/preview/dp_exchange_schwab/0.1.5/usage-rules.md) [3P]
- E*TRADE: expires at midnight ET, goes inactive after 2h idle; Renew returns only a status, not a new token. — [E*TRADE Renew Access Token](https://apisb.etrade.com/docs/api/authorization/renew_access_token.html) [official]
- IBKR: interactive gateway login, 2FA push approval in IBKR Mobile, weekly full re-auth / daily restarts. — [nautilus_trader #5069](https://github.com/nautechsystems/nautilus_trader/issues/5069) [3P]; [BrokerListings](https://brokerlistings.com/reviews/interactive-brokers/does-interactive-brokers-have-an-api) [3P]
- tastytrade: 15-minute access token from a refresh token. — [tastytrade OAuth2](https://developer.tastytrade.com/docs/authentication/oauth2/) [official]. Refresh token never expires. — [tastyworks-api](https://tastyworks-api.readthedocs.io/en/latest/sessions.html) [3P]. QuantConnect describes it as a "long-lived OAuth token." — [QuantConnect](https://www.quantconnect.com/announcements/19585/trade-smarter-tastytrade-integration-live-on-quantconnect/) [3P]
- Public: secret key exchanged for a bearer token with a configurable expiry (default 120 min). — [rPublic](https://cran.r-project.org/web/packages/rPublic/vignettes/rp_getting_started.html) [3P]
- Webull: HMAC signing plus an app-verified reusable access token. — [About Webull OpenAPI](https://developer.webull.com/apis/docs/about-open-api) [official]
- Robinhood agentic: the user can disconnect an agent at any time. Disclosures warn agents may act on outdated information and "may be hard to stop in real time." — [Robinhood Newsroom](https://robinhood.com/newsroom/robinhood-is-now-open-to-agents/) [official]

### Inferences
- For Schwab and E*TRADE, an unattended system needs a re-auth alert channel and must fail safe: flatten or stop opening positions when the token can't be renewed. It must never treat an auth failure as "no positions / no signal" (consistent with the CLAUDE.md rule on not reporting upstream failures as empty results).
- IBKR retail's 2FA push dependency makes truly headless operation impractical without community tools such as IBC, which were not researched here.

### Gaps
- No official confirmation of Alpaca or Tradier key/token lifetimes this session.
- Official tastytrade refresh-token lifetime not stated in its docs.
- Robinhood MCP session/OAuth lifetime unknown.
- Whether IBKR has opened OAuth (gateway-free) Web API access to individual retail accounts as of Oct 2026 is unconfirmed; sources conflict or are speculative.

---

## 3. Pattern day trader status after FINRA Regulatory Notice 26-10: which brokers have adopted the intraday margin standard?

### Takeaway
RN 26-10 (published 2026-04-20) replaced the day-trading margin rules "in their entirety." The PDT designation, the 4-trades-in-5-days count, and the $25,000 minimum are gone, effective **2026-06-04**, with optional phase-in through **2027-10-20**. Confirmed early adopters: **Alpaca** (2026-06-04), **tastytrade** (June 4, per its own marketing), **Schwab** (stopped counting day trades 2026-06-08; secondary source plus Schwab learn article), and **E*TRADE** (2026-06-09). Webull and Robinhood reportedly adopted on day one, per secondary sources only. **IBKR, Tradier and Public: no confirmation found.**

### Cited Findings
- RN 26-10: new intraday margin standards (Rule 4210 amendments) replace day trading margin requirements "in their entirety." The day-trade count test and the $25,000 PDT minimum are removed. Effective 2026-06-04 (45 days after publication), with an optional 18-month phase-in ending 2027-10-20. — [FINRA RN 26-10](https://www.finra.org/rules-guidance/notices/26-10) [official]; [PDF](https://www.finra.org/sites/default/files/2026-04/Regulatory-Notice-26-10.pdf) [official]
- Mechanics: applies on days with an "IML-reducing transaction" (e.g., a purchase or a short sale), and good-faith (cash) accounts are excluded. The firm computes the highest intraday margin deficit; real-time monitoring is optional and a single calculation is permitted. Deficits must be met "as promptly as possible" and stay outstanding up to the 15th business day. A customer who makes a practice of not curing by the 5th business day gets a **90-day restriction** on new debit balances or shorts. Deficits no larger than the lesser of 5% of equity or $1,000 don't count toward "practice." — [FINRA RN 26-10](https://www.finra.org/rules-guidance/notices/26-10) [official]
- The SEC approved SR-FINRA-2025-017 on 2026-04-14. — [Alpaca blog](https://alpaca.markets/blog/finra-retires-the-pdt-rule-introducing-alpacas-new-intraday-margin-framework/) [official broker source]; [Schwab: SEC approves scrapping $25,000 day trader minimum](https://www.schwab.com/learn/story/sec-approves-scrapping-25000-day-trader-minimum) [official]
- The separate $2,000 minimum equity to trade on margin and 25% maintenance remain. — [search summary citing TradeStation/Schwab coverage](https://www.tradestation.com/insights/2026/05/06/day-trade-rule-change/) [broker blog]
- **Alpaca:** implemented 2026-06-04. PDT designation, day-trade counting and the $25k minimum were removed, PDT-restricted accounts were unrestricted, and 4x intraday buying power now needs $2,000 equity instead of $25,000. The API fields `pattern_day_trader`, `daytrade_count`, `daytrading_buying_power` etc. were deprecated and removed by 2026-07-06; use `buying_power`. — [Alpaca blog](https://alpaca.markets/blog/finra-retires-the-pdt-rule-introducing-alpacas-new-intraday-margin-framework/) [official]; [Alpaca docs: Intraday Margin Rule](https://docs.alpaca.markets/us/docs/the-intraday-margin-rule) [official]; [Alpaca on X, implementation day](https://x.com/AlpacaHQ/status/2062566639325917446) [official]
- **tastytrade:** "THE PDT RULE IS GONE." It removes the day-trade limit and the $25K minimum, framed around June 4. — [tastytrade /pdt](https://tastytrade.com/pdt) [official]; [tastytrade /june4](https://tastytrade.com/june4/) [official]
- **E*TRADE:** implemented the new framework 2026-06-09. — [E*TRADE: PDT Rule Change](https://us.etrade.com/knowledge/library/margin/pattern-day-trading-rule-change) [official, via search summary]
- **Schwab:** stopped counting day trades starting 2026-06-08 and adjusts intraday margin buying power in real time. — [SpreadsheetsHub](https://spreadsheetshub.com/blogs/articles/pattern-day-trader-rule) [3P]; see also [Schwab learn article](https://www.schwab.com/learn/story/sec-approves-scrapping-25000-day-trader-minimum) [official; specific date not confirmed in the fetched text]
- **Webull and Robinhood:** "confirmed day-one implementation on June 4." — [Day Trading Toolkit](https://daytradingtoolkit.com/market-insights/pdt-rule-eliminated-2026-complete-guide) [3P]. An earlier piece says Webull announced day-one support while Robinhood only "signaled fast implementation." — [My Investing Club](https://myinvestingclub.com/pattern-day-trader-pdt-rule-change/) [3P]
- **IBKR:** only speculation ("widely expected to be among the first"). — [My Investing Club](https://myinvestingclub.com/pattern-day-trader-pdt-rule-change/) [3P]

### Inferences
- For a small live account (<$25k) running intraday on margin, Alpaca, tastytrade, Schwab and E*TRADE are confirmed or near-confirmed on the new regime. Cash accounts remain bound by settlement (T+1) / good-faith rules regardless, because RN 26-10 excludes good-faith accounts.
- Under the new regime, a bot that blows through intraday margin repeatedly risks a 90-day restriction. Position sizing should cap intraday exposure to `buying_power` and treat any deficit as a halt condition.

### Gaps
- No primary-source confirmation for Robinhood, Webull, IBKR, Tradier or Public adoption dates.
- FINRA said it would issue separate interpretive guidance; whether it has been published by Oct 2026 was not checked.
- How Alpaca paper trading models the intraday margin framework is not documented.

---

## 4. Historical market data for multi-year intraday backtesting: options and costs

### Takeaway
Cheapest credible paths for multi-year minute bars:
- **Alpaca**: free IEX, or $99/mo SIP; history from 2016.
- **Massive (formerly Polygon)**: minute-aggregate flat files back to 2003. Starter about $29/mo for 5 years, Developer about $79/mo for 10 years, Advanced about $199/mo for all history. Prices are from 3P sources.
- **Databento**: Standard $199/mo with 16+ years of OHLCV but only 12 months of L1 trades/quotes. Usage-based pay-per-GB with $125 free credits is a good fit for a one-off bulk pull.

IBKR historical data was not researched.

### Cited Findings
- **Alpaca:** history back to 2016 on both plans. Basic is IEX-only for recent data (the most recent 15 min of SIP is blocked). Algo Trader Plus is $99/mo, unrestricted SIP, 10,000 hist calls/min vs 200 on Basic. — [Alpaca docs: Market Data](https://docs.alpaca.markets/docs/about-market-data-api) [official]; [Alpaca Market Data FAQ](https://docs.alpaca.markets/us/docs/market-data-faq) [official]
- **Massive (formerly Polygon):** individual stock plans $0 Basic (EOD, 5 calls/min, 2 years), $29 Starter, $79 Developer, $199 Advanced. Starter and Developer are 15-min delayed; Advanced is real-time with 20+ years. — [qveris.ai pricing guide](https://api.qveris.ai/guides/polygon-pricing-optimized) [3P; verify on massive.com/pricing]
- Massive minute-aggregates flat files (daily S3 files, all US equities, OHLCV) go back to **2003-09-10**. Starter gets 5 years, Developer 10 years, Advanced all history; Basic is not included. — [Massive docs: Minute Aggregates](https://massive.com/docs/flat-files/stocks/minute-aggregates) [official]
- **Databento:** usage-based billing (pay-as-you-go historical, priced per GB uncompressed, CSV/JSON at no extra cost) with $125 free credits that expire after 6 months. **Standard $199/mo** includes live data and 16+ years of L0 (OHLCV, definitions, statistics), 12 months of L1 (trades, MBP-1, TBBO, BBO), and 1 month of L2/L3. **Plus** costs $1,750/mo in license fees (annual) and **Unlimited** $4,500/mo (16+ years, all schemas). Usage-based live is not available for Databento US Equities. — [Databento Pricing](https://databento.com/pricing) [official]
- Standard $199/mo is corroborated by a 3P source. — [QuantVPS](https://www.quantvps.com/blog/best-apis-for-historical-options-market-data-volatility) [3P]

### Inferences
- For 2016+ minute-bar backtests of a multi-stock system, Alpaca's free historical endpoint covers the basics, but it's IEX unless you pay $99/mo for SIP. SIP-based bars are preferable for realistic volume/VWAP.
- For pre-2016 history or a one-time bulk download, a single month of Massive Developer/Advanced flat files, or Databento usage-based credits, is likely the cheapest route.
- Databento Standard's 12-month limit on trades/quotes history makes it weaker for multi-year tick-level slippage modelling unless you pay usage-based fees.

### Gaps
- Official Massive pricing page not fetched (prices from a 3P guide).
- Databento per-GB rate for US equities OHLCV-1m not published on the pricing page (shown only in the portal), and the US equities dataset start date was not confirmed.
- IBKR historical data (pacing limits, depth of minute bars, subscription costs) not researched.
- Survivorship-bias handling (delisted symbols) per vendor not researched.

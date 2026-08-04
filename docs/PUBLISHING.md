# Publishing

## What must never reach the repo

The validator enforces most of this automatically. The list is here so the policy is
explicit rather than implied by a regex.

**Never published:**

- Account numbers, including masked ones. A masked last-four identifies an account to anyone who can also see the brokerage UI, and it correlates across every post you ever make. (The validator blocks these — it caught this very document during authoring, when the example was written out literally.)
- Balances for any account other than the sandbox. The operator's main book is not part of this experiment and its size is nobody's business. The validator blocks any five- or six-figure dollar figure for this reason.
- Emails, phone numbers, home location, employer, API keys, session tokens, screenshots containing any of the above.
- Order IDs, confirmation numbers, or anything else that maps a public post to a specific brokerage record.

**Deliberately published:**

- Tickers, entry and exit prices, position sizing in percentage terms, the full rulebook, every grade including the failing ones.
- Failures. The connector outage, the 0/6 entry, the six-cent reconciliation gap. A process log that only shows the good days is marketing, not a log.

**A judgement call you should make consciously:** the brokerage name. Naming it is
harmless on its own, but combined with timestamps and position sizes it narrows the
space considerably. This repo omits it from the board and mentions it only in prose
where relevant. If you attach a personal brand to the project, you have identified
yourself by choice — that is fine, but then the account details matter *more*, not less,
because there is no longer any distance between the public record and you.

## The review gate

**An agent writes to this repo. Do not wire agent commits straight to production.**

The failure mode is specific: a run miscomputes a number, hallucinates a level, or
loosens a rule at 10:30am, and it is on a public website before anyone reads it. Once
an audience exists, a wrong number is not just an error — it is a wrong number other
people may have acted on.

Recommended setup:

1. Agent runs commit to a `staging` branch, never to `main`.
2. Vercel gives `staging` a preview deployment. `main` is production.
3. The validator runs on both. It blocks leaks and misleading stats regardless of branch.
4. **A human merges `staging` into `main`.** Once a day is plenty — the after-close retro is the natural moment, since it is the run that has already re-checked the day's numbers.

If you want same-day publishing without a human in the loop, at minimum keep
forward-looking `will` entries out of production until after the window they describe
has closed. Publishing intent before execution is the part that turns a log into a
signal feed.

## Deploying to Vercel

1. Push the repo to GitHub.
2. In Vercel, **Add New → Project**, import the repo.
3. Framework preset: **Other**. Build command: `node scripts/validate.mjs`. Output directory: `.` — `vercel.json` already sets these.
4. Set the production branch to `main` (Settings → Git).
5. Deploy. Every push runs the validator; a leak or a bad stat fails the build and nothing ships.

Repo links in `index.html` already point at the real repository. After the first deploy,
confirm the site URL in `README.md` matches what Vercel actually assigned.

## A note on audience

This project gets more interesting to other people as the sample grows, and more
dangerous to them at the same rate. Two things worth deciding before an audience
exists, not after:

- **Never monetise the calls.** Documentation, tooling, and write-ups are fine. The moment money changes hands in exchange for what to trade, the legal picture in the US changes substantially. If you are anywhere near that line, talk to a securities lawyer first — this document is not legal advice and neither is anything else in the repo.
- **Keep the disclaimer visible on the page**, not buried in a link. It is in the banner at the top of the board for that reason. Do not move it to the footer to make the design cleaner.

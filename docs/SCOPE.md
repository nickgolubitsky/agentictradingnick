# Account scope

**One account. Never any other. Read or write.**

## Where this can and cannot be enforced

The published site has **no brokerage access at all**. It is static HTML that fetches
JSON from its own origin. It cannot read an account, cannot place an order, and cannot
be made to do either by anything a visitor does. So "the site should only show the
sandbox account" is already true by construction — there is no code path to anything
else.

The real exposure is upstream. The **agent runs** authenticate against a brokerage
connector that can see every account the login owns. A connector that lists accounts
lists *all* of them. Nothing in that API knows which one this experiment is allowed to
touch.

That means scope is enforced in three places, and only the last one is automatic:

| Layer | Enforced by | Automatic? |
|---|---|---|
| 1. Which account the agent trades | The mandate the run reads before acting | No — behavioural |
| 2. Which account the agent *reports* | The preflight assertion below | Partly — the run must run it |
| 3. What ever reaches the public repo | `scripts/validate.mjs` | **Yes** |

Layer 3 exists because layers 1 and 2 depend on the agent behaving. Layer 3 does not.
If a run ignores the mandate, misreads the account list, or hallucinates a balance from
the wrong book, the publish gate still refuses to ship it. That is the design intent:
the outermost layer is the one that does not rely on good behaviour.

## Preflight assertion

Every run that touches the brokerage does this **before** reading balances, and
certainly before placing an order:

```
1. Fetch the account list.
2. Select the single account whose identifier matches the target held in the
   private, gitignored config. Match exactly — no "first account", no
   "the one with a balance", no fuzzy matching on nickname.
3. If it is absent, ambiguous, or the list shape is unexpected:
      log the failure, notify, STOP. Do not fall back to another account.
4. Discard every other account from working memory. Do not summarise them,
   do not total them, do not mention them in the log or in a notification.
5. Every subsequent call passes that account identifier explicitly.
   Never call a balance or order endpoint with a default or omitted account.
```

Step 4 is the one that gets skipped. A run that says "your other account is up 2%
today" has already leaked, even if it never traded there — and if that sentence lands
in a commit, it is public.

## Where the identifier lives

**Not in this repository.** The target account identifier belongs in the agent's
private configuration — the same place the mandate lives — never in `data/`, never in
a doc, never in a commit message.

The repo has no legitimate need to know which account it describes. It describes *the*
account. Anonymity here is not a redaction step applied at publish time; it is that the
identifier was never written down on this side of the line.

If you ever need to prove two boards describe the same account without naming it,
publish a salted hash of the identifier with the salt kept private. Do not publish the
last four digits — four digits is a 10,000-item space and is trivially confirmed by
anyone who can also see the brokerage UI.

## What the validator enforces

- `data/state.json` carries exactly one `account` object. A plural `accounts` key, or an array, fails the build.
- No masked or full account numbers anywhere in the repo.
- No five- or six-figure balances — the sandbox is small, so a large figure could only have come from an account this project is not supposed to read.
- No emails, phone numbers, tokens, or keys.

Run it before every commit:

```bash
node scripts/validate.mjs
```

It is also the Vercel build command and a GitHub Actions check, so it runs on every
push whether or not anyone remembers to.

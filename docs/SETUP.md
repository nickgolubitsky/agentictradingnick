# Setup

Start to finish: local repo → GitHub → Vercel → live site. About twenty minutes.

Prerequisites: git, Node 18+, a GitHub account, a Vercel account (the free Hobby tier
is enough — this is static files).

---

## 1. Check it locally first

```bash
cd agentictradingnick
node scripts/validate.mjs
```

You want `ok  0 blocking issues`. If it fails, fix it before pushing — the whole point
is that nothing broken becomes public, and it is much easier to fix here than after a
bad commit is in the history.

Then look at the actual page:

```bash
python3 -m http.server 8000     # or: npx serve .
```

Open `http://localhost:8000`. It must be served over HTTP — opening `index.html` as a
file will fail, because `fetch()` cannot read `file://` URLs.

---

## 2. Create the GitHub repo

```bash
git init
git add .
git commit -m "Agentic trading: public process log"
git branch -M main
```

On GitHub: **New repository** → name it `agentictradingnick` → **Public** → do *not* add
a README, .gitignore, or licence (you already have all three). Then:

```bash
git remote add origin https://github.com/nickgolubitsky/agentictradingnick.git
git push -u origin main
```

Create the staging branch now, before any agent run exists:

```bash
git checkout -b staging
git push -u origin staging
```

Agent runs commit to `staging`. Humans merge to `main`. See step 5.

---

## 3. Connect Vercel

1. vercel.com → **Add New** → **Project**.
2. **Import Git Repository**, authorise GitHub, pick `agentictradingnick`.
3. Framework Preset: **Other**. Leave the build settings alone — `vercel.json` already
   sets the build command to `node scripts/validate.mjs` and the output directory to `.`.
4. **Deploy.**

You get a URL like `agentictradingnick.vercel.app`. That is the live board.

### Set the production branch

Settings → Git → Production Branch → `main`. Now `staging` pushes get a preview URL and
only `main` updates the public site.

---

## 4. Check the URLs

Repo links are already pointed at `nickgolubitsky/agentictradingnick`. The one thing to
confirm after the first deploy is the site URL in `README.md` — it assumes
`agentictradingnick.vercel.app`, but Vercel appends a suffix if that name is taken.

```bash
grep -rn "vercel.app" README.md
```

---

## 5. Wire the agent runs

**Scheduled, as analysts.** As of 2026-08-05 all four slots run as desktop scheduled
tasks — open 09:33, mid-session hourly at :17, pre-close 15:33, retro 16:30 ET, weekdays.

**None of them has order authority.** They publish an order specification as a `will`
entry; a human executes it or discards it. `order.requiresHuman` must be `true` or the
build fails. If you later wire actual execution, do it deliberately and read
[SCOPE.md](SCOPE.md) first — the preflight assertion there is still prose, and it should
be code before anything places an order on a timer.

These are desktop tasks, not a server: they fire only while the Claude app is open, so a
missed window runs late on next launch. Each run guards against that by refusing to write
a specification when it has fired too late for its quotes to be usable. A cloud runner is
the outstanding piece.

No run has recorded a row yet, so the board reports run health 0/5 and every runbook slot
reads NEVER until the first one fires.

This is the part with real consequences, so do it deliberately.

**Runs commit straight to `main` and publish live.** Give the agent a token scoped to
this repo only. The daily sequence is:

```
trading runs   → edit data/state.json, data/moves.json, append to data/why.json
retro run      → edit data/perf.json, data/bench.json, add grades to data/why.json
               → node scripts/validate.mjs, then commit and push main
               → live within a minute
```

There is no human merge step, and that is deliberate. The runs publish order
specifications that expire in 30 to 60 minutes; one sitting in a branch waiting to be
reviewed is worthless by the time anyone reads it. The operator watches the live board
and acts or does not.

What that costs is the human read before publish. What replaces it is
`scripts/validate.mjs`, which was always the layer that mattered — [SCOPE.md](SCOPE.md)
says so directly: layers that depend on an agent behaving well are not the ones holding
the line. Removing the merge step removes a behavioural check and leaves the automatic
one. It also means **a bad write is public immediately**, so the gate has to be treated
as load-bearing rather than as a formality.

Two consequences worth accepting on purpose:

- **`main` cannot be branch-protected** with required reviews, because the runs push to
  it directly. Protect the token instead: scope it to this repository only.
- **Every commit is public the moment it lands.** There is no staging URL to catch a
  leak in. The validator's leak scan is the whole defence.

Every push runs the validator, and it is also the Vercel build command, so a leaked
identifier or a misleading statistic fails the build and the deploy does not happen.
With no merge step in front of it, that is the only thing standing between an agent
commit and the public board.

**Before wiring anything up, read [SCOPE.md](SCOPE.md).** The preflight assertion there
is what keeps a run from reading, totalling, or mentioning an account that is not the
sandbox. The connector can see them all; the mandate is the only thing that stops it.

---

## 6. What to check on the first deploy

- The stale badge reads correctly against `lastRefreshUtc`.
- The disclaimer banner is visible above the fold, not scrolled past.
- The benchmark card shows "Baseline not set" rather than an empty chart — that is
  correct until the first retro with quote access seeds it.
- Win rate shows a dash, not `100%`.
- View source on the deployed page and search it for anything that identifies you. The
  validator catches the patterns it knows; your own eyes catch the rest.

---

## Troubleshooting

**Build fails with `FAIL LEAK` or `FAIL SCOPE`.** Working as designed. The message names
the file and the match. Fix the data, do not weaken the rule.

**Page loads but every card says "Could not load board data".** The JSON did not fetch.
Check that `data/` was committed (it is not in `.gitignore`) and that the browser
console shows a 200 for `data/state.json`.

**Charts do not draw.** Expected with fewer than two data points. The empty state says
so explicitly rather than drawing a line through a single point.

**Vercel deploys but shows a directory listing.** Output directory is not `.`. Confirm
`vercel.json` was committed.

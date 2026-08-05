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

**Not done yet.** As of 2026-08-05 no scheduler exists — this step is outstanding, which
is why the board reports run health 0/5 and every runbook slot reads NEVER. Steps 1–4
above are complete; this one is the gap between a specification and a system.

This is the part with real consequences, so do it deliberately.

**Runs commit to `staging`, never to `main`.** Give the agent a token scoped to this
repo only. Then the daily sequence is:

```
trading runs   → edit data/state.json, data/moves.json, append to data/why.json
retro run      → edit data/perf.json, data/bench.json, add grades to data/why.json
               → commit to staging
you            → read the diff, merge staging → main
```

The after-close retro is the natural merge point: it has already re-checked the day's
numbers, and merging once daily means a bad figure lives on a preview URL rather than
on the public site.

Every push runs the validator on both branches. A leaked identifier or a misleading
statistic fails the build and nothing ships — including to preview.

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

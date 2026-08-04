/* agentic-trading — board renderer.
   Reads data/*.json. Presentation only: it never computes a trading decision,
   and it renders an explicit empty state wherever the data is absent rather
   than inferring a plausible-looking number. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };
  var money = function (n) { return "$" + Number(n).toFixed(2); };
  var pct = function (n) { return (n > 0 ? "+" : n < 0 ? "\u2212" : "") + Math.abs(n).toFixed(2) + "%"; };
  var dir = function (n) { return n > 0.005 ? "up" : n < -0.005 ? "down" : "flat"; };
  var signed = function (n) { return (n >= 0 ? "+" : "\u2212") + "$" + Math.abs(n).toFixed(2); };

  /* ---------- header ---------- */
  function renderStamp(state) {
    var t = new Date(state.lastRefreshUtc);
    var hrs = (Date.now() - t) / 36e5;
    var k = hrs < 2 ? ["fresh", "current"]
          : hrs < 24 ? ["stale", "stale \u00b7 " + Math.round(hrs) + "h ago"]
          : ["dead", "stale \u00b7 " + Math.floor(hrs / 24) + "d ago"];
    $("stamp").innerHTML =
      "last run <b>" + esc(state.lastRefreshUtc) + "</b><br>" +
      '<span class="badge badge--' + k[0] + '">' + esc(k[1]) + "</span>";
  }

  /* ---------- outcome vs process ---------- */
  function renderPair(perf) {
    var net = perf.grossWins - perf.grossLosses;
    var a = perf.adherence;
    var thin = perf.totalTrades < (perf.minSampleForRates || 20);
    var diverged = perf.wins > 0 && a.entriesPassed < a.entriesGraded;

    $("pair").innerHTML =
      "<section><div class='pair__k'>Net P/L</div>" +
      "<div class='pair__v " + dir(net) + "'>" + signed(net) + "</div>" +
      "<div class='pair__m'>" + perf.wins + "W / " + perf.losses + "L \u00b7 " +
        perf.agentTrades + " of " + perf.totalTrades + " placed by the agent</div></section>" +

      "<section><div class='pair__k'>Checklist adherence</div>" +
      "<div class='pair__v " + (a.entriesPassed === a.entriesGraded ? "up" : "down") + "'>" +
        a.entriesPassed + "/" + a.entriesGraded + "</div>" +
      "<div class='pair__m'>entries passing all six at entry \u00b7 exits on time " +
        a.exitsOnTime + "/" + a.exitsTotal + "</div></section>" +

      "<div class='verdict'>" + (diverged
        ? "<b>Green P/L, failed process.</b> The money says nothing about whether the method works. " +
          "This pairing is the entire point of the project: an outcome that looks like skill and a " +
          "process that graded zero, shown at the same size so neither can hide behind the other."
        : "<b>P/L and process agree.</b> Keep the sample growing before trusting either.") +
      (thin ? " Sample is " + perf.totalTrades + " trade" + (perf.totalTrades === 1 ? "" : "s") +
        " \u2014 rates stay blank until " + perf.minSampleForRates + "." : "") + "</div>";
  }

  /* ---------- account ---------- */
  function renderAccount(state) {
    var a = state.account;
    $("account").innerHTML =
      "<div class='tiles'>" +
      tile("Account value", money(a.total), "verified " + a.verifiedAt, "") +
      tile("Deployable now", money(a.deployable), "settled cash", a.deployable < a.total ? "down" : "flat") +
      tile("Unsettled", money(a.unsettled), "settles " + a.settlesOn, "flat") +
      tile("Open positions", String((state.positions || []).length), (state.positions || []).length ? "see exit board" : "flat", "flat") +
      "</div><p class='note'>" + esc(a.note) + "</p>";
  }
  function tile(k, v, m, c) {
    return "<div class='tile'><div class='tile__k'>" + esc(k) + "</div>" +
      "<div class='tile__v " + (c || "") + "'>" + esc(v) + "</div>" +
      "<div class='tile__m'>" + esc(m) + "</div></div>";
  }

  /* ---------- exit board ---------- */
  function renderExits(state) {
    var p = state.positions || [];
    if (!p.length) {
      $("exits").innerHTML = "<div class='empty'><strong>Flat \u2014 no open positions</strong>" +
        "Nothing to enforce. This board lights only when a target, stop, time stop or " +
        "option no-fly window is live.</div>";
      return;
    }
    $("exits").innerHTML = p.map(function (x) {
      var lv = function (k, v, lit) {
        return "<div class='level" + (lit ? " level--lit" : "") + "'>" +
          "<div class='level__k'>" + esc(k) + "</div><div class='level__v'>" + esc(v) + "</div></div>";
      };
      return "<div class='pos pos--" + esc(x.lit || "watch") + "'>" +
        "<div class='pos__t'><span class='pos__s'>" + esc(x.sym) + "</span>" +
        "<span class='pos__d'>" + esc(x.desc || "") + "</span>" +
        "<span class='pos__p " + dir(x.plPct || 0) + "'>" + pct(x.plPct || 0) + "</span></div>" +
        "<div class='levels'>" + lv("Target", x.target, x.lit === "exit") +
        lv("Stop", x.stop, false) + lv("Time stop", x.timeStop, false) +
        (x.noFly ? lv("No-fly", x.noFly, true) : "") + "</div></div>";
    }).join("");
  }

  /* ---------- anticipated moves ---------- */
  function renderMoves(m) {
    var list = m.moves || [];
    if (!list.length) {
      $("moves").innerHTML = "<div class='empty'><strong>No catalysts in the window</strong>" +
        "The open run fills this from the earnings calendar. Empty means the calendar was not checked.</div>";
      return;
    }
    var held = list.filter(function (x) { return x.hold; });
    var h = "";
    if (held.length) {
      h += "<div class='nofly'><b>NO-FLY</b><span>Carrying a position into " +
        held.map(function (x) { return esc(x.ticker); }).join(", ") +
        ". Options never hold through a print \u2014 IV crush kills even a correct call. " +
        "An equity hold is a pre-decided coin flip on the implied move, or it is a mistake.</span></div>";
    }
    h += list.map(function (x) {
      var s = "<article class='move" + (x.hold ? " move--hold" : "") + "'>" +
        "<div class='move__t'><span class='move__k'>" + esc(x.ticker) + "</span>" +
        "<span class='move__e'>" + esc(x.event) + "</span>" +
        "<span class='move__w'>" + esc(x.when) + "</span></div><div class='imp'>" +
        "<div><div class='imp__k'>Implied move</div><div class='imp__v" +
          (x.impliedMove == null ? " imp__v--null" : "") + "'>" +
          (x.impliedMove == null ? "straddle not pulled" : "\u00b1" + (x.impliedMove * 100).toFixed(1) + "%") +
        "</div></div>";
      if (x.impliedMove != null && x.spot != null) {
        s += "<div><div class='imp__k'>Implied range</div><div class='imp__v'>" +
          money(x.spot * (1 - x.impliedMove)) + " \u2013 " + money(x.spot * (1 + x.impliedMove)) + "</div></div>";
      }
      if (x.spot != null) {
        s += "<div><div class='imp__k'>Reference</div><div class='imp__v'>" + money(x.spot) + "</div></div>";
      }
      s += "</div>";
      (x.branches || []).forEach(function (b) {
        s += "<div class='branch'>" +
          "<div><span class='branch__k'>If</span>" + esc(b.cond) + "</div>" +
          "<div><span class='branch__k'>Then</span><span class='branch__a" +
            (b.stand ? " branch__a--stand" : "") + "'>" + esc(b.act) + "</span></div>" +
          "<div><span class='branch__k'>Because</span><span class='branch__w'>" + esc(b.why) + "</span></div></div>";
      });
      if (x.source) s += "<div class='move__src'>" + esc(x.source) + "</div>";
      return s + "</article>";
    }).join("");
    $("moves").innerHTML = h;
  }

  /* ---------- entry watch ---------- */
  function renderWatch(state) {
    var w = state.entryWatch || [];
    if (!w.length) {
      $("watch").innerHTML = "<div class='empty'><strong>Nothing armed</strong>" +
        "A setup reaches this list only with its trigger and its exits written down first.</div>";
      return;
    }
    $("watch").innerHTML = "<table><thead><tr><th>Setup</th><th></th><th>Trigger</th>" +
      "<th>Exits</th><th>Reasoning</th></tr></thead><tbody>" +
      w.map(function (x) {
        return "<tr><td class='sym'>" + esc(x.setup) + "</td>" +
          "<td><span class='flag flag--" + esc(x.state) + "'>" + esc(String(x.state).toUpperCase()) + "</span></td>" +
          "<td>" + esc(x.trigger) + "</td><td class='num'>" + esc(x.exits) + "</td>" +
          "<td>" + esc(x.why) + "</td></tr>";
      }).join("") + "</tbody></table>";
  }

  /* ---------- candidates ---------- */
  function renderCandidates(state) {
    var label = { watch: "WATCH", nofly: "EARNINGS", ok: "OK" };
    $("candidates").innerHTML = "<table><thead><tr><th>Name</th>" +
      "<th class='r'>Last</th><th>Earnings</th><th></th><th>Note</th></tr></thead><tbody>" +
      (state.candidates || []).map(function (c) {
        return "<tr><td class='sym'>" + esc(c.sym) + "</td>" +
          "<td class='num r'>" + money(c.last) + "</td>" +
          "<td class='num'>" + esc(c.earnings) + "</td>" +
          "<td><span class='flag flag--" + esc(c.flag) + "'>" + esc(label[c.flag] || c.flag) + "</span></td>" +
          "<td>" + esc(c.note) + "</td></tr>";
      }).join("") + "</tbody></table>" +
      "<p class='stale'>Prices as of " + esc(state.candidatesAsOf) + ". " + esc(state.candidatesNote) + "</p>";
  }

  /* ---------- why ---------- */
  var CK = { 1: "catalyst", 2: "not the +8% day", 3: "implied move", 4: "liquidity",
             5: "expectations vs positioning", 6: "exits written before entry" };
  var CKV = { pass: "pass", fail: "FAIL", ne: "not evidenced", na: "not applicable" };
  var filter = "all";
  var whyData = { entries: [] };

  function renderWhy() {
    var list = whyData.entries.filter(function (e) { return filter === "all" || e.kind === filter; });
    if (!list.length) {
      $("why").innerHTML = "<div class='empty'><strong>Nothing logged under this filter</strong>" +
        "Every order and every deliberate non-order gets an entry. Silence means a run did not write one.</div>";
      return;
    }
    $("why").innerHTML = list.map(function (e) {
      var ck = e.checklist || {};
      var scored = Object.keys(ck).filter(function (k) { return ck[k] !== "na"; });
      var passed = scored.filter(function (k) { return ck[k] === "pass"; }).length;
      var chips = scored.length
        ? "<div class='chips'><span class='chips__k'>Checklist</span>" +
          [1, 2, 3, 4, 5, 6].map(function (n) {
            var v = ck[n] || "na";
            return "<span class='chip chip--" + v + "' title='" + esc(n + ". " + CK[n] + " \u2014 " + CKV[v]) + "'>" + n + "</span>";
          }).join("") +
          "<span class='chip__n'>" + passed + "/" + scored.length + "</span></div>"
        : "";
      var grade = e.grade
        ? "<div class='wy__g'><b>" + esc(e.grade.by) + "</b> \u2014 " + esc(e.grade.text) + "</div>"
        : (e.kind === "did" ? "<div class='wy__p'>Not yet graded.</div>" : "");
      return "<article class='wy wy--" + esc(e.kind) + "'><div class='wy__t'>" +
        "<span class='wy__k'>" + (e.kind === "did" ? "DID" : "WILL") + "</span>" +
        "<span class='wy__h'>" + esc(e.head) + "</span>" +
        "<span class='wy__d'>" + esc(e.date) + "</span></div>" +
        "<p class='wy__b'>" + esc(e.body) + "</p>" + chips + grade + "</article>";
    }).join("");
  }

  /* ---------- chart helper ---------- */
  function lineChart(rows, lines, fmt, band) {
    var W = 1000, H = 260, P = { t: 18, r: 16, b: 28, l: 56 };
    var vals = [];
    rows.forEach(function (r) { lines.forEach(function (l) { if (r[l.k] != null) vals.push(r[l.k]); }); });
    if (band) vals.push(0);
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    var pad = Math.max((hi - lo) * 0.14, Math.abs(hi || 1) * 0.01);
    lo -= pad; hi += pad;
    var X = function (i) { return P.l + i * (W - P.l - P.r) / (rows.length - 1); };
    var Y = function (v) { return P.t + (hi - v) * (H - P.t - P.b) / (hi - lo); };
    var path = function (k) {
      return rows.map(function (r, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(r[k]).toFixed(1); }).join(" ");
    };
    var s = "<svg class='chart' viewBox='0 0 " + W + " " + H + "' role='img' aria-label='" +
      esc(band ? "Account performance versus benchmark indexes, rebased to the baseline session" : "Account equity curve") + "'>";
    if (band) {
      s += "<line x1='" + P.l + "' x2='" + (W - P.r) + "' y1='" + Y(0).toFixed(1) + "' y2='" + Y(0).toFixed(1) +
        "' stroke='var(--line)'/><text x='" + (P.l - 9) + "' y='" + (Y(0) + 4).toFixed(1) +
        "' text-anchor='end' font-family='var(--num)' font-size='11' fill='var(--ink3)'>0%</text>";
      var okBand = rows.every(function (r) { return r[band[0]] != null && r[band[1]] != null; });
      if (okBand) {
        var d = rows.map(function (r, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(r[band[0]]).toFixed(1); }).join(" ") +
          " " + rows.slice().reverse().map(function (r, i) {
            return "L" + X(rows.length - 1 - i).toFixed(1) + " " + Y(r[band[1]]).toFixed(1);
          }).join(" ") + " Z";
        var ahead = rows[rows.length - 1][band[0]] >= rows[rows.length - 1][band[1]];
        s += "<path d='" + d + "' fill='" + (ahead ? "var(--up)" : "var(--down)") + "' opacity='0.12'/>";
      }
    }
    lines.forEach(function (l) {
      if (rows.some(function (r) { return r[l.k] == null; })) return;
      s += "<path d='" + path(l.k) + "' fill='none' stroke='" + l.color + "' stroke-width='" + l.w +
        "' stroke-linejoin='round' stroke-linecap='round'/>";
    });
    s += "<text x='" + (P.l - 9) + "' y='" + (P.t + 10) + "' text-anchor='end' font-family='var(--num)' " +
      "font-size='11' fill='var(--ink3)'>" + esc(fmt(hi)) + "</text>" +
      "<text x='" + P.l + "' y='" + (H - 8) + "' font-family='var(--num)' font-size='11' fill='var(--ink3)'>" +
      esc(rows[0].date) + "</text><text x='" + (W - P.r) + "' y='" + (H - 8) + "' text-anchor='end' " +
      "font-family='var(--num)' font-size='11' fill='var(--ink3)'>" + esc(rows[rows.length - 1].date) + "</text></svg>";
    return s;
  }

  /* ---------- performance ---------- */
  function renderPerf(p) {
    var a = p.adherence, L = p.ledger;
    var thin = p.totalTrades < (p.minSampleForRates || 20);
    var h = "<div class='tiles'>" +
      tile("Win rate", thin ? "\u2014" : ((p.wins / p.totalTrades) * 100).toFixed(0) + "%",
        p.wins + "W / " + p.losses + "L \u00b7 n=" + p.totalTrades, "flat") +
      tile("Profit factor", p.grossLosses > 0 ? (p.grossWins / p.grossLosses).toFixed(2) : "\u2014",
        p.grossLosses > 0 ? "gross wins / losses" : "no losses yet", "flat") +
      tile("Avg win", p.wins ? money(p.grossWins / p.wins) : "\u2014", "per winning trade", p.wins ? "up" : "flat") +
      tile("Avg loss", p.losses ? money(p.grossLosses / p.losses) : "\u2014", "per losing trade", "flat") +
      tile("Agent trades", String(p.agentTrades), "of " + p.totalTrades + " total", "flat") +
      "</div>";
    if (thin) {
      h += "<p class='note'>Win rate and profit factor stay blank below " + p.minSampleForRates +
        " trades. One win is 100% and it would be a lie told with arithmetic \u2014 " +
        "especially this one, which graded 0/6 on process.</p>";
    }

    h += "<div class='sub'>Equity curve</div>";
    h += p.equityCurve.length < 2
      ? "<div class='empty'><strong>One point on the board</strong>A line through a single point is a decoration.</div>"
      : lineChart(p.equityCurve.map(function (x) { return { date: x.date, v: x.v }; }),
          [{ k: "v", color: "var(--bench)", w: 2.5 }], money) +
        "<p class='note'>Start value derived from cash plus premium held before the first fill. " +
        "Close value reconciled against the brokerage, including a $0.06 regulatory fee.</p>";

    h += "<div class='sub'>Closed trades</div><table><thead><tr><th>Date</th><th>Instrument</th>" +
      "<th class='r'>P/L</th><th class='r'>%</th><th>Placed by</th><th>Process grade</th></tr></thead><tbody>" +
      p.closedTrades.map(function (t) {
        return "<tr><td class='num'>" + esc(t.date) + "</td><td class='sym'>" + esc(t.sym) + "</td>" +
          "<td class='num r " + dir(t.pl) + "'>" + signed(t.pl) + "</td>" +
          "<td class='num r " + dir(t.plPct) + "'>" + pct(t.plPct) + "</td>" +
          "<td>" + (t.byAgent ? "agent" : "by hand") + "</td><td>" + esc(t.grade) + "</td></tr>";
      }).join("") + "</tbody></table>";

    h += "<div class='sub'>Discipline ledger</div><div class='led'>" +
      [["Acted on time", L.onTime, "up"],
       ["Acted late", L.late, L.late ? "down" : "flat"],
       ["Missed setups", L.missed, L.missed ? "down" : "flat"],
       ["Stand-asides", L.standAside, "flat"],
       ["Entries passing", a.entriesPassed + "/" + a.entriesGraded, a.entriesPassed < a.entriesGraded ? "down" : "up"],
       ["Exits on time", a.exitsOnTime + "/" + a.exitsTotal, "up"]]
      .map(function (x) { return tile(x[0], String(x[1]), "", x[2]); }).join("") + "</div>" +
      L.items.map(function (i) {
        return "<div class='led-i'><b>" + esc(i.date) + "</b><span>" + esc(i.text) + "</span></div>";
      }).join("");
    $("perf").innerHTML = h;
  }

  /* ---------- bench ---------- */
  var BL = [{ k: "account", label: "Account", color: "var(--bench)", w: 2.5 },
            { k: "smh", label: "SMH", color: "var(--watch)", w: 1.5 },
            { k: "spy", label: "SPY", color: "var(--ink3)", w: 1.5 },
            { k: "qqq", label: "QQQ", color: "var(--ne)", w: 1.5 }];

  function renderBench(b) {
    if (!b.baseline) {
      $("bench").innerHTML = "<div class='empty'><strong>Baseline not set</strong>" +
        "The first retro run with quote access seeds <code>baseline</code> from live SPY, QQQ and SMH " +
        "closes plus the account value, then never edits it again. Nothing renders until then \u2014 " +
        "a guessed baseline silently biases every number derived from it.</div>";
      return;
    }
    var base = b.baseline;
    var rows = (b.series || []).map(function (r) {
      var o = { date: r.date };
      BL.forEach(function (l) { o[l.k] = base[l.k] ? (r[l.k] / base[l.k] - 1) * 100 : null; });
      return o;
    });
    var last = rows[rows.length - 1] || null;
    var h = "<div class='tiles'>" + BL.map(function (l) {
      var v = last ? last[l.k] : null;
      return tile(l.label, v == null ? "\u2014" : pct(v), "since " + base.date, v == null ? "flat" : dir(v));
    }).join("");
    if (last && last.account != null && last.smh != null) {
      var al = last.account - last.smh;
      h += "<div class='tile tile--alpha'><div class='tile__k'>vs SMH</div>" +
        "<div class='tile__v " + dir(al) + "'>" + pct(al) + "</div>" +
        "<div class='tile__m'>" + (al >= 0 ? "beat semis" : "sector beta, not skill") + "</div></div>";
    }
    h += "</div>";
    if (rows.length < 2) {
      h += "<div class='empty'><strong>One session on the board</strong>The curve draws from the second session.</div>";
      $("bench").innerHTML = h;
      return;
    }
    h += lineChart(rows, BL, pct, ["account", "smh"]) +
      "<div class='legend'>" + BL.map(function (l) {
        return "<span><i style='background:" + l.color + "'></i>" + esc(l.label) + "</span>";
      }).join("") +
      "<span><i style='background:var(--up);opacity:.4'></i>shaded = account minus SMH</span></div>" +
      "<p class='note'>SMH is the honest benchmark, not SPY. An account trading AI-hardware names beats " +
      "SPY by holding semis, not by picking them. Beating SPY while trailing SMH means the account " +
      "collected sector beta and the log called it skill.</p>";
    $("bench").innerHTML = h;
  }

  /* ---------- boot ---------- */
  function load(name) {
    return fetch("data/" + name + ".json", { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(name + ": HTTP " + r.status);
      return r.json();
    });
  }

  Promise.all([load("state"), load("moves"), load("why"), load("perf"), load("bench")])
    .then(function (d) {
      var state = d[0], moves = d[1], perf = d[3], bench = d[4];
      whyData = d[2];
      renderStamp(state);
      renderPair(perf);
      renderAccount(state);
      renderExits(state);
      renderMoves(moves);
      renderWatch(state);
      renderCandidates(state);
      renderWhy();
      renderPerf(perf);
      renderBench(bench);
    })
    .catch(function (e) {
      document.querySelectorAll("[data-slot]").forEach(function (n) {
        n.innerHTML = "<div class='empty'><strong>Could not load board data</strong>" + esc(e.message) +
          "<br>Serve this over HTTP rather than opening the file directly \u2014 " +
          "<code>npx serve .</code></div>";
      });
    });

  document.querySelectorAll(".filters button").forEach(function (b) {
    b.addEventListener("click", function () {
      filter = b.dataset.f;
      document.querySelectorAll(".filters button").forEach(function (x) {
        x.setAttribute("aria-pressed", String(x === b));
      });
      renderWhy();
    });
  });
})();

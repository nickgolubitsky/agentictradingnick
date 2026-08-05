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

  /* ---------- run health ---------- */
  /* Aggregate of the pre-file summary and the per-run rows. Kept in one place
     because three surfaces read it and they must not disagree. */
  function runHealth(r) {
    var p = (r && r.priorSummary) || {};
    var list = (r && r.runs) || [];
    var f = function (k) { return list.filter(function (x) { return x[k]; }).length; };
    return {
      fired: (p.fired || 0) + f("fired"),
      connected: (p.connected || 0) + f("connected"),
      actions: (p.actions || 0) + list.reduce(function (n, x) { return n + (x.actions || 0); }, 0),
      itemised: list.length
    };
  }

  /* ---------- headline: can the agent run itself? ---------- */
  /* Three measures of autonomy. P/L is deliberately not here \u2014 it lives in
     Performance. An account this small cannot make its returns interesting, but
     it can absolutely make its reliability interesting. */
  function renderHeadline(perf, runs) {
    var rh = runHealth(runs);
    var a = perf.adherence;
    var tot = perf.totalTrades, un = perf.agentTrades;
    var thin = tot < (perf.minSampleForRates || 20);

    var cell = function (k, v, c, m) {
      return "<section><div class='pair__k'>" + esc(k) + "</div>" +
        "<div class='pair__v " + c + "'>" + esc(v) + "</div>" +
        "<div class='pair__m'>" + m + "</div></section>";
    };

    var h =
      cell("Run health",
        rh.fired ? rh.connected + "/" + rh.fired : "\u2014",
        !rh.fired ? "flat" : rh.connected === rh.fired ? "up" : "down",
        rh.fired ? "scheduled runs that reached the brokerage"
                 : "no runs recorded yet") +

      cell("Unaided actions",
        tot ? un + "/" + tot : "\u2014",
        !tot ? "flat" : un === tot ? "up" : "down",
        tot ? "orders placed by the agent, not by hand"
            : "no actions recorded yet") +

      cell("Checklist adherence",
        a.entriesGraded ? a.entriesPassed + "/" + a.entriesGraded : "\u2014",
        !a.entriesGraded ? "flat" : a.entriesPassed === a.entriesGraded ? "up" : "down",
        "entries passing all six \u00b7 exits on time " + a.exitsOnTime + "/" + a.exitsTotal);

    var v;
    if (rh.fired && rh.connected === 0 && un === 0) {
      v = "<b>The agent is not yet running itself.</b> " + rh.fired + " scheduled run" +
        (rh.fired === 1 ? "" : "s") + " fired and none reached the brokerage; " +
        (tot - un) + " of " + tot + " action" + (tot === 1 ? "" : "s") +
        " on this board was placed by hand. Everything below describes a process a human is " +
        "still driving. Closing that gap is the project \u2014 so it is stated at the top rather " +
        "than left to be inferred from a ledger note.";
    } else if (rh.connected < rh.fired) {
      v = "<b>Partial autonomy.</b> " + rh.connected + " of " + rh.fired + " runs reached the " +
        "brokerage. A run that fires without a connection is not a smaller success; it is a " +
        "run that could not have enforced a stop.";
    } else if (un < tot) {
      v = "<b>Runs are healthy; the hand is still on the wheel.</b> Every scheduled run " +
        "connected, but " + (tot - un) + " of " + tot + " actions were placed manually.";
    } else {
      v = "<b>Running unattended.</b> Every recorded run connected and every action was the " +
        "agent's. Adherence is now the number that matters.";
    }
    if (thin) {
      v += " Trade sample is " + tot + " \u2014 win rate and profit factor stay blank until " +
        (perf.minSampleForRates || 20) + ".";
    }
    $("pair").innerHTML = h + "<div class='verdict'>" + v + "</div>";
  }

  /* ---------- run history ---------- */
  function renderRuns(r) {
    var rh = runHealth(r);
    var list = (r.runs || []).slice().reverse();
    var p = r.priorSummary;

    var h = "<div class='tiles'>" +
      tile("Runs fired", String(rh.fired), "scheduled firings on record", "flat") +
      tile("Connected", rh.fired ? rh.connected + "/" + rh.fired : "\u2014",
        "reached the brokerage", !rh.fired ? "flat" : rh.connected === rh.fired ? "up" : "down") +
      tile("Blind runs", String(rh.fired - rh.connected),
        "fired with no live account state", rh.fired - rh.connected ? "down" : "up") +
      tile("Actions taken", String(rh.actions), "orders placed across all runs", "flat") +
      "</div>";

    if (!list.length) {
      h += "<div class='empty'><strong>No per-run rows yet</strong>" +
        "Per-run records begin " + esc(r.recordsBeginOn || "when runs start writing them") +
        ". Until a run writes its own row, this table stays empty rather than reconstructing " +
        "one from the log.</div>";
    } else {
      h += "<div class='tw'><table><thead><tr><th>Date</th><th>Slot</th><th>At</th>" +
        "<th>Fired</th><th>Connected</th><th class='r'>Actions</th><th>Note</th></tr></thead><tbody>" +
        list.map(function (x) {
          var yn = function (b) {
            return "<span class='flag flag--" + (b ? "ok" : "nofly") + "'>" + (b ? "YES" : "NO") + "</span>";
          };
          return "<tr><td class='num'>" + esc(x.date) + "</td>" +
            "<td class='sym'>" + esc(x.slot) + "</td>" +
            "<td class='num'>" + esc(x.at || "\u2014") + "</td>" +
            "<td>" + yn(x.fired) + "</td><td>" + yn(x.connected) + "</td>" +
            "<td class='num r'>" + esc(String(x.actions == null ? "\u2014" : x.actions)) + "</td>" +
            "<td>" + esc(x.note || "") + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    }

    if (p && p.fired) {
      h += "<p class='note'><b>Before " + esc(r.recordsBeginOn) + ":</b> " + esc(p.note) + "</p>";
    }
    $("runs").innerHTML = h;
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
    $("watch").innerHTML = "<div class='tw'><table><thead><tr><th>Setup</th><th></th><th>Trigger</th>" +
      "<th>Exits</th><th>Reasoning</th></tr></thead><tbody>" +
      w.map(function (x) {
        return "<tr><td class='sym'>" + esc(x.setup) + "</td>" +
          "<td><span class='flag flag--" + esc(x.state) + "'>" + esc(String(x.state).toUpperCase()) + "</span></td>" +
          "<td>" + esc(x.trigger) + "</td><td class='num'>" + esc(x.exits) + "</td>" +
          "<td>" + esc(x.why) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  /* ---------- candidates ---------- */
  function renderCandidates(state) {
    var label = { watch: "WATCH", nofly: "EARNINGS", ok: "OK" };
    $("candidates").innerHTML = "<div class='tw'><table><thead><tr><th>Name</th>" +
      "<th class='r'>Last</th><th>Earnings</th><th></th><th>Note</th></tr></thead><tbody>" +
      (state.candidates || []).map(function (c) {
        return "<tr><td class='sym'>" + esc(c.sym) + "</td>" +
          "<td class='num r'>" + money(c.last) + "</td>" +
          "<td class='num'>" + esc(c.earnings) + "</td>" +
          "<td><span class='flag flag--" + esc(c.flag) + "'>" + esc(label[c.flag] || c.flag) + "</span></td>" +
          "<td>" + esc(c.note) + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
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
    var net = p.grossWins - p.grossLosses;
    var h = "<div class='tiles'>" +
      tile("Net P/L", signed(net), p.wins + "W / " + p.losses + "L", dir(net)) +
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

    /* Fill detail is optional per trade. A dash means the fill was never recorded —
       it is not reconstructed from P/L arithmetic, because a reconstructed price is
       indistinguishable from a confirmed one once it is committed. */
    var dash = function (v) { return v == null || v === "" ? "—" : v; };
    h += "<div class='sub'>Closed trades</div>";
    h += p.closedTrades.length
      ? "<div class='tw'><table><thead><tr><th>Date</th><th>Instrument</th>" +
        "<th class='r'>Entry</th><th class='r'>Exit</th><th class='r'>Held</th>" +
        "<th class='r'>P/L</th><th class='r'>%</th><th>Placed by</th><th>Process grade</th>" +
        "</tr></thead><tbody>" +
        p.closedTrades.map(function (t) {
          return "<tr><td class='num'>" + esc(t.date) + "</td><td class='sym'>" + esc(t.sym) + "</td>" +
            "<td class='num r'>" + esc(t.entry == null ? "—" : money(t.entry)) + "</td>" +
            "<td class='num r'>" + esc(t.exit == null ? "—" : money(t.exit)) + "</td>" +
            "<td class='num r'>" + esc(dash(t.held)) + "</td>" +
            "<td class='num r " + dir(t.pl) + "'>" + signed(t.pl) + "</td>" +
            "<td class='num r " + dir(t.plPct) + "'>" + pct(t.plPct) + "</td>" +
            "<td>" + (t.byAgent ? "agent" : "by hand") + "</td><td>" + esc(t.grade) + "</td></tr>";
        }).join("") + "</tbody></table></div>"
      : "<div class='empty'><strong>No closed trades</strong>Nothing has been opened and closed " +
        "under the mandate yet.</div>";

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
    /* A baseline can be honest and still be misleading if the window it opens on
       contains something the agent did not do. When the retro records that, it
       renders next to the numbers rather than sitting in the JSON unread. */
    if (base.note) h += "<p class='note'>" + esc(base.note) + "</p>";
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

  Promise.all([load("state"), load("moves"), load("why"), load("perf"), load("bench"), load("runs")])
    .then(function (d) {
      var state = d[0], moves = d[1], perf = d[3], bench = d[4], runs = d[5];
      whyData = d[2];
      renderStamp(state);
      renderHeadline(perf, runs);
      renderAccount(state);
      renderExits(state);
      renderMoves(moves);
      renderWatch(state);
      renderCandidates(state);
      renderWhy();
      renderRuns(runs);
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

  /* ---------- tabs ----------
     Progressive enhancement on purpose: the panels are visible in the markup and
     only this code hides them. With JS off — or if this file fails to parse — the
     page degrades to the single long scroll it used to be, with nothing lost.
     The disclaimer, the stamp and the headline sit outside the panels, so they
     stay on screen no matter which tab is open. */
  (function tabs() {
    var strip = document.querySelector(".tabs");
    var btns = [].slice.call(document.querySelectorAll(".tabs button"));
    var panels = [].slice.call(document.querySelectorAll("[data-panel]"));
    if (!strip || !btns.length || !panels.length) return;

    document.body.classList.add("tabs-on");

    function show(name, focus) {
      var known = panels.some(function (p) { return p.dataset.panel === name; });
      if (!known) name = panels[0].dataset.panel;
      panels.forEach(function (p) { p.hidden = p.dataset.panel !== name; });
      btns.forEach(function (b) {
        var on = b.dataset.tab === name;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      return name;
    }

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var n = show(b.dataset.tab);
        // replaceState, not a hash assignment: switching tabs should not stack
        // history entries the back button then has to chew through.
        history.replaceState(null, "", "#" + n);
      });
    });

    strip.addEventListener("keydown", function (e) {
      var i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      var j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1
            : e.key === "Home" ? 0 : e.key === "End" ? btns.length - 1 : -1;
      if (j < 0 && j !== 0) return;
      e.preventDefault();
      j = (j + btns.length) % btns.length;
      history.replaceState(null, "", "#" + show(btns[j].dataset.tab, true));
    });

    window.addEventListener("hashchange", function () {
      show(location.hash.replace(/^#/, ""));
    });

    show(location.hash.replace(/^#/, ""));
  })();
})();

// The Learn page (learn.html): one card per deck (ZBLL, ZBLS) with today's
// queue, progress, a goal time and which groups new cases come from.
// Scheduling is in scripts/srs.js; studying happens in trainer.html?learn=DECK.

(function () {
    var root = document.getElementById("deckList");
    if (!root || !window.Srs) return;

    var GOAL_RECENT = 5; // attempts per case that count towards the goal

    function el(tag, cls, html) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html != null) n.innerHTML = html;
        return n;
    }

    function esc(t) {
        return String(t).replace(/[&<>"]/g, function (ch) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
        });
    }

    function attemptsByCase() {
        var list;
        try { list = JSON.parse(localStorage.getItem("zbllAttempts") || "[]"); } catch (e) { list = []; }
        var by = {};
        for (var i = list.length - 1; i >= 0; i--) {
            var a = list[i];
            if (!a.caseName || !(a.time > 0) || a.result === "DNF") continue;
            var arr = by[a.caseName] || (by[a.caseName] = []);
            if (arr.length < GOAL_RECENT) arr.push(a.time);
        }
        return by;
    }

    function timeText(ms) {
        var d = new Date(ms);
        return d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
    }

    // ── Streak ──────────────────────────────────────────────────────────

    function renderStreak() {
        var s = Srs.streak();
        var node = document.getElementById("learnStreak");
        if (!node) return;
        if (!s.days) node.textContent = "Study today to start a streak.";
        else node.innerHTML = '<span class="streak-flame" aria-hidden="true">🔥</span> ' + s.days +
            " day" + (s.days === 1 ? "" : "s") + " in a row" + (s.today ? "" : " · study today to keep it going");
    }

    // ── A deck card ─────────────────────────────────────────────────────

    function renderDeck(deck) {
        var info = Srs.decks[deck];
        var cases = Srs.deckCases(deck);
        if (!cases.length) return null;
        var q = Srs.queue(deck);
        var p = Srs.progress(deck);
        var settings = Srs.getSettings(deck);
        var dueTotal = q.counts.new + q.counts.learning + q.counts.review;

        var card = el("section", "deck-card");
        card.dataset.deck = deck;

        // Header: name, today's counts, study button
        var head = el("div", "deck-head");
        head.appendChild(el("h2", "deck-title", info.label));
        head.appendChild(el("div", "deck-counts",
            '<span class="count count-new" title="New cases left today"><b>' + q.counts.new + "</b> new</span>" +
            '<span class="count count-learning" title="Cases you are still learning"><b>' + q.counts.learning + "</b> learning</span>" +
            '<span class="count count-review" title="Reviews due today"><b>' + q.counts.review + "</b> review</span>"));
        var study = el("a", "btn btn-primary deck-study");
        study.href = "trainer.html?learn=" + deck;
        if (q.next) study.textContent = "Study now";
        else {
            study.textContent = q.waitingUntil ? "Next case at " + timeText(q.waitingUntil) : "Done for today";
            study.classList.add("is-done");
            study.setAttribute("aria-disabled", "true");
            study.removeAttribute("href");
        }
        head.appendChild(study);
        card.appendChild(head);

        // Progress
        var pct = function (n) { return p.total ? (n / p.total) * 100 : 0; };
        var bar = el("div", "deck-progress");
        bar.innerHTML =
            '<div class="progress-bar" role="img" aria-label="' + p.known + " known, " + (p.learned - p.known) +
            " learned, " + p.learning + " learning, " + p.new + ' not started">' +
            '<span class="seg seg-known" style="width:' + pct(p.known) + '%"></span>' +
            '<span class="seg seg-learned" style="width:' + pct(p.learned - p.known) + '%"></span>' +
            '<span class="seg seg-learning" style="width:' + pct(p.learning) + '%"></span>' +
            "</div>" +
            '<p class="progress-text"><b>' + p.known + " / " + p.total + "</b> known" +
            '<span class="legend" title="Known: reviews 3 weeks or more apart"><i class="dot seg-known"></i>3+ weeks apart' +
            '<i class="dot seg-learned"></i>' + (p.learned - p.known) + " learned" +
            '<i class="dot seg-learning"></i>' + p.learning + " learning</span></p>";
        card.appendChild(bar);

        card.appendChild(renderGoal(deck, cases, settings));
        card.appendChild(renderSettings(deck, cases, settings));
        return card;
    }

    // Goal: a target time, and how many of your learned cases beat it
    function renderGoal(deck, cases, settings) {
        var box = el("div", "deck-goal");
        var by = attemptsByCase();
        var label = el("label", "goal-label", "Goal time ");
        var input = el("input", "input input-short goal-input");
        input.type = "number";
        input.min = "0.3";
        input.step = "0.1";
        input.placeholder = "e.g. 2.0";
        input.value = settings.goal || "";
        input.setAttribute("aria-label", "Goal time in seconds");
        label.appendChild(input);
        label.appendChild(document.createTextNode(" s"));
        box.appendChild(label);

        var text = el("p", "goal-text");
        var bar = el("div", "progress-bar goal-bar");
        function update() {
            var goal = parseFloat(input.value);
            if (!(goal > 0)) {
                text.textContent = "Set a target average to see how close you are.";
                bar.hidden = true;
                return;
            }
            var started = 0, under = 0;
            cases.forEach(function (c) {
                if (Srs.getCard(c.key).state === "new") return;
                var times = by[c.name];
                if (!times || !times.length) return;
                started++;
                var avg = times.reduce(function (s, t) { return s + t; }, 0) / times.length;
                if (avg <= goal) under++;
            });
            bar.hidden = !started;
            bar.innerHTML = '<span class="seg seg-known" style="width:' + (started ? (under / started) * 100 : 0) + '%"></span>';
            text.innerHTML = started
                ? "<b>" + under + " of " + started + "</b> cases you've started average under " + goal.toFixed(2) + "s (last " + GOAL_RECENT + " solves)"
                : "Solve some cases to see how close you are.";
        }
        input.addEventListener("change", function () {
            var goal = parseFloat(input.value);
            Srs.setSettings(deck, { goal: goal > 0 ? goal : null });
            update();
        });
        update();
        box.appendChild(text);
        box.appendChild(bar);
        return box;
    }

    // Settings: new cases per day, and which groups new cases come from
    function renderSettings(deck, cases, settings) {
        var details = el("details", "deck-settings");
        details.appendChild(el("summary", null, "<span>Settings and cases</span>" +
            '<svg class="icon chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'));

        var perDay = el("label", "setting-row", "<span>New cases per day</span>");
        var num = el("input", "input input-short");
        num.type = "number";
        num.min = "0";
        num.max = "50";
        num.value = settings.newPerDay;
        num.addEventListener("change", function () {
            var n = Math.max(0, Math.min(50, parseInt(num.value, 10) || 0));
            num.value = n;
            Srs.setSettings(deck, { newPerDay: n });
            refresh();
        });
        perDay.appendChild(num);
        details.appendChild(perDay);

        details.appendChild(el("p", "setting-hint",
            "New cases are taught in this order. Untick a group to skip it for now, or mark it as known if you already know those algs: they go straight to review, so you get checked on them over the next week."));

        // Group rows
        var groups = [];
        var byGroup = {};
        cases.forEach(function (c) {
            if (!byGroup[c.group]) { byGroup[c.group] = []; groups.push(c.group); }
            byGroup[c.group].push(c);
        });
        var list = el("ul", "group-list");
        groups.forEach(function (g) {
            var items = byGroup[g];
            var started = items.filter(function (c) { return Srs.getCard(c.key).state !== "new"; }).length;
            var li = el("li", "group-row");
            var check = el("input");
            check.type = "checkbox";
            check.checked = !settings.skip[g];
            check.id = "grp-" + deck + "-" + g.replace(/\W/g, "_");
            check.addEventListener("change", function () {
                var skip = Srs.getSettings(deck).skip;
                if (check.checked) delete skip[g]; else skip[g] = true;
                Srs.setSettings(deck, { skip: skip });
                refresh(true);
            });
            var label = el("label", "group-name", esc(g));
            label.htmlFor = check.id;
            li.appendChild(check);
            li.appendChild(label);
            li.appendChild(el("span", "group-count", started + " / " + items.length));
            var known = el("button", "btn btn-ghost btn-sm", "I know these");
            known.type = "button";
            known.disabled = started === items.length;
            known.addEventListener("click", function () {
                Srs.markKnown(items.map(function (c) { return c.key; }));
                refresh(true);
            });
            var reset = el("button", "btn btn-ghost btn-sm", "Reset");
            reset.type = "button";
            reset.disabled = started === 0;
            reset.addEventListener("click", function () {
                if (!confirm("Reset your progress on " + g + "? Those cases go back to new.")) return;
                Srs.resetCards(items.map(function (c) { return c.key; }));
                refresh(true);
            });
            li.appendChild(known);
            li.appendChild(reset);
            list.appendChild(li);
        });
        details.appendChild(list);
        return details;
    }

    // ── Render ──────────────────────────────────────────────────────────

    var openSettings = {};
    function refresh(keepOpen) {
        root.querySelectorAll(".deck-card").forEach(function (c) {
            var d = c.querySelector(".deck-settings");
            openSettings[c.dataset.deck] = keepOpen && d && d.open;
        });
        root.innerHTML = "";
        Object.keys(Srs.decks).forEach(function (deck) {
            var card = renderDeck(deck);
            if (!card) return;
            if (openSettings[deck]) card.querySelector(".deck-settings").open = true;
            root.appendChild(card);
        });
        renderStreak();
    }

    refresh();
    // Learning cases come due within minutes: keep the counts current
    setInterval(function () {
        var typing = document.activeElement && root.contains(document.activeElement);
        if (!document.hidden && !typing) refresh(true);
    }, 30000);
    window.addEventListener("pageshow", function () { refresh(true); });
})();

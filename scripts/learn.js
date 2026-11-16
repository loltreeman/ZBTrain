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
        // New cases you've picked and not started yet
        var picked = Object.keys(settings.include).filter(function (k) {
            return Srs.getCard(k).state === "new";
        }).length;
        var nothingYet = !q.next && !q.waitingUntil && !picked;
        if (q.next) study.textContent = "Study now";
        else if (nothingYet) {
            // Nothing picked yet: the beginner path, or pick cases yourself
            study = el("div", "deck-start");
            var pathBtn = el("button", "btn btn-primary deck-study", "Start the beginner path");
            pathBtn.type = "button";
            pathBtn.title = "Picks your first cases for you, one group at a time";
            pathBtn.addEventListener("click", function () {
                Srs.startPath(deck);
                refresh(true);
            });
            var chooseBtn = el("button", "btn btn-secondary deck-study", "Choose cases myself");
            chooseBtn.type = "button";
            chooseBtn.addEventListener("click", function () {
                var d = card.querySelector(".deck-settings");
                d.open = true;
                d.scrollIntoView({ behavior: "smooth", block: "start" });
            });
            study.appendChild(pathBtn);
            study.appendChild(chooseBtn);
        } else {
            study.textContent = q.waitingUntil ? "Next case at " + timeText(q.waitingUntil) : "Done for today";
            study.classList.add("is-done");
            study.setAttribute("aria-disabled", "true");
            study.removeAttribute("href");
        }
        head.appendChild(study);
        card.appendChild(head);

        // Beginner path: where you are
        var path = Srs.pathStatus(deck);
        if (path.on) {
            var strip = el("div", "path-strip");
            strip.innerHTML =
                '<span class="path-badge">Beginner path</span>' +
                '<span class="path-text">' +
                (path.current ? "Learning <b>" + esc(path.current) + "</b> · group " + path.done + " of " + path.total : "Starting…") +
                (path.next ? " · next: " + esc(path.next) + ", once you've started every case" : " · last group") +
                "</span>";
            var leave = el("button", "btn btn-ghost btn-sm", "Leave path");
            leave.type = "button";
            leave.title = "Keep the cases you have, but stop adding new groups";
            leave.addEventListener("click", function () {
                Srs.leavePath(deck);
                refresh(true);
            });
            strip.appendChild(leave);
            card.appendChild(strip);
        } else if (nothingYet && deck === "ZBLL") {
            card.appendChild(el("p", "path-hint",
                'New to ZB? The beginner path picks your first cases for you, 3 a day, in the usual learning order. ' +
                '<a href="guide/index.html">Read the guide</a> to see why.'));
        }

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
            refresh(true);
        });
        perDay.appendChild(num);
        details.appendChild(perDay);

        details.appendChild(el("p", "setting-hint",
            "Tick the groups you want to learn; new cases come only from those, in this order. Click a group's name to pick single cases instead, or to mark the ones you already know: they go straight to review, so you get checked on them over the next week."));

        var groups = [];
        var byGroup = {};
        cases.forEach(function (c) {
            if (!byGroup[c.group]) { byGroup[c.group] = []; groups.push(c.group); }
            byGroup[c.group].push(c);
        });
        var list = el("ul", "group-list");
        list.dataset.deck = deck;
        groups.forEach(function (g) { list.appendChild(renderGroup(deck, g, byGroup[g], settings)); });
        details.appendChild(list);
        return details;
    }

    // ── One group (e.g. "T 2GLL"), with its cases when opened ───────────

    var openGroups = {};   // "ZBLL|T 2GLL" → true
    var selected = {};     // case key → true (cases picked in an open group)

    function isPicked(settings, c) {
        return !!settings.include[c.key];
    }

    // off (not picked) / queued (picked, not started) / learning / learned / known
    function caseStatus(settings, c) {
        var card = Srs.getCard(c.key);
        if (card.state === "new") return isPicked(settings, c) ? "queued" : "off";
        if (card.state === "review") return card.interval >= Srs.CONFIG.knownInterval ? "known" : "learned";
        return "learning";
    }

    var STATUS_TEXT = { off: "Not added", queued: "To learn", learning: "Learning", learned: "Learned", known: "Known" };

    // Add cases to the ones you're learning, or take them out
    function setPicked(deck, items, on) {
        var include = Srs.getSettings(deck).include;
        items.forEach(function (c) {
            if (on) include[c.key] = true;
            else delete include[c.key];
        });
        Srs.setSettings(deck, { include: include });
    }

    function renderGroup(deck, g, items, settings) {
        var id = deck + "|" + g;
        var open = !!openGroups[id];
        var started = items.filter(function (c) { return Srs.getCard(c.key).state !== "new"; }).length;
        var freshItems = items.filter(function (c) { return Srs.getCard(c.key).state === "new"; });
        var included = freshItems.filter(function (c) { return isPicked(settings, c); }).length;

        var li = el("li", "group-row" + (open ? " is-open" : ""));
        var head = el("div", "group-head");
        var check = el("input");
        check.type = "checkbox";
        check.checked = freshItems.length ? included === freshItems.length : true;
        check.indeterminate = included > 0 && included < freshItems.length;
        check.disabled = !freshItems.length;
        check.setAttribute("aria-label", "Learn " + g);
        check.title = !freshItems.length ? "You've started every case in " + g
            : check.indeterminate ? included + " of " + freshItems.length + " new cases added" : "";
        check.addEventListener("change", function () {
            setPicked(deck, items, check.checked);
            refresh(true);
        });
        var name = el("button", "group-name",
            '<svg class="icon group-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>' + esc(g));
        name.type = "button";
        name.setAttribute("aria-expanded", String(open));
        name.addEventListener("click", function () {
            openGroups[id] = !open;
            if (open) items.forEach(function (c) { delete selected[c.key]; });
            refresh(true);
        });
        head.appendChild(check);
        head.appendChild(name);
        head.appendChild(el("span", "group-count", started + " / " + items.length));
        li.appendChild(head);
        if (open) li.appendChild(renderCaseGrid(deck, items, settings));
        return li;
    }

    function renderCaseGrid(deck, items, settings) {
        var panel = el("div", "case-panel");
        var grid = el("div", "case-grid");
        items.forEach(function (c) {
            var status = caseStatus(settings, c);
            var tile = el("button", "case-tile is-" + status + (selected[c.key] ? " is-selected" : ""));
            tile.type = "button";
            tile.setAttribute("aria-pressed", String(!!selected[c.key]));
            tile.title = c.name + " · " + STATUS_TEXT[status];
            var label = c.set === "ZBLS" ? c.subset + "-" + c.caseName : c.caseName;
            tile.innerHTML =
                '<img src="' + esc(encodeURI(c.img)) + '" alt="" loading="lazy">' +
                '<span class="case-tile-name">' + esc(label) + "</span>" +
                '<span class="case-tile-status">' + STATUS_TEXT[status] + "</span>";
            tile.addEventListener("click", function () {
                if (selected[c.key]) delete selected[c.key]; else selected[c.key] = true;
                tile.classList.toggle("is-selected", !!selected[c.key]);
                tile.setAttribute("aria-pressed", String(!!selected[c.key]));
                updateBar();
            });
            grid.appendChild(tile);
        });
        panel.appendChild(grid);

        // Actions for the picked cases
        var bar = el("div", "case-actions");
        var count = el("span", "case-count");
        function btn(text, cls, fn) {
            var b = el("button", "btn btn-sm " + cls, text);
            b.type = "button";
            b.addEventListener("click", fn);
            bar.appendChild(b);
            return b;
        }
        function picked() { return items.filter(function (c) { return selected[c.key]; }); }
        function done() {
            items.forEach(function (c) { delete selected[c.key]; });
            refresh(true);
        }
        btn("All", "btn-ghost", function () {
            items.forEach(function (c) { selected[c.key] = true; });
            refresh(true);
        });
        btn("None", "btn-ghost", function () {
            items.forEach(function (c) { delete selected[c.key]; });
            refresh(true);
        });
        bar.appendChild(count);
        var learn = btn("Learn these", "btn-primary", function () {
            setPicked(deck, picked(), true);
            done();
        });
        var known = btn("I know these", "btn-secondary", function () {
            Srs.markKnown(picked().map(function (c) { return c.key; }));
            done();
        });
        var skip = btn("Don't learn", "btn-secondary", function () {
            setPicked(deck, picked(), false);
            done();
        });
        var reset = btn("Reset", "btn-ghost btn-danger-hover", function () {
            var p = picked();
            if (!confirm("Reset your progress on " + p.length + " case" + (p.length === 1 ? "" : "s") + "? They go back to new.")) return;
            Srs.resetCards(p.map(function (c) { return c.key; }));
            done();
        });
        function updateBar() {
            var p = picked();
            var n = p.length;
            count.textContent = n ? n + " selected" : "Click cases to pick them";
            var anyNew = p.some(function (c) { return Srs.getCard(c.key).state === "new"; });
            var anyStarted = p.some(function (c) { return Srs.getCard(c.key).state !== "new"; });
            var s = Srs.getSettings(deck);
            known.disabled = !anyNew;
            learn.disabled = !p.some(function (c) { return Srs.getCard(c.key).state === "new" && !isPicked(s, c); });
            skip.disabled = !p.some(function (c) { return Srs.getCard(c.key).state === "new" && isPicked(s, c); });
            reset.disabled = !anyStarted;
        }
        updateBar();
        panel.appendChild(bar);
        return panel;
    }

    // ── Render ──────────────────────────────────────────────────────────

    var openSettings = {};
    function refresh(keepOpen) {
        var scroll = {};
        root.querySelectorAll(".deck-card").forEach(function (c) {
            var d = c.querySelector(".deck-settings");
            openSettings[c.dataset.deck] = keepOpen && d && d.open;
            var l = c.querySelector(".group-list");
            if (l) scroll[c.dataset.deck] = l.scrollTop;
        });
        root.innerHTML = "";
        Object.keys(Srs.decks).forEach(function (deck) {
            var card = renderDeck(deck);
            if (!card) return;
            if (openSettings[deck]) card.querySelector(".deck-settings").open = true;
            root.appendChild(card);
            var l = card.querySelector(".group-list");
            if (l && scroll[deck]) l.scrollTop = scroll[deck];
        });
        renderStreak();
    }

    // learn.html?path=ZBLL (from the guide): start the beginner path
    var startDeck = (/[?&]path=(ZBLL|ZBLS)\b/.exec(location.search) || [])[1];
    if (startDeck) {
        if (!Srs.pathStatus(startDeck).on) Srs.startPath(startDeck);
        history.replaceState(null, "", location.pathname);
    }

    refresh();
    // Learning cases come due within minutes: keep the counts current
    setInterval(function () {
        var typing = document.activeElement && root.contains(document.activeElement);
        if (!document.hidden && !typing) refresh(true);
    }, 30000);
    window.addEventListener("pageshow", function () { refresh(true); });
})();

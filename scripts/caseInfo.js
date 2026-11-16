// Case info window: one case's picture, a setup scramble, its algs (with the
// AUF for that setup) and how you've been doing on it. Like the case pop-up
// on bestsiteever.
//
//   CaseInfo.open("T-2GLL-CsA")   or   CaseInfo.open("ZBLS-12-3")
//
// Opened from slow cases and the stats table in the trainer, and from the ⓘ
// button on each case on the ZBLL and ZBLS pages. On pages that don't
// already load the cube code, it's loaded the first time you open a case.

(function (window, document) {
    // Loaded in this order if the page doesn't have them yet
    var DEPENDENCIES = [
        { test: function () { return typeof zbllAlgs !== "undefined"; }, src: "scripts/algorithms.js" },
        { test: function () { return typeof zbllScrambles !== "undefined"; }, src: "scripts/scrambles.js" },
        { test: function () { return typeof zblsAlgs !== "undefined"; }, src: "scripts/zblsData.js" },
        { test: function () { return !!window.CubeGoals; }, src: "scripts/cubeGoals.js" },
        { test: function () { return typeof Cube3 !== "undefined"; }, src: "scripts/cube.js" },
        // cube3x3.js redefines Cube3 with the turning methods
        { test: function () { return typeof Cube3 !== "undefined" && !!Cube3.prototype.rotate_f; }, src: "scripts/cube3x3.js" },
        { test: function () { return !!window.CubeViews; }, src: "scripts/cubeViews.js" },
        { test: function () { return !!window.AlgAuf; }, src: "scripts/algAuf.js" },
        { test: function () { return !!window.AlgDetect; }, src: "scripts/algDetect.js" },
        { test: function () { return !!window.virtualCube; }, src: "scripts/virtualCubeEmbed.js" },
        { test: function () { return !!window.AlgPlayer; }, src: "scripts/algPlayer.js" },
        { test: function () { return !!window.AlgSheets; }, src: "scripts/algSheets.js" },
    ];

    var loading = null;
    function loadDependencies() {
        if (!loading) {
            loading = DEPENDENCIES.reduce(function (p, dep) {
                return p.then(function () {
                    if (dep.test()) return;
                    return new Promise(function (resolve, reject) {
                        var s = document.createElement("script");
                        s.src = dep.src;
                        s.onload = resolve;
                        s.onerror = function () { reject(new Error("Couldn't load " + dep.src)); };
                        document.body.appendChild(s);
                    });
                });
            }, Promise.resolve());
            loading.catch(function () { loading = null; });
        }
        return loading;
    }

    // ── Case data ───────────────────────────────────────────────────────

    function parseKey(key) {
        var m = /^ZBLS-(\d+)-(\d+)$/.exec(key);
        if (m) return { key: key, set: "ZBLS", subset: m[1], caseName: m[2], deck: "ZBLS" };
        var parts = String(key).split("-");
        return { key: key, set: parts[0], subset: parts[1], caseName: parts.slice(2).join("-"), deck: "ZBLL" };
    }

    function caseData(key) {
        var c = parseKey(key);
        var reg = window.CASE_SETS && window.CASE_SETS.ZBLS;
        if (c.deck === "ZBLS") {
            c.name = reg ? reg.name(c.subset, c.caseName) : "F2L " + c.subset + "-" + c.caseName;
            c.img = reg ? reg.img(c.subset, c.caseName) : "images/ZBLS/F2L " + c.subset + "-" + c.caseName + ".png";
            c.baseAlgs = ((typeof zblsAlgs !== "undefined" && zblsAlgs[c.subset]) || {})[c.caseName] || [];
            c.scrambles = ((typeof zblsScrambles !== "undefined" && zblsScrambles[c.subset]) || {})[c.caseName] || [];
        } else {
            c.name = key;
            c.img = "svg/top/" + key + ".svg";
            var a = typeof zbllAlgs !== "undefined" ? zbllAlgs : {};
            var s = typeof zbllScrambles !== "undefined" ? zbllScrambles : {};
            c.baseAlgs = ((a[c.set] || {})[c.subset] || {})[c.caseName] || [];
            c.scrambles = ((s[c.set] || {})[c.subset] || {})[c.caseName] || [];
        }
        var saved = {};
        try { saved = JSON.parse(localStorage.getItem("customAlgs") || "{}"); } catch (e) {}
        c.own = saved[key] || c.baseAlgs.slice();
        c.algs = window.AlgSheets ? c.own.concat(AlgSheets.extraAlgs(key, c.own)) : c.own.slice();
        c.mainIndex = parseInt(localStorage.getItem("mainAlg:" + key), 10) || 0;
        if (c.mainIndex >= c.algs.length) c.mainIndex = 0;
        return c;
    }

    // Your solves of this case, and which alg you used in each
    function caseStats(c) {
        var attempts = [];
        try { attempts = JSON.parse(localStorage.getItem("zbllAttempts") || "[]"); } catch (e) {}
        var mine = attempts.filter(function (a) { return a.caseName === c.name; });
        var times = mine.filter(function (a) { return a.result !== "DNF" && a.time > 0; }).map(function (a) { return a.time; });
        var used = {};
        var detected = 0;
        if (window.AlgDetect && c.algs.length) {
            mine.forEach(function (a) {
                if (!a.moves || !a.moves.length) return;
                var d = AlgDetect.detectNotation(a.moves.map(function (m) { return m[0]; }), c.algs, c.mainIndex);
                if (d.index >= 0) { used[d.index] = (used[d.index] || 0) + 1; detected++; }
            });
        }
        var recent = times.slice(-12);
        return {
            count: mine.length,
            avg: recent.length ? recent.reduce(function (s, t) { return s + t; }, 0) / recent.length : null,
            best: times.length ? Math.min.apply(null, times) : null,
            last: times.length ? times[times.length - 1] : null,
            used: used,
            detected: detected,
        };
    }

    // ── Window ──────────────────────────────────────────────────────────

    var els = null;
    var state = { c: null, scrambleIndex: 0, lastFocus: null, adjusted: [] };

    function esc(t) {
        return String(t == null ? "" : t).replace(/[&<>"]/g, function (ch) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
        });
    }

    function icon(d) { return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>"; }
    var ICONS = {
        close: icon('<path d="M18 6 6 18M6 6l12 12"/>'),
        play: icon('<path d="M7 4.5v15l12-7.5z"/>'),
        copy: icon('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
        shuffle: icon('<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'),
    };

    function build() {
        var overlay = document.createElement("div");
        overlay.className = "case-info-overlay";
        overlay.hidden = true;
        overlay.innerHTML =
            '<div class="case-info-card" role="dialog" aria-modal="true" aria-labelledby="caseInfoTitle">' +
            '  <div class="case-info-header">' +
            '    <h3 id="caseInfoTitle"></h3>' +
            '    <button type="button" class="btn btn-ghost btn-icon" data-act="close" aria-label="Close">' + ICONS.close + "</button>" +
            "  </div>" +
            '  <div class="case-info-body">' +
            '    <div class="case-info-top">' +
            '      <img class="case-info-img" alt="">' +
            '      <div class="case-info-setup">' +
            '        <span class="case-info-label">Setup</span>' +
            '        <div class="case-info-scramble" data-ref="scramble"></div>' +
            '        <div class="case-info-setup-actions">' +
            '          <button type="button" class="btn btn-secondary btn-sm" data-act="another">' + ICONS.shuffle + "Another setup</button>" +
            '          <button type="button" class="btn btn-secondary btn-sm" data-act="copy-setup">' + ICONS.copy + "Copy</button>" +
            "        </div>" +
            '        <div class="case-info-stats" data-ref="stats"></div>' +
            "      </div>" +
            "    </div>" +
            '    <span class="case-info-label">Algs <span class="case-info-hint">with the AUF for this setup</span></span>' +
            '    <ul class="case-info-algs" data-ref="algs"></ul>' +
            "  </div>" +
            "</div>";
        document.body.appendChild(overlay);
        els = {
            overlay: overlay,
            title: overlay.querySelector("#caseInfoTitle"),
            img: overlay.querySelector(".case-info-img"),
            scramble: overlay.querySelector('[data-ref="scramble"]'),
            stats: overlay.querySelector('[data-ref="stats"]'),
            algs: overlay.querySelector('[data-ref="algs"]'),
        };
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) { close(); return; }
            var btn = e.target.closest("[data-act]");
            if (!btn) return;
            var act = btn.dataset.act, i = parseInt(btn.dataset.i, 10);
            if (act === "close") close();
            else if (act === "another") nextScramble();
            else if (act === "copy-setup") copy(currentScramble(), btn);
            else if (act === "play") play(i);
            else if (act === "copy-alg") copy(algText(i), btn);
            else if (act === "main") setMain(i);
        });
        // While open, keys belong to this window (not the timer or the cube)
        window.addEventListener("keydown", function (e) {
            if (!isOpen() || document.body.classList.contains("player-open")) return;
            if (e.key === "Escape") { e.preventDefault(); close(); }
            if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
            if (e.key !== "Tab" && e.key !== "Enter") e.stopPropagation();
            if (e.key === " " && e.target.tagName !== "BUTTON") e.preventDefault();
        }, true);
        window.addEventListener("keyup", function (e) {
            if (isOpen() && !document.body.classList.contains("player-open") && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) e.stopPropagation();
        }, true);
    }

    function isOpen() { return els && !els.overlay.hidden; }

    function currentScramble() {
        var c = state.c;
        if (c.scrambles.length) return c.scrambles[state.scrambleIndex % c.scrambles.length];
        // No saved scramble: undo the main alg
        var tokens = window.AlgAuf && c.algs[c.mainIndex] ? AlgAuf.tokenize(c.algs[c.mainIndex]) : null;
        if (!tokens) return "";
        return tokens.slice().reverse().map(function (t) {
            return /2$/.test(t) ? t : /'$/.test(t) ? t.slice(0, -1) : t + "'";
        }).join(" ");
    }

    function nextScramble() {
        var n = state.c.scrambles.length;
        if (n > 1) {
            var next = state.scrambleIndex;
            while (next === state.scrambleIndex) next = Math.floor(Math.random() * n);
            state.scrambleIndex = next;
        }
        render();
    }

    // Each alg with its pre/post AUF for the shown setup
    function adjust(alg, setup) {
        if (!window.AlgAuf || !window.CubeGoals || !setup) return { ok: false, core: alg };
        var before = CubeGoals.active;
        CubeGoals.active = state.c.deck === "ZBLS" ? "zbls" : "zbll";
        try { return AlgAuf.adjust(setup, alg); }
        finally { CubeGoals.active = before; }
    }

    function algText(i) {
        var a = state.adjusted[i];
        return a && a.ok ? AlgAuf.toText(a) : state.c.algs[i];
    }

    function fmt(t) { return t == null ? "–" : t.toFixed(2) + "s"; }

    function render() {
        var c = state.c;
        var setup = currentScramble();
        var stats = caseStats(c);
        els.title.textContent = c.name;
        els.img.src = encodeURI(c.img);
        els.img.alt = c.name;
        var angle = 0;
        try { angle = parseInt((JSON.parse(sessionStorage.getItem("caseOrientation") || "{}") || {})[c.set], 10) || 0; } catch (e) {}
        els.img.style.transform = angle ? "rotate(" + angle + "deg)" : "";
        els.scramble.textContent = setup || "No setup for this case";
        els.overlay.querySelector('[data-act="another"]').disabled = c.scrambles.length < 2;

        // Your stats, and the alg you usually use
        var mostUsed = -1, mostCount = 0;
        Object.keys(stats.used).forEach(function (k) {
            if (stats.used[k] > mostCount) { mostCount = stats.used[k]; mostUsed = parseInt(k, 10); }
        });
        els.stats.innerHTML = stats.count
            ? '<div class="case-info-stat"><span>Solves</span><b>' + stats.count + "</b></div>" +
              '<div class="case-info-stat"><span>Average</span><b>' + fmt(stats.avg) + "</b></div>" +
              '<div class="case-info-stat"><span>Best</span><b>' + fmt(stats.best) + "</b></div>" +
              '<div class="case-info-stat"><span>Last</span><b>' + fmt(stats.last) + "</b></div>"
            : '<p class="case-info-hint">You haven\'t solved this case yet.</p>';

        // Algs: main first
        var order = c.algs.map(function (_, i) { return i; });
        order.sort(function (a, b) { return (b === c.mainIndex) - (a === c.mainIndex); });
        state.adjusted = c.algs.map(function (alg) { return adjust(alg, setup); });
        els.algs.innerHTML = c.algs.length ? order.map(function (i) {
            var a = state.adjusted[i];
            var tags = [];
            if (i === c.mainIndex) tags.push('<span class="case-info-tag is-main">Main</span>');
            if (stats.used[i]) {
                tags.push('<span class="case-info-tag' + (i === mostUsed ? " is-used" : "") + '" title="Solves where you used this alg">' +
                    (i === mostUsed ? "You usually use this · " : "Used ") + stats.used[i] + "×</span>");
            }
            if (i >= c.own.length) tags.push('<span class="case-info-tag">From a sheet</span>');
            var text = a.ok
                ? (a.pre ? '<span class="auf">' + esc(a.pre) + "</span> " : "") + esc(a.core) + (a.post ? ' <span class="auf">' + esc(a.post) + "</span>" : "")
                : esc(c.algs[i]);
            return '<li class="case-info-alg' + (i === c.mainIndex ? " is-main" : "") + '">' +
                '<div class="case-info-alg-text">' + text + "</div>" +
                (tags.length ? '<div class="case-info-tags">' + tags.join("") + "</div>" : "") +
                '<div class="case-info-alg-actions">' +
                '<button type="button" class="btn btn-ghost btn-sm" data-act="play" data-i="' + i + '"' + (window.AlgPlayer ? "" : " disabled") + ">" + ICONS.play + "Play</button>" +
                '<button type="button" class="btn btn-ghost btn-sm" data-act="copy-alg" data-i="' + i + '">' + ICONS.copy + "Copy</button>" +
                (i === c.mainIndex ? "" : '<button type="button" class="btn btn-ghost btn-sm" data-act="main" data-i="' + i + '">Make main</button>') +
                "</div></li>";
        }).join("") : '<li class="case-info-hint">No algs saved for this case.</li>';
        if (stats.count && stats.detected < stats.count) {
            els.algs.insertAdjacentHTML("beforeend", '<li class="case-info-hint">' +
                (stats.detected ? "Which alg you used is known for " + stats.detected + " of your " + stats.count + " solves" : "Solve with the virtual cube or a smart cube to see which alg you use") + ".</li>");
        }
    }

    function play(i) {
        if (!window.AlgPlayer) return;
        var a = state.adjusted[i];
        var setup = currentScramble();
        var before = window.CubeGoals && CubeGoals.active;
        AlgPlayer.open({
            setup: setup,
            pre: a && a.ok ? a.pre : "",
            core: a && a.ok ? a.core : state.c.algs[i],
            post: a && a.ok ? a.post : "",
            title: state.c.name,
        });
        if (before) CubeGoals.active = before;
    }

    function setMain(i) {
        try { localStorage.setItem("mainAlg:" + state.c.key, i); } catch (e) {}
        state.c.mainIndex = i;
        render();
        // The trainer's alg list shows the main alg first
        if (typeof window.onCaseInfoChange === "function") window.onCaseInfoChange(state.c.key);
    }

    function copy(text, btn) {
        if (!text) return;
        var done = function () {
            var old = btn.innerHTML;
            btn.textContent = "Copied";
            setTimeout(function () { btn.innerHTML = old; }, 1200);
        };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
        else done();
    }

    function open(key) {
        return loadDependencies().then(function () {
            if (!els) build();
            state.c = caseData(key);
            state.scrambleIndex = Math.floor(Math.random() * Math.max(1, state.c.scrambles.length));
            if (!isOpen()) state.lastFocus = document.activeElement;
            render();
            els.overlay.hidden = false;
            document.body.classList.add("case-info-open");
            els.overlay.querySelector('[data-act="close"]').focus();
        }).catch(function (e) { alert(e.message); });
    }

    function close() {
        if (!isOpen()) return;
        els.overlay.hidden = true;
        document.body.classList.remove("case-info-open");
        if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
    }

    window.CaseInfo = { open: open, close: close };
})(window, document);

// Algorithm player: step through or play an alg on the case you just solved.
//
// Opened from the play button on each alg (trainer.js → openAlgPlayerFor).
// Each step rebuilds the cube from the setup plus the first N moves using
// virtualCube.makeCube(), then draws it with CubeViews, so it never touches
// the cube you are turning.
//
// Keys while open: Space play/pause · ← → step · Home/End jump · Esc close

(function (window, document) {
    // Speed slider ranges. Algs: turns per second. Replays: a multiple of
    // your real timing (1 = real time).
    var ALG_RANGE = { min: 0.5, max: 12, step: 0.5, initial: 2.5 };
    var REPLAY_RANGE = { min: 0.25, max: 2, step: 0.05, initial: 1 };
    var CANVAS_SIZE = 260;

    var els = null;
    var state = {
        setup: "",
        steps: [],      // [{ text, kind: "pre" | "core" | "post" }]
        step: 0,        // how many moves have been applied
        timer: null,
        timings: null,  // ms per move from the case appearing (replays only)
        replaySpeed: REPLAY_RANGE.initial,
        onDelete: null,
        view: "iso",
        algTps: ALG_RANGE.initial,
        lastFocus: null,
    };

    try {
        state.view = localStorage.getItem("playerView") || state.view;
        var savedTps = parseFloat(localStorage.getItem("playerTps"));
        if (savedTps >= ALG_RANGE.min && savedTps <= ALG_RANGE.max) state.algTps = savedTps;
    } catch (e) {}

    function icon(d) {
        return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>";
    }

    var ICONS = {
        start: icon('<path d="M18 19 9 12l9-7z"/><path d="M6 5v14"/>'),
        prev: icon('<path d="m15 18-6-6 6-6"/>'),
        play: icon('<path d="M7 4.5v15l12-7.5z"/>'),
        pause: icon('<path d="M8 5v14M16 5v14"/>'),
        next: icon('<path d="m9 18 6-6-6-6"/>'),
        end: icon('<path d="m6 19 9-7-9-7z"/><path d="M18 5v14"/>'),
        close: icon('<path d="M18 6 6 18M6 6l12 12"/>'),
    };

    // ── Build the window once ───────────────────────────────────────────

    function build() {
        var overlay = document.createElement("div");
        overlay.className = "player-overlay";
        overlay.hidden = true;
        overlay.innerHTML =
            '<div class="player-card" role="dialog" aria-modal="true" aria-labelledby="playerTitle">' +
            '  <div class="player-header">' +
            '    <div>' +
            '      <p class="player-sub" id="playerCase"></p>' +
            '      <h3 class="player-title" id="playerTitle">Algorithm player</h3>' +
            "    </div>" +
            '    <button type="button" class="btn btn-ghost btn-icon" data-act="close" aria-label="Close">' + ICONS.close + "</button>" +
            "  </div>" +
            '  <div class="player-info" hidden></div>' +
            '  <div class="player-stage"><canvas class="player-canvas"></canvas></div>' +
            '  <div class="player-moves" aria-label="Moves"></div>' +
            '  <div class="player-controls">' +
            '    <button type="button" class="btn btn-ghost btn-icon" data-act="start" title="Back to start (Home)" aria-label="Back to start">' + ICONS.start + "</button>" +
            '    <button type="button" class="btn btn-ghost btn-icon" data-act="prev" title="Previous move (←)" aria-label="Previous move">' + ICONS.prev + "</button>" +
            '    <button type="button" class="btn btn-primary btn-icon player-play" data-act="play" title="Play / pause (Space)" aria-label="Play">' + ICONS.play + "</button>" +
            '    <button type="button" class="btn btn-ghost btn-icon" data-act="next" title="Next move (→)" aria-label="Next move">' + ICONS.next + "</button>" +
            '    <button type="button" class="btn btn-ghost btn-icon" data-act="end" title="Jump to end (End)" aria-label="Jump to end">' + ICONS.end + "</button>" +
            '    <span class="player-counter" aria-live="polite"></span>' +
            "  </div>" +
            '  <div class="player-options">' +
            '    <label>View <select class="input" data-opt="view"></select></label>' +
            '    <label>Speed' +
            '      <span class="player-speed">' +
            '        <input type="range" data-opt="speed" aria-label="Playback speed">' +
            '        <output data-opt="speedValue"></output>' +
            "      </span>" +
            "    </label>" +
            "  </div>" +
            '  <div class="player-footer" hidden>' +
            '    <span class="player-legend"><span class="player-legend-swatch"></span>Undone moves</span>' +
            '    <button type="button" class="btn btn-ghost btn-danger-hover" data-act="delete">Delete this solve</button>' +
            "  </div>" +
            "</div>";
        document.body.appendChild(overlay);

        els = {
            overlay: overlay,
            card: overlay.querySelector(".player-card"),
            caseName: overlay.querySelector("#playerCase"),
            title: overlay.querySelector("#playerTitle"),
            info: overlay.querySelector(".player-info"),
            footer: overlay.querySelector(".player-footer"),
            canvas: overlay.querySelector(".player-canvas"),
            moves: overlay.querySelector(".player-moves"),
            play: overlay.querySelector('[data-act="play"]'),
            counter: overlay.querySelector(".player-counter"),
            view: overlay.querySelector('[data-opt="view"]'),
            speed: overlay.querySelector('[data-opt="speed"]'),
            speedValue: overlay.querySelector('[data-opt="speedValue"]'),
        };

        // View options come from cubeViews.js
        (window.CubeViews ? CubeViews.names : ["classic"]).forEach(function (name) {
            var opt = document.createElement("option");
            opt.value = name;
            opt.textContent = CubeViews.label(name);
            els.view.appendChild(opt);
        });

        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) return close();
            var btn = e.target.closest("[data-act]");
            if (btn) act(btn.getAttribute("data-act"));
            var move = e.target.closest("[data-step]");
            if (move) { pause(); setStep(parseInt(move.getAttribute("data-step"), 10)); }
        });

        els.view.addEventListener("change", function () {
            state.view = els.view.value;
            try { localStorage.setItem("playerView", state.view); } catch (e) {}
            render();
        });
        els.speed.addEventListener("input", function () {
            var v = parseFloat(els.speed.value);
            if (state.timings) {
                state.replaySpeed = v;
            } else {
                state.algTps = v;
                try { localStorage.setItem("playerTps", v); } catch (e) {}
            }
            updateSpeedLabel();
            if (state.timer) { pause(); play(); }
        });

        // While open, the player owns the keyboard so the timer and the
        // virtual cube don't react (capture phase runs before their listeners).
        window.addEventListener("keydown", onKey, true);
        window.addEventListener("keyup", swallow, true);
    }

    function swallow(e) {
        if (!isOpen()) return;
        e.stopImmediatePropagation();
    }

    function onKey(e) {
        if (!isOpen()) return;
        var inSelect = e.target && (e.target.tagName === "SELECT" || e.target.tagName === "INPUT");
        var handled = true;
        switch (e.key) {
            case "Escape": close(); break;
            case " ": if (inSelect) handled = false; else act("play"); break;
            case "ArrowRight": if (inSelect) handled = false; else act("next"); break;
            case "ArrowLeft": if (inSelect) handled = false; else act("prev"); break;
            case "Home": act("start"); break;
            case "End": act("end"); break;
            case "Tab": trapFocus(e); handled = false; break;
            default: handled = false;
        }
        if (handled) e.preventDefault();
        e.stopImmediatePropagation();
    }

    function trapFocus(e) {
        var focusable = els.card.querySelectorAll("button, select");
        if (!focusable.length) return;
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }

    // ── Playback ────────────────────────────────────────────────────────

    function act(name) {
        if (name === "close") return close();
        if (name === "delete") { if (state.onDelete) state.onDelete(); return; }
        if (name === "play") return state.timer ? pause() : play();
        pause();
        if (name === "start") setStep(0);
        if (name === "end") setStep(state.steps.length);
        if (name === "prev") setStep(state.step - 1);
        if (name === "next") setStep(state.step + 1);
    }

    function play() {
        if (!state.steps.length) return;
        if (state.step >= state.steps.length) setStep(0);
        // Replays are timed against the clock (not chained delays), so drawing
        // time doesn't make playback drift slower than the real solve
        var mult = state.replaySpeed || 1;
        var t0 = state.step > 0 && state.timings ? state.timings[state.step - 1] : 0;
        var started = performance.now();
        function next() {
            if (state.step >= state.steps.length) return pause();
            var delay = 1000 / (state.algTps || ALG_RANGE.initial);
            if (state.timings) {
                // Real gaps from the solve (the first one is your recognition time)
                var due = (state.timings[state.step] - t0) / mult;
                delay = due - (performance.now() - started);
            }
            state.timer = setTimeout(function () {
                setStep(state.step + 1);
                if (state.step >= state.steps.length) pause();
                else next();
            }, Math.max(0, delay));
        }
        state.timer = true;
        updatePlayButton();
        next();
    }

    function pause() {
        if (state.timer && state.timer !== true) clearTimeout(state.timer);
        state.timer = null;
        updatePlayButton();
    }

    function updateSpeedLabel() {
        if (!els) return;
        els.speedValue.textContent = state.timings
            ? (state.replaySpeed === 1 ? "Real time" : state.replaySpeed.toFixed(2).replace(/0$/, "") + "×")
            : state.algTps.toFixed(1) + " TPS";
    }

    function updatePlayButton() {
        if (!els) return;
        var playing = !!state.timer;
        els.play.innerHTML = playing ? ICONS.pause : ICONS.play;
        els.play.setAttribute("aria-label", playing ? "Pause" : "Play");
    }

    function setStep(n) {
        state.step = Math.max(0, Math.min(state.steps.length, n));
        render();
    }

    // ── Drawing ─────────────────────────────────────────────────────────

    function render() {
        if (!els || !window.virtualCube || !window.CubeViews || !window.AlgAuf) return;
        var applied = state.steps.slice(0, state.step).map(function (s) { return s.text; });
        var moves = AlgAuf.toCubeMoves(applied);
        var cube = virtualCube.makeCube(state.setup + " " + moves);
        CubeViews.renderTo(els.canvas, state.view, cube, CANVAS_SIZE, 0.9);

        // Highlight the move just played; dim the ones already done
        var spans = els.moves.querySelectorAll("[data-step]");
        for (var i = 0; i < spans.length; i++) {
            spans[i].classList.toggle("is-done", i < state.step - 1);
            spans[i].classList.toggle("is-current", i === state.step - 1);
        }
        var solved = state.step === state.steps.length && cube.isSolved();
        els.counter.textContent = solved
            ? "Solved"
            : state.step + " / " + state.steps.length;
        els.counter.classList.toggle("is-solved", solved);
    }

    function renderMoves() {
        els.moves.innerHTML = "";
        state.steps.forEach(function (s, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "player-move" + (s.kind !== "core" ? " is-auf" : "") + (s.undone ? " is-undone" : "");
            b.textContent = s.text;
            b.setAttribute("data-step", i + 1);
            b.title = s.kind === "pre" ? "Pre-AUF" : s.kind === "post" ? "Post-AUF"
                : s.undone ? "Undone later (a mistake or its fix)" : "Jump to after this move";
            if (state.timings) b.title += " · " + (state.timings[i] / 1000).toFixed(2) + "s";
            els.moves.appendChild(b);
        });
    }

    // ── Open / close ────────────────────────────────────────────────────

    function isOpen() {
        return els && !els.overlay.hidden;
    }

    // opts: { setup, pre, core, post, title }
    // Replays also pass: heading, timings (ms per move), undone (bool per
    // move), info ([[label, value], ...]) and onDelete
    function open(opts) {
        if (!els) build();
        pause();
        state.setup = opts.setup || "";
        state.steps = [];
        function add(text, kind) {
            var tokens = window.AlgAuf ? AlgAuf.tokenize(text) : null;
            (tokens || []).forEach(function (t) { state.steps.push({ text: t, kind: kind }); });
            return tokens !== null;
        }
        add(opts.pre, "pre");
        var readable = add(opts.core, "core");
        add(opts.post, "post");

        // Replay extras
        state.timings = opts.timings && opts.timings.length === state.steps.length ? opts.timings : null;
        state.onDelete = opts.onDelete || null;
        if (opts.undone) {
            state.steps.forEach(function (s, i) { s.undone = !!opts.undone[i]; });
        }
        els.title.textContent = opts.heading || "Algorithm player";
        els.info.hidden = !opts.info;
        els.info.innerHTML = (opts.info || []).map(function (kv) {
            return '<div class="player-stat"><span>' + kv[0] + "</span><b>" + kv[1] + "</b></div>";
        }).join("");
        els.footer.hidden = !state.onDelete;
        els.footer.querySelector(".player-legend").hidden = !opts.undone || !opts.undone.some(Boolean);

        // Speed slider: turns per second for algs, a multiple of your real
        // timing for replays
        var range = state.timings ? REPLAY_RANGE : ALG_RANGE;
        els.speed.min = range.min;
        els.speed.max = range.max;
        els.speed.step = range.step;

        els.caseName.textContent = opts.title || "";
        els.view.value = state.view;
        if (els.view.value !== state.view) { state.view = "iso"; els.view.value = "iso"; }
        els.speed.value = state.timings ? state.replaySpeed : state.algTps;
        updateSpeedLabel();
        renderMoves();
        if (!readable) els.moves.textContent = "This algorithm has notation the player can't read.";

        if (!isOpen()) state.lastFocus = document.activeElement;
        els.overlay.hidden = false;
        document.body.classList.add("player-open");
        setStep(0);
        els.play.focus();
    }

    function close() {
        if (!isOpen()) return;
        pause();
        els.overlay.hidden = true;
        document.body.classList.remove("player-open");
        if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
    }

    window.AlgPlayer = { open: open, close: close };
})(window, document);

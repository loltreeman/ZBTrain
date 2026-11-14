// Stats from recorded solves (virtual cube or smart cube).
//
// Each attempt saved by the trainer can carry the moves you did and when:
//   attempt.moves = [["R", 412], ["U", 530], ...]   (ms since the case appeared)
//   attempt.setup = orientation + scramble the case started from
//
// Definitions (shown in the UI as tooltips too):
//   Turns     Face turns you did, mistakes included. Two quarter turns of the
//             same face in a row count as one (R R = R2). Rotations don't count.
//   TPS       Turns per second while executing: from your first turn to your
//             last. (csTimer divides by the whole solve time instead.)
//   Fluidity  Share of execution time spent turning rather than pausing. Any
//             gap between turns longer than PAUSE_MS counts as a pause.

(function (window) {
    var PAUSE_MS = 400;

    function isRotation(t) { return /^[xyz]/.test(t); }

    // Merge R R → one turn; drop rotations. Returns [{ t: token, ms }]
    function turns(moves) {
        var out = [];
        moves.forEach(function (m) {
            var tok = m[0], ms = m[1];
            if (isRotation(tok)) return;
            var last = out[out.length - 1];
            // Only the same quarter turn twice (R R) is one turn; R R' is two
            if (last && last.t === tok && !last.merged && !/2$/.test(tok)) {
                last.merged = true; // R R → R2, still one turn at the first time
                return;
            }
            out.push({ t: tok, ms: ms });
        });
        return out;
    }

    // Stats for one attempt, or null if it has no recorded moves
    function analyze(attempt) {
        if (!attempt || !attempt.moves || !attempt.moves.length) return null;
        var list = turns(attempt.moves);
        if (!list.length) return null;
        var first = list[0].ms, last = list[list.length - 1].ms;
        var windowMs = Math.max(last - first, 1);
        var pauseMs = 0, pauses = 0, longest = 0;
        for (var i = 1; i < list.length; i++) {
            var gap = list[i].ms - list[i - 1].ms;
            if (gap > longest) longest = gap;
            if (gap > PAUSE_MS) { pauses++; pauseMs += gap; }
        }
        var tokens = attempt.moves.map(function (m) { return m[0]; });
        var mistakes = window.AlgDetect ? AlgDetect.trace(tokens).events.length : 0;
        return {
            turns: list.length,
            tps: list.length > 1 ? (list.length - 1) / (windowMs / 1000) : 0,
            fluidity: list.length > 1 ? Math.max(0, 1 - pauseMs / windowMs) : 1,
            pauses: pauses,
            longestPause: longest / 1000,
            firstMove: first / 1000,
            mistakes: mistakes,
        };
    }

    // Averages over several attempts (only those with recorded moves)
    function summarize(attempts) {
        var rows = attempts.map(analyze).filter(Boolean);
        if (!rows.length) return null;
        function avg(key) {
            return rows.reduce(function (s, r) { return s + r[key]; }, 0) / rows.length;
        }
        return {
            count: rows.length,
            turns: avg("turns"),
            tps: avg("tps"),
            fluidity: avg("fluidity"),
            mistakeRate: rows.filter(function (r) { return r.mistakes > 0; }).length / rows.length,
        };
    }

    // Where in your main alg you tend to undo moves or pause.
    // Uses only attempts where you actually did that alg.
    function troubleSpots(attempts, mainAlg) {
        if (!window.AlgDetect || !window.AlgAuf || !mainAlg) return null;
        // The alg's turns after its opening AUF, to label positions with.
        // Prefer the alg as written (rotations dropped); fall back to plain
        // face turns if slices make the counts differ.
        var faceTurns = AlgDetect.toFaceTurns(mainAlg).split(" ").filter(Boolean);
        while (faceTurns.length && /^U/.test(faceTurns[0])) faceTurns.shift();
        var written = (AlgAuf.tokenize(mainAlg) || []).filter(function (t) { return !isRotation(t); });
        while (written.length && /^U/.test(written[0])) written.shift();
        var algTurns = written.length === faceTurns.length ? written : faceTurns;
        var mistakeAt = {}, gapSum = {}, gapCount = {};
        var used = 0, withMistakes = 0;

        attempts.forEach(function (a) {
            if (!a.moves || !a.moves.length) return;
            var tokens = a.moves.map(function (m) { return m[0]; });
            if (AlgDetect.detectNotation(tokens, [mainAlg], 0).index !== 0) return;
            used++;
            var tr = AlgDetect.trace(tokens);
            if (tr.events.length) {
                withMistakes++;
                // count each position once per solve
                tr.events.filter(function (p, i, arr) { return arr.indexOf(p) === i; })
                    .forEach(function (p) { mistakeAt[p] = (mistakeAt[p] || 0) + 1; });
                return; // pauses in messy solves are mostly the fixing
            }
            // Clean solve: time between each turn of the alg (after the opening AUF)
            var list = turns(a.moves);
            var start = 0;
            while (start < list.length && /^U/.test(list[start].t)) start++;
            for (var i = start + 1; i < list.length; i++) {
                var pos = i - start; // gap before turn number pos+1
                gapSum[pos] = (gapSum[pos] || 0) + (list[i].ms - list[i - 1].ms);
                gapCount[pos] = (gapCount[pos] || 0) + 1;
            }
        });
        if (!used) return null;

        var worstMistake = null;
        Object.keys(mistakeAt).forEach(function (p) {
            if (!worstMistake || mistakeAt[p] > worstMistake.count) {
                worstMistake = { position: +p, count: mistakeAt[p] };
            }
        });
        var slowest = null;
        Object.keys(gapSum).forEach(function (p) {
            if (gapCount[p] < 2) return;
            var avgGap = gapSum[p] / gapCount[p] / 1000; // seconds
            if (!slowest || avgGap > slowest.avgGap) slowest = { position: +p, avgGap: avgGap };
        });
        return {
            solves: used,
            withMistakes: withMistakes,
            mistake: worstMistake,
            slowest: slowest,
            algTurns: algTurns,
        };
    }

    // Show the alg split at a turn position: "R U R' | U' R'"
    function contextAt(algTurns, position) {
        var before = algTurns.slice(Math.max(0, position - 3), position).join(" ");
        var after = algTurns.slice(position, position + 2).join(" ");
        return (position > 3 ? "… " : "") + before + " | " + after + (position + 2 < algTurns.length ? " …" : "");
    }

    window.SolveStats = {
        PAUSE_MS: PAUSE_MS,
        analyze: analyze,
        summarize: summarize,
        troubleSpots: troubleSpots,
        contextAt: contextAt,
    };
})(window);

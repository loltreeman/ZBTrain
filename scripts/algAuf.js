// AUF-adjusted algorithms (like ZBLL Explorer).
//
// The saved algorithms are written for one fixed angle of each case, but the
// scramble you get can leave the case at any of the four angles. For each
// algorithm we strip its own leading/trailing U turns, then try every
// pre-AUF and post-AUF (4 × 4 = 16 combinations) on a copy of the cube until
// the scramble + algorithm leaves it solved. The algorithm is then shown as
//
//     [pre-AUF] | core algorithm | [post-AUF]
//
// Everything runs on separate cubes made with virtualCube.makeCube(), so it
// never touches the cube you are turning.

(function (window) {
    var AUFS = ["", "U", "U2", "U'"];
    // Some algs end with the cube turned (a trailing z, or wide moves like
    // "l' ... l2"), so the last layer is no longer on top. The post-AUF is then
    // a turn of whichever face now holds it, so we try every face (U first).
    var POST_AUFS = AUFS.concat(
        ["D", "D2", "D'", "F", "F2", "F'", "B", "B2", "B'", "R", "R2", "R'", "L", "L2", "L'"]
    );

    // ── Notation ─────────────────────────────────────────────────────────

    // Turn one written token into a clean token like "R", "R2", "R'", "r", "x'".
    // Handles Rw (= r), R3 (= R'), R2' (= R2), and ignores brackets.
    // Returns null for anything that isn't a move (e.g. comments).
    function normalizeToken(tok) {
        var m = /^([URFDLBMESxyzurfdlb])(w?)(\d*)(')?$/.exec(tok);
        if (!m) return null;
        var face = m[1];
        if (m[2]) face = face.toLowerCase();               // Rw → r
        var amount = m[3] ? parseInt(m[3], 10) : 1;
        if (m[4]) amount = -amount;
        amount = ((amount % 4) + 4) % 4;
        if (amount === 0) return "";                        // e.g. R4: no-op
        return face + (amount === 2 ? "2" : amount === 3 ? "'" : "");
    }

    // Split an algorithm into clean tokens. Returns null if it contains
    // something we can't read.
    function tokenize(alg) {
        var raw = String(alg || "").replace(/[()\[\]]/g, " ").trim();
        if (!raw) return [];
        var out = [];
        var parts = raw.split(/\s+/);
        for (var i = 0; i < parts.length; i++) {
            var t = normalizeToken(parts[i]);
            if (t === null) return null;
            if (t) out.push(t);
        }
        return out;
    }

    // The cube model has no wide u / d / f / b, so expand them into a face
    // turn plus a slice turn (u = U E', d = D E, f = F S, b = B S').
    var WIDE = {
        u: ["U", "E'"], d: ["D", "E"], f: ["F", "S"], b: ["B", "S'"],
    };

    function invert(t) {
        if (/2$/.test(t)) return t;
        return /'$/.test(t) ? t.slice(0, -1) : t + "'";
    }

    function toCubeMoves(tokens) {
        var out = [];
        tokens.forEach(function (t) {
            var base = t.charAt(0), suffix = t.slice(1);
            if (WIDE[base]) {
                WIDE[base].forEach(function (m) {
                    if (suffix === "2") out.push(m.charAt(0) + "2");
                    else if (suffix === "'") out.push(invert(m));
                    else out.push(m);
                });
            } else {
                out.push(t);
            }
        });
        return out.join(" ");
    }

    function isAuf(t) { return /^U(2|')?$/.test(t); }

    // ── Solving the AUF ─────────────────────────────────────────────────

    function solves(scramble, moves) {
        var cube = window.virtualCube.makeCube(scramble + " " + moves);
        return cube.isSolved();
    }

    // Returns { pre, core, post, ok } for one algorithm and scramble.
    function adjust(scramble, alg) {
        var tokens = tokenize(alg);
        if (!tokens || !window.virtualCube || !window.virtualCube.makeCube) {
            return { pre: "", core: String(alg), post: "", ok: false };
        }
        // Strip the alg's own U turns at either end; we work them out ourselves
        while (tokens.length && isAuf(tokens[0])) tokens.shift();
        while (tokens.length && isAuf(tokens[tokens.length - 1])) tokens.pop();

        var core = tokens.join(" ");
        var coreMoves = toCubeMoves(tokens);
        for (var i = 0; i < AUFS.length; i++) {
            for (var j = 0; j < POST_AUFS.length; j++) {
                if (solves(scramble, AUFS[i] + " " + coreMoves + " " + POST_AUFS[j])) {
                    return { pre: AUFS[i], core: core, post: POST_AUFS[j], ok: true };
                }
            }
        }
        return { pre: "", core: String(alg), post: "", ok: false };
    }

    function toText(a) {
        return [a.pre, a.core, a.post].filter(Boolean).join(" ");
    }

    window.AlgAuf = {
        tokenize: tokenize,
        toCubeMoves: toCubeMoves,
        adjust: adjust,
        toText: toText,
    };
})(window);

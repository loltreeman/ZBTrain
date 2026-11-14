// Which algorithm did you just use?
//
// After each solve, the moves you did (keyboard or smart cube) are compared
// with the case's saved algorithms.
//
// Everything is first turned into a "canonical" form so different ways of
// writing the same thing match:
//
//   1. Fixed frame. Rotations, slices and wide moves are rewritten as plain
//      face turns relative to the centres. "r U r'" and "L x U x' L'" both
//      become the same face turns. A smart cube only ever reports face turns
//      in this frame, so this is also what makes smart cube solves comparable.
//   2. Messups cancelled. Neighbouring turns of the same face are merged
//      (R R → R2, R R' → nothing), also across turns of the opposite face
//      (R L R' → L). A wrong move you undo, or a whole wrong alg you reverse,
//      disappears.
//   3. AUFs stripped. U turns at the start and end don't count.
//   4. Angle ignored. An alg done from another side (y rotation vs a U turn)
//      still matches.

(function (window) {
    // Cube3 method → standard notation. rotate_x / y / z are named the
    // wrong way round in cube3x3.js, so they map to the opposite rotation.
    var METHOD_NOTATION = {
        rotate_u: "U", rotate_up: "U'", rotate_d: "D", rotate_dp: "D'",
        rotate_r: "R", rotate_rp: "R'", rotate_l: "L", rotate_lp: "L'",
        rotate_f: "F", rotate_fp: "F'", rotate_b: "B", rotate_bp: "B'",
        rotate_R: "r", rotate_Rp: "r'", rotate_L: "l", rotate_Lp: "l'",
        rotate_m: "M", rotate_mp: "M'", rotate_e: "E", rotate_ep: "E'",
        rotate_s: "S", rotate_sp: "S'",
        rotate_x: "x'", rotate_xp: "x", rotate_y: "y'", rotate_yp: "y",
        rotate_z: "z'", rotate_zp: "z",
    };

    function methodsToNotation(methods) {
        return methods.map(function (m) { return METHOD_NOTATION[m] || null; })
            .filter(Boolean);
    }

    // ── 1. Fixed frame ──────────────────────────────────────────────────

    var OPPOSITE = { U: "D", D: "U", R: "L", L: "R", F: "B", B: "F" };
    var AXIS = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };

    // How each rotation moves faces: after the rotation, the face now in
    // position K is the one that was in position CYCLE[K].
    var ROTATION_CYCLE = {
        x: { U: "F", F: "D", D: "B", B: "U" },   // like R
        y: { F: "R", R: "B", B: "L", L: "F" },   // like U
        z: { U: "L", L: "D", D: "R", R: "U" },   // like F
    };

    // Each slice / wide move as face turns plus a rotation
    var EXPANSIONS = {
        M: [["R", 1], ["L", 3], ["x", 3]],
        E: [["U", 1], ["D", 3], ["y", 3]],
        S: [["F", 3], ["B", 1], ["z", 1]],
        r: [["L", 1], ["x", 1]],
        l: [["R", 1], ["x", 3]],
        u: [["D", 1], ["y", 1]],
        d: [["U", 1], ["y", 3]],
        f: [["B", 1], ["z", 1]],
        b: [["F", 1], ["z", 3]],
    };

    function rotate(frame, axis, times) {
        for (var t = 0; t < times; t++) {
            var cycle = ROTATION_CYCLE[axis], next = {};
            for (var face in frame) next[face] = cycle[face] ? frame[cycle[face]] : frame[face];
            frame = next;
        }
        return frame;
    }

    // tokens (standard notation) → [{ f: fixed face, a: 1..3 }]
    // frame: the cube's rotation before these moves (default: none)
    function toFixedFrame(tokens, frame) {
        frame = frame || { U: "U", D: "D", R: "R", L: "L", F: "F", B: "B" };
        var out = [];
        tokens.forEach(function (tok) {
            var m = /^([URFDLBMESxyzurfdlb])(2|')?$/.exec(tok);
            if (!m) return;
            var amount = m[2] === "2" ? 2 : m[2] === "'" ? 3 : 1;
            var parts = EXPANSIONS[m[1]] || [[m[1], 1]];
            for (var n = 0; n < amount; n++) {
                parts.forEach(function (p) {
                    if (ROTATION_CYCLE[p[0]]) frame = rotate(frame, p[0], p[1]);
                    else out.push({ f: frame[p[0]], a: p[1] });
                });
            }
        });
        return out;
    }

    // The cube's rotation after some moves (rotations, wide and slice moves)
    function frameAfter(tokens) {
        var frame = { U: "U", D: "D", R: "R", L: "L", F: "F", B: "B" };
        tokens.forEach(function (tok) {
            var m = /^([URFDLBMESxyzurfdlb])(2|')?$/.exec(tok);
            if (!m) return;
            var amount = m[2] === "2" ? 2 : m[2] === "'" ? 3 : 1;
            var parts = EXPANSIONS[m[1]] || [];
            for (var n = 0; n < amount; n++) {
                parts.forEach(function (p) { if (ROTATION_CYCLE[p[0]]) frame = rotate(frame, p[0], p[1]); });
            }
            if (ROTATION_CYCLE[m[1]]) frame = rotate(frame, m[1], amount);
        });
        return frame;
    }

    // ── 2. Cancel messups ───────────────────────────────────────────────

    function simplify(moves) {
        var stack = [];
        moves.forEach(function (mv) {
            var merged = false;
            // Look back through the run of turns on the same axis
            for (var j = stack.length - 1; j >= 0 && AXIS[stack[j].f] === AXIS[mv.f]; j--) {
                if (stack[j].f === mv.f) {
                    var a = (stack[j].a + mv.a) % 4;
                    if (a === 0) stack.splice(j, 1);
                    else stack[j] = { f: mv.f, a: a };
                    merged = true;
                    break;
                }
            }
            if (!merged) stack.push({ f: mv.f, a: mv.a % 4 });
        });
        return stack.filter(function (m) { return m.a !== 0; });
    }

    // ── 3. Strip AUFs ───────────────────────────────────────────────────

    // Turns of opposite faces commute (U D' = D' U), so put each run of
    // same-axis turns in a fixed order before comparing.
    var FACE_ORDER = { U: 0, D: 1, R: 2, L: 3, F: 4, B: 5 };

    function normalizeRuns(moves) {
        var out = [], i = 0;
        while (i < moves.length) {
            var j = i;
            while (j < moves.length && AXIS[moves[j].f] === AXIS[moves[i].f]) j++;
            out = out.concat(moves.slice(i, j).sort(function (a, b) {
                return FACE_ORDER[a.f] - FACE_ORDER[b.f];
            }));
            i = j;
        }
        return out;
    }

    // Remove U turns from the first and last run of U/D turns
    function stripAuf(moves) {
        moves = moves.slice();
        var e = 0;
        while (e < moves.length && AXIS[moves[e].f] === AXIS.U) e++;
        var head = moves.slice(0, e).filter(function (m) { return m.f !== "U"; });
        moves = head.concat(moves.slice(e));
        var s = moves.length;
        while (s > 0 && AXIS[moves[s - 1].f] === AXIS.U) s--;
        var tail = moves.slice(s).filter(function (m) { return m.f !== "U"; });
        return moves.slice(0, s).concat(tail);
    }

    // ── 4. Compare from any angle ───────────────────────────────────────

    var Y_RELABEL = { F: "L", L: "B", B: "R", R: "F", U: "U", D: "D" };

    function relabel(moves, times) {
        return moves.map(function (m) {
            var f = m.f;
            for (var t = 0; t < times; t++) f = Y_RELABEL[f];
            return { f: f, a: m.a };
        });
    }

    function key(moves) {
        return moves.map(function (m) {
            return m.f + (m.a === 2 ? "2" : m.a === 3 ? "'" : "");
        }).join(" ");
    }

    function canonical(tokens, frame) {
        return normalizeRuns(stripAuf(simplify(toFixedFrame(tokens, frame))));
    }

    // All four angles of a saved alg
    function algKeys(alg) {
        var tokens = window.AlgAuf ? AlgAuf.tokenize(alg) : null;
        if (!tokens) return [];
        var c = canonical(tokens);
        return [0, 1, 2, 3].map(function (t) { return key(normalizeRuns(relabel(c, t))); });
    }

    // ── Public ──────────────────────────────────────────────────────────

    // methods: Cube3 method names from the move log
    // algs: the case's saved algorithms
    // Returns { index, cleaned, cleanedLength, rawLength, messy }
    //   index: matching alg index, or -1 if none matches
    //   cleaned: what you did, in readable notation (AUFs removed)
    //   preferIndex: when several saved algs are the same moves (e.g. an R
    //   version and its y2 L version), prefer this one (your main alg)
    function detect(methods, algs, preferIndex) {
        return detectTokens(methodsToNotation(methods), algs, preferIndex);
    }

    // frame: the cube's rotation before these moves (from frameAfter)
    function detectTokens(notation, algs, preferIndex, frame) {
        var recorded = canonical(notation, frame);
        var recordedKey = key(recorded);
        // Matching entries are the same moves; prefer your main alg among them
        var index = -1;
        for (var i = 0; i < algs.length; i++) {
            if (algKeys(algs[i]).indexOf(recordedKey) === -1) continue;
            if (index === -1 || i === preferIndex) index = i;
        }
        var fixed = toFixedFrame(notation, frame);
        var cancelled = fixed.length - simplify(fixed).length;
        var cleanedTokens = cleanNotation(notation);
        // A solve is "messy" if cancelling removed a lot of moves, or the
        // result is much longer than the case's algs: probably not a clean alg.
        var longest = algs.reduce(function (n, a) {
            var t = window.AlgAuf ? AlgAuf.tokenize(a) : null;
            return Math.max(n, t ? t.length : 0);
        }, 0);
        return {
            index: index,
            cleaned: cleanedTokens.join(" "),
            cleanedLength: recorded.length,
            rawLength: notation.length,
            cancelled: cancelled,
            messy: recorded.length > Math.max(longest + 4, 22) || cancelled > 6,
        };
    }

    // What you did, written in the notation you used (rotations, wide and
    // slice moves kept), with direct undo pairs and AUFs removed.
    function cleanNotation(tokens) {
        var stack = [];
        tokens.forEach(function (t) {
            var top = stack[stack.length - 1];
            if (top && top.charAt(0) === t.charAt(0)) {
                var a = (amountOf(top) + amountOf(t)) % 4;
                stack.pop();
                if (a) stack.push(t.charAt(0) + (a === 2 ? "2" : a === 3 ? "'" : ""));
            } else {
                stack.push(t);
            }
        });
        while (stack.length && /^U/.test(stack[0])) stack.shift();
        while (stack.length && /^U/.test(stack[stack.length - 1])) stack.pop();
        return stack;
    }

    function amountOf(t) {
        return /2$/.test(t) ? 2 : /'$/.test(t) ? 3 : 1;
    }

    // ── Mistakes in a recorded solve ────────────────────────────────────
    // Runs the same cancelling as simplify(), but remembers which written
    // moves produced each turn. Returns:
    //   cancelled[i]: true if move i was later undone (a mistake or its fix)
    //   events: for each undo, how far into the alg you were (turns kept so
    //           far, not counting the opening AUF)
    function trace(tokens) {
        var cancelled = tokens.map(function () { return false; });
        var events = [];
        var frame = { U: "U", D: "D", R: "R", L: "L", F: "F", B: "B" };
        var stack = []; // { f, a, src: [token indices] }

        function progress() {
            var n = 0;
            while (n < stack.length && stack[n].f === "U") n++;
            return stack.length - n;
        }

        tokens.forEach(function (tok, ti) {
            var m = /^([URFDLBMESxyzurfdlb])(2|')?$/.exec(tok);
            if (!m) return;
            var amount = m[2] === "2" ? 2 : m[2] === "'" ? 3 : 1;
            var parts = EXPANSIONS[m[1]] || [[m[1], 1]];
            for (var n = 0; n < amount; n++) {
                parts.forEach(function (p) {
                    if (ROTATION_CYCLE[p[0]]) { frame = rotate(frame, p[0], p[1]); return; }
                    var mv = { f: frame[p[0]], a: p[1] };
                    var merged = false;
                    for (var j = stack.length - 1; j >= 0 && AXIS[stack[j].f] === AXIS[mv.f]; j--) {
                        if (stack[j].f !== mv.f) continue;
                        var a = (stack[j].a + mv.a) % 4;
                        var src = stack[j].src.indexOf(ti) === -1 ? stack[j].src.concat(ti) : stack[j].src;
                        if (a === 0) {
                            src.forEach(function (i) { cancelled[i] = true; });
                            stack.splice(j, 1);
                            events.push(progress());
                        } else {
                            stack[j] = { f: mv.f, a: a, src: src };
                        }
                        merged = true;
                        break;
                    }
                    if (!merged) stack.push({ f: mv.f, a: mv.a, src: [ti] });
                });
            }
        });
        // A move that is part of a turn still on the cube wasn't undone
        stack.forEach(function (s) { s.src.forEach(function (i) { cancelled[i] = false; }); });
        return { cancelled: cancelled, events: events };
    }

    window.AlgDetect = {
        trace: trace,
        // Same as detect(), but for moves already in notation. before: moves
        // done earlier in the same solve, whose rotations still apply.
        detectNotation: function (tokens, algs, preferIndex, before) {
            return detectTokens(tokens, algs, preferIndex, before ? frameAfter(before) : null);
        },
        detect: detect,
        canonicalKey: function (alg) { return algKeys(alg)[0] || ""; },
        methodsToNotation: methodsToNotation,
        methodNotation: METHOD_NOTATION,
        // Face turns only, relative to the centres (what a smart cube sees)
        toFaceTurns: function (alg) {
            var t = window.AlgAuf ? AlgAuf.tokenize(alg) : null;
            return t ? key(normalizeRuns(simplify(toFixedFrame(t)))) : "";
        },
    };
})(window);

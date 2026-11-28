// LSLL: last slot + last layer, solved as ZBLS then ZBLL.
//
// Cases: any ZBLS case with any last layer. The scramble is a ZBLL scramble,
// a random U turn, then a ZBLS scramble (see generateSetup). csTimer instead
// solves a random cube state; this gets every ZBLS × ZBLL combination from
// the scrambles we already have, without a solver.
//
// After a solve, analyze() splits your moves at the first moment the cube
// reaches "F2L solved, last-layer edges oriented" (end of ZBLS) and works out:
//   - the ZBLS case, from the starting position
//   - the ZBLL case, from the position at that split
//   - which saved alg you used for each (algDetect.js), and the time of each
// Cases are recognised by a fingerprint of the pieces that define them,
// allowing for any AUF, so it works whatever alg you choose.

(function (window) {
    // Cubie colour slots in cube.js: 0 front, 1 right, 2 up, 3 back, 4 left, 5 down
    var SLOT = { F: 0, R: 1, U: 2, B: 3, L: 4, D: 5 };
    var LETTER = ["F", "R", "U", "B", "L", "D"];
    var CENTRE = { F: "F__", R: "_R_", U: "__U", B: "B__", L: "_L_", D: "__D" };

    // Last-layer positions, clockwise seen from above (a U turn moves each to the next)
    var LL_CORNERS = ["BLU", "BRU", "FRU", "FLU"];
    var LL_EDGES = ["B_U", "_RU", "F_U", "_LU"];
    // For each corner position, its two side faces in clockwise order around U
    var CORNER_SIDES = { BLU: ["L", "B"], BRU: ["B", "R"], FRU: ["R", "F"], FLU: ["F", "L"] };

    function makeCube(moves) { return window.virtualCube.makeCube(moves || ""); }

    // Which face each colour belongs to (from the centres)
    function faceOfColour(cube) {
        var map = {};
        Object.keys(CENTRE).forEach(function (f) { map[cube.cubies[CENTRE[f]].colors[SLOT[f]]] = f; });
        return map;
    }

    // The faces (home) of the piece at a position, e.g. "DFR"
    function homeOf(cube, key, faceMap) {
        var col = cube.cubies[key].colors, faces = [];
        for (var s = 0; s < 6; s++) if (faceMap[col[s]]) faces.push(faceMap[col[s]]);
        return faces.sort().join("");
    }

    // Face letter of the slot where a piece shows the colour of `face`
    function whereIs(cube, key, faceMap, face) {
        var col = cube.cubies[key].colors;
        for (var s = 0; s < 6; s++) if (faceMap[col[s]] === face) return LETTER[s];
        return "?";
    }

    function rotate(list, a) {
        var n = list.length, out = [];
        for (var i = 0; i < n; i++) out[(i + a) % n] = list[i];
        return out;
    }

    // ── ZBLS fingerprint ─────────────────────────────────────────────────
    // Where the front-right pair is and how it's twisted, plus which
    // last-layer edges are oriented. Last-layer corners and edge identities
    // don't define a ZBLS case. Normalised over pre-AUF (U turns).
    function zblsRaw(cube) {
        var fm = faceOfColour(cube);
        var corner = null, edge = null;
        var cornerPos = LL_CORNERS.concat(["FRD"]), edgePos = LL_EDGES.concat(["FR_"]);
        cornerPos.forEach(function (k, i) {
            if (homeOf(cube, k, fm) === "DFR") corner = { i: i, o: whereIs(cube, k, fm, "D") };
        });
        edgePos.forEach(function (k, i) {
            if (homeOf(cube, k, fm) === "FR") edge = { i: i, o: whereIs(cube, k, fm, "F") };
        });
        // Orientation of the other edges in those positions: U colour up (or
        // on F, for the slot) = oriented
        var eo = edgePos.map(function (k, i) {
            if (edge && edge.i === i) return "P";
            var at = whereIs(cube, k, fm, "U");
            return at === "U" || (i === 4 && at === "F") ? "o" : "x";
        });
        return { corner: corner, edge: edge, eo: eo };
    }

    function zblsSig(cube) {
        var r = zblsRaw(cube);
        if (!r.corner || !r.edge) return null;
        var best = null;
        for (var a = 0; a < 4; a++) {
            var ci = r.corner.i === 4 ? "S" : (r.corner.i + a) % 4;
            var ei = r.edge.i === 4 ? "S" : (r.edge.i + a) % 4;
            // corner twist written relative to the position (U-layer side faces turn with U)
            var co = r.corner.o;
            if (r.corner.i < 4 && co !== "U" && co !== "D") {
                var sides = CORNER_SIDES[LL_CORNERS[r.corner.i]];
                co = co === sides[0] ? "1" : "2";
            }
            var eo = rotate(r.eo.slice(0, 4), a).join("") + r.eo[4];
            var eoo = r.edge.i < 4 ? (r.edge.o === "U" ? "u" : "s") : r.edge.o;
            var s = "c" + ci + co + "e" + ei + eoo + "o" + eo;
            if (best === null || s < best) best = s;
        }
        return best;
    }

    // ── ZBLL fingerprint ─────────────────────────────────────────────────
    // Last-layer permutation and twist, normalised over pre-AUF (rotate
    // positions) and post-AUF (rotate piece identities).
    function zbllRaw(cube) {
        var fm = faceOfColour(cube);
        var cornerHome = LL_CORNERS.map(function (k) { return k.replace(/_/g, "").split("").sort().join(""); });
        var edgeHome = LL_EDGES.map(function (k) { return k.replace(/_/g, "").split("").sort().join(""); });
        var corners = LL_CORNERS.map(function (k) {
            var h = cornerHome.indexOf(homeOf(cube, k, fm));
            var at = whereIs(cube, k, fm, "U");
            var sides = CORNER_SIDES[k];
            var o = at === "U" ? 0 : at === sides[0] ? 1 : at === sides[1] ? 2 : 9;
            return [h, o];
        });
        var edges = LL_EDGES.map(function (k) {
            var h = edgeHome.indexOf(homeOf(cube, k, fm));
            return [h, whereIs(cube, k, fm, "U") === "U" ? 0 : 1];
        });
        return { corners: corners, edges: edges };
    }

    function zbllSig(cube) {
        var r = zbllRaw(cube);
        if (r.corners.some(function (c) { return c[0] < 0; }) || r.edges.some(function (e) { return e[0] < 0; })) return null;
        var best = null;
        for (var a = 0; a < 4; a++) {
            for (var b = 0; b < 4; b++) {
                var c = rotate(r.corners, a).map(function (p) { return ((p[0] + b) % 4) + "" + p[1]; }).join("");
                var e = rotate(r.edges, a).map(function (p) { return ((p[0] + b) % 4) + "" + p[1]; }).join("");
                var s = c + "|" + e;
                if (best === null || s < best) best = s;
            }
        }
        return best;
    }

    // ── Case indexes (built once, from each case's first scramble) ───────
    var zblsIndex = null, zbllIndex = null;

    function buildIndexes() {
        if (zblsIndex) return;
        zblsIndex = {};
        zbllIndex = {};
        Object.keys(zblsScrambles).forEach(function (f) {
            Object.keys(zblsScrambles[f]).forEach(function (c) {
                if (!zblsScrambles[f][c].length) return;
                var sig = zblsSig(makeCube(zblsScrambles[f][c][0]));
                if (sig && !zblsIndex[sig]) zblsIndex[sig] = { family: f, caseName: c };
            });
        });
        Object.keys(zbllScrambles).forEach(function (set) {
            Object.keys(zbllScrambles[set]).forEach(function (sub) {
                Object.keys(zbllScrambles[set][sub]).forEach(function (c) {
                    if (!zbllScrambles[set][sub][c].length) return;
                    var sig = zbllSig(makeCube(zbllScrambles[set][sub][c][0]));
                    if (sig && !zbllIndex[sig]) zbllIndex[sig] = { set: set, subset: sub, caseName: c };
                });
            });
        });
    }

    var solvedSigCache = null;
    function solvedSig() {
        if (solvedSigCache === null) solvedSigCache = zbllSig(makeCube(""));
        return solvedSigCache;
    }

    function zblsCaseOf(cube) {
        buildIndexes();
        var hit = zblsIndex[zblsSig(cube)];
        if (!hit) return null;
        var key = "ZBLS-" + hit.family + "-" + hit.caseName;
        return {
            name: "F2L " + hit.family + "-" + hit.caseName,
            key: key,
            set: "ZBLS", subset: hit.family, caseName: hit.caseName,
            img: window.CASE_SETS.ZBLS.img(hit.family, hit.caseName),
            ownAlgs: ownAlgsFor(key, (zblsAlgs[hit.family] || {})[hit.caseName]),
            algs: algsFor(key, (zblsAlgs[hit.family] || {})[hit.caseName]),
        };
    }

    function zbllCaseOf(cube) {
        buildIndexes();
        // Solved, or only an AUF away
        var sig = zbllSig(cube);
        if (cube.isSolved() || sig === solvedSig()) return { name: "LL skip", algs: [], skip: true };
        var hit = zbllIndex[sig];
        if (!hit) {
            // Corners already oriented with edges oriented: a PLL, not a ZBLL case
            var raw = zbllRaw(cube);
            var oriented = raw.corners.every(function (c) { return c[1] === 0; });
            return { name: oriented ? "PLL" : "Unrecognised last layer", algs: [], other: true };
        }
        var key = hit.set + "-" + hit.subset + "-" + hit.caseName;
        return {
            name: key,
            key: key,
            set: hit.set, subset: hit.subset, caseName: hit.caseName,
            img: "svg/top/" + key + ".svg",
            ownAlgs: ownAlgsFor(key, ((zbllAlgs[hit.set] || {})[hit.subset] || {})[hit.caseName]),
            algs: algsFor(key, ((zbllAlgs[hit.set] || {})[hit.subset] || {})[hit.caseName]),
        };
    }

    // ── Generating a case ───────────────────────────────────────────────

    function randomItem(list) { return list[Math.floor(Math.random() * list.length)]; }

    // Merge neighbouring turns of the same face (where two scrambles join)
    function cancel(tokens) {
        var out = [];
        tokens.forEach(function (t) {
            var top = out[out.length - 1];
            if (top && top.charAt(0) === t.charAt(0)) {
                var a = (amount(top) + amount(t)) % 4;
                out.pop();
                if (a) out.push(t.charAt(0) + (a === 2 ? "2" : a === 3 ? "'" : ""));
            } else out.push(t);
        });
        return out;
    }

    function amount(t) { return /2$/.test(t) ? 2 : /'$/.test(t) ? 3 : 1; }

    // A random ZBLL scramble, a random U turn, then a random ZBLS case's
    // scramble. The ZBLS scramble only moves the last-layer pieces around,
    // so the ZBLS case stays the same and the last layer you get after
    // solving it is a random one.
    function generateSetup() {
        var set = randomItem(Object.keys(zbllScrambles));
        var sub = randomItem(Object.keys(zbllScrambles[set]));
        var zbll = randomItem(zbllScrambles[set][sub][randomItem(Object.keys(zbllScrambles[set][sub]))]);
        var family = randomItem(Object.keys(zblsScrambles));
        var zbls = randomItem(zblsScrambles[family][randomItem(Object.keys(zblsScrambles[family]))]);
        // The ZBLS in one of the slots you ticked (zblsSlotTools.js moves it there)
        var slot = randomItem(savedSlots());
        if (slot !== "FR" && window.ZBLSSlots) zbls = ZBLSSlots.moveScramble(zbls, slot);
        var tokens = (zbll + " " + randomItem(["", "U", "U2", "U'"]) + " " + zbls).split(/\s+/).filter(Boolean);
        return cancel(tokens).join(" ");
    }

    // Slots for the ZBLS (trainer settings, LSLL only)
    var SLOTS = ["FR", "FL", "BR", "BL"];
    function savedSlots() {
        try {
            var s = JSON.parse(localStorage.getItem("lsllSlots"));
            if (Array.isArray(s)) s = s.filter(function (x) { return SLOTS.indexOf(x) >= 0; });
            if (s && s.length) return s;
        } catch (e) {}
        return ["FR"];
    }

    // The ZBLS case of a position, in whichever slot is open: turns the cube
    // so that slot is in front-right, looks the case up, and gives that
    // slot's name, algs and key ("ZBLS-FL-12-3")
    function zblsCaseOfSetup(moves) {
        var cube = makeCube(moves);
        var broken = brokenSlots(cube);
        if (broken.length !== 1 || broken[0] === "FR" || !window.ZBLSSlots) return zblsCaseOf(cube);
        var slot = broken[0];
        var turned = null;
        ["y", "y2", "y'"].some(function (r) {
            var c = makeCube(moves + " " + r);
            var b = brokenSlots(c);
            if (b.length === 1 && b[0] === "FR") { turned = c; return true; }
            return false;
        });
        var fr = turned && zblsCaseOf(turned);
        if (!fr) return null;
        var key = ZBLSSlots.key(fr.subset, fr.caseName, slot);
        var base = (zblsAlgs[fr.subset] || {})[fr.caseName] || [];
        var slotAlgs = ZBLSSlots.algsFor(fr.subset, fr.caseName, slot, base);
        return {
            name: fr.name + " (" + slot + ")",
            key: key,
            set: "ZBLS", subset: fr.subset, caseName: fr.caseName, slot: slot,
            img: "", // no diagram for other slots: the trainer draws the cube
            ownAlgs: ownAlgsFor(key, slotAlgs),
            algs: algsFor(key, slotAlgs),
        };
    }

    // A case's own algs, with your edits from the trainer (customAlgs)
    function ownAlgsFor(key, fallback) {
        try {
            var saved = JSON.parse(localStorage.getItem("customAlgs") || "{}");
            if (saved[key]) return saved[key];
        } catch (e) {}
        return fallback || [];
    }

    // Your algs plus algs from the sheets you have turned on (algSheets.js)
    function algsFor(key, fallback) {
        var own = ownAlgsFor(key, fallback);
        return window.AlgSheets ? own.concat(AlgSheets.extraAlgs(key, own)) : own;
    }

    // ── Analysing a solve ───────────────────────────────────────────────
    // moves: [[notation, ms], ...] from the case appearing (as saved with attempts)
    function analyze(setup, moves) {
        if (!moves || !moves.length) return null;
        var zbls = zblsCaseOfSetup(setup);
        var tokens = moves.map(function (m) { return m[0]; });

        // Split at the first moment F2L is solved and edges are oriented
        var cube = makeCube(setup), split = -1;
        for (var i = 0; i < tokens.length; i++) {
            cube =makeCube(setup + " " + window.AlgAuf.toCubeMoves(tokens.slice(0, i + 1)));
            if (window.CubeGoals.zbls(cube)) { split = i + 1; break; }
        }
        if (split < 0) return { zbls: zbls, zbll: null, split: -1 };

        var zbll = zbllCaseOf(cube);
        var zblsPart = tokens.slice(0, split), zbllPart = tokens.slice(split);
        function used(part, algs, before) {
            if (!part.length) return { cleaned: "", index: -1 };
            var d = window.AlgDetect.detectNotation(part, algs, 0, before);
            return { cleaned: d.cleaned, index: d.index, alg: d.index >= 0 ? algs[d.index] : null };
        }
        var firstMs = moves[0][1], splitMs = moves[split - 1][1], lastMs = moves[moves.length - 1][1];
        return {
            zbls: zbls,
            zbll: zbll,
            split: split,
            zblsUsed: zbls ? used(zblsPart, zbls.algs) : used(zblsPart, []),
            // the ZBLS alg may leave the cube rotated (wide moves)
            zbllUsed: zbll && !zbll.skip ? used(zbllPart, zbll.algs, zblsPart) : { cleaned: "", index: -1 },
            times: {
                recog: firstMs / 1000,
                zbls: (splitMs - firstMs) / 1000,
                zbll: (lastMs - splitMs) / 1000,
            },
        };
    }

    // ── Helpers for the alg checker (algSheets.js) ──────────────────────

    // Every first-two-layers piece solved except the front-right pair
    var F2L_KEYS = ["F_D", "B_D", "_RD", "_LD", "FLD", "BRD", "BLD", "__D",
        "FL_", "BR_", "BL_", "F__", "B__", "_R_", "_L_"];

    function f2lExceptPair(cube) {
        var fm = faceOfColour(cube);
        return F2L_KEYS.every(function (k) {
            var col = cube.cubies[k].colors;
            for (var s = 0; s < 6; s++) {
                if (fm[col[s]] && fm[col[s]] !== LETTER[s]) return false;
            }
            return true;
        });
    }

    // The 24 ways to hold the cube. The alg checker tries the position as it
    // comes first, then the others: an alg with an x or z in it can leave
    // the case on its side.
    var ROTATIONS = ["", "y", "y2", "y'", "x", "x y", "x y2", "x y'", "x2", "x2 y", "x2 y2", "x2 y'",
        "x'", "x' y", "x' y2", "x' y'", "z", "z y", "z y2", "z y'", "z'", "z' y", "z' y2", "z' y'"];

    // Calls test(cube) for each way of holding the position made by `moves`
    // and returns the first result that isn't null
    function eachHolding(moves, test) {
        for (var i = 0; i < ROTATIONS.length; i++) {
            var r = test(makeCube((moves + " " + ROTATIONS[i]).trim()));
            if (r != null) return r;
        }
        return null;
    }

    // ── F2L slots (for ZBLS in any slot) ────────────────────────────────
    var SLOT_PIECES = {
        FR: ["FR_", "FRD"], FL: ["FL_", "FLD"], BR: ["BR_", "BRD"], BL: ["BL_", "BLD"],
    };

    function pieceSolved(cube, key, fm) {
        var col = cube.cubies[key].colors;
        for (var s = 0; s < 6; s++) {
            if (fm[col[s]] && fm[col[s]] !== LETTER[s]) return false;
        }
        return true;
    }

    // The F2L slots that aren't solved, e.g. ["FL"]
    function brokenSlots(cube) {
        var fm = faceOfColour(cube);
        return Object.keys(SLOT_PIECES).filter(function (slot) {
            return !SLOT_PIECES[slot].every(function (k) { return pieceSolved(cube, k, fm); });
        });
    }

    // Where a piece is, e.g. findPiece(cube, "FR") → "F_U" (the FR edge is at UF)
    function findPiece(cube, home) {
        var fm = faceOfColour(cube);
        var want = home.split("").sort().join("");
        var keys = Object.keys(cube.cubies);
        for (var i = 0; i < keys.length; i++) {
            if (homeOf(cube, keys[i], fm) === want) return keys[i];
        }
        return null;
    }

    window.LSLL = {
        f2lExceptPair: f2lExceptPair,
        brokenSlots: brokenSlots,
        findPiece: findPiece,
        pieceSolved: function (cube, key) { return pieceSolved(cube, key, faceOfColour(cube)); },
        eachHolding: eachHolding,
        generateSetup: generateSetup,
        analyze: analyze,
        zblsCaseOf: zblsCaseOf,
        zblsCaseOfSetup: zblsCaseOfSetup,
        savedSlots: savedSlots,
        zbllCaseOf: zbllCaseOf,
        _sig: { zbls: zblsSig, zbll: zbllSig, index: function () { buildIndexes(); return { zbls: zblsIndex, zbll: zbllIndex }; } },
    };

    // Register LSLL as a case set for the trainer
    window.CASE_SETS = window.CASE_SETS || {};
    window.CASE_SETS.LSLL = {
        label: "LSLL",
        goal: "zbll",
        selectPage: "./",
        dynamic: true, // cases are generated (generateSetup), not picked from a list
        algs: {},
        scrambles: {},
        name: function () { return "LSLL"; },
        img: function () { return ""; },
    };
})(window);

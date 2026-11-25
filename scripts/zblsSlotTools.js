// ZBLS in any slot, and "edge fixed" practice.
//
// ZBTrain's ZBLS cases are written for the front-right slot. The same case
// in another slot is the FR case with the cube turned: FL is a y', BR a y,
// BL a y2 (see zblsSlots.js). A scramble is moved into another slot by
// rewriting its turns (so it stays plain face turns, no rotations).
//
// Edge fixed: the slot's edge always starts at the same top-layer position
// (for example UF), by adding a U turn to the end of the scramble. That lets
// you practise each case from one angle. If the edge isn't in the top layer
// (it's in a slot), the corner is put above the slot instead.
//
// Needs virtualCube.makeCube (virtualCubeEmbed.js) and LSLL (lsll.js).

(function (window) {
    var SLOTS = ["FR", "FL", "BR", "BL"];
    var TURN = { FR: "", FL: "y'", BR: "y", BL: "y2" };
    var UNDO = { FR: "", FL: "y", BR: "y'", BL: "y2" };
    var EDGE_TARGET = { UF: "F_U", UR: "_RU", UB: "B_U", UL: "_LU" };
    var CORNER_ABOVE = { FR: "FRU", FL: "FLU", BR: "BRU", BL: "BLU" };

    function makeCube(moves) { return window.virtualCube.makeCube(moves || ""); }

    function sameCube(a, b) {
        return JSON.stringify(a.cubies) === JSON.stringify(b.cubies);
    }

    // For each slot, which face each face turn becomes (worked out once on
    // the cube model, so it always matches the virtual cube)
    var faceMaps = {};
    function faceMap(slot) {
        if (faceMaps[slot]) return faceMaps[slot];
        var map = {};
        ["U", "D", "R", "L", "F", "B"].forEach(function (f) {
            var target = makeCube(TURN[slot] + " " + f + " " + UNDO[slot]);
            ["U", "D", "R", "L", "F", "B"].forEach(function (g) {
                if (sameCube(target, makeCube(g))) map[f] = g;
            });
        });
        return (faceMaps[slot] = map);
    }

    // An FR scramble moved into another slot
    function moveScramble(moves, slot) {
        if (!slot || slot === "FR") return moves;
        var map = faceMap(slot);
        return String(moves).trim().split(/\s+/).map(function (t) {
            return (map[t.charAt(0)] || t.charAt(0)) + t.slice(1);
        }).join(" ");
    }

    // Corner fixed: the slot's corner starts at UFR, UFL, UBR or UBL. If the
    // corner is in a slot, the edge starts at the front (FR/FL slots) or
    // back (BR/BL) instead.
    var CORNER_TARGET = { UFR: "FRU", UFL: "FLU", UBR: "BRU", UBL: "BLU" };
    var EDGE_BESIDE = { FR: "F_U", FL: "F_U", BR: "B_U", BL: "B_U" };

    // Add a U turn so the slot's edge starts at `target` (UF, UR, UB, UL), or
    // its corner (UFR, UFL, UBR, UBL)
    function fixEdge(setup, slot, target) {
        var cornerWant = CORNER_TARGET[target];
        var want = EDGE_TARGET[target];
        if ((!want && !cornerWant) || !window.LSLL || !LSLL.findPiece) return setup;
        slot = slot || "FR";
        var aufs = ["", "U", "U2", "U'"];
        var edgeHome = slot;                       // e.g. "FL"
        var cornerHome = "D" + slot;               // e.g. "DFL"
        // Which piece to place, and where
        var piece = cornerWant ? cornerHome : edgeHome;
        var spot = cornerWant || want;
        var start = LSLL.findPiece(makeCube(setup), piece);
        var inTop = start && start.indexOf("U") >= 0 && start.charAt(start.length - 1) === "U";
        if (!inTop) {
            // Not in the top layer: place the other piece instead
            piece = cornerWant ? edgeHome : cornerHome;
            spot = cornerWant ? EDGE_BESIDE[slot] : CORNER_ABOVE[slot];
            var other = LSLL.findPiece(makeCube(setup), piece);
            if (!other || other.charAt(other.length - 1) !== "U") return setup;
        }
        for (var i = 0; i < aufs.length; i++) {
            var moves = (setup + " " + aufs[i]).trim();
            if (LSLL.findPiece(makeCube(moves), piece) === spot) return moves;
        }
        return setup;
    }

    // Algs for a case in a slot: the sheet algs for that slot, or else the
    // FR algs done after turning the cube (e.g. "y' R U R'")
    function algsFor(family, caseName, slot, frAlgs) {
        if (!slot || slot === "FR") return (frAlgs || []).slice();
        var data = window.zblsSlotAlgs && zblsSlotAlgs[slot];
        var list = data && data[family] && data[family][caseName];
        if (list && list.length) return list.slice();
        return (frAlgs || []).map(function (a) { return TURN[slot] + " " + a; });
    }

    // Whether a slot has real algs for every case, or uses the rotation fallback
    function coverage(slot) {
        if (slot === "FR") return 1;
        var data = window.zblsSlotAlgs && zblsSlotAlgs[slot];
        if (!data || typeof zblsAlgs === "undefined") return 0;
        var have = 0, total = 0;
        Object.keys(zblsAlgs).forEach(function (f) {
            Object.keys(zblsAlgs[f]).forEach(function (c) {
                total++;
                if (data[f] && data[f][c] && data[f][c].length) have++;
            });
        });
        return total ? have / total : 0;
    }

    // Saved choices (ZBLS page)
    function savedSlots() {
        try {
            var s = JSON.parse(localStorage.getItem("zblsSlots"));
            if (Array.isArray(s) && s.length) return s.filter(function (x) { return SLOTS.indexOf(x) >= 0; });
        } catch (e) {}
        return ["FR"];
    }

    function savedEdge() {
        try { return localStorage.getItem("zblsEdgeFix") || "any"; } catch (e) { return "any"; }
    }

    window.ZBLSSlots = {
        SLOTS: SLOTS,
        TURN: TURN,
        moveScramble: moveScramble,
        fixEdge: fixEdge,
        algsFor: algsFor,
        coverage: coverage,
        savedSlots: savedSlots,
        savedEdge: savedEdge,
        // "ZBLS-12-3" + "FL" → "ZBLS-FL-12-3"
        key: function (family, caseName, slot) {
            return "ZBLS-" + (slot && slot !== "FR" ? slot + "-" : "") + family + "-" + caseName;
        },
    };
})(window);

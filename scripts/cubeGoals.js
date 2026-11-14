// What counts as "solved" for each kind of case.
//
//   zbll: the whole cube is solved.
//   zbls: the first two layers are solved and every last-layer edge is
//         oriented (U colour on top). The last layer can be anything else.
//
// Used by the virtual cube's solve detection and by the AUF adjustment of
// algorithms (algAuf.js). Checks are relative to the centres, so cube
// rotations during an alg don't matter.

(function (window) {
    // Cubie colour slots in cube.js: 0 front, 1 right, 2 up, 3 back, 4 left, 5 down
    var SLOT = { F: 0, R: 1, U: 2, B: 3, L: 4, D: 5 };
    var CENTRE = { 0: "F__", 1: "_R_", 2: "__U", 3: "B__", 4: "_L_", 5: "__D" };

    function centreColour(cube, slot) {
        return cube.cubies[CENTRE[slot]].colors[slot];
    }

    // Stickers of a cubie, as colour slots, from its position key (e.g. "FR_")
    function slotsOf(key) {
        var out = [];
        for (var i = 0; i < 3; i++) {
            var ch = key.charAt(i);
            if (ch !== "_") out.push(SLOT[ch]);
        }
        return out;
    }

    function zbllSolved(cube) {
        return cube.isSolved();
    }

    function zblsSolved(cube) {
        var up = centreColour(cube, SLOT.U);
        for (var key in cube.cubies) {
            var colours = cube.cubies[key].colors;
            var slots = slotsOf(key);
            if (key.charAt(2) === "U") {
                // Last layer: only edges need to be oriented
                if (slots.length === 2 && colours[SLOT.U] !== up) return false;
                continue;
            }
            // First two layers: every sticker matches its centre
            for (var i = 0; i < slots.length; i++) {
                if (colours[slots[i]] !== centreColour(cube, slots[i])) return false;
            }
        }
        return true;
    }

    window.CubeGoals = {
        zbll: zbllSolved,
        zbls: zblsSolved,
        // The goal in use on this page; the trainer sets it from the cases
        active: "zbll",
        isGoal: function (cube) {
            var fn = window.CubeGoals[window.CubeGoals.active];
            return typeof fn === "function" ? fn(cube) : cube.isSolved();
        },
    };
})(window);

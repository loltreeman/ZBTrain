// Display names for ZBLL subsets, like ZBLL Explorer: where the two swapped
// corners are in the case picture (Top, Bottom, Left, Right). "2GLL" (no swap)
// and "Diag" keep their names.
//
// Only the label changes. Saved algs, stats, presets and sheets still use the
// subset IDs ("T-3-AsC"), so nothing saved is affected.
//
// The sides below were worked out from the case pictures (svg/top): in each
// subset's pictures, exactly one side has its two corners placed right
// relative to each other, and the swap is on the side opposite. The numbers
// don't mean the same side in every set (T-3 is Top, Sune-3 is Bottom).
//
// If you turn a set's pictures (ZBLL page, "Other angles"), the names turn
// with them: an angle of 90° (clockwise) makes Top read as Right.

(function (window) {
    var SIDE = {
        T: { "3": "Top", "4": "Bottom", "5": "Left", "6": "Right" },
        U: { "3": "Top", "4": "Bottom", "5": "Left", "6": "Right" },
        L: { "3": "Left", "4": "Top", "5": "Right", "6": "Bottom" },
        Pi: { "3": "Left", "4": "Right", "5": "Top", "6": "Bottom" },
        Sune: { "3": "Bottom", "4": "Top", "5": "Left", "6": "Right" },
        Antisune: { "3": "Bottom", "4": "Top", "5": "Right", "6": "Left" },
        // H looks the same turned 180°, so a swap on the right is also one on the left
        H: { "3": "Right", "4": "Top" },
    };

    // Clockwise around the picture
    var CW = ["Top", "Right", "Bottom", "Left"];

    function turned(side, angle) {
        var q = Math.round((parseInt(angle, 10) || 0) / 90);
        var i = CW.indexOf(side);
        return i < 0 ? side : CW[(((i + q) % 4) + 4) % 4];
    }

    // "3" → "Top" (or the turned side), "2GLL" and "Diag" stay as they are
    function label(set, subset, angle) {
        var side = SIDE[set] && SIDE[set][subset];
        if (!side) return subset;
        side = turned(side, angle);
        if (set === "H") return side === "Top" || side === "Bottom" ? "Top/Bottom" : "Left/Right";
        return side;
    }

    window.ZbllSubsets = { label: label, side: function (set, subset) { return (SIDE[set] || {})[subset] || null; } };
})(window);

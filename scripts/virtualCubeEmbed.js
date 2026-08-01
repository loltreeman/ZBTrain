// This file is used to embed the virtual cube onto the trainer.

(function (window, document) {
    var T = 0.9;
    var colors = [
        "rgba(20,200,20," + T + ")",
        "rgba(255,0,0," + T + ")",
        "rgba(255,255,255," + T + ")",
        "rgba(0,0,255," + T + ")",
        "rgba(255,160,0," + T + ")",
        "rgba(255,255,0," + T + ")",
    ];

    var canvas = document.getElementById("canvas");
    var context = canvas && canvas.getContext ? canvas.getContext("2d") : null;

    window.cube3 = new Cube3(colors);
    window.cube3.isSolving = false;

    var prevSolved = false;
    var solveCallback = null;
    window._firstMoveFired = false;
    window._aufMoveFired = false;

    function draw() {
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        cube3.draw(context, 80, 30);
    }

    // ─── Keybind system ────────────────────────────────────────────────────

    /** Default key → cube3 method name. Never mutated at runtime. */
    var DEFAULT_CUBE_ACTIONS = {
        h: "rotate_f",  g: "rotate_fp", i: "rotate_r",  k: "rotate_rp",
        j: "rotate_u",  f: "rotate_up", w: "rotate_b",  o: "rotate_bp",
        d: "rotate_l",  e: "rotate_lp", s: "rotate_d",  l: "rotate_dp",
        b: "rotate_x",  n: "rotate_x",  t: "rotate_xp", y: "rotate_xp",
        a: "rotate_y",  ";": "rotate_yp", q: "rotate_z", p: "rotate_zp",
        u: "rotate_R",  m: "rotate_Rp", v: "rotate_L",  r: "rotate_Lp",
        "5": "rotate_m", "6": "rotate_mp", "0": "rotate_s", "1": "rotate_sp",
        "2": "rotate_e", "9": "rotate_ep",
    };

    var LS_KEY = "cubeKeybinds";

    /** Load merged keybinds: saved overrides on top of defaults. */
    function loadKeybinds() {
        var merged = {};
        // Copy all defaults first
        Object.keys(DEFAULT_CUBE_ACTIONS).forEach(function (k) {
            merged[k] = DEFAULT_CUBE_ACTIONS[k];
        });
        try {
            var saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
            if (saved && typeof saved === "object") {
                Object.keys(saved).forEach(function (k) {
                    merged[k] = saved[k];
                    // If this key was already in defaults for a DIFFERENT method,
                    // the saved binding wins (old entry is simply overwritten above).
                });
                // Remove default entries whose keys were re-bound to something else
                // (i.e. a default key now appears as a *different* key in saved)
                var savedValues = Object.values ? Object.values(saved) : Object.keys(saved).map(function(k){ return saved[k]; });
                Object.keys(DEFAULT_CUBE_ACTIONS).forEach(function (defKey) {
                    if (!saved[defKey] && savedValues.indexOf(DEFAULT_CUBE_ACTIONS[defKey]) !== -1) {
                        // This method now has a different key — remove the default binding
                        // only if the method is fully remapped (not just a dual key like b/n)
                        // Count how many times this method appears in merged
                        var count = Object.keys(merged).filter(function(k){ return merged[k] === DEFAULT_CUBE_ACTIONS[defKey]; }).length;
                        if (count > 1) {
                            // Safe to drop the old key, the new key covers it
                            delete merged[defKey];
                        }
                    }
                });
            }
        } catch (e) { /* ignore corrupt storage */ }
        return merged;
    }

    /** Save only the *differences* from defaults to localStorage. */
    function saveKeybinds(fullMap) {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(fullMap));
        } catch (e) { /* quota issues — silently skip */ }
    }

    /** The live map consulted by the keydown listener. Refreshed on each bind change. */
    var cubeActions = loadKeybinds();

    // ─── AUF helpers ───────────────────────────────────────────────────────

    /** Returns the set of keys currently bound to rotate_u or rotate_up. */
    function getAUFKeys() {
        var keys = {};
        Object.keys(cubeActions).forEach(function (k) {
            var m = cubeActions[k];
            if (m === "rotate_u" || m === "rotate_up") keys[k] = true;
        });
        return keys;
    }

    // ─── keydown listener ─────────────────────────────────────────────────

    var allowMoves = false;

    document.addEventListener("keydown", function (event) {
        if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
        if (!allowMoves) return;
        var k = event.key;
        if (!k) return;
        if (k.length === 1) k = k.toLowerCase();
        if (!(k in cubeActions)) return;

        if (cube3.isSolving) {
            var aufKeys = getAUFKeys();
            var isAUF = !!aufKeys[k];
            if (!window._firstMoveFired && !isAUF) {
                window._firstMoveFired = true;
                document.dispatchEvent(new CustomEvent("cubeFirstMove", { detail: { time: performance.now() } }));
            } else if (!window._firstMoveFired && isAUF) {
                window._aufMoveFired = true;
                document.dispatchEvent(new CustomEvent("cubeAUFMove", { detail: { time: performance.now() } }));
            }
        }

        var method = cubeActions[k];
        try {
            if (typeof cube3[method] === "function") cube3[method]();
            cube3.moveCount = (cube3.moveCount || 0) + 1;
            draw();
            event.preventDefault();
        } catch (e) { }
    });

    // ─── solve-detection interval ─────────────────────────────────────────

    setInterval(function () {
        if (!cube3.isSolving) return;
        if (!window._firstMoveFired && !window._aufMoveFired) return;

        var recallCheckbox = document.getElementById("recallModeCheckbox");
        var inRecallMode = recallCheckbox && recallCheckbox.checked;
        if (inRecallMode && !window._firstMoveFired) return;

        var now = cube3.isSolved();

        if (!prevSolved && now) {
            if (typeof solveCallback === "function") solveCallback();
            cube3.isSolving = false;
            window._firstMoveFired = false;
            window._aufMoveFired = false;
        }
        prevSolved = now;
    }, 80);

    // ─── cube helpers ─────────────────────────────────────────────────────

    function resetCube() {
        window.cube3 = new Cube3(colors);
        window.cube3.isSolving = false;
        window._firstMoveFired = false;
        window._aufMoveFired = false;
        window._recallColorSnapshot = undefined;
        prevSolved = false;
        setTimeout(function () { resizeCanvas(); }, 10);
    }

    function applyScrambleString(scramble) {
        if (!scramble || !scramble.length) return;
        var tokens = scramble.trim().split(/\s+/).filter(Boolean);
        tokens.forEach(function (tok) {
            var base = tok.charAt(0).toUpperCase();
            var isInverse = tok.indexOf("'") !== -1;
            var times = tok.indexOf("2") !== -1 ? 2 : 1;
            var rotationMap = { X: "rotate_x", Y: "rotate_y", Z: "rotate_z" };
            var sliceMap    = { M: "rotate_m", E: "rotate_e", S: "rotate_s" };
            var wideMoveMap = { r: "rotate_R", u: "rotate_U", f: "rotate_F", l: "rotate_L", d: "rotate_D", b: "rotate_B" };
            var method;
            var baseOrig = tok.charAt(0);
            if (rotationMap[base])      { method = rotationMap[base]; if (isInverse) method += "p"; }
            else if (sliceMap[base])    { method = sliceMap[base];    if (isInverse) method += "p"; }
            else if (wideMoveMap[baseOrig]) { method = wideMoveMap[baseOrig]; if (isInverse) method += "p"; }
            else { method = "rotate_" + base.toLowerCase(); if (isInverse) method += "p"; }
            for (var i = 0; i < times; i++) {
                if (typeof cube3[method] === "function") cube3[method]();
                else console.warn("Unknown move method:", method, "from token:", tok);
            }
        });
        draw();
        window._firstMoveFired = false;
        window._aufMoveFired = false;
        window._recallColorSnapshot = undefined;
        cube3.isSolving = true;
    }

    function resizeCanvas() {
        if (!canvas) return;
        var cssWidth = 400;
        var cssHeight = 300;
        var ratio = window.devicePixelRatio || 1;
        canvas.width  = Math.round(cssWidth  * ratio);
        canvas.height = Math.round(cssHeight * ratio);
        canvas.style.width  = cssWidth  + "px";
        canvas.style.height = cssHeight + "px";
        canvas.style.marginLeft = canvas.style.marginRight = "auto";
        canvas.style.display = "block";
        if (!context) return;
        window.virtualCube._nativeBounds = null;
        measureNativeBounds();
        var nb = window.virtualCube._nativeBounds || { w: 180, h: 150, minX: 0, minY: 0 };
        var s = Math.min(cssWidth / nb.w, cssHeight / nb.h) * 0.88;
        if (s <= 0) s = 1;
        var scale = ratio * s;
        var offsetX = (cssWidth  - nb.w * s) / 2 - nb.minX * s;
        var offsetY = (cssHeight - nb.h * s) / 2 - nb.minY * s;
        context.setTransform(scale, 0, 0, scale, Math.round(offsetX * ratio), Math.round(offsetY * ratio));
        draw();
    }

    function measureNativeBounds() {
        try {
            var off = document.createElement("canvas");
            var W = 1000, H = 1000;
            off.width = W; off.height = H;
            var octx = off.getContext("2d");
            octx.clearRect(0, 0, W, H);
            cube3.draw(octx, 0, 0);
            var data = octx.getImageData(0, 0, W, H).data;
            var minX = W, minY = H, maxX = 0, maxY = 0;
            for (var y = 0; y < H; y++) {
                for (var x = 0; x < W; x++) {
                    var idx = (y * W + x) * 4 + 3;
                    if (data[idx] !== 0) {
                        if (x < minX) minX = x; if (y < minY) minY = y;
                        if (x > maxX) maxX = x; if (y > maxY) maxY = y;
                    }
                }
            }
            if (maxX <= minX || maxY <= minY) {
                window.virtualCube._nativeBounds = { w: 180, h: 150, minX: 0, minY: 0 };
            } else {
                var pad = 8;
                window.virtualCube._nativeBounds = {
                    w: (maxX - minX + 1) + pad * 2, h: (maxY - minY + 1) + pad * 2,
                    minX: minX - pad, minY: minY - pad,
                };
            }
        } catch (e) {
            window.virtualCube._nativeBounds = { w: 180, h: 150, minX: 0, minY: 0 };
        }
    }

    window.addEventListener("resize", resizeCanvas);

    // ─── public API ───────────────────────────────────────────────────────

    window.virtualCube = {
        applyScramble:  applyScrambleString,
        onSolve:        function (cb) { solveCallback = cb; },
        isSolved:       function () { return cube3.isSolved(); },
        draw:           draw,
        enableMoves:    function () { allowMoves = true; },
        disableMoves:   function () { allowMoves = false; },
        areMovesAllowed: function () { return !!allowMoves; },
        reset:          resetCube,
        resize:         function () { resizeCanvas(); },

        // ── keybind API ──────────────────────────────────────────────────
        /** Return a copy of the live key → method map. */
        getKeybinds: function () {
            var copy = {};
            Object.keys(cubeActions).forEach(function (k) { copy[k] = cubeActions[k]; });
            return copy;
        },

        /** Return a copy of the unmodified default map. */
        getDefaultKeybinds: function () {
            var copy = {};
            Object.keys(DEFAULT_CUBE_ACTIONS).forEach(function (k) { copy[k] = DEFAULT_CUBE_ACTIONS[k]; });
            return copy;
        },

        /**
         * Bind `key` to `method`. Automatically removes any previous key that
         * was bound to the same method (so each method has at most one key
         * unless the default had two, e.g. b/n for rotate_x).
         */
        setKeybind: function (key, method) {
            if (key.length === 1) key = key.toLowerCase();
            // Remove the old key(s) bound to this method, EXCEPT when the
            // default intentionally had multiple keys for the same method
            // (b and n both do rotate_x; t and y both do rotate_xp).
            // We handle this by only removing if there is more than one binding.
            var oldKeys = Object.keys(cubeActions).filter(function (k) {
                return cubeActions[k] === method;
            });
            if (oldKeys.length >= 1) {
                // Drop all old bindings for this method; the new key replaces them
                oldKeys.forEach(function (k) { delete cubeActions[k]; });
            }
            // Also free the target key from whatever it was previously bound to
            delete cubeActions[key];
            // Apply the new binding
            cubeActions[key] = method;
            saveKeybinds(cubeActions);
        },

        /** Wipe custom bindings and restore defaults. */
        resetKeybinds: function () {
            try { localStorage.removeItem(LS_KEY); } catch (e) { }
            cubeActions = loadKeybinds();
        },
    };

    setTimeout(draw, 50);
})(window, document);
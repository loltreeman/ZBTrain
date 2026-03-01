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

    var cubeActions = {
        h: "rotate_f", g: "rotate_fp", i: "rotate_r", k: "rotate_rp",
        j: "rotate_u", f: "rotate_up", w: "rotate_b", o: "rotate_bp",
        d: "rotate_l", e: "rotate_lp", s: "rotate_d", l: "rotate_dp",
        b: "rotate_x", n: "rotate_x", t: "rotate_xp", y: "rotate_xp",
        a: "rotate_y", ";": "rotate_yp", q: "rotate_z", p: "rotate_zp",
        u: "rotate_R", m: "rotate_Rp", v: "rotate_L", r: "rotate_Lp",
        5: "rotate_m", 6: "rotate_mp", 0: "rotate_s", 1: "rotate_sp",
        2: "rotate_e", 9: "rotate_ep",
    };

    var allowMoves = false;

    document.addEventListener("keydown", function (event) {
        if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
        if (!allowMoves) return;
        var k = event.key;
        if (!k) return;
        if (k.length === 1) k = k.toLowerCase();
        if (!(k in cubeActions)) return;

        if (cube3.isSolving) {
            var isAUF = (k === 'j' || k === 'f');
            if (!window._firstMoveFired && !isAUF) {
                window._firstMoveFired = true;
                document.dispatchEvent(new CustomEvent('cubeFirstMove', { detail: { time: performance.now() } }));
            } else if (!window._firstMoveFired && isAUF) {
                window._aufMoveFired = true;
                document.dispatchEvent(new CustomEvent('cubeAUFMove', { detail: { time: performance.now() } }));
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

    setInterval(function () {
        if (!cube3.isSolving) return;
        if (!window._firstMoveFired && !window._aufMoveFired) return;

        var recallCheckbox = document.getElementById('recallModeCheckbox');
        var inRecallMode = recallCheckbox && recallCheckbox.checked;

        if (inRecallMode && !window._firstMoveFired) return;

        var now = false;
        if (typeof window.recallMaskApplied !== 'undefined' && window.recallMaskApplied) {
            // For recall mode, user must spacebar to confirm finish.
            // But if it's completely solved under the hood, we can auto-trigger
            now = cube3.isSolved();
        } else if (typeof window.useUserDefinedMask !== 'undefined' && window.useUserDefinedMask && window.useUserDefinedMask.checked) {
            // Same for user defined mask
            now = cube3.isSolved();
        } else {
            now = cube3.isSolved();
        }

        if (!prevSolved && now) {
            if (typeof solveCallback === 'function') solveCallback();
            cube3.isSolving = false;
            window._firstMoveFired = false;
            window._aufMoveFired = false;
        }
        prevSolved = now;
    }, 80);

    function resetCube() {
        window.cube3 = new Cube3(colors);
        window.cube3.isSolving = false;
        window._firstMoveFired = false;
        window._aufMoveFired = false;
        window._recallColorSnapshot = undefined;
        prevSolved = false;
        draw();
    }

    function applyScrambleString(scramble) {
        if (!scramble || !scramble.length) return;
        var tokens = scramble.trim().split(/\s+/).filter(Boolean);
        tokens.forEach(function (tok) {
            var base = tok.charAt(0).toUpperCase();
            var isInverse = tok.indexOf("'") !== -1;
            var times = tok.indexOf("2") !== -1 ? 2 : 1;
            var rotationMap = { X: "rotate_x", Y: "rotate_y", Z: "rotate_z" };
            var sliceMap = { M: "rotate_m", E: "rotate_e", S: "rotate_s" };
            var wideMoveMap = { r: "rotate_R", u: "rotate_U", f: "rotate_F", l: "rotate_L", d: "rotate_D", b: "rotate_B" };
            var method;
            var baseOrig = tok.charAt(0);
            if (rotationMap[base]) { method = rotationMap[base]; if (isInverse) method += "p"; }
            else if (sliceMap[base]) { method = sliceMap[base]; if (isInverse) method += "p"; }
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
        var container = canvas.parentElement || document.body;
        var containerWidth = container.clientWidth;
        var cssWidth = Math.min(containerWidth, 400);
        var cssHeight = Math.round(cssWidth * 0.75);
        canvas.style.marginLeft = Math.round((containerWidth - cssWidth) / 2) + "px";
        var ratio = window.devicePixelRatio || 1;
        canvas.width = Math.round(cssWidth * ratio);
        canvas.height = Math.round(cssHeight * ratio);
        canvas.style.width = cssWidth + "px";
        canvas.style.height = cssHeight + "px";
        if (!context) return;
        measureNativeBounds();
        var nb = window.virtualCube._nativeBounds || { w: 180, h: 150, minX: 0, minY: 0 };
        var s = Math.min(cssWidth / nb.w, cssHeight / nb.h) * 0.9;
        if (s <= 0) s = 1;
        var scale = ratio * s;
        var offsetX = (cssWidth - nb.w * s) / 2 - nb.minX * s;
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

    window.virtualCube = {
        applyScramble: applyScrambleString,
        onSolve: function (cb) { solveCallback = cb; },
        isSolved: function () { return cube3.isSolved(); },
        draw: draw,
        enableMoves: function () { allowMoves = true; },
        disableMoves: function () { allowMoves = false; },
        areMovesAllowed: function () { return !!allowMoves; },
        reset: resetCube,
        resize: function () { resizeCanvas(); },
    };

    setTimeout(draw, 50);
})(window, document);
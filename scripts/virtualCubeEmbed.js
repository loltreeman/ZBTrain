// This file is used to embed the virtual cube onto the trainer. 

(function(window, document){
    var T = .9;
    var colors = ["rgba(20,200,20,"+T+")","rgba(255,0,0,"+T+")","rgba(255,255,255,"+T+")","rgba(0,0,255,"+T+")","rgba(255,160,0,"+T+")","rgba(255,255,0,"+T+")"];

    var canvas = document.getElementById('canvas');
    var context = canvas && canvas.getContext ? canvas.getContext('2d') : null;

    window.cube3 = new Cube3(colors);
    window.cube3.isSolving = false;
    var deviceRatio = window.devicePixelRatio || 1;

    function draw() {
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        // drawing assumes original coordinate system; use transform already set in resizeCanvas
        cube3.draw(context, 80, 30);
    }

    var cubeActions = {
        'h': 'rotate_f', 'g': 'rotate_fp',
        'i': 'rotate_r', 'k': 'rotate_rp',
        'j': 'rotate_u', 'f': 'rotate_up',
        'w': 'rotate_b', 'o': 'rotate_bp',
        'd': 'rotate_l', 'e': 'rotate_lp',
        's': 'rotate_d', 'l': 'rotate_dp',

        'b': 'rotate_x', 'n': 'rotate_x', 
        't': 'rotate_xp', 'y': 'rotate_xp',
        'a': 'rotate_y', ';': 'rotate_yp', 
        'q': 'rotate_z', 'p': 'rotate_zp',

        'u': 'rotate_R', 'm': 'rotate_Rp', 
        'v': 'rotate_L', 'r': 'rotate_Lp',

        '5': 'rotate_m', '6': 'rotate_mp', '0': 'rotate_s', '1': 'rotate_sp', '2': 'rotate_e', '9': 'rotate_ep'
    };

    var allowMoves = false; // disable keyboard moves until enabled by trainer
    // Use keydown and event.key for consistent handling (supports digits and letters)
    
    document.addEventListener('keydown', function(event){

        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return; // Don't move the cube if we are typing!
        }

        if (!allowMoves) return;
        var k = event.key;
        if (!k) return;
        if (k.length === 1) k = k.toLowerCase();
        if (!(k in cubeActions)) return;
        var method = cubeActions[k];
        try {
            if (typeof cube3[method] === 'function') cube3[method]();
            cube3.moveCount = (cube3.moveCount || 0) + 1;
            draw();
            event.preventDefault();
        } catch (e) { /* ignore */ }
    });

    // simple solver detection polling
    var prevSolved = cube3.isSolved();
    var solveCallback = null;
    setInterval(function(){
        var now = cube3.isSolved();
        if (!prevSolved && now && cube3.isSolving) {
            if (typeof solveCallback === 'function') {
                // pass a textual time placeholder; trainer will use its own timer
                solveCallback();
            }
            cube3.isSolving = false;
        }
        prevSolved = now;
    }, 80);

    function resetCube() {
        // recreate a fresh solved cube
        window.cube3 = new Cube3(colors);
        window.cube3.isSolving = false;
        // update prevSolved for detection logic
        try { prevSolved = window.cube3.isSolved(); } catch (e) { prevSolved = true; }
        // redraw
        draw();
    }

    function applyScrambleString(scramble) {
        if (!scramble || !scramble.length) return;
        var tokens = scramble.trim().split(/\s+/).filter(Boolean);
        tokens.forEach(function(tok){
            // Support notation like R, R', R2, L, L', L2
            var base = tok.charAt(0).toUpperCase();
            var isInverse = tok.indexOf("'") !== -1;
            var times = tok.indexOf('2') !== -1 ? 2 : 1;
            var method = 'rotate_' + base.toLowerCase();
            if (isInverse) method = method + 'p';
            for (var i=0;i<times;i++) {
                if (typeof cube3[method] === 'function') cube3[method]();
            }
        });
        draw();
        // mark cube as in solving state, but do not enable user moves until trainer starts timing
        cube3.isSolving = true;
    }

    function resizeCanvas() {
        if (!canvas) return;
        var container = canvas.parentElement || document.body;
        
        // Use the container's width, but keep it within reasonable bounds
        var cssWidth = container.clientWidth;
        var cssHeight = container.clientHeight || Math.round(cssWidth * 0.8);

        // Handle High DPI screens (Retina)
        var ratio = window.devicePixelRatio || 1;
        canvas.width = Math.round(cssWidth * ratio);
        canvas.height = Math.round(cssHeight * ratio);

        canvas.style.width = cssWidth + 'px';
        canvas.style.height = cssHeight + 'px';

        if (!context) return;

        // Ensure we have native drawing bounds measured
        if (!window.virtualCube._nativeBounds) measureNativeBounds();
        var nb = window.virtualCube._nativeBounds || {w:180,h:150,minX:0,minY:0};

        // compute a scale that fits the native drawing into the CSS size
        var s = Math.min(cssWidth / nb.w, cssHeight / nb.h) * 0.95;
        if (s <= 0) s = 1;

        // final device pixel scale
        var scale = (window.devicePixelRatio || 1) * s;

        // compute offsets in CSS pixels, shift by native min to align
        var offsetX = (cssWidth - (nb.w * s)) / 2 - (nb.minX * s);
        var offsetY = (cssHeight - (nb.h * s)) / 2 - (nb.minY * s);

        // set the transform so drawing is scaled and centered correctly
        context.setTransform(scale, 0, 0, scale, Math.round(offsetX * (window.devicePixelRatio || 1)), Math.round(offsetY * (window.devicePixelRatio || 1)));

        draw();
    }

    // Measure the native pixel bounds of the cube drawing by rendering to an offscreen canvas
    function measureNativeBounds() {
        try {
            var off = document.createElement('canvas');
            var W = 1000, H = 1000;
            off.width = W; off.height = H;
            var octx = off.getContext('2d');
            octx.clearRect(0,0,W,H);
            // draw at origin
            cube3.draw(octx, 0, 0);
            var data = octx.getImageData(0,0,W,H).data;
            var minX = W, minY = H, maxX = 0, maxY = 0;
            for (var y=0;y<H;y++) {
                for (var x=0;x<W;x++) {
                    var idx = (y*W + x) * 4 + 3; // alpha channel
                    if (data[idx] !== 0) {
                        if (x < minX) minX = x;
                        if (y < minY) minY = y;
                        if (x > maxX) maxX = x;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            if (maxX <= minX || maxY <= minY) {
                // fallback reasonable defaults
                window.virtualCube._nativeBounds = {w:180, h:150, minX:0, minY:0};
            } else {
                var w = maxX - minX + 1;
                var h = maxY - minY + 1;
                // add small padding so stickers don't touch edges
                var pad = 8;
                window.virtualCube._nativeBounds = {w: w + pad*2, h: h + pad*2, minX: minX - pad, minY: minY - pad};
            }
        } catch (e) {
            window.virtualCube._nativeBounds = {w:180, h:150, minX:0, minY:0};
        }
    }

    window.addEventListener('resize', function(){ resizeCanvas(); });

    window.virtualCube = {
        applyScramble: applyScrambleString,
        onSolve: function(cb){ solveCallback = cb; },
        isSolved: function(){ return cube3.isSolved(); },
        draw: draw,
        enableMoves: function(){ allowMoves = true; },
        disableMoves: function(){ allowMoves = false; },
        areMovesAllowed: function(){ return !!allowMoves; }
    };

    // expose reset and resize
    window.virtualCube.reset = resetCube;
    window.virtualCube.resize = function(){ resizeCanvas(); };

    // initial draw
    setTimeout(draw, 50);
})(window, document);

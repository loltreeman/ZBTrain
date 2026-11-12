// Cube views: different ways to draw the same virtual cube.
//
// Every view (except "classic", which uses Cube3.draw) works from a plain
// 54-sticker representation, the same idea as Tao Yu's trainer:
//
//   stickers = { U: [9], L: [9], F: [9], R: [9], B: [9], D: [9] }
//
// Each face is 9 colours in reading order (row by row, left to right) as you
// look straight at that face with U on top (for U: B at the top, for D: F at
// the top):
//
//        0 1 2
//        3 4 5
//        6 7 8
//
// getStickers() builds that from Cube3's 27 cubies, so the drawing code never
// has to know about cubies. If you later switch the cube model to a real
// 54-sticker array, only getStickers() needs to change.

(function (window) {
    // Cubie colour slots in cube.js: 0 front, 1 right, 2 up, 3 back, 4 left, 5 down
    var X = { B: "B", M: "_", F: "F" };   // back → front
    var Y = { L: "L", M: "_", R: "R" };   // left → right
    var Z = { U: "U", M: "_", D: "D" };   // up → down

    function piece(cube, x, y, z) {
        return cube.cubies[x + y + z];
    }

    function getStickers(cube) {
        var s = { U: [], L: [], F: [], R: [], B: [], D: [] };
        var xs = ["B", "_", "F"], ys = ["L", "_", "R"], zs = ["U", "_", "D"];
        var r, c;

        for (r = 0; r < 3; r++) {
            for (c = 0; c < 3; c++) {
                // U: looking down, back row at the top, left → right
                s.U.push(piece(cube, xs[r], ys[c], "U").colors[2]);
                // F: looking at the front, up → down, left → right
                s.F.push(piece(cube, "F", ys[c], zs[r]).colors[0]);
                // R: looking at the right, up → down, front → back
                s.R.push(piece(cube, xs[2 - c], "R", zs[r]).colors[1]);
                // B: looking at the back, up → down, right → left
                s.B.push(piece(cube, "B", ys[2 - c], zs[r]).colors[3]);
                // L: looking at the left, up → down, back → front
                s.L.push(piece(cube, xs[c], "L", zs[r]).colors[4]);
                // D: looking up from below, front row at the top, left → right
                s.D.push(piece(cube, xs[2 - r], ys[c], "D").colors[5]);
            }
        }
        return s;
    }

    // ── Drawing helpers ───────────────────────────────────────────────────

    var BODY = "#141416";      // plastic
    var GAP = 0.07;            // gap between stickers, as a fraction of a sticker
    var RADIUS = 0.12;         // sticker corner rounding, fraction of a sticker

    function lerp(a, b, t) {
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }

    // Point inside a quad: u across (0 = left edge, 1 = right edge),
    // v down (0 = top edge, 1 = bottom edge). Works for any 4-sided shape.
    function bilinear(q, u, v) {
        var top = lerp(q.tl, q.tr, u);
        var bottom = lerp(q.bl, q.br, u);
        return lerp(top, bottom, v);
    }

    function path(ctx, pts) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();
    }

    // Rounded polygon (corners cut with quadratic curves)
    function roundedPath(ctx, pts, r) {
        var n = pts.length;
        ctx.beginPath();
        for (var i = 0; i < n; i++) {
            var p = pts[i], prev = pts[(i + n - 1) % n], next = pts[(i + 1) % n];
            var a = towards(p, prev, r), b = towards(p, next, r);
            if (i === 0) ctx.moveTo(a[0], a[1]); else ctx.lineTo(a[0], a[1]);
            ctx.quadraticCurveTo(p[0], p[1], b[0], b[1]);
        }
        ctx.closePath();
    }

    function towards(from, to, dist) {
        var dx = to[0] - from[0], dy = to[1] - from[1];
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        var d = Math.min(dist, len / 2);
        return [from[0] + dx / len * d, from[1] + dy / len * d];
    }

    // Draw one face: a dark body, then 9 inset stickers.
    // `quad` = the face's four corners as seen on screen, using the face's own
    // orientation (tl = top-left sticker corner, etc.). `shade` darkens it.
    function drawFace(ctx, quad, colors, shade, opts) {
        opts = opts || {};
        path(ctx, [quad.tl, quad.tr, quad.br, quad.bl]);
        ctx.fillStyle = BODY;
        ctx.fill();
        ctx.lineJoin = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = BODY;
        ctx.stroke();

        var stickerPx = Math.hypot(quad.tr[0] - quad.tl[0], quad.tr[1] - quad.tl[1]) / 3;
        for (var r = 0; r < 3; r++) {
            if (opts.rows && opts.rows.indexOf(r) === -1) continue;
            for (var c = 0; c < 3; c++) {
                var u0 = c / 3 + GAP / 3, u1 = (c + 1) / 3 - GAP / 3;
                var v0 = r / 3 + GAP / 3, v1 = (r + 1) / 3 - GAP / 3;
                var pts = [
                    bilinear(quad, u0, v0), bilinear(quad, u1, v0),
                    bilinear(quad, u1, v1), bilinear(quad, u0, v1),
                ];
                roundedPath(ctx, pts, stickerPx * RADIUS);
                ctx.fillStyle = colors[r * 3 + c];
                ctx.fill();
                if (shade) {
                    ctx.fillStyle = "rgba(0,0,0," + shade + ")";
                    ctx.fill();
                }
            }
        }
    }

    // ── Views ─────────────────────────────────────────────────────────────

    // Isometric: corner towards you, U on top, F lower-left, R lower-right.
    // Closest to how you see a cube in your hands (csTimer's "Q2 look").
    function drawIsometric(ctx, s, ox, oy) {
        var S = 60;                         // sticker size
        var cx = Math.cos(Math.PI / 6), sy = Math.sin(Math.PI / 6);
        // 3D point (x → right, y → front, z → up), cube spans 0..3
        function p(x, y, z) {
            return [ox + (x - y) * cx * S, oy + (x + y) * sy * S - z * S];
        }
        drawFace(ctx, { tl: p(0, 0, 3), tr: p(3, 0, 3), bl: p(0, 3, 3), br: p(3, 3, 3) }, s.U, 0);
        drawFace(ctx, { tl: p(0, 3, 3), tr: p(3, 3, 3), bl: p(0, 3, 0), br: p(3, 3, 0) }, s.F, 0.08);
        drawFace(ctx, { tl: p(3, 3, 3), tr: p(3, 0, 3), bl: p(3, 3, 0), br: p(3, 0, 0) }, s.R, 0.22);
    }

    // Top: U face flat, all four sides folded out around it.
    // Shows every last-layer sticker at once (like csTimer's Q cube and
    // solved.no's default case image).
    function drawTop(ctx, s, ox, oy) {
        var W = 180;    // U face size
        var H = 96;     // how far each side flap sticks out (foreshortened)
        var D = 34;     // how much each flap flares outwards
        function pt(x, y) { return [ox + x, oy + y]; }

        // Side flaps first, so the U face sits on top of their inner edges
        drawFace(ctx, { tl: pt(0, W), tr: pt(W, W), bl: pt(-D, W + H), br: pt(W + D, W + H) }, s.F, 0.08);
        drawFace(ctx, { tl: pt(W, W), tr: pt(W, 0), bl: pt(W + H, W + D), br: pt(W + H, -D) }, s.R, 0.16);
        drawFace(ctx, { tl: pt(W, 0), tr: pt(0, 0), bl: pt(W + D, -H), br: pt(-D, -H) }, s.B, 0.16);
        drawFace(ctx, { tl: pt(0, 0), tr: pt(0, W), bl: pt(-H, -D), br: pt(-H, W + D) }, s.L, 0.16);
        drawFace(ctx, { tl: pt(0, 0), tr: pt(W, 0), bl: pt(0, W), br: pt(W, W) }, s.U, 0);
    }

    // Net: the classic unfolded cross. Handy for checking the 54-sticker state.
    function drawNet(ctx, s, ox, oy) {
        var F = 120, G = 8, step = F + G;
        function face(col, row, colors) {
            var x = ox + col * step, y = oy + row * step;
            drawFace(ctx, { tl: [x, y], tr: [x + F, y], bl: [x, y + F], br: [x + F, y + F] }, colors, 0);
        }
        face(1, 0, s.U);
        face(0, 1, s.L); face(1, 1, s.F); face(2, 1, s.R); face(3, 1, s.B);
        face(1, 2, s.D);
    }

    // ── Flat "q" views (layouts inspired by csTimer's qCube / qLast / q2Look) ──
    // Written from scratch for ZBTrain. Everything is in sticker units:
    // a cell {x, y, w, h, c} is a sticker at (x, y) of size w × h with colour c.

    var QS = 60;      // pixels per sticker
    var QG = 0.18;    // gap between blocks, in stickers
    var QINSET = 0.06;

    function drawCells(ctx, cells, ox, oy) {
        var i, cell, x, y, w, h;
        // Dark body under every sticker; neighbouring cells merge into one block
        ctx.fillStyle = BODY;
        for (i = 0; i < cells.length; i++) {
            cell = cells[i];
            ctx.fillRect(ox + cell.x * QS, oy + cell.y * QS, cell.w * QS, cell.h * QS);
        }
        for (i = 0; i < cells.length; i++) {
            cell = cells[i];
            x = ox + (cell.x + QINSET) * QS;
            y = oy + (cell.y + QINSET) * QS;
            w = (cell.w - QINSET * 2) * QS;
            h = (cell.h - QINSET * 2) * QS;
            roundedPath(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], QS * RADIUS);
            ctx.fillStyle = cell.c;
            ctx.fill();
        }
    }

    function cell(x, y, c, w, h) {
        return { x: x, y: y, w: w || 1, h: h || 1, c: c };
    }

    // U face (3×3) and some rows of F (below it) at a given position
    function addFace(cells, colors, x, y, rows) {
        for (var r = 0; r < rows; r++)
            for (var c = 0; c < 3; c++) cells.push(cell(x + c, y + r, colors[r * 3 + c]));
    }

    // qCube: U with F below, and L / R strips that show each side's top row
    // next to U and its front column next to F. The corner sticker stretches
    // across the seam, like looking at the cube from above the front edge.
    function drawQCube(ctx, s, ox, oy) {
        var cells = [], g = QG;
        var left = 0, mid = 1 + g, right = 4 + 2 * g, fTop = 3 + g;
        addFace(cells, s.U, mid, 0, 3);
        addFace(cells, s.F, mid, fTop, 3);
        // L strip (back → front, then down the front column)
        cells.push(cell(left, 0, s.L[0]), cell(left, 1, s.L[1]), cell(left, 2, s.L[2], 1, 2 + g),
                   cell(left, fTop + 1, s.L[5]), cell(left, fTop + 2, s.L[8]));
        // R strip
        cells.push(cell(right, 0, s.R[2]), cell(right, 1, s.R[1]), cell(right, 2, s.R[0], 1, 2 + g),
                   cell(right, fTop + 1, s.R[3]), cell(right, fTop + 2, s.R[6]));
        drawCells(ctx, cells, ox, oy);
    }

    // qLast: U with the top row of every side around it — all last-layer
    // stickers — plus the top two rows of F.
    function drawQLast(ctx, s, ox, oy) {
        var cells = [], g = QG;
        var uX = 1 + g, uY = 1 + g;
        for (var i = 0; i < 3; i++) {
            cells.push(cell(uX + i, 0, s.B[2 - i]));        // B, seen from above
            cells.push(cell(0, uY + i, s.L[i]));            // L, back → front
            cells.push(cell(uX + 3 + g, uY + i, s.R[2 - i])); // R, back → front
        }
        addFace(cells, s.U, uX, uY, 3);
        addFace(cells, s.F, uX, uY + 3 + g, 2);
        drawCells(ctx, cells, ox, oy);
    }

    // q2Look: only what you see holding the cube — U, R's top row, F's top rows.
    function drawQ2Look(ctx, s, ox, oy) {
        var cells = [], g = QG;
        for (var i = 0; i < 3; i++) cells.push(cell(3 + g, i, s.R[2 - i]));
        addFace(cells, s.U, 0, 0, 3);
        addFace(cells, s.F, 0, 3 + g, 2);
        drawCells(ctx, cells, ox, oy);
    }

    var VIEWS = {
        classic: { label: "Classic 3D", draw: function (ctx, cube, ox, oy) { cube.draw(ctx, ox, oy); } },
        iso:     { label: "Isometric",  draw: function (ctx, cube, ox, oy) { drawIsometric(ctx, getStickers(cube), ox, oy); } },
        top:     { label: "Top (4 sides)", draw: function (ctx, cube, ox, oy) { drawTop(ctx, getStickers(cube), ox, oy); } },
        net:     { label: "Net",        draw: function (ctx, cube, ox, oy) { drawNet(ctx, getStickers(cube), ox, oy); } },
        qcube:   { label: "qCube",      draw: function (ctx, cube, ox, oy) { drawQCube(ctx, getStickers(cube), ox, oy); } },
        qlast:   { label: "qLast",      draw: function (ctx, cube, ox, oy) { drawQLast(ctx, getStickers(cube), ox, oy); } },
        q2look:  { label: "q2Look",     draw: function (ctx, cube, ox, oy) { drawQ2Look(ctx, getStickers(cube), ox, oy); } },
    };

    // Find the drawn area of a view by rendering it off-screen and scanning
    // for non-transparent pixels. Returns {minX, minY, w, h} in drawing units.
    var MEASURE_ORIGIN = 300, MEASURE_SIZE = 1000;
    function measure(name, cube) {
        var off = document.createElement("canvas");
        off.width = off.height = MEASURE_SIZE;
        var octx = off.getContext("2d");
        (VIEWS[name] || VIEWS.classic).draw(octx, cube, MEASURE_ORIGIN, MEASURE_ORIGIN);
        var data = octx.getImageData(0, 0, MEASURE_SIZE, MEASURE_SIZE).data;
        var minX = MEASURE_SIZE, minY = MEASURE_SIZE, maxX = 0, maxY = 0;
        for (var y = 0; y < MEASURE_SIZE; y++) {
            for (var x = 0; x < MEASURE_SIZE; x++) {
                if (data[(y * MEASURE_SIZE + x) * 4 + 3] !== 0) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        if (maxX <= minX) return { minX: 0, minY: 0, w: 1, h: 1 };
        return { minX: minX - 4, minY: minY - 4, w: maxX - minX + 9, h: maxY - minY + 9 };
    }

    // Draw a cube state into any canvas, scaled to fit and centred.
    // Used for the case image. cssSize = displayed size in CSS pixels.
    function renderTo(canvas, name, cube, cssSize, fill) {
        var ratio = window.devicePixelRatio || 1;
        canvas.width = Math.round(cssSize * ratio);
        canvas.height = Math.round(cssSize * ratio);
        canvas.style.width = canvas.style.height = cssSize + "px";
        var ctx = canvas.getContext("2d");
        var b = measure(name, cube);
        var s = Math.min(cssSize / b.w, cssSize / b.h) * (fill || 0.94);
        var offX = (cssSize - b.w * s) / 2 - b.minX * s;
        var offY = (cssSize - b.h * s) / 2 - b.minY * s;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(s * ratio, 0, 0, s * ratio, offX * ratio, offY * ratio);
        (VIEWS[name] || VIEWS.classic).draw(ctx, cube, MEASURE_ORIGIN, MEASURE_ORIGIN);
    }

    window.CubeViews = {
        getStickers: getStickers,
        names: Object.keys(VIEWS),
        has: function (name) { return !!VIEWS[name]; },
        label: function (name) { return VIEWS[name] ? VIEWS[name].label : name; },
        draw: function (name, ctx, cube, ox, oy) {
            (VIEWS[name] || VIEWS.classic).draw(ctx, cube, ox, oy);
        },
        measure: measure,
        renderTo: renderTo,
    };
})(window);

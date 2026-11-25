// Cube pictures for the guide (guide/*.html), drawn from ZBTrain's own case
// pictures (svg/top/*.svg) so they always match the trainer.
//
//   <div class="cube-fig" data-case="U-Diag-AsO" data-view="2d|3d"
//        data-show="all|shape|corners|bh|ncp|twisty|U,F1,F2,R0,R1"></div>
//   <div class="cube-fig" data-bh="CsC"></div>       one of the 12 BH patterns
//   <div class="cube-fig" data-bh="CsC" data-twist="cw"></div>
//   <div class="cube-fig" data-case="H-2GLL-AsC" data-u2></div>  seen after a U2
//   data-show="fb": only the front and back sides (H recognition)
//
// Sticker names: U0–U8 (top face, back-left to front-right), and the top
// row of each side: F0–F2 (left to right), R0–R2 (front to back),
// B0–B2 (right to left as seen from the back), L0–L2 (back to front).
// Stickers not shown are drawn grey.

(function () {
    var GREY = "#8c8c8c";
    var DARK = "#1b1b1e";
    var YELLOW = "#FEFE00";
    var GREEN = "#00D800", BLUE = "#0000F2", RED = "#EE0000", ORANGE = "#FFA100";
    var OPP = {};
    OPP[GREEN] = BLUE; OPP[BLUE] = GREEN; OPP[RED] = ORANGE; OPP[ORANGE] = RED;

    // Which stickers each recognition view keeps
    var SHOW = {
        corners: ["U0", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "F0", "F2", "R0", "R2", "B0", "B2", "L0", "L2"],
        bh: ["U0", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "F1", "F2", "R0", "R1"],
        ncp: ["U0", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "F0", "F1", "F2", "R0", "R1", "L1", "L2"],
        twisty: ["U0", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "F0", "F1", "F2", "R0", "R1", "R2"],
        // H: the two sides without yellow (front and back in the trainer's pictures)
        fb: ["U0", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "F0", "F1", "F2", "B0", "B1", "B2"],
    };

    // The same case after a U2: the top layer turns 180°, colours stay
    function afterU2(s) {
        var o = {};
        for (var i = 0; i < 9; i++) o["U" + i] = s["U" + (8 - i)];
        for (var k = 0; k < 3; k++) {
            o["F" + k] = s["B" + k];
            o["B" + k] = s["F" + k];
            o["L" + k] = s["R" + k];
            o["R" + k] = s["L" + k];
        }
        return o;
    }

    // ── Case data from the trainer's own pictures ───────────────────────
    var cache = {};

    function loadCase(key, base) {
        if (!cache[key]) {
            cache[key] = fetch(base + "svg/top/" + key + ".svg").then(function (r) {
                if (!r.ok) throw new Error("No picture for " + key);
                return r.text();
            }).then(parseCase);
        }
        return cache[key];
    }

    function parseCase(svgText) {
        var polys = [];
        var re = /<polygon fill='(#[0-9A-Fa-f]+)'[^>]*points='([^']+)'/g, m;
        while ((m = re.exec(svgText))) {
            var pts = m[2].trim().split(/\s+/).map(function (p) { return p.split(",").map(Number); });
            var cx = 0, cy = 0;
            pts.forEach(function (p) { cx += p[0]; cy += p[1]; });
            polys.push({ fill: m[1].toUpperCase(), cx: cx / pts.length, cy: cy / pts.length });
        }
        var top = polys.filter(function (p) { return Math.abs(p.cx) < 0.55 && Math.abs(p.cy) < 0.55 && p.fill !== "#000000"; })
            .sort(function (a, b) { return Math.round((a.cy - b.cy) * 10) || a.cx - b.cx; });
        var front = polys.filter(function (p) { return p.cy > 0.6; }).sort(function (a, b) { return a.cx - b.cx; });
        var right = polys.filter(function (p) { return p.cx > 0.6; }).sort(function (a, b) { return b.cy - a.cy; });
        var back = polys.filter(function (p) { return p.cy < -0.6; }).sort(function (a, b) { return b.cx - a.cx; });
        var left = polys.filter(function (p) { return p.cx < -0.6; }).sort(function (a, b) { return a.cy - b.cy; });
        var s = {};
        top.forEach(function (p, i) { s["U" + i] = p.fill; });
        [["F", front], ["R", right], ["B", back], ["L", left]].forEach(function (side) {
            side[1].forEach(function (p, i) { s[side[0] + i] = p.fill; });
        });
        return s;
    }

    // The 12 BH patterns around the front-right corner, by ZBTrain's edge
    // names. The corner shows c1 on the front and c2 on the right; the
    // letters compare the edges with it (see the case names page).
    function bhStickers(name, twist) {
        var c1 = GREEN, c2 = RED;
        var pairs = {
            CsC: [c1, c2], CsA: [c1, OPP[c1]], CsO: [c1, OPP[c2]],
            AsC: [OPP[c2], c2], AsA: [c2, c1], AsO: [c2, OPP[c2]],
            OsC: [OPP[c1], c2], OsA: [OPP[c1], c1], OsO: [OPP[c1], OPP[c2]],
            CxO: [c2, OPP[c1]], OxC: [OPP[c2], c1], OxO: [OPP[c2], OPP[c1]],
        };
        var e = pairs[name] || pairs.CsC;
        var s = {};
        for (var i = 0; i < 9; i++) s["U" + i] = YELLOW;
        // corner stickers: up, front, right (twisted corners move the yellow)
        var corner = { up: YELLOW, front: c1, right: c2 };
        if (twist === "cw") corner = { up: c2, front: YELLOW, right: c1 };
        if (twist === "ccw") corner = { up: c1, front: c2, right: YELLOW };
        s.U8 = corner.up;
        s.F2 = corner.front;
        s.R0 = corner.right;
        s.F1 = e[0];
        s.R1 = e[1];
        return s;
    }

    // ── Drawing ─────────────────────────────────────────────────────────

    function poly(points, fill) {
        return '<polygon points="' + points.map(function (p) { return p[0].toFixed(2) + "," + p[1].toFixed(2); }).join(" ") +
            '" fill="' + fill + '" stroke="' + DARK + '" stroke-width="2.2" stroke-linejoin="round"/>';
    }

    function colorOf(stickers, id, show) {
        if (show && show.indexOf(id) < 0) return GREY;
        return stickers[id] || GREY;
    }

    // Top view with the side stickers around it (like the trainer's pictures)
    function draw2D(st, show) {
        var size = 160, cell = 28, gap = 3, pad = 22;
        var o = (size - cell * 3 - gap * 2) / 2;
        var out = '<svg viewBox="0 0 ' + size + " " + size + '" role="img">';
        out += '<rect x="' + (o - 4) + '" y="' + (o - 4) + '" width="' + (cell * 3 + gap * 2 + 8) + '" height="' + (cell * 3 + gap * 2 + 8) + '" rx="6" fill="' + DARK + '"/>';
        for (var i = 0; i < 9; i++) {
            var x = o + (i % 3) * (cell + gap), y = o + Math.floor(i / 3) * (cell + gap);
            out += '<rect x="' + x + '" y="' + y + '" width="' + cell + '" height="' + cell + '" rx="3" fill="' + colorOf(st, "U" + i, show) + '"/>';
        }
        var t = 10; // side sticker thickness
        function side(id, x, y, w, h) {
            out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="' + colorOf(st, id, show) + '" stroke="' + DARK + '" stroke-width="1.5"/>';
        }
        for (var k = 0; k < 3; k++) {
            var along = o + k * (cell + gap);
            side("F" + k, along, o + cell * 3 + gap * 2 + 6, cell, t);                 // front: left → right
            side("B" + k, o + (2 - k) * (cell + gap), o - 6 - t, cell, t);            // back: right → left
            side("R" + k, o + cell * 3 + gap * 2 + 6, o + (2 - k) * (cell + gap), t, cell); // right: front → back
            side("L" + k, o - 6 - t, along, t, cell);                                  // left: back → front
        }
        return out + "</svg>";
    }

    // Front-right-top 3D view: top face, and the front and right faces with
    // only their top row in colour
    function draw3D(st, show) {
        var s = 30;
        var cos = Math.cos(Math.PI / 6), sin = Math.sin(Math.PI / 6);
        // The cube spans y = 10 (back top corner) to 190 (front bottom corner)
        function P(x, y, z) { return [100 + (x - z) * cos * s, 145 - y * s + (x + z) * sin * s - 3 * sin * s]; }
        var out = '<svg viewBox="0 0 200 200" role="img">';
        // top face (y = 3): column c = x, row r = z (back → front)
        for (var i = 0; i < 9; i++) {
            var c = i % 3, r = Math.floor(i / 3);
            out += poly([P(c, 3, r), P(c + 1, 3, r), P(c + 1, 3, r + 1), P(c, 3, r + 1)], colorOf(st, "U" + i, show));
        }
        // front face (z = 3)
        for (var row = 0; row < 3; row++) for (var col = 0; col < 3; col++) {
            var fill = row === 0 ? colorOf(st, "F" + col, show) : GREY;
            out += poly([P(col, 3 - row, 3), P(col + 1, 3 - row, 3), P(col + 1, 2 - row, 3), P(col, 2 - row, 3)], fill);
        }
        // right face (x = 3): left to right on screen is front to back
        for (row = 0; row < 3; row++) for (col = 0; col < 3; col++) {
            fill = row === 0 ? colorOf(st, "R" + col, show) : GREY;
            var z0 = 3 - col;
            out += poly([P(3, 3 - row, z0), P(3, 3 - row, z0 - 1), P(3, 2 - row, z0 - 1), P(3, 2 - row, z0)], fill);
        }
        return out + "</svg>";
    }

    function render(el, base) {
        var view = el.dataset.view || (el.dataset.bh ? "3d" : "2d");
        var show = el.dataset.show;
        var list = !show || show === "all" ? null : SHOW[show] || show.split(",");
        var label = el.getAttribute("aria-label") || el.dataset.case || (el.dataset.bh ? "BH pattern " + el.dataset.bh : "Cube");
        function paint(st) {
            if (el.dataset.u2 != null) st = afterU2(st);
            // The OCLL shape: just where the yellow stickers are
            if (show === "shape") {
                list = Object.keys(st).filter(function (id) { return st[id] === YELLOW; });
            }
            el.innerHTML = view === "3d" ? draw3D(st, list) : draw2D(st, list);
            var svg = el.querySelector("svg");
            svg.setAttribute("aria-label", label);
        }
        if (el.dataset.bh) paint(bhStickers(el.dataset.bh, el.dataset.twist));
        else if (el.dataset.case) loadCase(el.dataset.case, base).then(paint).catch(function () { el.textContent = ""; });
    }

    // Pages live in guide/, so the trainer's pictures are one folder up
    var base = /\/guide\//.test(location.pathname) ? "../" : "";
    document.querySelectorAll(".cube-fig").forEach(function (el) { render(el, base); });

    // Also used by the BH trainer (bh.html)
    window.GuideFigures = {
        SHOW: SHOW,
        COLOURS: { grey: GREY, yellow: YELLOW, green: GREEN, blue: BLUE, red: RED, orange: ORANGE },
        parseCase: parseCase,
        loadCase: function (key) { return loadCase(key, base); },
        bhStickers: bhStickers,
        draw2D: draw2D,
        draw3D: draw3D,
    };
})();

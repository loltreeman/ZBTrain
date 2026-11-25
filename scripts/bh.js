// BH recognition trainer (bh.html).
//
// Shows only the BH stickers (the top face, the front-right corner and the
// front and right edges, GuideFigures.SHOW.bh) so you recognise a ZBLL from
// its BH pattern instead of blocks.
//
//   Name:       a random BH pattern; name it (the 12 names are editable).
//   Case:       one case of a subset, at the case picture's angle, your
//               standard angle or any angle; pick which case it is.
//   Story:      a whole ZBLL; name the pattern at each corner, anticlockwise
//               from front-right.
//   By pattern: pick any of the 36 front-right patterns (12 patterns × 3
//               corner twists) as presets; get every ZBLL at every angle
//               that shows one of them, and recognise it from two sides.
//
// Case, Story and By pattern can be solved on the virtual cube or a smart cube.
// Patterns are worked out from the stickers (classify), so a case's picture,
// the cube and the answer always agree.

(function () {
    "use strict";

    var GF = window.GuideFigures;
    var COL = GF.COLOURS;
    var Y = COL.yellow, WHITE = "#FFFFFF";
    // Side colours in order round a yellow-top cube (front, right, back, left)
    var CYCLE = [COL.green, COL.orange, COL.blue, COL.red];
    var OPP = {};
    OPP[COL.green] = COL.blue; OPP[COL.blue] = COL.green; OPP[COL.red] = COL.orange; OPP[COL.orange] = COL.red;

    var PATTERNS = ["CsC", "CsA", "CsO", "AsC", "AsA", "AsO", "OsC", "OsA", "OsO", "CxO", "OxC", "OxO"];
    // How the front-right corner sits: oriented, yellow on the front, yellow on the right
    var TWISTS = ["", "cw", "ccw"];
    var TWIST_LABEL = { "": "Corner oriented", cw: "Yellow on the front", ccw: "Yellow on the right" };
    var SUB_ORDER = ["2GLL", "3", "4", "5", "6", "Diag"];
    var SIDES = ["F", "R", "B", "L"];
    var AUF = ["", "U", "U2", "U'"];
    var MODES = ["name", "case", "story", "pattern"];

    // ── Saved state ─────────────────────────────────────────────────────

    function load(key, fallback) {
        try {
            var v = JSON.parse(localStorage.getItem(key));
            return v && typeof v === "object" ? v : fallback;
        } catch (e) { return fallback; }
    }
    function save(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }

    var names = load("bhNames", {});
    var settings = load("bhSettings", {});
    var defaults = {
        mode: "name", view: "3d", twist: false, set: "T", sub: "2GLL", answers: "pictures",
        angle: "picture", cube: false, hideCube: true,
        // By pattern
        pSel: PATTERNS.map(function (p) { return p + ":"; }), pSets: null, pAngles: "all", pView: "two",
    };
    Object.keys(defaults).forEach(function (k) { if (settings[k] === undefined) settings[k] = defaults[k]; });
    if (MODES.indexOf(settings.mode) < 0) settings.mode = "name";
    if (!Array.isArray(settings.pSel)) settings.pSel = defaults.pSel;
    if (!Array.isArray(settings.pSets)) settings.pSets = Object.keys(zbllAlgs);
    var stats = load("bhStats", {});
    if (!stats.byPattern || typeof stats.byPattern !== "object") stats.byPattern = {};

    function saveSettings() { save("bhSettings", settings); }
    function nameOf(p) { return names[p] || p; }
    function twistText(t) { return t === "cw" ? "yellow on the front" : t === "ccw" ? "yellow on the right" : ""; }
    function patternText(bh) { return bh ? nameOf(bh.name) + (bh.twist ? " (" + twistText(bh.twist) + ")" : "") : "?"; }
    function patternId(bh) { return bh ? bh.name + ":" + bh.twist : "?"; }

    // ── Patterns ────────────────────────────────────────────────────────

    // Edge colours (front edge, right edge) for each pattern, when the
    // corner shows c1 on the front and c2 on the right (as in guideFigures.js)
    function edgePairs(c1, c2) {
        return {
            CsC: [c1, c2], CsA: [c1, OPP[c1]], CsO: [c1, OPP[c2]],
            AsC: [OPP[c2], c2], AsA: [c2, c1], AsO: [c2, OPP[c2]],
            OsC: [OPP[c1], c2], OsA: [OPP[c1], c1], OsO: [OPP[c1], OPP[c2]],
            CxO: [c2, OPP[c1]], OxC: [OPP[c2], c1], OxO: [OPP[c2], OPP[c1]],
        };
    }

    // The pattern at the front-right corner of a sticker map. A twisted
    // corner keeps its colours in the same order round it (up → front →
    // right), so the colour after yellow plays the front sticker.
    // twist: "" oriented, "cw" yellow on the front, "ccw" yellow on the right.
    function classify(s) {
        var cyc = [s.U8, s.F2, s.R0];
        var yi = cyc.indexOf(Y);
        if (yi < 0) return null;
        var pairs = edgePairs(cyc[(yi + 1) % 3], cyc[(yi + 2) % 3]);
        for (var p in pairs) {
            if (pairs[p][0] === s.F1 && pairs[p][1] === s.R1) return { name: p, twist: TWISTS[yi] };
        }
        return null;
    }

    // A pattern drawn on a yellow-top cube; side = which colour is in front
    function patternStickers(p, twist, side) {
        var c1 = CYCLE[side % 4], c2 = CYCLE[(side + 1) % 4];
        var e = edgePairs(c1, c2)[p];
        var s = {};
        for (var i = 0; i < 9; i++) s["U" + i] = Y;
        var corner = [Y, c1, c2];                      // up, front, right
        if (twist === "cw") corner = [c2, Y, c1];
        if (twist === "ccw") corner = [c1, c2, Y];
        s.U8 = corner[0]; s.F2 = corner[1]; s.R0 = corner[2];
        s.F1 = e[0]; s.R1 = e[1];
        return s;
    }

    // The same stickers after a U: the corner from back-right comes to front-right
    function turnU(s) {
        var o = {};
        for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) o["U" + (r * 3 + c)] = s["U" + ((2 - c) * 3 + r)];
        for (var k = 0; k < 3; k++) {
            o["F" + k] = s["R" + k]; o["R" + k] = s["B" + k];
            o["B" + k] = s["L" + k]; o["L" + k] = s["F" + k];
        }
        return o;
    }
    function turned(s, k) {
        for (var i = 0; i < k; i++) s = turnU(s);
        return s;
    }

    // What you see with only the BH stickers: the pattern and where yellow is on top
    function sigOf(st) {
        var top = "";
        for (var i = 0; i < 9; i++) top += st["U" + i] === Y ? "Y" : ".";
        return patternId(classify(st)) + "|" + top;
    }

    // ── Standard angles ─────────────────────────────────────────────────
    // Where yellow is on the front-right and front-left corners: "U", or the side it faces
    function cornerAt(st, ids) {
        if (st[ids[0]] === Y) return "U";
        if (st[ids[1]] === Y) return "F";
        if (st[ids[2]] === Y) return ids[2].charAt(0);
        return "?";
    }
    function fr(st) { return cornerAt(st, ["U8", "F2", "R0"]); }
    function fl(st) { return cornerAt(st, ["U6", "F0", "L2"]); }

    // T, U: oriented corners in front. L: oriented corner front-right, the
    // front-left corner's yellow facing you. Sune, Antisune: the oriented
    // corner front-right. H, Pi: "chameleon eyes", the front corners' yellow
    // facing left and right.
    var STANDARD = {
        T: function (s) { return fr(s) === "U" && fl(s) === "U"; },
        U: function (s) { return fr(s) === "U" && fl(s) === "U"; },
        L: function (s) { return fr(s) === "U" && fl(s) === "F"; },
        Sune: function (s) { return fr(s) === "U"; },
        Antisune: function (s) { return fr(s) === "U"; },
        H: function (s) { return fr(s) === "R" && fl(s) === "L"; },
        Pi: function (s) { return fr(s) === "R" && fl(s) === "L"; },
    };
    var STANDARD_TEXT = {
        T: "oriented corners in front", U: "oriented corners in front",
        L: "oriented corner front-right, the other front corner's yellow facing you",
        Sune: "oriented corner front-right", Antisune: "oriented corner front-right",
        H: "front corners' yellow facing left and right", Pi: "front corners' yellow facing left and right",
    };

    // U turns (0–3) from the case picture to your standard angle(s)
    function standardAngles(set, st) {
        var rule = STANDARD[set], out = [];
        for (var k = 0; k < 4; k++) if (rule && rule(turned(st, k))) out.push(k);
        return out.length ? out : [0];
    }

    function draw(st, show) {
        return settings.view === "2d" ? GF.draw2D(st, show) : GF.draw3D(st, show);
    }

    // The BH stickers of a last layer. On top, only where yellow is (plus
    // the BH corner): a twisted corner's top colour isn't part of BH.
    function bhShow(st) {
        return GF.SHOW.bh.filter(function (id) { return id.charAt(0) !== "U" || id === "U8" || st[id] === Y; });
    }

    // ── Cubes ───────────────────────────────────────────────────────────

    // Nearest guide colour for a colour the virtual cube uses
    var PALETTE = [COL.green, COL.red, COL.blue, COL.orange, Y, WHITE];
    var paletteCache = {};
    function rgbOf(c) {
        var m = /rgba?\(([^)]+)\)/.exec(c);
        if (m) return m[1].split(",").slice(0, 3).map(Number);
        var h = String(c).replace("#", "");
        if (h.length === 3) h = h.replace(/./g, "$&$&");
        return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
    }
    function toPalette(c) {
        if (paletteCache[c]) return paletteCache[c];
        var a = rgbOf(c), best = COL.grey, bestD = Infinity;
        PALETTE.forEach(function (p) {
            var b = rgbOf(p);
            var d = (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2]);
            if (d < bestD) { bestD = d; best = p; }
        });
        return (paletteCache[c] = best);
    }

    // A cube's last layer as a sticker map (U0–U8 and the sides' top rows)
    function cubeStickers(cube) {
        var s = CubeViews.getStickers(cube), o = {};
        s.U.forEach(function (c, i) { o["U" + i] = toPalette(c); });
        SIDES.forEach(function (f) { for (var k = 0; k < 3; k++) o[f + k] = toPalette(s[f][k]); });
        return o;
    }

    // Each sticker by the side whose centre it matches, to compare a cube with a picture
    function cubeLook(cube) {
        var s = CubeViews.getStickers(cube);
        var centre = { U: s.U[4], F: s.F[4], R: s.R[4], B: s.B[4], L: s.L[4] };
        var lab = function (col) { for (var f in centre) if (centre[f] === col) return f; return "?"; };
        return s.U.map(lab).join("") + "|" + SIDES.map(function (f) { return s[f].slice(0, 3).map(lab).join(""); }).join("|");
    }

    // Every way a picture's colours can sit on the cube (which side is in front doesn't matter)
    function pictureLooks(st) {
        var looks = {};
        for (var shift = 0; shift < 4; shift++) {
            var face = {};
            face[Y] = "U";
            CYCLE.forEach(function (col, i) { face[col] = SIDES[(i + shift) % 4]; });
            var lab = function (id) { return face[st[id]] || "?"; };
            var u = [], sides = [];
            for (var i = 0; i < 9; i++) u.push(lab("U" + i));
            SIDES.forEach(function (f) { sides.push(lab(f + 0) + lab(f + 1) + lab(f + 2)); });
            looks[u.join("") + "|" + sides.join("|")] = true;
        }
        return looks;
    }

    // Rotation that puts yellow on top and green in front on the virtual cube
    var baseRotation = null;
    function yellowTop() {
        if (baseRotation != null) return baseRotation;
        baseRotation = "";
        ["", "z2", "x2", "x", "x'", "z", "z'"].some(function (r) {
            var s = CubeViews.getStickers(virtualCube.makeCube(r));
            if (toPalette(s.U[4]) !== Y) return false;
            return ["", "y", "y2", "y'"].some(function (yr) {
                var rot = (r + " " + yr).trim();
                var t = CubeViews.getStickers(virtualCube.makeCube(rot));
                if (toPalette(t.F[4]) === COL.green) { baseRotation = rot; return true; }
                return false;
            });
        });
        return baseRotation;
    }

    function invert(alg) {
        return alg.replace(/[()]/g, " ").trim().split(/\s+/).filter(Boolean).reverse().map(function (t) {
            return /2'?$/.test(t) ? t.replace("'", "") : /'$/.test(t) ? t.slice(0, -1) : t + "'";
        }).join(" ");
    }

    // A setup for the case that looks like its picture turned by `turns` U
    // turns, starting from a random side colour in front.
    // Returns { setup, scramble, cube } or null. `scramble` has no rotations
    // (as the trainer shows it).
    function setupFor(info, turns) {
        var looks = pictureLooks(info.stickers);
        var y = ["", "y", "y2", "y'"][Math.floor(Math.random() * 4)];
        var prefix = (yellowTop() + " " + y).trim();
        var scr = (((window.zbllScrambles || {})[info.set] || {})[info.sub] || {})[info.name] || [];
        var list = shuffle(scr.slice());
        var algs = ((zbllAlgs[info.set] || {})[info.sub] || {})[info.name] || [];
        algs.forEach(function (a) { list.push(invert(a)); });
        for (var i = 0; i < list.length; i++) {
            for (var t = 0; t < 4; t++) {
                try {
                    if (!looks[cubeLook(virtualCube.makeCube((prefix + " " + list[i] + " " + AUF[t]).trim()))]) continue;
                } catch (e) { continue; }
                var scramble = (list[i] + " " + AUF[(t + (turns || 0)) % 4]).trim();
                var setup = (prefix + " " + scramble).trim();
                return { setup: setup, scramble: scramble, cube: virtualCube.makeCube(setup) };
            }
        }
        return null;
    }

    // Your main alg for a case (as set in the trainer), else the first one
    function mainAlg(info) {
        var key = info.set + "-" + info.sub + "-" + info.name;
        var algs = ((zbllAlgs[info.set] || {})[info.sub] || {})[info.name] || [];
        try {
            var own = JSON.parse(localStorage.getItem("customAlgs") || "{}")[key];
            if (Array.isArray(own) && own.length) algs = own;
            var i = parseInt(localStorage.getItem("mainAlg:" + key), 10);
            if (i >= 0 && i < algs.length) return algs[i];
        } catch (e) {}
        return algs[0] || "";
    }
    function algFor(info, setup) {
        var alg = mainAlg(info);
        if (!alg || !window.AlgAuf || !setup) return alg;
        try {
            var a = AlgAuf.adjust(setup, alg);
            return a && a.ok ? AlgAuf.toText(a) : alg;
        } catch (e) { return alg; }
    }

    function shuffle(a) {
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

    // ── Cases ───────────────────────────────────────────────────────────

    var subsetCache = {};

    function subsetsOf(set) {
        var subs = Object.keys(zbllAlgs[set] || {});
        return SUB_ORDER.filter(function (s) { return subs.indexOf(s) >= 0; })
            .concat(subs.filter(function (s) { return SUB_ORDER.indexOf(s) < 0; }));
    }

    // Each case of a subset with its picture's stickers, and for each of the
    // 4 angles (U turns from the picture) its BH pattern and signature
    function loadSubset(set, sub) {
        var key = set + "-" + sub;
        if (!subsetCache[key]) {
            var cases = Object.keys(zbllAlgs[set][sub]);
            subsetCache[key] = Promise.all(cases.map(function (name) {
                var k = set + "-" + sub + "-" + name;
                return GF.loadCase(k).then(function (st) {
                    var bh = [], sigs = [];
                    for (var t = 0; t < 4; t++) {
                        var s = turned(st, t);
                        bh.push(classify(s));
                        sigs.push(sigOf(s));
                    }
                    return { set: set, sub: sub, name: name, key: k, stickers: st, bh: bh, sigs: sigs, standard: standardAngles(set, st) };
                }).catch(function () { return null; });
            })).then(function (list) { return list.filter(Boolean); });
        }
        return subsetCache[key];
    }

    var allCases = null;
    function loadAll() {
        if (!allCases) {
            var jobs = [];
            Object.keys(zbllAlgs).forEach(function (set) {
                subsetsOf(set).forEach(function (sub) { jobs.push(loadSubset(set, sub)); });
            });
            allCases = Promise.all(jobs).then(function (lists) { return [].concat.apply([], lists); });
        }
        return allCases;
    }

    // The angles a case can be asked from: "picture", "standard" or "any"
    function anglesFor(c, which) {
        if (which === "standard") return c.standard;
        if (which === "any" || which === "all") return [0, 1, 2, 3];
        return [0];
    }

    function angleText(c, turns) {
        if (!turns) return "the case picture's angle";
        return AUF[turns] + " from the case picture";
    }

    // ── Page ────────────────────────────────────────────────────────────

    var $ = function (id) { return document.getElementById(id); };
    var els = {
        tabs: document.querySelectorAll("[data-mode]"),
        stats: $("bhStats"), subsetRow: $("bhSubsetRow"), set: $("bhSet"), sub: $("bhSub"),
        angleField: $("bhAngleField"), angle: $("bhAngle"),
        prompt: $("bhPrompt"), picture: $("bhPicture"), story: $("bhStory"), feedback: $("bhFeedback"),
        typeForm: $("bhTypeForm"), typed: $("bhTyped"), answers: $("bhAnswers"),
        next: $("bhNext"), resetStats: $("bhResetStats"),
        cubePanel: $("bhCubePanel"), useCube: $("bhUseCube"), cubeBody: $("bhCubeBody"),
        cover: $("bhCubeCover"), showCube: $("bhShowCube"), resetCube: $("bhResetCube"), hideCube: $("bhHideCube"),
        view: $("bhView"), twist: $("bhTwist"), answerStyle: $("bhAnswerStyle"),
        renameGrid: $("bhRenameGrid"), renameReset: $("bhRenameReset"),
        // By pattern
        pPanel: $("bhPatternPanel"), pSets: $("bhPSets"), pAngles: $("bhPAngles"), pView: $("bhPView"),
        pGrid: $("bhPGrid"), pCount: $("bhPCount"), pAll: $("bhPAll"), pNone: $("bhPNone"),
        scramble: $("bhScramble"), reveal: $("bhReveal"), revealBox: $("bhRevealBox"),
        grade: $("bhGrade"), knew: $("bhKnew"), missed: $("bhMissed"),
    };

    var q = null;          // the current question
    var token = 0;         // drops answers to questions that were replaced

    // Score
    function modeStats() {
        return stats[settings.mode] || (stats[settings.mode] = { right: 0, total: 0, streak: 0, best: 0 });
    }
    function score(right) {
        var m = modeStats();
        m.total++;
        if (right) { m.right++; m.streak++; m.best = Math.max(m.best, m.streak); }
        else m.streak = 0;
        save("bhStats", stats);
        renderStats();
    }
    function renderStats() {
        var m = modeStats();
        var pct = m.total ? Math.round(100 * m.right / m.total) + "%" : "–";
        els.stats.innerHTML = "<span><b>" + m.right + "</b> / " + m.total + " right (" + pct + ")</span>" +
            "<span>Streak <b>" + m.streak + "</b></span><span>Best <b>" + m.best + "</b></span>";
    }

    function setFeedback(text, kind) {
        els.feedback.textContent = text;
        els.feedback.dataset.kind = kind || "";
    }

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
    }

    // Answer buttons with a pattern picture each (Name and Story mode)
    function patternButtons() {
        els.answers.className = "bh-answers is-patterns";
        els.answers.innerHTML = PATTERNS.map(function (p) {
            return '<button type="button" class="bh-answer" data-answer="' + p + '">' +
                '<span class="bh-answer-pic" aria-hidden="true">' + draw(patternStickers(p, "", 0), GF.SHOW.bh) + "</span>" +
                '<span class="bh-answer-name">' + esc(nameOf(p)) + "</span></button>";
        }).join("");
    }

    // A typed name → pattern (your names or the default ones, any case)
    function patternFromText(text) {
        var t = text.trim().toLowerCase().replace(/\s+/g, " ");
        if (!t) return null;
        var hit = null;
        PATTERNS.some(function (p) { if (nameOf(p).toLowerCase() === t) { hit = p; return true; } return false; });
        if (!hit) PATTERNS.some(function (p) { if (p.toLowerCase() === t) { hit = p; return true; } return false; });
        return hit;
    }

    function markButtons(right, wrong) {
        els.answers.querySelectorAll("[data-answer]").forEach(function (b) {
            var a = b.dataset.answer;
            b.classList.toggle("is-right", right.indexOf(a) >= 0);
            b.classList.toggle("is-wrong", wrong === a && right.indexOf(a) < 0);
        });
    }

    // ── Name mode ───────────────────────────────────────────────────────

    function newNameQuestion() {
        var p = pick(PATTERNS);
        if (q && q.mode === "name" && p === q.answer) p = pick(PATTERNS);
        var twist = settings.twist ? pick(TWISTS) : "";
        q = { mode: "name", answer: p, twist: twist, side: Math.floor(Math.random() * 4), done: false };
        els.prompt.textContent = "Which BH pattern is this?";
        els.picture.innerHTML = draw(patternStickers(p, twist, q.side), GF.SHOW.bh);
        els.picture.setAttribute("aria-label", "A BH pattern" + (twist ? ", " + twistText(twist) : ""));
        patternButtons();
    }

    function answerName(p) {
        if (!q || q.done) return;
        q.done = true;
        var right = p === q.answer;
        score(right);
        markButtons([q.answer], p);
        setFeedback(right ? "Right: " + nameOf(q.answer) + "." : "It's " + nameOf(q.answer) + (p ? ", not " + nameOf(p) : "") + ".", right ? "good" : "bad");
    }

    // ── Case mode ───────────────────────────────────────────────────────

    function newCaseQuestion() {
        var my = ++token;
        els.prompt.textContent = "Which " + settings.set + "-" + settings.sub + " case is this?";
        els.picture.innerHTML = "";
        loadSubset(settings.set, settings.sub).then(function (cases) {
            if (my !== token) return;
            if (!cases.length) { setFeedback("Couldn't load this subset's pictures.", "bad"); return; }
            var c = pick(cases);
            if (q && q.mode === "case" && cases.length > 1 && q.info && q.info.key === c.key) c = pick(cases);
            var turns = pick(anglesFor(c, settings.angle));
            var made = setupFor(c, turns);
            var st = made ? cubeStickers(made.cube) : turned(c.stickers, turns);
            // Cases that look the same from any angle you could be asked
            var sig = c.sigs[turns];
            var same = cases.filter(function (o) {
                return anglesFor(o, settings.angle).some(function (t) { return o.sigs[t] === sig; });
            }).map(function (o) { return o.name; });
            q = { mode: "case", info: c, turns: turns, cases: cases, setup: made && made.setup, right: same, done: false };
            els.picture.innerHTML = draw(st, bhShow(st));
            els.picture.setAttribute("aria-label", "BH stickers of a " + settings.set + "-" + settings.sub + " case");
            caseButtons(cases);
            loadCube();
        });
    }

    function caseButtons(cases) {
        var pics = settings.answers === "pictures";
        var std = settings.angle === "standard";
        els.answers.className = "bh-answers " + (pics ? "is-cases" : "is-names");
        els.answers.innerHTML = cases.map(function (c) {
            var pic = "";
            if (pics && std) pic = '<span class="bh-answer-pic bh-answer-full" aria-hidden="true">' + GF.draw2D(turned(c.stickers, c.standard[0]), null) + "</span>";
            else if (pics) pic = '<img class="bh-answer-img" src="svg/top/' + encodeURIComponent(c.key) + '.svg" alt="">';
            return '<button type="button" class="bh-answer" data-answer="' + c.name + '" aria-label="' + esc(c.key) + '">' + pic +
                '<span class="bh-answer-name"' + (pics ? " data-reveal" : "") + ">" + esc(c.name) + "</span></button>";
        }).join("");
    }

    function answerCase(name, solved) {
        if (!q || q.done) return;
        q.done = true;
        var right = solved || q.right.indexOf(name) >= 0;
        score(right);
        markButtons(q.right, name);
        els.answers.classList.add("is-done");
        var label = q.info.key;
        var others = q.right.filter(function (n) { return n !== q.info.name; });
        var also = others.length ? " With only these stickers it looks the same as " + others.join(", ") + ", so both count." : "";
        var pattern = " BH pattern: " + patternText(q.info.bh[q.turns]) + ".";
        var where = settings.angle === "picture" ? "" : " Seen at " + angleText(q.info, q.turns) + ".";
        if (solved) setFeedback("Solved: " + label + "." + pattern + where, "good");
        else setFeedback((right ? "Right: " : "It's ") + label + "." + pattern + where + also, right ? "good" : "bad");
        revealCube();
    }

    // ── Story mode ──────────────────────────────────────────────────────

    function newStoryQuestion() {
        var my = ++token;
        els.prompt.textContent = "Name the BH pattern at each corner, anticlockwise from front-right";
        els.picture.innerHTML = "";
        loadSubset(settings.set, settings.sub).then(function (cases) {
            if (my !== token || !cases.length) return;
            var c = pick(cases);
            var made = setupFor(c, 0);
            var st = made ? cubeStickers(made.cube) : c.stickers;
            q = { mode: "story", info: c, seq: c.bh.map(function (b) { return b ? b.name : "?"; }), given: [], done: false };
            els.picture.innerHTML = GF.draw2D(st, null);
            els.picture.setAttribute("aria-label", "The whole last layer of " + c.key);
            renderStory();
            patternButtons();
        });
    }

    var CORNERS = ["Front-right", "Back-right", "Back-left", "Front-left"];

    function renderStory() {
        els.story.innerHTML = '<ol class="bh-story-list">' + CORNERS.map(function (label, i) {
            var g = q.given[i], cls = "";
            if (q.done) cls = g === q.seq[i] ? "is-right" : "is-wrong";
            else if (i === q.given.length) cls = "is-current";
            var shown = g ? esc(nameOf(g)) : "…";
            if (q.done && g !== q.seq[i]) shown = (g ? "<s>" + esc(nameOf(g)) + "</s> " : "") + esc(nameOf(q.seq[i]));
            return '<li class="' + cls + '"><span>' + label + "</span><b>" + shown + "</b></li>";
        }).join("") + "</ol>";
    }

    function answerStory(p) {
        if (!q || q.done) return;
        q.given.push(p);
        if (q.given.length === 4) {
            q.done = true;
            var right = q.given.every(function (g, i) { return g === q.seq[i]; });
            score(right);
            var same = q.seq.every(function (n) { return n === q.seq[0]; });
            setFeedback((right ? "Right! " : "Not quite. ") + q.info.key + ": " + q.seq.map(nameOf).join(" → ") +
                (same ? " (the same pattern from every side)" : "") + ".", right ? "good" : "bad");
        }
        renderStory();
    }

    // ── By pattern ──────────────────────────────────────────────────────
    // Every (case, angle) whose front-right pattern you selected

    var pool = [];
    var poolCounts = {};

    function buildPool(cases) {
        var sel = {}, sets = {};
        settings.pSel.forEach(function (id) { sel[id] = true; });
        settings.pSets.forEach(function (s) { sets[s] = true; });
        pool = [];
        poolCounts = {};
        cases.forEach(function (c) {
            if (!sets[c.set]) return;
            anglesFor(c, settings.pAngles).forEach(function (t) {
                var id = patternId(c.bh[t]);
                poolCounts[id] = (poolCounts[id] || 0) + 1;
                if (sel[id]) pool.push({ c: c, turns: t, id: id });
            });
        });
    }

    function renderPatternGrid() {
        var sel = {};
        settings.pSel.forEach(function (id) { sel[id] = true; });
        els.pGrid.innerHTML = TWISTS.map(function (tw) {
            var all = PATTERNS.every(function (p) { return sel[p + ":" + tw]; });
            return '<div class="bh-p-group"><div class="bh-p-head"><h3>' + TWIST_LABEL[tw] + '</h3>' +
                '<button type="button" class="chip" data-row="' + tw + '" aria-pressed="' + all + '">' + (all ? "Clear row" : "Whole row") + "</button></div>" +
                '<div class="bh-p-row">' + PATTERNS.map(function (p) {
                    var id = p + ":" + tw;
                    var st = stats.byPattern[id];
                    var acc = st && st.total ? Math.round(100 * st.right / st.total) + "%" : "";
                    var n = poolCounts[id] || 0;
                    return '<button type="button" class="bh-p-btn" data-pid="' + id + '" aria-pressed="' + !!sel[id] + '" title="' +
                        esc(nameOf(p) + (tw ? ", " + twistText(tw) : "") + ": " + n + " case angles" + (acc ? ", " + acc + " right" : "")) + '">' +
                        '<span class="bh-answer-pic" aria-hidden="true">' + GF.draw3D(patternStickers(p, tw, 0), GF.SHOW.bh) + "</span>" +
                        '<span class="bh-answer-name">' + esc(nameOf(p)) + "</span>" +
                        '<span class="bh-p-meta">' + n + (acc ? " · " + acc : "") + "</span></button>";
                }).join("") + "</div></div>";
        }).join("");
        els.pCount.textContent = pool.length + " case angle" + (pool.length === 1 ? "" : "s") + " selected";
    }

    function renderPatternSets() {
        els.pSets.innerHTML = Object.keys(zbllAlgs).map(function (s) {
            return '<button type="button" class="chip" data-pset="' + s + '" aria-pressed="' + (settings.pSets.indexOf(s) >= 0) + '">' + s + "</button>";
        }).join("");
    }

    function refreshPool() {
        return loadAll().then(function (cases) {
            buildPool(cases);
            renderPatternGrid();
        });
    }

    function newPatternQuestion() {
        var my = ++token;
        els.prompt.textContent = "Which ZBLL is this?";
        els.picture.innerHTML = "";
        els.scramble.textContent = "";
        els.revealBox.hidden = true;
        els.grade.hidden = true;
        els.reveal.hidden = false;
        refreshPool().then(function () {
            if (my !== token) return;
            if (!pool.length) {
                els.prompt.textContent = !settings.pSel.length || !settings.pSets.length
                    ? "Pick at least one pattern and one set below"
                    : "No case shows these patterns at your standard angles: try All 4 angles";
                q = null;
                return;
            }
            var item = pick(pool);
            if (q && q.mode === "pattern" && pool.length > 1 && q.info.key === item.c.key && q.turns === item.turns) item = pick(pool);
            var made = setupFor(item.c, item.turns);
            var st = made ? cubeStickers(made.cube) : turned(item.c.stickers, item.turns);
            q = { mode: "pattern", info: item.c, turns: item.turns, id: item.id, setup: made && made.setup, st: st, revealed: false, done: false };
            var show = settings.pView === "bh" ? bhShow(st) : settings.pView === "two" ? GF.SHOW.twisty : null;
            els.picture.innerHTML = settings.pView === "whole" ? GF.draw2D(st, null) : draw(st, show);
            els.picture.setAttribute("aria-label", "A ZBLL, " + (settings.pView === "two" ? "two sides shown" : settings.pView === "bh" ? "BH stickers shown" : "whole last layer"));
            if (made) els.scramble.innerHTML = "Scramble <code>" + esc(made.scramble) + "</code>";
            loadCube();
        });
    }

    function revealPattern() {
        if (!q || q.mode !== "pattern" || q.revealed) return;
        q.revealed = true;
        var c = q.info;
        els.revealBox.innerHTML = '<div class="bh-reveal-pic" aria-hidden="true">' + GF.draw2D(q.st, null) + "</div>" +
            '<div class="bh-reveal-text"><p class="bh-reveal-case">' + esc(c.key) + "</p>" +
            "<p>Front-right pattern: <b>" + esc(patternText(c.bh[q.turns])) + "</b></p>" +
            "<p>Angle: " + esc(angleText(c, q.turns)) + (c.standard.indexOf(q.turns) >= 0 ? " (your standard angle)" : "") + "</p>" +
            (mainAlg(c) ? '<p>Alg: <code>' + esc(algFor(c, q.setup)) + "</code></p>" : "") + "</div>";
        els.revealBox.hidden = false;
        els.reveal.hidden = true;
        els.grade.hidden = q.done;
        revealCube();
    }

    function gradePattern(right) {
        if (!q || q.mode !== "pattern" || q.done) return;
        q.done = true;
        score(right);
        var bp = stats.byPattern[q.id] || (stats.byPattern[q.id] = { right: 0, total: 0 });
        bp.total++;
        if (right) bp.right++;
        save("bhStats", stats);
        els.grade.hidden = true;
        setFeedback(right ? "Counted as right." : "Counted as a miss.", right ? "good" : "bad");
        renderPatternGrid();
    }

    // ── Virtual cube ────────────────────────────────────────────────────

    function cubeMode() { return settings.mode === "case" || settings.mode === "pattern"; }
    function cubeOn() { return cubeMode() && settings.cube && window.virtualCube; }

    function loadCube() {
        if (!window.virtualCube) return;
        if (!cubeOn() || !q || !q.setup) { virtualCube.disableMoves(); return; }
        virtualCube.reset();
        virtualCube.applyScramble(q.setup);
        virtualCube.enableMoves();
        els.cover.hidden = !settings.hideCube;
        setTimeout(function () { virtualCube.resize(); }, 20);
    }

    function revealCube() { els.cover.hidden = true; }

    if (window.virtualCube) {
        virtualCube.onSolve(function () {
            if (!q) return;
            if (q.mode === "case") {
                if (!q.done) answerCase(q.info.name, true);
                else setFeedback(els.feedback.textContent.replace(/ Solved\.$/, "") + " Solved.", els.feedback.dataset.kind);
            } else if (q.mode === "pattern") {
                if (!q.done) { revealPattern(); gradePattern(true); setFeedback("Solved: counted as right.", "good"); }
            }
        });
    }

    // ── Wiring ──────────────────────────────────────────────────────────

    function next() {
        setFeedback("", "");
        els.typed.value = "";
        els.answers.classList.remove("is-done");
        if (settings.mode === "name") { token++; newNameQuestion(); }
        else if (settings.mode === "case") newCaseQuestion();
        else if (settings.mode === "story") newStoryQuestion();
        else newPatternQuestion();
    }

    function applyMode() {
        els.tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t.dataset.mode === settings.mode)); });
        var m = settings.mode;
        els.subsetRow.hidden = m === "name" || m === "pattern";
        els.angleField.hidden = m !== "case";
        els.story.hidden = m !== "story";
        els.typeForm.hidden = m === "case" || m === "pattern";
        els.answers.hidden = m === "pattern";
        els.pPanel.hidden = m !== "pattern";
        els.scramble.hidden = m !== "pattern";
        els.reveal.hidden = m !== "pattern";
        els.revealBox.hidden = true;
        els.grade.hidden = true;
        els.cubePanel.hidden = !cubeMode();
        els.cubeBody.hidden = !(cubeMode() && settings.cube);
        els.typed.placeholder = m === "story" ? "Type the names, e.g. CsA AsO" : "Type the name, e.g. " + nameOf("CsA");
        if (window.virtualCube && !cubeMode()) virtualCube.disableMoves();
        renderStats();
        q = null;
        next();
    }

    function fillSets() {
        els.set.innerHTML = Object.keys(zbllAlgs).map(function (s) { return '<option value="' + s + '">' + s + "</option>"; }).join("");
        if (!zbllAlgs[settings.set]) settings.set = Object.keys(zbllAlgs)[0];
        els.set.value = settings.set;
        fillSubs();
    }
    function fillSubs() {
        var subs = subsetsOf(settings.set);
        els.sub.innerHTML = subs.map(function (s) { return '<option value="' + s + '">' + settings.set + "-" + s + "</option>"; }).join("");
        if (subs.indexOf(settings.sub) < 0) settings.sub = subs[0];
        els.sub.value = settings.sub;
        els.angle.title = "Standard angle for " + settings.set + ": " + STANDARD_TEXT[settings.set];
    }

    function renderRename() {
        els.renameGrid.innerHTML = PATTERNS.map(function (p) {
            return '<label class="bh-rename-item"><span class="bh-answer-pic" aria-hidden="true">' +
                GF.draw3D(patternStickers(p, "", 0), GF.SHOW.bh) + "</span>" +
                '<input type="text" class="input input-mono" data-pattern="' + p + '" value="' + esc(nameOf(p)) +
                '" placeholder="' + p + '" maxlength="24" aria-label="Name for ' + p + '"></label>';
        }).join("");
    }

    els.tabs.forEach(function (t) {
        t.addEventListener("click", function () {
            if (settings.mode === t.dataset.mode) return;
            settings.mode = t.dataset.mode;
            saveSettings();
            applyMode();
        });
    });

    els.answers.addEventListener("click", function (e) {
        var b = e.target.closest("[data-answer]");
        if (!b || !q) return;
        if (q.mode === "name") answerName(b.dataset.answer);
        else if (q.mode === "case") answerCase(b.dataset.answer);
        else if (q.mode === "story") answerStory(b.dataset.answer);
    });

    els.typeForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!q) return;
        if (q.done) { next(); return; }
        var text = els.typed.value;
        if (q.mode === "name") {
            var p = patternFromText(text);
            if (!p) { setFeedback("“" + text.trim() + "” isn't one of the 12 names.", "warn"); return; }
            answerName(p);
        } else if (q.mode === "story") {
            // Several names at once (split on commas, arrows or spaces), or one
            var parts = text.split(/\s*(?:,|→|->|;)\s*/).filter(Boolean);
            if (parts.length === 1 && !patternFromText(parts[0])) parts = text.trim().split(/\s+/);
            var found = parts.map(patternFromText);
            var bad = parts.filter(function (x, i) { return !found[i]; });
            if (bad.length) { setFeedback("“" + bad[0] + "” isn't one of the 12 names.", "warn"); return; }
            found.forEach(function (f) { answerStory(f); });
        }
        els.typed.value = "";
    });

    els.next.addEventListener("click", next);
    els.resetStats.addEventListener("click", function () {
        stats[settings.mode] = { right: 0, total: 0, streak: 0, best: 0 };
        if (settings.mode === "pattern") stats.byPattern = {};
        save("bhStats", stats);
        renderStats();
        if (settings.mode === "pattern") renderPatternGrid();
    });

    // Enter: show the answer (By pattern), or the next question
    document.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" || e.target.closest("input, select, textarea, button, a, summary")) return;
        e.preventDefault();
        if (q && q.mode === "pattern" && !q.revealed) revealPattern();
        else next();
    });

    els.set.addEventListener("change", function () {
        settings.set = els.set.value;
        fillSubs();
        saveSettings();
        q = null;
        next();
    });
    els.sub.addEventListener("change", function () {
        settings.sub = els.sub.value;
        saveSettings();
        q = null;
        next();
    });
    els.angle.addEventListener("change", function () {
        settings.angle = els.angle.value;
        saveSettings();
        q = null;
        next();
    });

    // By pattern controls
    els.pGrid.addEventListener("click", function (e) {
        var b = e.target.closest("[data-pid], [data-row]");
        if (!b) return;
        var sel = settings.pSel.slice();
        if (b.dataset.pid) {
            var i = sel.indexOf(b.dataset.pid);
            if (i >= 0) sel.splice(i, 1); else sel.push(b.dataset.pid);
        } else {
            var ids = PATTERNS.map(function (p) { return p + ":" + b.dataset.row; });
            var on = b.getAttribute("aria-pressed") !== "true";
            sel = sel.filter(function (id) { return ids.indexOf(id) < 0; });
            if (on) sel = sel.concat(ids);
        }
        settings.pSel = sel;
        saveSettings();
        refreshPool().then(function () { if (!q) next(); });
    });
    els.pAll.addEventListener("click", function () {
        settings.pSel = [];
        TWISTS.forEach(function (tw) { PATTERNS.forEach(function (p) { settings.pSel.push(p + ":" + tw); }); });
        saveSettings();
        refreshPool().then(function () { if (!q) next(); });
    });
    els.pNone.addEventListener("click", function () {
        settings.pSel = [];
        saveSettings();
        refreshPool();
    });
    els.pSets.addEventListener("click", function (e) {
        var b = e.target.closest("[data-pset]");
        if (!b) return;
        var i = settings.pSets.indexOf(b.dataset.pset);
        if (i >= 0) settings.pSets.splice(i, 1); else settings.pSets.push(b.dataset.pset);
        saveSettings();
        renderPatternSets();
        refreshPool().then(function () { if (!q) next(); });
    });
    els.pAngles.addEventListener("change", function () {
        settings.pAngles = els.pAngles.value;
        saveSettings();
        q = null;
        next();
    });
    els.pView.addEventListener("change", function () {
        settings.pView = els.pView.value;
        saveSettings();
        q = null;
        next();
    });
    els.reveal.addEventListener("click", revealPattern);
    els.knew.addEventListener("click", function () { gradePattern(true); });
    els.missed.addEventListener("click", function () { gradePattern(false); });

    els.useCube.addEventListener("change", function () {
        settings.cube = els.useCube.checked;
        saveSettings();
        els.cubeBody.hidden = !settings.cube;
        loadCube();
    });
    els.hideCube.addEventListener("change", function () {
        settings.hideCube = els.hideCube.checked;
        saveSettings();
        if (!settings.hideCube) revealCube();
        else if (q && !q.done) els.cover.hidden = false;
    });
    els.showCube.addEventListener("click", revealCube);
    els.resetCube.addEventListener("click", function () {
        if (!q || !q.setup) return;
        virtualCube.reset();
        virtualCube.applyScramble(q.setup);
        virtualCube.enableMoves();
    });

    els.view.addEventListener("change", function () {
        settings.view = els.view.value;
        saveSettings();
        renderRename();
        q = null;
        next();
    });
    els.twist.addEventListener("change", function () {
        settings.twist = els.twist.checked;
        saveSettings();
        if (settings.mode === "name") next();
    });
    els.answerStyle.addEventListener("change", function () {
        settings.answers = els.answerStyle.value;
        saveSettings();
        if (q && q.mode === "case" && !q.done) caseButtons(q.cases);
    });

    els.renameGrid.addEventListener("input", function (e) {
        var input = e.target.closest("[data-pattern]");
        if (!input) return;
        var v = input.value.trim();
        if (v && v !== input.dataset.pattern) names[input.dataset.pattern] = v;
        else delete names[input.dataset.pattern];
        save("bhNames", names);
    });
    // Show the new names once you leave the box
    els.renameGrid.addEventListener("change", function () {
        if (settings.mode === "name" && q && !q.done) patternButtons();
        if (settings.mode === "story" && q) { renderStory(); patternButtons(); }
        if (settings.mode === "pattern") renderPatternGrid();
    });
    els.renameReset.addEventListener("click", function () {
        names = {};
        save("bhNames", names);
        renderRename();
        if (settings.mode === "pattern") renderPatternGrid();
        else if (settings.mode !== "case") next();
    });

    // ── Start ───────────────────────────────────────────────────────────

    els.view.value = settings.view;
    els.twist.checked = !!settings.twist;
    els.answerStyle.value = settings.answers;
    els.angle.value = settings.angle;
    els.pAngles.value = settings.pAngles;
    els.pView.value = settings.pView;
    els.useCube.checked = !!settings.cube;
    els.hideCube.checked = settings.hideCube !== false;
    fillSets();
    renderPatternSets();
    renderRename();
    applyMode();

    // For checking from the console
    window.BHTrainer = {
        classify: classify, turnU: turnU, turned: turned, patternStickers: patternStickers, setupFor: setupFor,
        loadSubset: loadSubset, loadAll: loadAll, cubeStickers: cubeStickers, sigOf: sigOf, standardAngles: standardAngles,
    };
})();

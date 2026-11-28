// Alg sheets: import algs from a spreadsheet or a list, check them, and use
// them in the trainer. Managed on sheets.html.
//
// How checking works: each alg is played backwards from a solved cube, and
// the position that gives is recognised as a ZBLL or ZBLS case (the same
// fingerprints the LSLL trainer uses, see lsll.js). So a sheet doesn't need
// our case names: any table or list of algs works. If a row also names a
// case ("T-2GLL-CsA", "F2L 12-3", ...), algs that solve a different case are
// flagged.
//
// Sheets are kept in localStorage ("algSheets"). The algs of the sheets you
// turn on are added after your own algs in the trainer (extraAlgs). Your own
// list is never changed, so removing a sheet removes its algs.

(function (window) {
    var STORE_KEY = "algSheets";
    var XLSX_URL = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";

    // ── Storage ─────────────────────────────────────────────────────────

    function list() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; }
    }

    function saveList(sheets) {
        localStorage.setItem(STORE_KEY, JSON.stringify(sheets));
        extraCache = null;
    }

    // sheet: { name, source: { type, url?, file? }, entries: [{ key, alg }] }
    function add(sheet) {
        var sheets = list();
        sheet.id = "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        sheet.addedAt = Date.now();
        sheet.enabled = sheet.enabled !== false;
        sheets.push(sheet);
        saveList(sheets);
        return sheet;
    }

    function update(id, patch) {
        var sheets = list();
        sheets.forEach(function (s) {
            if (s.id === id) Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
        });
        saveList(sheets);
    }

    function remove(id) {
        saveList(list().filter(function (s) { return s.id !== id; }));
    }

    // ── Algs for the trainer ────────────────────────────────────────────

    var extraCache = null; // case key → [alg] from sheets that are turned on
    var extraCacheTop = false; // whether topSolverAlgs.js was loaded when it was made

    function loadedState() { return !!topData() + "|" + builtinLists().length; }

    function sheetAlgs() {
        if (extraCache && extraCacheTop === loadedState()) return extraCache;
        extraCache = {};
        extraCacheTop = loadedState();
        list().forEach(function (s) {
            if (!s.enabled) return;
            (s.entries || []).forEach(function (e) {
                (extraCache[e.key] = extraCache[e.key] || []).push(e.alg);
            });
        });
        // Community collections (communityAlgs.js) that are turned on
        builtinLists().forEach(function (b) {
            if (!builtinOn(b.id)) return;
            Object.keys(b.algs || {}).forEach(function (key) {
                b.algs[key].forEach(function (a) { (extraCache[key] = extraCache[key] || []).push(a); });
            });
        });
        // The top solvers' algs come after your own sheets
        if (topOn() && topData()) {
            Object.keys(topData()).forEach(function (key) {
                topData()[key].forEach(function (e) {
                    (extraCache[key] = extraCache[key] || []).push(e[0]);
                });
            });
        }
        return extraCache;
    }

    // ── Community collections (communityAlgs.js) ────────────────────────
    // Built in like the top solvers' algs: on by default, can be turned off.

    var BUILTIN_KEY = "builtinSheets"; // { id: false } for the ones turned off

    function builtinLists() {
        return typeof communityAlgs !== "undefined" && Array.isArray(communityAlgs) ? communityAlgs : [];
    }

    function builtinOn(id) {
        try { return (JSON.parse(localStorage.getItem(BUILTIN_KEY)) || {})[id] !== false; } catch (e) { return true; }
    }

    // Which community collection an extra alg came from ("ZBLL Explorer"), or ""
    function sourceOf(key, alg) {
        var hit = builtinLists().filter(function (b) {
            return builtinOn(b.id) && (b.algs[key] || []).indexOf(alg) >= 0;
        })[0];
        return hit ? hit.name : "";
    }

    function setBuiltinOn(id, on) {
        var map = {};
        try { map = JSON.parse(localStorage.getItem(BUILTIN_KEY)) || {}; } catch (e) {}
        if (on) delete map[id]; else map[id] = false;
        try { localStorage.setItem(BUILTIN_KEY, JSON.stringify(map)); } catch (e) {}
        extraCache = null;
    }

    // ── Top solvers' algs (topSolverAlgs.js) ────────────────────────────
    // Built in, so it can't be removed, only turned off.

    var TOP_KEY = "topSolverAlgs";

    function topData() {
        return typeof topSolverAlgs !== "undefined" ? topSolverAlgs : null;
    }

    function topOn() {
        try { return localStorage.getItem(TOP_KEY) !== "off"; } catch (e) { return true; }
    }

    function setTopOn(on) {
        try { localStorage.setItem(TOP_KEY, on ? "on" : "off"); } catch (e) {}
        extraCache = null;
    }

    // "x12630 t11383" → [{ who: "x", name: "Xuanyi Geng", id, url }]
    function parseRecons(text) {
        var names = typeof TOP_SOLVERS !== "undefined" ? TOP_SOLVERS : {};
        return String(text || "").split(/\s+/).filter(Boolean).map(function (r) {
            // "x12630", or a longer code for other solvers ("bz13001")
            var m = /^([a-z]+)(\d+)$/.exec(r) || [r, "", r];
            return { who: m[1], name: names[m[1]] || "Top solver", id: m[2], url: "https://reco.nz/solve/" + m[2] };
        });
    }

    // The top solvers' algs for one case: [{ alg, recons }]
    function topAlgs(key) {
        var d = topData();
        return ((d && d[key]) || []).map(function (e) { return { alg: e[0], recons: parseRecons(e[1]) }; });
    }

    // Solves where a top solver used this alg (any AUF or way of writing it)
    function topUsesOf(key, alg) {
        var out = [];
        topAlgs(key).forEach(function (e) {
            if (sameAlg(e.alg, alg)) out = out.concat(e.recons);
        });
        return out;
    }

    // Same alg written differently (AUFs, rotations, wide moves) counts once
    function algId(alg) {
        if (window.AlgDetect) {
            var k = AlgDetect.canonicalKey(alg);
            if (k) return k;
        }
        return String(alg).replace(/\s+/g, " ").trim();
    }

    // Same alg, however it's written: AUFs, rotations ("y2 R U R'" = "L U L'"), wide moves
    function sameAlg(a, b) {
        if (window.AlgDetect && AlgDetect.sameAlg) return AlgDetect.sameAlg(a, b);
        return algId(a) === algId(b);
    }

    // Sheet and collection algs you hid for one case: { caseKey: [alg, …] }
    var HIDDEN_KEY = "hiddenSheetAlgs";

    function hiddenMap() {
        try { return JSON.parse(localStorage.getItem(HIDDEN_KEY)) || {}; } catch (e) { return {}; }
    }

    function hiddenAlgs(key) { return hiddenMap()[key] || []; }

    function hideAlg(key, alg) {
        var map = hiddenMap();
        map[key] = (map[key] || []).concat([alg]);
        try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(map)); } catch (e) {}
    }

    function unhideAll(key) {
        var map = hiddenMap();
        delete map[key];
        try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(map)); } catch (e) {}
    }

    // How many of a case's sheet algs are hidden right now
    function hiddenCount(key) {
        var extra = sheetAlgs()[key] || [];
        var hidden = hiddenAlgs(key);
        return extra.filter(function (a) { return hidden.indexOf(a) >= 0; }).length;
    }

    // Algs from your sheets for one case, leaving out ones you already have
    // and ones you hid
    function extraAlgs(key, own) {
        var extra = sheetAlgs()[key];
        if (!extra || !extra.length) return [];
        var out = [];
        var have = (own || []).slice();
        var hidden = hiddenAlgs(key);
        extra.forEach(function (a) {
            if (hidden.indexOf(a) >= 0) return;
            if (have.some(function (b) { return sameAlg(a, b); })) return;
            have.push(a);
            out.push(a);
        });
        return out;
    }

    window.addEventListener("storage", function (e) { if (e.key === STORE_KEY || e.key === TOP_KEY || e.key === BUILTIN_KEY) extraCache = null; });

    // ── Reading algs ────────────────────────────────────────────────────

    // Curly quotes and primes from docs and sheets → '
    function cleanAlg(text) {
        return String(text || "")
            .replace(/[‘’′´`]/g, "'")
            .replace(/[–—]/g, "-")
            .replace(/\s+/g, " ")
            .trim();
    }

    function isRotation(t) { return /^[xyz]/.test(t); }

    // Tokens if this looks like an alg (at least 3 turns, like R U R'), else null
    function algTokens(text) {
        var tokens = window.AlgAuf ? AlgAuf.tokenize(cleanAlg(text)) : null;
        if (!tokens) return null;
        var turns = tokens.filter(function (t) { return !isRotation(t); }).length;
        return turns >= 3 ? tokens : null;
    }

    function invertToken(t) {
        if (/2$/.test(t)) return t;
        return /'$/.test(t) ? t.slice(0, -1) : t + "'";
    }

    // ZBLS case keys for other slots: "ZBLS-12-3" in FL → "ZBLS-FL-12-3"
    function zblsSlotKey(key, slot) {
        return slot && slot !== "FR" ? key.replace(/^ZBLS-/, "ZBLS-" + slot + "-") : key;
    }

    // Which case an alg solves.
    // → { ok: true, deck, key, name } or { ok: false, reason }
    function checkAlg(alg) {
        var tokens = algTokens(alg);
        if (!tokens) return { ok: false, reason: "Not readable as an alg" };
        if (!window.LSLL || !window.virtualCube) return { ok: false, reason: "Checker not loaded" };
        var inverse = AlgAuf.toCubeMoves(tokens.slice().reverse().map(invertToken));
        var raw = window.virtualCube.makeCube(inverse);
        if (raw.isSolved()) return { ok: false, reason: "Doesn't change the cube" };
        // Which F2L slot the alg solves (ZBLS can be done in any slot)
        var broken = LSLL.brokenSlots ? LSLL.brokenSlots(raw) : [];
        var slot = broken.length === 1 ? broken[0] : "FR";
        // The position the alg solves, held each possible way: the first
        // way that looks like a ZBLL or a front-right ZBLS case wins
        var nearMiss = null;
        var found = LSLL.eachHolding(inverse, function (cube) {
            if (window.CubeGoals && CubeGoals.zbls(cube)) {
                var ll = LSLL.zbllCaseOf(cube);
                if (ll.skip) { nearMiss = nearMiss || "Only an AUF"; return null; }
                if (ll.other) { nearMiss = nearMiss || (ll.name === "PLL" ? "A PLL, not a ZBLL" : "Last layer not recognised"); return null; }
                return { ok: true, deck: "ZBLL", key: ll.key, name: ll.name };
            }
            if (LSLL.f2lExceptPair(cube)) {
                var ls = LSLL.zblsCaseOf(cube);
                // Other slots: the same case, seen with that slot turned to the front right
                if (ls && slot !== "FR") return { ok: true, deck: "ZBLS", slot: slot, key: zblsSlotKey(ls.key, slot), name: ls.name + " (" + slot + ")" };
                if (ls) return { ok: true, deck: "ZBLS", slot: "FR", key: ls.key, name: ls.name };
                nearMiss = nearMiss || "Front-right pair case not recognised";
            }
            return null;
        });
        return found || { ok: false, reason: nearMiss || "Doesn't solve a ZBLL or front-right ZBLS case" };
    }

    // ── Case names written in a sheet ───────────────────────────────────

    var SET_NAMES = { as: "Antisune", antisune: "Antisune", s: "Sune", sune: "Sune", pi: "Pi", p: "Pi",
        h: "H", l: "L", t: "T", u: "U" };
    var zbllNameIndex = null;

    // "T-2GLL-CsA", "T 2GLL CsA", "F2L 12-3", "ZBLS 12-3" → case key, or null
    function parseCaseName(text) {
        var s = cleanAlg(text);
        if (!s || s.length > 40) return null;
        var m = /^(?:F2L|ZBLS)?\s*#?\s*(\d{1,2})\s*[-_.\/ ]\s*(\d{1,2})$/i.exec(s);
        if (m && typeof zblsAlgs !== "undefined" && zblsAlgs[m[1]] && zblsAlgs[m[1]][m[2]]) {
            return "ZBLS-" + m[1] + "-" + m[2];
        }
        if (typeof zbllAlgs === "undefined") return null;
        if (!zbllNameIndex) {
            zbllNameIndex = {};
            Object.keys(zbllAlgs).forEach(function (set) {
                Object.keys(zbllAlgs[set]).forEach(function (sub) {
                    Object.keys(zbllAlgs[set][sub]).forEach(function (c) {
                        zbllNameIndex[(set + " " + sub + " " + c).toLowerCase()] = set + "-" + sub + "-" + c;
                    });
                });
            });
        }
        // H's side names have a slash in them ("H-Top/Bottom-AsC")
        s = s.replace(/top\s*\/\s*bottom/i, "TopBottom").replace(/left\s*\/\s*right/i, "LeftRight");
        var parts = s.split(/[\s\-_\/]+/).filter(Boolean);
        if (parts.length !== 3) return null;
        var set = SET_NAMES[parts[0].toLowerCase()] || parts[0];
        var sub = subsetFromLabel(set, parts[1]) || parts[1];
        return zbllNameIndex[(set + " " + sub + " " + parts[2]).toLowerCase()] || null;
    }

    // "Top" → "3" for T (zbllSubsets.js), so names like "T-Top-AsC" are read too
    function subsetFromLabel(set, text) {
        if (!window.ZbllSubsets || typeof zbllAlgs === "undefined" || !zbllAlgs[set]) return null;
        var want = String(text).toLowerCase().replace(/\//g, "");
        var hit = null;
        Object.keys(zbllAlgs[set]).forEach(function (sub) {
            if (ZbllSubsets.label(set, sub, 0).toLowerCase().replace(/\//g, "") === want) hit = sub;
        });
        return hit;
    }

    // ── Case names and pictures for exports ─────────────────────────────

    // Case key → the name ZBTrain shows: "T-3-AsC" → "T-Top-AsC",
    // "ZBLS-12-3" → "F2L 12-3", "ZBLS-FL-12-3" → "F2L 12-3 (FL)".
    // Subset names are for the standard picture angle, like the exported pictures.
    function caseName(key) {
        var m = /^ZBLS-(?:(FL|BR|BL)-)?(\d+)-(\d+)$/.exec(key);
        if (m) return "F2L " + m[2] + "-" + m[3] + (m[1] ? " (" + m[1] + ")" : "");
        var z = /^(\w+)-(\w+)-(\w+)$/.exec(key);
        if (z && window.ZbllSubsets) return z[1] + "-" + ZbllSubsets.label(z[1], z[2], 0) + "-" + z[3];
        return key;
    }

    // Case key → its picture (ZBLS slots other than FR use the FR picture)
    function caseImg(key) {
        var m = /^ZBLS-(?:(?:FL|BR|BL)-)?(\d+)-(\d+)$/.exec(key);
        if (m) return "images/ZBLS/F2L " + m[1] + "-" + m[2] + ".png";
        return /^\w+-\w+-\w+$/.test(key) ? "svg/top/" + key + ".svg" : "";
    }

    // Case key → the group it's shown under: "T Top", "F2L 12"
    function caseGroup(key) {
        var m = /^ZBLS-(?:(FL|BR|BL)-)?(\d+)-\d+$/.exec(key);
        if (m) return "F2L " + m[2] + (m[1] ? " (" + m[1] + ")" : "");
        var z = /^(\w+)-(\w+)-\w+$/.exec(key);
        if (z) return z[1] + " " + (window.ZbllSubsets ? ZbllSubsets.label(z[1], z[2], 0) : z[2]);
        return "";
    }

    // Your saved solves (trainer, "zbllAttempts") → stats per case key:
    // { solves, dnfs, avg, best, recog, exec, tps, last }. Times in seconds.
    // ZBLS solves in every slot count for the case.
    function caseStats() {
        var attempts = [];
        try { attempts = JSON.parse(localStorage.getItem("zbllAttempts") || "[]"); } catch (e) {}
        var by = {};
        attempts.forEach(function (a) {
            if (!a || !a.set || !a.subset || !a.caseId) return;
            var key = (a.set === "ZBLS" ? "ZBLS" : a.set) + "-" + a.subset + "-" + a.caseId;
            var s = by[key] || (by[key] = { solves: 0, dnfs: 0, times: [], recog: [], exec: [], tps: [], last: null });
            if (!s.last || a.timestamp > s.last) s.last = a.timestamp;
            if (a.result === "DNF") { s.dnfs++; return; }
            if (!(a.time > 0)) return;
            s.solves++;
            s.times.push(a.time);
            if (a.recogTime > 0) s.recog.push(a.recogTime);
            if (a.execTime > 0) s.exec.push(a.execTime);
            var st = window.SolveStats && a.moves ? SolveStats.analyze(a) : null;
            if (st && st.tps > 0) s.tps.push(st.tps);
        });
        function avg(list) { return list.length ? list.reduce(function (x, y) { return x + y; }, 0) / list.length : null; }
        Object.keys(by).forEach(function (k) {
            var s = by[k];
            by[k] = {
                solves: s.solves, dnfs: s.dnfs, last: s.last,
                avg: avg(s.times), best: s.times.length ? Math.min.apply(null, s.times) : null,
                recog: avg(s.recog), exec: avg(s.exec), tps: avg(s.tps),
            };
        });
        return by;
    }

    // One line for a case card: "14 solves · avg 2.41 · best 1.88 · 6.2 TPS"
    function statsText(s) {
        if (!s || (!s.solves && !s.dnfs)) return null;
        var parts = [s.solves + (s.solves === 1 ? " solve" : " solves")];
        if (s.avg != null) parts.push("avg " + s.avg.toFixed(2));
        if (s.best != null) parts.push("best " + s.best.toFixed(2));
        if (s.recog != null) parts.push("recog " + s.recog.toFixed(2));
        if (s.tps != null) parts.push(s.tps.toFixed(1) + " TPS");
        if (s.dnfs) parts.push(s.dnfs + " DNF");
        return parts.join(" · ");
    }

    // Case key → its tab in an Excel export: the ZBLL set, or ZBLS
    function caseTab(key) {
        if (/^ZBLS-/.test(key)) return "ZBLS";
        return (/^(\w+)-/.exec(key) || [])[1] || "Algs";
    }

    // ── Tables ──────────────────────────────────────────────────────────

    // CSV (quotes, commas or tabs) → rows of cells
    function parseCSV(text, sep) {
        text = String(text || "").replace(/^﻿/, "");
        if (!sep) sep = /\t/.test(text.split("\n")[0]) ? "\t" : ",";
        var rows = [], row = [], cell = "", quoted = false;
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if (quoted) {
                if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
                else if (ch === '"') quoted = false;
                else cell += ch;
            } else if (ch === '"' && cell === "") quoted = true;
            else if (ch === sep) { row.push(cell); cell = ""; }
            else if (ch === "\n" || ch === "\r") {
                if (ch === "\r" && text[i + 1] === "\n") i++;
                row.push(cell); rows.push(row); row = []; cell = "";
            } else cell += ch;
        }
        if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
        return rows;
    }

    // Pasted text: a table copied from a spreadsheet (tabs), CSV, or one alg
    // per line, optionally "case name: alg"
    function parseText(text) {
        text = String(text || "");
        if (/\t/.test(text)) return parseCSV(text, "\t");
        return text.split(/\r?\n/).map(function (line) {
            return line.split(/\s*[,;|:]\s*/);
        });
    }

    // Rows of cells → checked algs.
    // Returns { items: [{ row, alg, expected, result, status }], ... counts }
    //   status: "ok" | "mismatch" (named case differs) | "bad" (solves nothing we know)
    function checkRows(rows) {
        var items = [];
        rows.forEach(function (cells, r) {
            var expected = null;
            var algs = [];
            cells.forEach(function (cell) {
                String(cell == null ? "" : cell).split(/\r?\n|\s*;\s*/).forEach(function (part) {
                    part = cleanAlg(part);
                    if (!part) return;
                    var name = parseCaseName(part);
                    if (name) { if (!expected) expected = name; return; }
                    if (algTokens(part)) algs.push(part);
                });
            });
            algs.forEach(function (alg) {
                var res = checkAlg(alg);
                var status = !res.ok ? "bad" : expected && expected !== res.key ? "mismatch" : "ok";
                items.push({ row: r + 1, alg: alg, expected: expected, result: res, status: status });
            });
        });
        var counts = { ok: 0, mismatch: 0, bad: 0, ZBLL: 0, ZBLS: 0, cases: 0 };
        var cases = {};
        items.forEach(function (it) {
            counts[it.status]++;
            if (it.result.ok) {
                counts[it.result.deck]++;
                cases[it.result.key] = true;
            }
        });
        counts.cases = Object.keys(cases).length;
        return { items: items, counts: counts };
    }

    // What gets saved for a sheet: algs that solve a case we know. An alg
    // whose row names another case is still saved under the case it solves.
    function entriesFrom(report) {
        var seen = {};
        var out = [];
        report.items.forEach(function (it) {
            if (!it.result.ok) return;
            var id = it.result.key + "|" + it.alg;
            if (seen[id]) return;
            seen[id] = true;
            out.push({ key: it.result.key, alg: it.alg });
        });
        return out;
    }

    // ── Sources ─────────────────────────────────────────────────────────

    // A Google Sheets link → its CSV (the sheet must be shared so anyone
    // with the link can view it)
    function googleCsvUrl(url) {
        var m = /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/.exec(url || "");
        if (!m) return null;
        var gid = /[#&?]gid=(\d+)/.exec(url);
        return "https://docs.google.com/spreadsheets/d/" + m[1] + "/gviz/tq?tqx=out:csv" + (gid ? "&gid=" + gid[1] : "");
    }

    // The whole spreadsheet as an Excel file: every tab, and cell notes
    // (some sheets keep their algs in notes)
    function googleXlsxUrl(url) {
        var m = /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/.exec(url || "");
        return m ? "https://docs.google.com/spreadsheets/d/" + m[1] + "/export?format=xlsx" : null;
    }

    function fetchGoogleSheet(url) {
        var xlsxUrl = googleXlsxUrl(url);
        if (!xlsxUrl) return Promise.reject(new Error("That doesn't look like a Google Sheets link."));
        return Promise.all([loadXLSX(), fetch(xlsxUrl)]).then(function (r) {
            var res = r[1];
            if (!res.ok || !/spreadsheetml|octet-stream/.test(res.headers.get("content-type") || "")) throw new Error("not xlsx");
            return res.arrayBuffer().then(function (buf) {
                return workbookRows(r[0], r[0].read(buf, { type: "array" }));
            });
        }).catch(function () {
            // Fall back to the CSV of one tab (no notes, but no Excel reader needed)
            return fetchGoogleCsv(url);
        });
    }

    function fetchGoogleCsv(url) {
        var csvUrl = googleCsvUrl(url);
        return fetch(csvUrl).then(function (res) {
            if (!res.ok) throw new Error("Couldn't open the sheet (" + res.status + "). Make sure it's shared so anyone with the link can view it.");
            return res.text();
        }).then(function (text) {
            if (/^\s*<!DOCTYPE html|<html/i.test(text)) {
                throw new Error("Google asked to sign in. Share the sheet so anyone with the link can view it.");
            }
            return parseCSV(text, ",");
        });
    }

    // Excel support (SheetJS, Apache-2.0) loads only when you use it
    var xlsxPromise = null;
    function loadXLSX() {
        if (window.XLSX) return Promise.resolve(window.XLSX);
        if (!xlsxPromise) {
            xlsxPromise = new Promise(function (resolve, reject) {
                var s = document.createElement("script");
                s.src = XLSX_URL;
                s.onload = function () { resolve(window.XLSX); };
                s.onerror = function () { xlsxPromise = null; reject(new Error("Couldn't load the Excel reader. Check your connection, or save the sheet as CSV.")); };
                document.head.appendChild(s);
            });
        }
        return xlsxPromise;
    }

    // Every tab of a workbook → rows of cells. A cell's note (comment) is
    // added to its text, since some sheets keep their algs in notes.
    function workbookRows(X, wb) {
        var rows = [];
        wb.SheetNames.forEach(function (n) {
            var ws = wb.Sheets[n];
            if (!ws || !ws["!ref"]) return;
            var range = X.utils.decode_range(ws["!ref"]);
            for (var r = range.s.r; r <= range.e.r; r++) {
                var row = [];
                for (var c = range.s.c; c <= range.e.c; c++) {
                    var cell = ws[X.utils.encode_cell({ r: r, c: c })];
                    if (!cell) { row.push(""); continue; }
                    var text = cell.w != null ? String(cell.w) : cell.v != null ? String(cell.v) : "";
                    if (cell.c && cell.c.length) {
                        text += "\n" + cell.c.map(function (note) { return note.t || ""; }).join("\n");
                    }
                    row.push(text);
                }
                rows.push(row);
            }
        });
        return rows;
    }

    // A file (.csv, .tsv, .txt, .xlsx, .xls, .ods) → rows of cells (every sheet in it)
    function readFile(file) {
        var name = (file && file.name || "").toLowerCase();
        if (/\.(xlsx|xls|ods)$/.test(name)) {
            return Promise.all([loadXLSX(), file.arrayBuffer()]).then(function (r) {
                return workbookRows(r[0], r[0].read(r[1], { type: "array" }));
            });
        }
        return file.text().then(function (text) {
            return /\.(csv|tsv)$/.test(name) ? parseCSV(text) : parseText(text);
        });
    }

    // ── Export ──────────────────────────────────────────────────────────

    // rows: [[cell, ...], ...] (first row = headers)
    function downloadBlob(blob, filename) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function exportCSV(rows, filename) {
        var csv = rows.map(function (r) {
            return r.map(function (c) {
                c = String(c == null ? "" : c);
                return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c;
            }).join(",");
        }).join("\r\n");
        downloadBlob(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }), filename + ".csv");
    }

    function exportExcel(rows, filename, sheetName) {
        return loadXLSX().then(function (X) {
            var ws = X.utils.aoa_to_sheet(rows);
            ws["!cols"] = rows[0].map(function (_, i) { return { wch: i === 0 ? 18 : 40 }; });
            var wb = X.utils.book_new();
            X.utils.book_append_sheet(wb, ws, (sheetName || "Algs").slice(0, 31));
            X.writeFile(wb, filename + ".xlsx");
        });
    }

    // ── Excel with pictures ─────────────────────────────────────────────
    // SheetJS can't put pictures in a file, so these use ExcelJS (MIT), loaded
    // only when you export.
    var EXCELJS_URL = "https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js";
    var excelJsPromise = null;
    function loadExcelJS() {
        if (window.ExcelJS) return Promise.resolve(window.ExcelJS);
        if (!excelJsPromise) {
            excelJsPromise = new Promise(function (resolve, reject) {
                var s = document.createElement("script");
                s.src = EXCELJS_URL;
                s.onload = function () { resolve(window.ExcelJS); };
                s.onerror = function () { excelJsPromise = null; reject(new Error("Couldn't load the Excel writer. Check your connection, or export as CSV.")); };
                document.head.appendChild(s);
            });
        }
        return excelJsPromise;
    }

    var IMG_PX = 120;      // picture size in the file
    var CARDS_PER_ROW = 6; // cases side by side

    // A picture (SVG or PNG) → PNG as base64, drawn at IMG_PX (Excel can't show SVG)
    var pngCache = {};
    function pngOf(src) {
        if (!src) return Promise.resolve(null);
        if (!pngCache[src]) {
            pngCache[src] = new Promise(function (resolve) {
                var img = new Image();
                img.onload = function () {
                    var scale = 2; // sharp when zoomed in
                    var c = document.createElement("canvas");
                    c.width = c.height = IMG_PX * scale;
                    var g = c.getContext("2d");
                    var w = img.naturalWidth || IMG_PX, h = img.naturalHeight || IMG_PX;
                    var k = Math.min(c.width / w, c.height / h);
                    g.drawImage(img, (c.width - w * k) / 2, (c.height - h * k) / 2, w * k, h * k);
                    try { resolve(c.toDataURL("image/png").split(",")[1]); } catch (e) { resolve(null); }
                };
                img.onerror = function () { resolve(null); };
                img.src = encodeURI(src);
            });
        }
        return pngCache[src];
    }

    // cases: [{ key, algs: [..], stats: "text" or null }] in the order to show.
    // Each case is a card like a printed alg sheet:
    //     picture
    //     name
    //     your stats (if any)
    //     algs (the first one in bold when boldFirst)
    // One tab per ZBLL set (or ZBLS), a heading per group ("T Top", "F2L 12"),
    // and CARDS_PER_ROW cards side by side.
    function exportExcelCards(cases, filename, opts) {
        opts = opts || {};
        return loadExcelJS().then(function (ExcelJS) {
            return Promise.all(cases.map(function (c) { return pngOf(c.img || caseImg(c.key)); })).then(function (pngs) {
                var wb = new ExcelJS.Workbook();
                wb.creator = "ZBTrain";
                wb.created = new Date();
                var tabs = {}, order = [];
                cases.forEach(function (c, i) {
                    var t = opts.tab ? opts.tab : caseTab(c.key);
                    if (!tabs[t]) { tabs[t] = []; order.push(t); }
                    tabs[t].push({ c: c, png: pngs[i] });
                });
                order.forEach(function (t) { addCardTab(wb, t, tabs[t], opts); });
                if (!order.length) addCardTab(wb, opts.tab || "Algs", [], opts);
                return wb.xlsx.writeBuffer();
            }).then(function (buf) {
                downloadBlob(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename + ".xlsx");
            });
        });
    }

    function addCardTab(wb, name, items, opts) {
        var ws = wb.addWorksheet(String(name).replace(/[\\\/?*\[\]:]/g, " ").slice(0, 31), {
            views: [{ showGridLines: false }],
        });
        var cols = [];
        for (var i = 0; i < CARDS_PER_ROW; i++) cols.push({ width: 46 });
        ws.columns = cols;

        var mono = { name: "Consolas", size: 10 };
        var row = 1;
        if (opts.title) {
            ws.getCell(row, 1).value = opts.title;
            ws.getCell(row, 1).font = { bold: true, size: 14 };
            row++;
            if (opts.subtitle) {
                ws.getCell(row, 1).value = opts.subtitle;
                ws.getCell(row, 1).font = { color: { argb: "FF666666" }, size: 10 };
                row++;
            }
            row++;
        }

        // Group the cards ("T Top", "F2L 12"), keeping their order
        var groups = [], byGroup = {};
        items.forEach(function (it) {
            var g = caseGroup(it.c.key) || name;
            if (!byGroup[g]) { byGroup[g] = []; groups.push(g); }
            byGroup[g].push(it);
        });

        groups.forEach(function (g) {
            var list = byGroup[g];
            ws.getCell(row, 1).value = g;
            ws.getCell(row, 1).font = { bold: true, size: 13, color: { argb: "FF1D4ED8" } };
            row++;
            for (var start = 0; start < list.length; start += CARDS_PER_ROW) {
                var band = list.slice(start, start + CARDS_PER_ROW);
                var algRows = band.reduce(function (n, it) { return Math.max(n, it.c.algs.length); }, 1);
                var hasStats = band.some(function (it) { return it.c.stats; });

                // Picture row
                ws.getRow(row).height = IMG_PX * 0.75 + 8; // points
                band.forEach(function (it, i) {
                    if (!it.png) return;
                    var id = wb.addImage({ base64: it.png, extension: "png" });
                    // Centred in its column: a width of 46 characters is about 327px (9525 EMU per px)
                    var EMU = 9525, colPx = 46 * 7 + 5;
                    ws.addImage(id, {
                        tl: { nativeCol: i, nativeColOff: Math.round(Math.max(0, colPx - IMG_PX) / 2 * EMU), nativeRow: row - 1, nativeRowOff: 4 * EMU },
                        ext: { width: IMG_PX, height: IMG_PX },
                        editAs: "oneCell",
                    });
                });
                row++;

                // Name row
                band.forEach(function (it, i) {
                    var cell = ws.getCell(row, i + 1);
                    cell.value = caseName(it.c.key);
                    cell.font = { bold: true, size: 12 };
                    cell.alignment = { horizontal: "center" };
                    cell.border = { bottom: { style: "thin", color: { argb: "FFCCCCCC" } } };
                });
                row++;

                // Stats row
                if (hasStats) {
                    band.forEach(function (it, i) {
                        var cell = ws.getCell(row, i + 1);
                        cell.value = it.c.stats || "No solves yet";
                        cell.font = { italic: true, size: 9, color: { argb: "FF666666" } };
                        cell.alignment = { horizontal: "center", wrapText: true };
                    });
                    ws.getRow(row).height = 26;
                    row++;
                }

                // Alg rows
                for (var a = 0; a < algRows; a++) {
                    band.forEach(function (it, i) {
                        var alg = it.c.algs[a];
                        if (!alg) return;
                        var cell = ws.getCell(row, i + 1);
                        cell.value = alg;
                        cell.font = Object.assign({}, mono, a === 0 && opts.boldFirst ? { bold: true } : {});
                        cell.alignment = { wrapText: true, vertical: "top" };
                    });
                    row++;
                }
                row++; // space between bands
            }
            row++;
        });
    }

    window.AlgSheets = {
        list: list,
        add: add,
        update: update,
        remove: remove,
        extraAlgs: extraAlgs,
        hideAlg: hideAlg,
        unhideAll: unhideAll,
        hiddenCount: hiddenCount,
        builtinLists: builtinLists,
        sourceOf: sourceOf,
        builtinOn: builtinOn,
        setBuiltinOn: setBuiltinOn,
        topOn: topOn,
        setTopOn: setTopOn,
        topAlgs: topAlgs,
        topUsesOf: topUsesOf,
        sameAlg: sameAlg,
        topData: topData,
        cleanAlg: cleanAlg,
        checkAlg: checkAlg,
        zblsSlotKey: zblsSlotKey,
        parseCaseName: parseCaseName,
        parseCSV: parseCSV,
        parseText: parseText,
        checkRows: checkRows,
        entriesFrom: entriesFrom,
        googleCsvUrl: googleCsvUrl,
        fetchGoogleSheet: fetchGoogleSheet,
        readFile: readFile,
        exportCSV: exportCSV,
        exportExcel: exportExcel,
        exportExcelCards: exportExcelCards,
        caseName: caseName,
        caseImg: caseImg,
        caseGroup: caseGroup,
        caseStats: caseStats,
        statsText: statsText,
    };
})(window);

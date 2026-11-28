// The Alg sheets page (sheets.html): your sheets, adding one (with the
// checker report), and exporting your algs. The work is in algSheets.js.

(function () {
    if (!window.AlgSheets) return;
    var $ = function (id) { return document.getElementById(id); };

    function esc(t) {
        return String(t == null ? "" : t).replace(/[&<>"]/g, function (ch) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
        });
    }

    // "ZBLS-12-3" → "F2L 12-3", "ZBLS-FL-12-3" → "F2L 12-3 (FL)"
    // "T-3-AsC" → "T-Top-AsC", "ZBLS-12-3" → "F2L 12-3"
    function caseLabel(key) { return AlgSheets.caseName(key); }

    // Case keys in the order ZBTrain lists them (T, U, L… then F2L 1, 2…)
    var keyOrder = null;
    function orderOf(key) {
        if (!keyOrder) {
            keyOrder = {};
            Srs.deckCases("ZBLL").concat(Srs.deckCases("ZBLS")).forEach(function (c, i) { keyOrder[c.key] = i; });
        }
        var base = key.replace(/^ZBLS-(FL|BR|BL)-/, "ZBLS-");
        var slot = { FL: 1, BR: 2, BL: 3 }[(/^ZBLS-(FL|BR|BL)-/.exec(key) || [])[1]] || 0;
        return (keyOrder[base] != null ? keyOrder[base] : 1e5) + slot * 1e6;
    }

    // [{ key, alg }] → one card per case for AlgSheets.exportExcelCards
    function cardsFrom(pairs, statsOf) {
        var by = {}, keys = [];
        pairs.forEach(function (p) {
            if (!by[p.key]) { by[p.key] = []; keys.push(p.key); }
            if (by[p.key].indexOf(p.alg) < 0) by[p.key].push(p.alg);
        });
        keys.sort(function (a, b) { return orderOf(a) - orderOf(b); });
        return keys.map(function (k) { return { key: k, algs: by[k], stats: statsOf ? statsOf(k) : null }; });
    }

    function excelError(e) { alert(e.message); }

    // ── Your sheets ─────────────────────────────────────────────────────

    // Built-in: the algs Xuanyi, Qixian and Tymon used in reconstructed solves
    function topRow() {
        var data = AlgSheets.topData && AlgSheets.topData();
        if (!data) return null;
        var on = AlgSheets.topOn();
        var zbll = 0, zbls = 0, solves = {};
        Object.keys(data).forEach(function (key) {
            data[key].forEach(function (e) {
                if (/^ZBLS-/.test(key)) zbls++; else zbll++;
                e[1].split(" ").forEach(function (r) { solves[r.replace(/^[a-z]+/, "")] = true; });
            });
        });
        var li = document.createElement("li");
        li.className = "sheet-row" + (on ? "" : " is-off");
        li.innerHTML =
            '<label class="switch-wrap" title="Use these algs in the trainer">' +
            '<input type="checkbox" class="sheet-toggle"' + (on ? " checked" : "") + ' aria-label="Use the top solvers\' algs in the trainer"></label>' +
            '<div class="sheet-info"><span class="sheet-name">Top solvers\' algs <span class="sheet-badge">Built in</span></span>' +
            '<span class="sheet-meta">What Xuanyi Geng, Qixian Cao and Tymon Kolasiński used in ' + Object.keys(solves).length +
            ' reconstructed solves · ' + zbll + " ZBLL, " + zbls + " ZBLS algs · " + Object.keys(data).length + " cases</span>" +
            '<span class="sheet-meta">Collected by <a href="https://x.com/zbller" target="_blank" rel="noopener">Yota Ueda</a> from ' +
            '<a href="https://reco.nz/" target="_blank" rel="noopener">reco.nz</a> · ' +
            '<a href="https://docs.google.com/spreadsheets/d/1wYaKvm1FQ8ZAJ4I_te8N75rowwn-9lgB1A8M8khfxVA" target="_blank" rel="noopener">Sheet</a>. ' +
            "Open a case's ⓘ to see the solves each alg was used in.</span></div>" +
            '<div class="sheet-actions">' +
            '<button type="button" class="btn btn-ghost btn-sm" data-act="xlsx">Excel</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-act="csv">CSV</button>' +
            "</div>";
        li.querySelector(".sheet-toggle").addEventListener("change", function (e) {
            AlgSheets.setTopOn(e.target.checked);
            renderSheets();
        });
        var rows = function () {
            var out = [["Case", "Alg", "Used by", "Reconstructions"]];
            Object.keys(data).sort(function (a, b) { return orderOf(a) - orderOf(b); }).forEach(function (key) {
                AlgSheets.topAlgs(key).forEach(function (e) {
                    var names = [];
                    e.recons.forEach(function (r) { if (names.indexOf(r.name) < 0) names.push(r.name); });
                    out.push([caseLabel(key), e.alg, names.join(", "), e.recons.map(function (r) { return r.url; }).join(" ")]);
                });
            });
            return out;
        };
        li.querySelector('[data-act="xlsx"]').addEventListener("click", function () {
            var pairs = [], usedBy = {};
            Object.keys(data).forEach(function (key) {
                AlgSheets.topAlgs(key).forEach(function (e) {
                    pairs.push({ key: key, alg: e.alg });
                    e.recons.forEach(function (r) {
                        var u = usedBy[key] || (usedBy[key] = []);
                        if (u.indexOf(r.name) < 0) u.push(r.name);
                    });
                });
            });
            AlgSheets.exportExcelCards(cardsFrom(pairs, function (k) { return usedBy[k] ? "Used by " + usedBy[k].join(", ") : null; }),
                "Top_solvers_algs", { title: "Top solvers' algs", subtitle: "Algs used in reconstructed solves, from reco.nz" }).catch(excelError);
        });
        li.querySelector('[data-act="csv"]').addEventListener("click", function () {
            AlgSheets.exportCSV(rows(), "Top_solvers_algs");
        });
        return li;
    }

    // Built in: algs from community collections (communityAlgs.js)
    function builtinRow(b) {
        var on = AlgSheets.builtinOn(b.id);
        var zbll = 0, zbls = 0, slots = {};
        Object.keys(b.algs || {}).forEach(function (key) {
            var n = b.algs[key].length;
            var m = /^ZBLS-(?:(FL|BR|BL)-)?/.exec(key);
            if (m) { zbls += n; slots[m[1] || "FR"] = true; } else zbll += n;
        });
        var li = document.createElement("li");
        li.className = "sheet-row" + (on ? "" : " is-off");
        li.innerHTML =
            '<label class="switch-wrap" title="Use these algs in the trainer">' +
            '<input type="checkbox" class="sheet-toggle"' + (on ? " checked" : "") + ' aria-label="Use ' + esc(b.name) + ' in the trainer"></label>' +
            '<div class="sheet-info"><span class="sheet-name">' + esc(b.name) + ' <span class="sheet-badge">Built in</span></span>' +
            '<span class="sheet-meta">' +
            [zbll ? zbll + " ZBLL algs" : "", zbls ? zbls + " ZBLS algs (" + ["FR", "FL", "BR", "BL"].filter(function (s) { return slots[s]; }).join(", ") + ")" : ""].filter(Boolean).join(" · ") +
            " · " + Object.keys(b.algs || {}).length + " cases · only algs ZBTrain didn't already have</span>" +
            '<span class="sheet-meta">By ' + esc(b.by) + " · " +
            '<a href="' + esc(b.url) + '" target="_blank" rel="noopener">' + (/docs\.google/.test(b.url) ? "Sheet" : "Website") + "</a>" +
            (b.note ? " · " + esc(b.note) : "") + "</span></div>" +
            '<div class="sheet-actions">' +
            '<button type="button" class="btn btn-ghost btn-sm" data-act="xlsx">Excel</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-act="csv">CSV</button>' +
            "</div>";
        li.querySelector(".sheet-toggle").addEventListener("change", function (e) {
            AlgSheets.setBuiltinOn(b.id, e.target.checked);
            renderSheets();
        });
        var rows = function () {
            var out = [["Case", "Alg"]];
            Object.keys(b.algs || {}).sort(function (a, b) { return orderOf(a) - orderOf(b); }).forEach(function (key) {
                b.algs[key].forEach(function (a) { out.push([caseLabel(key), a]); });
            });
            return out;
        };
        li.querySelector('[data-act="xlsx"]').addEventListener("click", function () {
            var pairs = [];
            Object.keys(b.algs || {}).forEach(function (key) {
                b.algs[key].forEach(function (a) { pairs.push({ key: key, alg: a }); });
            });
            AlgSheets.exportExcelCards(cardsFrom(pairs), fileName(b.name), { title: b.name, subtitle: "By " + b.by }).catch(excelError);
        });
        li.querySelector('[data-act="csv"]').addEventListener("click", function () {
            AlgSheets.exportCSV(rows(), fileName(b.name));
        });
        return li;
    }

    function renderSheets() {
        var sheets = AlgSheets.list();
        var root = $("sheetList");
        root.innerHTML = "";
        var ul = document.createElement("ul");
        ul.className = "sheet-list";
        var top = topRow();
        if (top) ul.appendChild(top);
        if (AlgSheets.builtinLists) AlgSheets.builtinLists().forEach(function (b) { ul.appendChild(builtinRow(b)); });
        if (!sheets.length) {
            root.appendChild(ul);
            root.insertAdjacentHTML("beforeend", '<p class="goal-text">None of your own sheets yet. Add one below.</p>');
            return;
        }
        sheets.forEach(function (s) {
            var zbll = 0, zbls = 0, cases = {};
            (s.entries || []).forEach(function (e) {
                if (/^ZBLS-/.test(e.key)) zbls++; else zbll++;
                cases[e.key] = true;
            });
            var src = s.source || {};
            var srcText = src.type === "url" ? '<a href="' + esc(src.url) + '" target="_blank" rel="noopener">Google Sheets</a>'
                : src.type === "file" ? esc(src.file || "File") : "Pasted";
            var li = document.createElement("li");
            li.className = "sheet-row" + (s.enabled ? "" : " is-off");
            li.innerHTML =
                '<label class="switch-wrap" title="Use these algs in the trainer">' +
                '<input type="checkbox" class="sheet-toggle"' + (s.enabled ? " checked" : "") + ' aria-label="Use ' + esc(s.name) + ' in the trainer"></label>' +
                '<div class="sheet-info"><span class="sheet-name">' + esc(s.name) + "</span>" +
                '<span class="sheet-meta">' +
                [zbll ? zbll + " ZBLL alg" + (zbll === 1 ? "" : "s") : "", zbls ? zbls + " ZBLS alg" + (zbls === 1 ? "" : "s") : ""].filter(Boolean).join(" · ") +
                " · " + Object.keys(cases).length + (Object.keys(cases).length === 1 ? " case · " : " cases · ") + srcText +
                " · added " + new Date(s.addedAt).toLocaleDateString() + "</span></div>" +
                '<div class="sheet-actions">' +
                (src.type === "url" ? '<button type="button" class="btn btn-ghost btn-sm" data-act="refresh">Refresh</button>' : "") +
                '<button type="button" class="btn btn-ghost btn-sm" data-act="xlsx">Excel</button>' +
                '<button type="button" class="btn btn-ghost btn-sm" data-act="csv">CSV</button>' +
                '<button type="button" class="btn btn-ghost btn-sm btn-danger-hover" data-act="remove">Remove</button>' +
                "</div>";
            li.querySelector(".sheet-toggle").addEventListener("change", function (e) {
                AlgSheets.update(s.id, { enabled: e.target.checked });
                renderSheets();
            });
            li.querySelectorAll("[data-act]").forEach(function (b) {
                b.addEventListener("click", function () { sheetAction(s, b.dataset.act, b); });
            });
            ul.appendChild(li);
        });
        root.appendChild(ul);
    }

    function sheetRows(s) {
        var rows = [["Case", "Alg"]];
        cardsFrom(s.entries || []).forEach(function (c) {
            c.algs.forEach(function (a) { rows.push([caseLabel(c.key), a]); });
        });
        return rows;
    }

    function fileName(name) {
        return String(name || "algs").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_") || "algs";
    }

    function sheetAction(s, act, btn) {
        if (act === "remove") {
            if (!confirm('Remove "' + s.name + '"? Its algs will no longer show in the trainer.')) return;
            AlgSheets.remove(s.id);
            renderSheets();
        } else if (act === "csv") {
            AlgSheets.exportCSV(sheetRows(s), fileName(s.name));
        } else if (act === "xlsx") {
            AlgSheets.exportExcelCards(cardsFrom(s.entries || []), fileName(s.name), { title: s.name }).catch(excelError);
        } else if (act === "refresh") {
            btn.disabled = true;
            btn.textContent = "Refreshing…";
            AlgSheets.fetchGoogleSheet(s.source.url).then(function (rows) {
                var report = AlgSheets.checkRows(rows);
                AlgSheets.update(s.id, { entries: AlgSheets.entriesFrom(report), refreshedAt: Date.now() });
                renderSheets();
            }).catch(function (e) {
                alert(e.message);
                renderSheets();
            });
        }
    }

    // ── Add a sheet ─────────────────────────────────────────────────────

    var source = "url";
    var current = null; // { report, source, defaultName }

    document.querySelectorAll(".source-tab").forEach(function (tab) {
        tab.addEventListener("click", function () {
            source = tab.dataset.source;
            document.querySelectorAll(".source-tab").forEach(function (t) {
                t.setAttribute("aria-selected", String(t === tab));
            });
            document.querySelectorAll(".source-panel").forEach(function (p) {
                p.hidden = p.dataset.panel !== source;
            });
        });
    });

    function setStatus(text, isError) {
        var s = $("addStatus");
        s.textContent = text || "";
        s.classList.toggle("is-error", !!isError);
    }

    function readSource() {
        if (source === "url") {
            var url = $("sheetUrl").value.trim();
            if (!url) return Promise.reject(new Error("Paste a link to a Google Sheet first."));
            return AlgSheets.fetchGoogleSheet(url).then(function (rows) {
                return { rows: rows, source: { type: "url", url: url }, name: "Google Sheet" };
            });
        }
        if (source === "file") {
            var f = $("sheetFile").files[0];
            if (!f) return Promise.reject(new Error("Choose a file first."));
            return AlgSheets.readFile(f).then(function (rows) {
                return { rows: rows, source: { type: "file", file: f.name }, name: f.name.replace(/\.[^.]+$/, "") };
            });
        }
        var text = $("sheetText").value;
        if (!text.trim()) return Promise.reject(new Error("Paste some algs first."));
        return Promise.resolve({ rows: AlgSheets.parseText(text), source: { type: "paste" }, name: "Pasted algs" });
    }

    $("checkBtn").addEventListener("click", function () {
        var btn = this;
        btn.disabled = true;
        setStatus("Checking…");
        $("report").hidden = true;
        readSource().then(function (r) {
            // Let the "Checking…" text show before the work starts
            return new Promise(function (res) { setTimeout(function () { res(r); }, 30); });
        }).then(function (r) {
            var report = AlgSheets.checkRows(r.rows);
            current = { report: report, source: r.source };
            if (!report.items.length) {
                setStatus("No algs found. Each alg needs at least 3 turns, in standard notation.", true);
                return;
            }
            setStatus("");
            $("sheetName").value = r.name;
            renderReport();
        }).catch(function (e) {
            setStatus(e.message, true);
        }).then(function () { btn.disabled = false; });
    });

    var filter = "problems";
    document.querySelectorAll(".report-filter .chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
            filter = chip.dataset.filter;
            document.querySelectorAll(".report-filter .chip").forEach(function (c) {
                c.setAttribute("aria-pressed", String(c === chip));
            });
            renderReport();
        });
    });

    function renderReport() {
        if (!current) return;
        var r = current.report, c = r.counts;
        $("report").hidden = false;
        $("reportSummary").innerHTML =
            '<span class="stat stat-ok"><b>' + c.ok + "</b> OK</span>" +
            '<span class="stat stat-warn" title="The row names a different case from the one the alg solves"><b>' + c.mismatch + "</b> different case</span>" +
            '<span class="stat stat-bad"><b>' + c.bad + "</b> not recognised</span>" +
            '<span class="stat"><b>' + c.cases + "</b> cases covered (" + c.ZBLL + " ZBLL, " + c.ZBLS + " ZBLS algs)</span>";
        var items = filter === "all" ? r.items : r.items.filter(function (it) { return it.status !== "ok"; });
        var shown = items.slice(0, 500);
        $("reportRows").innerHTML = shown.length
            ? shown.map(function (it) {
                var solves = it.result.ok ? esc(caseLabel(it.result.key)) : "—";
                var note = it.status === "ok" ? (it.expected ? "Matches" : "")
                    : it.status === "mismatch" ? "Row says " + esc(caseLabel(it.expected))
                    : esc(it.result.reason);
                return '<tr class="is-' + it.status + '"><td>' + it.row + '</td><td class="alg-cell">' + esc(it.alg) +
                    "</td><td>" + solves + "</td><td>" + note + "</td></tr>";
            }).join("") + (items.length > shown.length ? '<tr><td colspan="4">… and ' + (items.length - shown.length) + " more</td></tr>" : "")
            : '<tr><td colspan="4" class="report-empty">No problems found.</td></tr>';
        var savable = AlgSheets.entriesFrom(r).length;
        $("saveBtn").disabled = !savable;
        $("saveBtn").textContent = savable ? "Save sheet (" + savable + " algs)" : "Nothing to save";
    }

    $("saveBtn").addEventListener("click", function () {
        if (!current) return;
        var name = $("sheetName").value.trim() || "My sheet";
        AlgSheets.add({ name: name, source: current.source, entries: AlgSheets.entriesFrom(current.report) });
        current = null;
        $("report").hidden = true;
        setStatus('Saved "' + name + '". Its algs now show in the trainer.');
        renderSheets();
    });

    // ── Export your algs ────────────────────────────────────────────────

    function ownAlgs(c) {
        var key = c.set + "-" + c.subset + "-" + c.caseName;
        var saved = {};
        try { saved = JSON.parse(localStorage.getItem("customAlgs") || "{}"); } catch (e) {}
        if (saved[key]) return saved[key];
        if (c.set === "ZBLS") return ((zblsAlgs[c.subset] || {})[c.caseName] || []).slice();
        return (((zbllAlgs[c.set] || {})[c.subset] || {})[c.caseName] || []).slice();
    }

    function exportData() {
        var deck = $("exportDeck").value;
        var all = $("exportWhich").value === "all";
        var withSheets = $("exportSheets").checked;
        var withStats = $("exportStats").checked;
        var stats = withStats ? AlgSheets.caseStats() : {};
        var cases = Srs.deckCases(deck);
        var rows = [];
        var width = 1;
        cases.forEach(function (c) {
            var own = ownAlgs(c);
            var key = c.set + "-" + c.subset + "-" + c.caseName;
            var algs = withSheets ? own.concat(AlgSheets.extraAlgs(key, own)) : own;
            var mainIdx = parseInt(localStorage.getItem("mainAlg:" + key), 10) || 0;
            var main = algs[mainIdx] || algs[0] || "";
            var list = all ? [main].concat(algs.filter(function (a, i) { return i !== mainIdx && a !== main; })) : [main];
            width = Math.max(width, list.length);
            rows.push({ c: c, name: caseLabel(key), algs: list, stats: stats[key] || null });
        });
        var header = ["Case"];
        if (withStats) header.push("Solves", "Avg (s)", "Best (s)", "Recognition (s)", "Execution (s)", "TPS", "DNFs", "Last solve");
        for (var i = 0; i < width; i++) header.push(width === 1 ? "Alg" : i === 0 ? "Main alg" : "Alg " + (i + 1));
        function num(v, d) { return v == null ? "" : Number(v.toFixed(d)); }
        return {
            deck: deck,
            all: all,
            withStats: withStats,
            items: rows,
            table: [header].concat(rows.map(function (r) {
                var st = r.stats || {};
                var cells = [r.name];
                if (withStats) cells.push(st.solves || 0, num(st.avg, 2), num(st.best, 2), num(st.recog, 2), num(st.exec, 2),
                    num(st.tps, 1), st.dnfs || 0, st.last ? st.last.slice(0, 10) : "");
                return cells.concat(r.algs);
            })),
        };
    }

    function exportName(d) { return "ZBTrain_" + d.deck + (d.all ? "_all" : "_main"); }

    function exportStatus(t) { $("exportStatus").textContent = t || ""; }

    $("exportCsv").addEventListener("click", function () {
        var d = exportData();
        AlgSheets.exportCSV(d.table, exportName(d));
    });

    $("exportXlsx").addEventListener("click", function () {
        var d = exportData();
        exportStatus("Preparing Excel file…");
        var cards = d.items.map(function (r) {
            return { key: r.c.key, img: r.c.img, algs: r.algs, stats: d.withStats ? (AlgSheets.statsText(r.stats) || "No solves yet") : null };
        });
        AlgSheets.exportExcelCards(cards, exportName(d), {
            title: "ZBTrain · " + d.deck + " algs",
            subtitle: (d.all ? "Main alg in bold, then your other algs." : "Your main alg for each case.") +
                (d.withStats ? " Stats are your solves in the trainer, times in seconds." : "") +
                " Exported " + new Date().toLocaleDateString() + ".",
            boldFirst: d.all,
        }).then(function () { exportStatus(""); })
            .catch(function (e) { exportStatus(e.message); });
    });

    // PDF: a printable page with each case's image and algs
    $("exportPdf").addEventListener("click", function () {
        var d = exportData();
        var w = window.open("", "_blank");
        if (!w) { exportStatus("Allow pop-ups for this page to export a PDF."); return; }
        var base = location.href.replace(/[^\/]*$/, "");
        var rows = d.items.map(function (r) {
            return "<tr><td class=\"img\"><img src=\"" + esc(encodeURI(r.c.img)) + "\" alt=\"\"></td><td class=\"name\">" + esc(r.name) +
                (d.withStats && r.stats ? '<div class="stats">' + esc(AlgSheets.statsText(r.stats) || "") + "</div>" : "") +
                "</td><td>" + r.algs.map(function (a, i) {
                    return '<div class="alg' + (i === 0 && d.all ? " main" : "") + '">' + esc(a) + "</div>";
                }).join("") + "</td></tr>";
        }).join("");
        w.document.write(
            "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><base href=\"" + esc(base) + "\">" +
            "<title>" + esc(exportName(d)) + "</title><style>" +
            "body{font:13px/1.4 system-ui,sans-serif;color:#111;margin:24px}" +
            "h1{font-size:20px;margin:0 0 4px}p{color:#555;margin:0 0 16px}" +
            "table{width:100%;border-collapse:collapse}" +
            "tr{break-inside:avoid}td{border-bottom:1px solid #ddd;padding:6px 8px;vertical-align:middle}" +
            "td.img{width:64px}td.img img{width:56px;height:56px;object-fit:contain}" +
            "td.name{width:130px;font-weight:600}.stats{font-weight:400;font-size:11px;color:#666}" +
            ".alg{font-family:ui-monospace,Consolas,monospace;font-size:12px}.alg+.alg{color:#555}.alg.main{font-weight:700}" +
            "@page{margin:14mm}" +
            "</style></head><body><h1>ZBTrain · " + esc(d.deck) + " algs</h1><p>" +
            (d.all ? "Main alg in bold, then your other algs." : "Your main alg for each case.") +
            " Exported " + new Date().toLocaleDateString() + ".</p><table>" + rows + "</table>" +
            "<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>"
        );
        w.document.close();
    });

    renderSheets();
})();

// ZBLS case selection (zbls.html).
//
// Builds one card per F2L case (F2L 1-41) from the data in zblsData.js.
// Each card shows the first variant large; expanding it shows every
// edge-orientation variant. Selections are kept in localStorage and handed
// to trainer.html the same way the ZBLL page does (sessionStorage
// "selectedCases" as [{ set, subset, caseName }]).

(function () {
    var SET = "ZBLS";
    var STORAGE_KEY = "zblsSelection";
    var data = window.CASE_SETS && window.CASE_SETS[SET];
    var root = document.getElementById("zblsFamilies");
    if (!data || !root) return;

    var families = Object.keys(data.algs).sort(function (a, b) { return a - b; });
    var selected = {}; // "12-5" → true

    try {
        (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).forEach(function (k) { selected[k] = true; });
    } catch (e) {}

    function save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.keys(selected))); } catch (e) {}
    }

    function casesOf(family) {
        return Object.keys(data.algs[family]).sort(function (a, b) { return a - b; });
    }

    function key(family, c) { return family + "-" + c; }

    // ── Build the cards ────────────────────────────────────────────────

    function el(tag, cls, html) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html != null) n.innerHTML = html;
        return n;
    }

    families.forEach(function (family) {
        var cases = casesOf(family);
        var card = el("section", "zbll-set-container zbls-family");
        card.dataset.family = family;

        var header = el("div", "set-toggle-button");
        var toggle = el("button", null,
            '<span class="set-title"><b>F2L ' + family + "</b></span>" +
            '<span class="set-info"><span class="set-count"><span data-count>0</span>/' + cases.length + "</span>" +
            '<span class="subset-arrow" aria-hidden="true"></span></span>');
        toggle.type = "button";
        toggle.setAttribute("aria-expanded", "false");
        toggle.addEventListener("click", function () { setExpanded(card, !card.classList.contains("is-open")); });
        header.appendChild(toggle);
        card.appendChild(header);

        var content = el("div", "set-content");
        var main = el("div", "zbll-card main-card");
        var preview = el("button", "main-angle-button");
        preview.type = "button";
        preview.title = "Select or clear every case of F2L " + family;
        preview.innerHTML = '<img class="main-angle-svg zbls-preview" alt="F2L ' + family + '" src="' + data.img(family, cases[0]) + '">';
        preview.addEventListener("click", function () {
            var all = cases.every(function (c) { return selected[key(family, c)]; });
            cases.forEach(function (c) { setCase(family, c, !all); });
            refresh();
        });
        main.appendChild(preview);
        content.appendChild(main);

        var grid = el("div", "subsets-wrapper zbls-grid");
        grid.style.display = "none";
        cases.forEach(function (c) {
            var item = el("button", "zbll-card zbls-case");
            item.type = "button";
            item.dataset.key = key(family, c);
            item.setAttribute("aria-pressed", "false");
            item.innerHTML =
                '<span class="main-image-container"><img class="subset-orientation" loading="lazy" alt="" src="' + data.img(family, c) + '"></span>' +
                '<span class="subset-title">' + data.name(family, c) + "</span>";
            item.addEventListener("click", function () {
                setCase(family, c, !selected[key(family, c)]);
                refresh();
            });
            // ⓘ next to the tile (a button can't go inside another button)
            var wrap = el("div", "zbls-case-wrap");
            wrap.appendChild(item);
            if (window.CaseInfo) {
                var info = el("button", "case-info-btn", "i");
                info.type = "button";
                info.title = "Setup and algs";
                info.setAttribute("aria-label", "Setup and algs for " + data.name(family, c));
                // In the slot you're training (FR if it's ticked, else the first ticked one)
                info.addEventListener("click", function () {
                    var slots = window.ZBLSSlots ? chosenSlots() : ["FR"];
                    var slot = slots.indexOf("FR") >= 0 || !slots.length ? "FR" : slots[0];
                    CaseInfo.open(window.ZBLSSlots ? ZBLSSlots.key(family, c, slot) : "ZBLS-" + family + "-" + c);
                });
                wrap.appendChild(info);
            }
            grid.appendChild(wrap);
        });
        content.appendChild(grid);
        card.appendChild(content);
        root.appendChild(card);
    });

    // ── State ─────────────────────────────────────────────────────────

    function setCase(family, c, on) {
        if (on) selected[key(family, c)] = true;
        else delete selected[key(family, c)];
    }

    function setExpanded(card, open) {
        card.classList.toggle("is-open", open);
        card.querySelector(".zbls-grid").style.display = open ? "grid" : "none";
        card.querySelector(".set-toggle-button button").setAttribute("aria-expanded", String(open));
        card.querySelector(".subset-arrow").classList.toggle("is-open", open);
    }

    function refresh() {
        var total = 0;
        root.querySelectorAll(".zbls-family").forEach(function (card) {
            var family = card.dataset.family;
            var cases = casesOf(family);
            var n = cases.filter(function (c) { return selected[key(family, c)]; }).length;
            total += n;
            card.querySelector("[data-count]").textContent = n;
            var img = card.querySelector(".zbls-preview");
            img.classList.toggle("selected-all", n === cases.length);
            img.classList.toggle("selected-some", n > 0 && n < cases.length);
            card.querySelectorAll(".zbls-case").forEach(function (item) {
                var on = !!selected[item.dataset.key];
                item.classList.toggle("all-selected", on);
                item.setAttribute("aria-pressed", String(on));
                item.querySelector("img").classList.toggle("selected-all", on);
            });
        });
        document.getElementById("selected").textContent = total + " case" + (total === 1 ? "" : "s") + " selected";
        document.getElementById("start").disabled = total === 0;
        document.getElementById("recap").disabled = total === 0;
        save();
    }

    // ── Sidebar ───────────────────────────────────────────────────────

    function selectAll(on) {
        families.forEach(function (f) { casesOf(f).forEach(function (c) { setCase(f, c, on); }); });
        refresh();
    }

    // ── Slots and edge position (zblsSlotTools.js) ────────────────────
    var slotBoxes = document.querySelectorAll("#slotPicks input");
    var edgeSelect = document.getElementById("edgeFix");

    function chosenSlots() {
        var s = [];
        slotBoxes.forEach(function (b) { if (b.checked) s.push(b.value); });
        return s;
    }

    function updateSlotHint() {
        var hint = document.getElementById("slotHint");
        if (!hint || !window.ZBLSSlots) return;
        var notes = chosenSlots().filter(function (s) { return s !== "FR"; }).map(function (s) {
            var cov = ZBLSSlots.coverage(s);
            return cov >= 1 ? s + ": algs for every case"
                : s + ": algs for " + Math.round(cov * 100) + "% of cases; the rest use a " + ZBLSSlots.TURN[s] + " then the FR alg";
        });
        hint.textContent = notes.length ? notes.join(". ") + "." : "Train the last slot in front right, or add other slots.";
    }

    if (window.ZBLSSlots) {
        var saved = ZBLSSlots.savedSlots();
        slotBoxes.forEach(function (b) {
            b.checked = saved.indexOf(b.value) >= 0;
            b.addEventListener("change", function () {
                // Always keep at least one slot
                if (!chosenSlots().length) b.checked = true;
                try { localStorage.setItem("zblsSlots", JSON.stringify(chosenSlots())); } catch (e) {}
                updateSlotHint();
            });
        });
        if (edgeSelect) {
            edgeSelect.value = ZBLSSlots.savedEdge();
            edgeSelect.addEventListener("change", function () {
                try { localStorage.setItem("zblsEdgeFix", edgeSelect.value); } catch (e) {}
            });
        }
        updateSlotHint();
    }

    // One trainer case per selected case and slot
    function startTraining(isRecap) {
        var list = [];
        var slots = window.ZBLSSlots ? chosenSlots() : ["FR"];
        families.forEach(function (f) {
            casesOf(f).forEach(function (c) {
                if (!selected[key(f, c)]) return;
                slots.forEach(function (slot) {
                    list.push({ set: SET, subset: f, caseName: c, slot: slot });
                });
            });
        });
        if (!list.length) return;
        sessionStorage.setItem("selectedCases", JSON.stringify(list));
        sessionStorage.setItem("recapMode", JSON.stringify(!!isRecap));
        location.href = location.pathname.replace(/zbls\.html$/, "") + "trainer.html";
    }

    // ── Presets: named selections, kept in localStorage ───────────────

    var PRESET_KEY = "zblsPresets";
    var presetList = document.getElementById("zblsPresetList");
    var presetName = document.getElementById("zblsPresetName");

    function loadPresets() {
        try { return JSON.parse(localStorage.getItem(PRESET_KEY)) || {}; } catch (e) { return {}; }
    }

    function savePresets(p) {
        try { localStorage.setItem(PRESET_KEY, JSON.stringify(p)); } catch (e) {}
    }

    function renderPresets(selectName) {
        var presets = loadPresets();
        var names = Object.keys(presets).sort(function (a, b) { return a.localeCompare(b); });
        presetList.innerHTML = "";
        names.forEach(function (name) {
            var opt = document.createElement("option");
            opt.value = name;
            opt.textContent = name + " (" + presets[name].length + ")";
            presetList.appendChild(opt);
        });
        if (selectName) presetList.value = selectName;
        presetList.hidden = !names.length;
        document.getElementById("zblsPresetEmpty").hidden = !!names.length;
    }

    document.getElementById("zblsPresetSave").addEventListener("click", function () {
        var name = presetName.value.trim() || presetList.value;
        var keys = Object.keys(selected);
        if (!name || !keys.length) {
            presetName.focus();
            return;
        }
        var presets = loadPresets();
        if (presets[name] && !confirm('Replace the preset "' + name + '"?')) return;
        presets[name] = keys;
        savePresets(presets);
        presetName.value = "";
        renderPresets(name);
    });

    function loadSelectedPreset() {
        var keys = loadPresets()[presetList.value];
        if (!keys) return;
        selected = {};
        keys.forEach(function (k) { selected[k] = true; });
        refresh();
    }

    document.getElementById("zblsPresetLoad").addEventListener("click", loadSelectedPreset);
    presetList.addEventListener("dblclick", loadSelectedPreset);

    document.getElementById("zblsPresetDelete").addEventListener("click", function () {
        var name = presetList.value;
        if (!name || !confirm('Delete the preset "' + name + '"?')) return;
        var presets = loadPresets();
        delete presets[name];
        savePresets(presets);
        renderPresets();
    });

    presetName.addEventListener("keydown", function (e) {
        if (e.key === "Enter") document.getElementById("zblsPresetSave").click();
    });

    renderPresets();

    document.getElementById("selectAll").addEventListener("click", function () { selectAll(true); });
    document.getElementById("deselectAll").addEventListener("click", function () { selectAll(false); });
    document.getElementById("expandAll").addEventListener("click", function () {
        root.querySelectorAll(".zbls-family").forEach(function (c) { setExpanded(c, true); });
    });
    document.getElementById("collapseAll").addEventListener("click", function () {
        root.querySelectorAll(".zbls-family").forEach(function (c) { setExpanded(c, false); });
    });
    document.getElementById("start").addEventListener("click", function () { startTraining(false); });
    document.getElementById("recap").addEventListener("click", function () { startTraining(true); });

    refresh();
})();

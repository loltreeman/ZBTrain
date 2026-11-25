// Presets from the trainer: save cases to a preset without going back to the
// case selection page. Uses the same storage as the selection pages, so the
// presets show up there as usual.
//
//   ZBLL (presets.js):     localStorage "preset_<id>" = { id, name, modalSelections, activeOrientation }
//                          and "presetOrder" = [id, …]
//                          modalSelections = { "T-2GLL": { CsA: true, … }, … }
//   ZBLS (zblsSelect.js):  localStorage "zblsPresets" = { name: ["12-3", …] }
//
// cases are trainer case objects ({ set, subset, caseName, slot }).
// ZBLS presets don't store the slot: the ZBLS page's slot boxes choose it.

(function (window) {
    function read(key, fallback) {
        try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
    }
    function write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    function uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0;
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
    }

    function deckOf(cases) {
        return cases.length && cases[0].set === "ZBLS" ? "ZBLS" : "ZBLL";
    }

    // [{ id, name, count }] for a deck
    function list(deck) {
        if (deck === "ZBLS") {
            var z = read("zblsPresets", {});
            return Object.keys(z).sort(function (a, b) { return a.localeCompare(b); })
                .map(function (name) { return { id: name, name: name, count: (z[name] || []).length }; });
        }
        return read("presetOrder", []).map(function (id) {
            var p = read("preset_" + id, null);
            if (!p) return null;
            var count = 0;
            Object.keys(p.modalSelections || {}).forEach(function (k) {
                Object.keys(p.modalSelections[k]).forEach(function (c) { if (p.modalSelections[k][c]) count++; });
            });
            return { id: id, name: p.name || "(No name)", count: count };
        }).filter(Boolean);
    }

    // Add cases to a preset (id from list()), or to a new one when id is empty.
    // Returns { name, added } (added: how many weren't in it already).
    function add(deck, id, cases, newName) {
        var added = 0;
        if (deck === "ZBLS") {
            var z = read("zblsPresets", {});
            var name = id || String(newName || "").trim();
            if (!name) throw new Error("Give the new preset a name.");
            if (!id && z[name]) throw new Error('There is already a preset called "' + name + '".');
            var keys = z[name] || [];
            cases.forEach(function (c) {
                var k = c.subset + "-" + c.caseName;
                if (keys.indexOf(k) < 0) { keys.push(k); added++; }
            });
            z[name] = keys;
            write("zblsPresets", z);
            return { name: name, added: added };
        }
        var preset;
        if (id) {
            preset = read("preset_" + id, null);
            if (!preset) throw new Error("That preset no longer exists.");
        } else {
            var title = String(newName || "").trim();
            if (!title) throw new Error("Give the new preset a name.");
            var orientation = {};
            try { orientation = JSON.parse(sessionStorage.getItem("caseOrientation") || "{}") || {}; } catch (e) {}
            preset = { id: uuid(), name: title, modalSelections: {}, activeOrientation: orientation };
            var order = read("presetOrder", []);
            order.push(preset.id);
            write("presetOrder", order);
        }
        preset.modalSelections = preset.modalSelections || {};
        cases.forEach(function (c) {
            var k = c.set + "-" + c.subset;
            var sel = (preset.modalSelections[k] = preset.modalSelections[k] || {});
            if (!sel[c.caseName]) { sel[c.caseName] = true; added++; }
        });
        write("preset_" + preset.id, preset);
        return { name: preset.name, added: added };
    }

    // A small "save to a preset" control: a list of presets (or a new one),
    // a name box for a new one, and a button. getCases() is read on save.
    function picker(container, getCases, opts) {
        opts = opts || {};
        var deck = opts.deck || deckOf(getCases());
        container.classList.add("preset-picker");
        container.innerHTML =
            '<select class="input preset-picker-list" aria-label="Preset"></select>' +
            '<input type="text" class="input preset-picker-name" maxlength="60" placeholder="New preset name" aria-label="New preset name">' +
            '<button type="button" class="btn btn-secondary btn-sm preset-picker-save">' + (opts.label || "Save") + "</button>" +
            '<span class="preset-picker-status" role="status"></span>';
        var sel = container.querySelector(".preset-picker-list");
        var name = container.querySelector(".preset-picker-name");
        var btn = container.querySelector(".preset-picker-save");
        var status = container.querySelector(".preset-picker-status");

        function fill(selectId) {
            var items = list(deck);
            sel.innerHTML = '<option value="">New preset…</option>' + items.map(function (p) {
                return '<option value="' + String(p.id).replace(/"/g, "&quot;") + '">' +
                    String(p.name).replace(/[&<>]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]; }) +
                    " (" + p.count + ")</option>";
            }).join("");
            if (selectId != null) sel.value = selectId;
            name.hidden = !!sel.value;
        }
        sel.addEventListener("change", function () { name.hidden = !!sel.value; if (!sel.value) name.focus(); });
        name.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); btn.click(); } e.stopPropagation(); });
        name.addEventListener("keyup", function (e) { e.stopPropagation(); });
        btn.addEventListener("click", function () {
            var cases = getCases();
            if (!cases.length) { status.textContent = "Tick some cases first."; return; }
            try {
                var r = add(deck, sel.value, cases, name.value);
                name.value = "";
                fill(deck === "ZBLS" ? r.name : (sel.value || list(deck).slice(-1)[0].id));
                status.textContent = r.added
                    ? "Added " + r.added + " case" + (r.added === 1 ? "" : "s") + ' to "' + r.name + '".'
                    : 'Already in "' + r.name + '".';
                if (opts.onSaved) opts.onSaved(r);
            } catch (e) {
                status.textContent = e.message;
            }
        });
        fill();
        return { refresh: fill };
    }

    window.PresetStore = { list: list, add: add, picker: picker, deckOf: deckOf };
})(window);

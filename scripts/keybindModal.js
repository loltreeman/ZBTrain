(function () {
    var MODAL_ID = "keybindModal";
    var listeningRow = null; // { entry, tr, btn }
    var escapeHandler = null;
    var editorMode = false;
    var selectedKeyEl = null; // currently selected key tile in editor

    function getVC() {
        return window.virtualCube || null;
    }

    var MOVE_LIST = [
        // Face moves
        { method: "rotate_f", label: "F", category: "Face Moves" },
        { method: "rotate_fp", label: "F'", category: "Face Moves" },
        { method: "rotate_r", label: "R", category: "Face Moves" },
        { method: "rotate_rp", label: "R'", category: "Face Moves" },
        { method: "rotate_u", label: "U", category: "Face Moves" },
        { method: "rotate_up", label: "U'", category: "Face Moves" },
        { method: "rotate_b", label: "B", category: "Face Moves" },
        { method: "rotate_bp", label: "B'", category: "Face Moves" },
        { method: "rotate_l", label: "L", category: "Face Moves" },
        { method: "rotate_lp", label: "L'", category: "Face Moves" },
        { method: "rotate_d", label: "D", category: "Face Moves" },
        { method: "rotate_dp", label: "D'", category: "Face Moves" },
        // Wide moves
        { method: "rotate_R", label: "r", category: "Wide Moves" },
        { method: "rotate_Rp", label: "r'", category: "Wide Moves" },
        { method: "rotate_L", label: "l", category: "Wide Moves" },
        { method: "rotate_Lp", label: "l'", category: "Wide Moves" },
        // Slice moves
        { method: "rotate_m", label: "M", category: "Slice Moves" },
        { method: "rotate_mp", label: "M'", category: "Slice Moves" },
        { method: "rotate_e", label: "E", category: "Slice Moves" },
        { method: "rotate_ep", label: "E'", category: "Slice Moves" },
        { method: "rotate_s", label: "S", category: "Slice Moves" },
        { method: "rotate_sp", label: "S'", category: "Slice Moves" },
        // Cube rotations
        { method: "rotate_x", label: "x", category: "Cube Rotations" },
        { method: "rotate_xp", label: "x'", category: "Cube Rotations" },
        { method: "rotate_y", label: "y", category: "Cube Rotations" },
        { method: "rotate_yp", label: "y'", category: "Cube Rotations" },
        { method: "rotate_z", label: "z", category: "Cube Rotations" },
        { method: "rotate_zp", label: "z'", category: "Cube Rotations" },
    ];

    // Physical QWERTY rows shown in the keyboard editor
    var KB_ROWS = [
        { keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"], offset: 0 },
        { keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"], offset: 22 },
        { keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"], offset: 38 },
        { keys: ["z", "x", "c", "v", "b", "n", "m"], offset: 58 },
    ];

    // Extra special chars that non-QWERTY layouts may bind
    var EXTRA_CHARS = ["'", ",", ".", "`", "-", "=", "[", "]", "\\", "/"];

    // ─── Helpers ──────────────────────────────────────────────────────────────

    function keyLabel(k) {
        if (!k) return "\u2014";
        if (k === " ") return "Space";
        if (k.length === 1) return k.toUpperCase();
        return k;
    }

    function invertMap(bindings) {
        var inv = {};
        Object.keys(bindings).forEach(function (k) {
            var m = bindings[k];
            if (!inv[m]) inv[m] = [];
            inv[m].push(k);
        });
        return inv;
    }

    function getMethodLabel(method) {
        for (var i = 0; i < MOVE_LIST.length; i++) {
            if (MOVE_LIST[i].method === method) return MOVE_LIST[i].label;
        }
        return method;
    }

    // ─── Modal ────────────────────────────────────────────────────────────────

    function buildModal() {
        var existing = document.getElementById(MODAL_ID);
        if (existing) existing.remove();

        var vc = getVC();
        if (!vc) { alert("Virtual cube not initialised."); return; }

        editorMode = false;
        selectedKeyEl = null;

        // overlay
        var overlay = document.createElement("div");
        overlay.id = MODAL_ID;
        overlay.className = "kb-overlay";
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) closeModal();
        });

        // card
        var card = document.createElement("div");
        card.className = "kb-card";

        // ── Header ──────────────────────────────────────────────────────────
        var header = document.createElement("div");
        header.className = "kb-header";

        var headerLeft = document.createElement("div");
        var headerLabel = document.createElement("p");
        headerLabel.className = "kb-header-label";
        headerLabel.textContent = "Virtual Cube";
        var headerTitle = document.createElement("h2");
        headerTitle.className = "kb-header-title";
        headerTitle.textContent = "\u2328\uFE0F Keybind Settings";
        headerLeft.appendChild(headerLabel);
        headerLeft.appendChild(headerTitle);

        var closeBtn = document.createElement("button");
        closeBtn.className = "kb-close";
        closeBtn.id = "kb-close-btn";
        closeBtn.title = "Close";
        closeBtn.textContent = "\u2715";
        closeBtn.addEventListener("click", closeModal);

        header.appendChild(headerLeft);
        header.appendChild(closeBtn);
        card.appendChild(header);

        // ── Layout Bar ──────────────────────────────────────────────────────
        var layoutBar = buildLayoutBar(vc);
        card.appendChild(layoutBar);

        // ── View Toggle ─────────────────────────────────────────────────────
        var viewBar = document.createElement("div");
        viewBar.className = "kb-view-toggle-bar";

        var listViewBtn = document.createElement("button");
        listViewBtn.className = "kb-view-btn kb-view-btn-active";
        listViewBtn.id = "kb-list-view-btn";
        listViewBtn.textContent = "Move List";

        var editorViewBtn = document.createElement("button");
        editorViewBtn.className = "kb-view-btn";
        editorViewBtn.id = "kb-editor-view-btn";
        editorViewBtn.textContent = "\u2328 Edit Layout";

        viewBar.appendChild(listViewBtn);
        viewBar.appendChild(editorViewBtn);
        card.appendChild(viewBar);

        // ── Hint ────────────────────────────────────────────────────────────
        var hint = document.createElement("p");
        hint.className = "kb-hint";
        hint.id = "kb-hint-text";
        hint.textContent = "Click \u201CRebind\u201D next to any move, then press the key you want to assign to it.";
        card.appendChild(hint);

        // ── Move List Body ───────────────────────────────────────────────────
        var moveBody = buildMoveListBody(vc);
        moveBody.id = "kb-move-list-body";
        card.appendChild(moveBody);

        // ── Keyboard Editor Body (hidden) ────────────────────────────────────
        var editorBody = document.createElement("div");
        editorBody.className = "kb-body kb-editor-body";
        editorBody.id = "kb-editor-body";
        editorBody.style.display = "none";
        card.appendChild(editorBody);

        // ── Footer ───────────────────────────────────────────────────────────
        var footer = document.createElement("div");
        footer.className = "kb-footer";

        var resetBtn = document.createElement("button");
        resetBtn.className = "kb-reset-btn";
        resetBtn.id = "kb-reset-btn";
        resetBtn.textContent = "\u21BA Reset to Defaults";
        resetBtn.addEventListener("click", function () {
            if (confirm("Reset all keybinds to their defaults?")) {
                vc.resetKeybinds();
                closeModal();
                openKeybindModal();
            }
        });

        var doneBtn = document.createElement("button");
        doneBtn.className = "kb-done-btn";
        doneBtn.textContent = "Done";
        doneBtn.addEventListener("click", closeModal);

        footer.appendChild(resetBtn);
        footer.appendChild(doneBtn);
        card.appendChild(footer);

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        // ── Wire up view toggle ───────────────────────────────────────────────
        listViewBtn.addEventListener("click", function () {
            if (!editorMode) return;
            editorMode = false;
            listViewBtn.classList.add("kb-view-btn-active");
            editorViewBtn.classList.remove("kb-view-btn-active");
            moveBody.style.display = "";
            editorBody.style.display = "none";
            hint.textContent = "Click \u201CRebind\u201D next to any move, then press the key you want to assign to it.";
            card.classList.remove("kb-card-wide");
        });

        editorViewBtn.addEventListener("click", function () {
            if (editorMode) return;
            editorMode = true;
            editorViewBtn.classList.add("kb-view-btn-active");
            listViewBtn.classList.remove("kb-view-btn-active");
            moveBody.style.display = "none";
            editorBody.style.display = "";
            hint.textContent = "Click a key to assign a move. Use \u201C+ Save Layout\u201D to create a named preset.";
            card.classList.add("kb-card-wide");
            buildKeyboardEditorContent(vc, editorBody);
        });

        // ── Escape handler ────────────────────────────────────────────────────
        escapeHandler = function (e) {
            if (e.key === "Escape") {
                if (listeningRow) stopListening();
                else closeModal();
            }
        };
        document.addEventListener("keydown", escapeHandler, true);

        requestAnimationFrame(function () { overlay.classList.add("kb-visible"); });
    }

    // ─── Layout Bar ───────────────────────────────────────────────────────────

    function buildLayoutBar(vc) {
        var bar = document.createElement("div");
        bar.className = "kb-layout-bar";
        bar.id = "kb-layout-bar";
        populateLayoutBar(vc, bar);
        return bar;
    }

    function populateLayoutBar(vc, bar) {
        bar.innerHTML = "";

        if (typeof vc.getLayouts !== "function") return;

        var layouts = vc.getLayouts();
        var activeName = typeof vc.getActiveLayoutName === "function"
            ? vc.getActiveLayoutName() : "QWERTY";

        Object.keys(layouts).forEach(function (name) {
            var info = layouts[name];
            var pill = document.createElement("button");
            pill.className = "kb-layout-pill" + (name === activeName ? " kb-layout-pill-active" : "");

            var nameSpan = document.createElement("span");
            nameSpan.textContent = name;
            pill.appendChild(nameSpan);

            pill.addEventListener("click", function () {
                if (name === vc.getActiveLayoutName()) return;
                vc.applyLayout(name);
                var bar2 = document.getElementById("kb-layout-bar");
                if (bar2) populateLayoutBar(vc, bar2);
                refreshMoveList(vc);
                if (editorMode) {
                    var eb = document.getElementById("kb-editor-body");
                    if (eb) buildKeyboardEditorContent(vc, eb);
                }
            });

            // Delete button for custom layouts
            if (!info.builtin) {
                var delBtn = document.createElement("button");
                delBtn.className = "kb-layout-del";
                delBtn.title = "Delete layout \u201C" + name + "\u201D";
                delBtn.textContent = "\u2715";
                delBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    if (confirm("Delete custom layout \u201C" + name + "\u201D?")) {
                        vc.deleteCustomLayout(name);
                        var bar2 = document.getElementById("kb-layout-bar");
                        if (bar2) populateLayoutBar(vc, bar2);
                    }
                });
                pill.appendChild(delBtn);
            }

            bar.appendChild(pill);
        });

        // "+ Save Layout" button
        var saveBtn = document.createElement("button");
        saveBtn.className = "kb-layout-save-btn";
        saveBtn.title = "Save current bindings as a named custom layout";
        saveBtn.textContent = "+ Save Layout";
        saveBtn.addEventListener("click", function () {
            var name = prompt("Name for this custom layout:");
            if (!name || !name.trim()) return;
            name = name.trim();
            vc.saveCustomLayout(name, vc.getKeybinds());
            var bar2 = document.getElementById("kb-layout-bar");
            if (bar2) populateLayoutBar(vc, bar2);
        });
        bar.appendChild(saveBtn);
    }

    // ─── Move List ────────────────────────────────────────────────────────────

    function buildMoveListBody(vc) {
        var bindings = vc.getKeybinds();
        var inv = invertMap(bindings);

        var body = document.createElement("div");
        body.className = "kb-body";

        var currentCategory = null;
        MOVE_LIST.forEach(function (entry) {
            if (entry.category !== currentCategory) {
                currentCategory = entry.category;
                var catHead = document.createElement("div");
                catHead.className = "kb-category-head";
                catHead.textContent = currentCategory;
                body.appendChild(catHead);
            }

            var keys = inv[entry.method] || [];
            var tr = document.createElement("div");
            tr.className = "kb-row";
            tr.dataset.method = entry.method;

            var moveCell = document.createElement("span");
            moveCell.className = "kb-move-label";
            moveCell.textContent = entry.label;

            var keyCell = document.createElement("span");
            keyCell.className = "kb-key-cell";
            renderKeyCell(keyCell, keys);

            var rebindBtn = document.createElement("button");
            rebindBtn.className = "kb-rebind-btn";
            rebindBtn.textContent = "Rebind";
            rebindBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                startListening(entry, tr, rebindBtn);
            });

            var warnEl = document.createElement("span");
            warnEl.className = "kb-warn";

            tr.appendChild(moveCell);
            tr.appendChild(keyCell);
            tr.appendChild(rebindBtn);
            tr.appendChild(warnEl);
            body.appendChild(tr);
        });

        return body;
    }

    function refreshMoveList(vc) {
        var bindings = vc.getKeybinds();
        var inv = invertMap(bindings);
        MOVE_LIST.forEach(function (entry) {
            var rows = document.querySelectorAll(".kb-row[data-method=\"" + entry.method + "\"]");
            rows.forEach(function (row) {
                var keyCell = row.querySelector(".kb-key-cell");
                if (keyCell) renderKeyCell(keyCell, inv[entry.method] || []);
                var btn = row.querySelector(".kb-rebind-btn");
                if (btn && btn.textContent !== "Rebind") btn.textContent = "Rebind";
            });
        });
    }

    // ─── Keyboard Editor ──────────────────────────────────────────────────────

    function buildKeyboardEditorContent(vc, editorBody) {
        editorBody.innerHTML = "";
        selectedKeyEl = null;

        var bindings = vc.getKeybinds();

        // Build the visual keyboard
        var kbWrap = document.createElement("div");
        kbWrap.className = "kb-keyboard-wrap";

        var allRowKeys = {};
        KB_ROWS.forEach(function (rowDef) {
            var rowEl = document.createElement("div");
            rowEl.className = "kb-key-row";
            rowEl.style.paddingLeft = rowDef.offset + "px";

            rowDef.keys.forEach(function (k) {
                allRowKeys[k] = true;
                rowEl.appendChild(createKeyTile(k, bindings[k] || null, vc, editorBody, kbWrap));
            });
            kbWrap.appendChild(rowEl);
        });

        // Extra row: any bound special chars not in main rows
        var extraBound = [];
        EXTRA_CHARS.forEach(function (k) {
            if (bindings[k]) extraBound.push(k);
        });
        Object.keys(bindings).forEach(function (k) {
            if (!allRowKeys[k] && k.length === 1 && EXTRA_CHARS.indexOf(k) === -1) {
                extraBound.push(k);
            }
        });

        if (extraBound.length > 0) {
            var extraRow = document.createElement("div");
            extraRow.className = "kb-key-row kb-key-row-extra";
            var extraLbl = document.createElement("span");
            extraLbl.className = "kb-extra-label";
            extraLbl.textContent = "Other:";
            extraRow.appendChild(extraLbl);
            extraBound.forEach(function (k) {
                extraRow.appendChild(createKeyTile(k, bindings[k] || null, vc, editorBody, kbWrap));
            });
            kbWrap.appendChild(extraRow);
        }

        editorBody.appendChild(kbWrap);

        // Move picker panel (hidden initially)
        var pickerPanel = document.createElement("div");
        pickerPanel.className = "kb-move-picker";
        pickerPanel.style.display = "none";
        editorBody.appendChild(pickerPanel);
    }

    function createKeyTile(k, method, vc, editorBody, kbWrap) {
        var tile = document.createElement("div");
        tile.className = "kb-key" + (method ? " kb-key-bound" : "");
        tile.dataset.key = k;

        var physLbl = document.createElement("span");
        physLbl.className = "kb-key-phys";
        physLbl.textContent = (k.length === 1 && k >= "a" && k <= "z") ? k.toUpperCase() : k;
        tile.appendChild(physLbl);

        var moveLbl = document.createElement("span");
        moveLbl.className = "kb-key-move" + (method ? " kb-key-move-bound" : "");
        moveLbl.textContent = method ? getMethodLabel(method) : "";
        tile.appendChild(moveLbl);

        tile.addEventListener("click", function () {
            if (selectedKeyEl === tile) {
                tile.classList.remove("kb-key-selected");
                selectedKeyEl = null;
                var picker = editorBody.querySelector(".kb-move-picker");
                if (picker) picker.style.display = "none";
                return;
            }
            if (selectedKeyEl) selectedKeyEl.classList.remove("kb-key-selected");
            selectedKeyEl = tile;
            tile.classList.add("kb-key-selected");
            showMovePicker(k, vc, editorBody, kbWrap);
        });

        return tile;
    }

    function showMovePicker(selectedKey, vc, editorBody, kbWrap) {
        var picker = editorBody.querySelector(".kb-move-picker");
        if (!picker) return;
        picker.innerHTML = "";
        picker.style.display = "";

        var bindings = vc.getKeybinds();
        var currentMethod = bindings[selectedKey] || null;

        // Title
        var title = document.createElement("div");
        title.className = "kb-picker-title";
        var displayKey = (selectedKey.length === 1 && selectedKey >= "a" && selectedKey <= "z")
            ? selectedKey.toUpperCase() : selectedKey;
        title.innerHTML = "Assign key <code>" + displayKey + "</code> to:";
        picker.appendChild(title);

        // Move grid
        var grid = document.createElement("div");
        grid.className = "kb-picker-grid";

        var prevCat = null;
        MOVE_LIST.forEach(function (entry) {
            if (entry.category !== prevCat) {
                prevCat = entry.category;
                var catSpan = document.createElement("span");
                catSpan.className = "kb-picker-cat";
                catSpan.textContent = entry.category;
                grid.appendChild(catSpan);
            }

            var pill = document.createElement("button");
            pill.className = "kb-picker-pill" + (entry.method === currentMethod ? " kb-picker-pill-active" : "");
            pill.textContent = entry.label;
            pill.addEventListener("click", function () {
                vc.setKeybind(selectedKey, entry.method);
                refreshEditorAndList(vc, editorBody, kbWrap);
                if (selectedKeyEl) { selectedKeyEl.classList.remove("kb-key-selected"); selectedKeyEl = null; }
                picker.style.display = "none";
                // Update layout bar (active might have changed if layout was just saved)
            });
            grid.appendChild(pill);
        });

        // Unbound / clear button
        var clearBtn = document.createElement("button");
        clearBtn.className = "kb-picker-clear" + (!currentMethod ? " kb-picker-pill-active" : "");
        clearBtn.textContent = "\u2715 Unbound";
        clearBtn.addEventListener("click", function () {
            if (typeof vc.unbindKey === "function") vc.unbindKey(selectedKey);
            refreshEditorAndList(vc, editorBody, kbWrap);
            if (selectedKeyEl) { selectedKeyEl.classList.remove("kb-key-selected"); selectedKeyEl = null; }
            picker.style.display = "none";
        });
        grid.appendChild(clearBtn);

        picker.appendChild(grid);
    }

    function refreshEditorAndList(vc, editorBody, kbWrap) {
        var bindings = vc.getKeybinds();
        // Refresh all key tiles in the keyboard grid
        kbWrap.querySelectorAll(".kb-key").forEach(function (tile) {
            var k = tile.dataset.key;
            var method = bindings[k] || null;
            var moveLbl = tile.querySelector(".kb-key-move");
            if (moveLbl) {
                moveLbl.textContent = method ? getMethodLabel(method) : "";
                if (method) moveLbl.classList.add("kb-key-move-bound");
                else moveLbl.classList.remove("kb-key-move-bound");
            }
            if (method) tile.classList.add("kb-key-bound");
            else tile.classList.remove("kb-key-bound");
        });
        // Refresh move list rows
        refreshMoveList(vc);
    }

    // ─── Render Helpers ───────────────────────────────────────────────────────

    function renderKeyCell(keyCell, keys) {
        keyCell.innerHTML = "";
        if (keys.length === 0) {
            var none = document.createElement("span");
            none.className = "kb-unbound";
            none.textContent = "unbound";
            keyCell.appendChild(none);
        } else {
            keys.forEach(function (k) {
                var badge = document.createElement("span");
                badge.className = "kb-badge";
                badge.textContent = keyLabel(k);
                keyCell.appendChild(badge);
            });
        }
    }

    // ─── Rebind (existing flow) ────────────────────────────────────────────────

    function startListening(entry, tr, btn) {
        if (listeningRow) stopListening(false);

        listeningRow = { entry: entry, tr: tr, btn: btn };
        tr.classList.add("kb-listening");
        btn.textContent = "Press a key\u2026";
        btn.classList.add("kb-listening-btn");

        var warn = tr.querySelector(".kb-warn");
        if (warn) { warn.textContent = ""; warn.classList.remove("kb-warn-visible"); }

        document.addEventListener("keydown", captureKey, true);
    }

    function stopListening(resetBtn) {
        if (!listeningRow) return;
        var tr = listeningRow.tr;
        var btn = listeningRow.btn;
        tr.classList.remove("kb-listening");
        if (resetBtn !== false) {
            btn.textContent = "Rebind";
            btn.classList.remove("kb-listening-btn");
            btn.classList.remove("kb-confirm-btn");
        }
        document.removeEventListener("keydown", captureKey, true);
        listeningRow = null;
    }

    function captureKey(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var k = e.key;
        if (!k) return;
        if (k.length === 1) k = k.toLowerCase();

        if (["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "NumLock", "ScrollLock"].indexOf(k) !== -1) return;

        var vc = getVC();
        var bindings = vc.getKeybinds();
        var targetMethod = listeningRow.entry.method;
        var tr = listeningRow.tr;
        var btn = listeningRow.btn;

        var conflictMethod = bindings[k];
        if (conflictMethod && conflictMethod !== targetMethod) {
            var conflictLabel = "another move";
            for (var i = 0; i < MOVE_LIST.length; i++) {
                if (MOVE_LIST[i].method === conflictMethod) { conflictLabel = MOVE_LIST[i].label; break; }
            }
            var warn = tr.querySelector(".kb-warn");
            warn.textContent = "\u26A0\uFE0F  \"" + keyLabel(k) + "\" is bound to " + conflictLabel + ". Confirm to override.";
            warn.classList.add("kb-warn-visible");

            stopListening(false);
            btn.textContent = "Confirm";
            btn.classList.add("kb-confirm-btn");
            btn.classList.remove("kb-listening-btn");

            var confirmHandler = function (ev) {
                ev.stopPropagation();
                btn.removeEventListener("click", confirmHandler);
                btn.classList.remove("kb-confirm-btn");
                btn.textContent = "Rebind";
                warn.textContent = "";
                warn.classList.remove("kb-warn-visible");
                applyBind(vc, k, targetMethod);
            };
            btn.addEventListener("click", confirmHandler);
            return;
        }

        stopListening();
        applyBind(vc, k, targetMethod);
    }

    function applyBind(vc, key, method) {
        var oldBindings = vc.getKeybinds();
        var affectedMethods = {};
        if (oldBindings[key]) affectedMethods[oldBindings[key]] = true;
        affectedMethods[method] = true;

        vc.setKeybind(key, method);

        var newBindings = vc.getKeybinds();
        var newInv = invertMap(newBindings);

        Object.keys(affectedMethods).forEach(function (m) {
            var rows = document.querySelectorAll(".kb-row[data-method=\"" + m + "\"]");
            rows.forEach(function (row) {
                var keyCell = row.querySelector(".kb-key-cell");
                renderKeyCell(keyCell, newInv[m] || []);
                var b = row.querySelector(".kb-rebind-btn");
                if (b && b.textContent !== "Rebind") b.textContent = "Rebind";
            });
        });

        // Also refresh keyboard editor tiles if editor is visible
        if (editorMode) {
            var kbWrap = document.querySelector(".kb-keyboard-wrap");
            if (kbWrap) {
                kbWrap.querySelectorAll(".kb-key").forEach(function (tile) {
                    var k = tile.dataset.key;
                    var meth = newBindings[k] || null;
                    var moveLbl = tile.querySelector(".kb-key-move");
                    if (moveLbl) {
                        moveLbl.textContent = meth ? getMethodLabel(meth) : "";
                        if (meth) moveLbl.classList.add("kb-key-move-bound");
                        else moveLbl.classList.remove("kb-key-move-bound");
                    }
                    if (meth) tile.classList.add("kb-key-bound");
                    else tile.classList.remove("kb-key-bound");
                });
            }
        }
    }

    // ─── Close ────────────────────────────────────────────────────────────────

    function closeModal() {
        stopListening();
        if (escapeHandler) {
            document.removeEventListener("keydown", escapeHandler, true);
            escapeHandler = null;
        }
        var overlay = document.getElementById(MODAL_ID);
        if (!overlay) return;
        overlay.classList.remove("kb-visible");
        setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 280);
    }

    window.openKeybindModal = function () {
        buildModal();
    };
})();

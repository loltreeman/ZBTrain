(function () {
    var MODAL_ID = "keybindModal";
    var listeningRow = null; // { entry, tr, btn }
    var escapeHandler = null;

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

    function buildModal() {
        var existing = document.getElementById(MODAL_ID);
        if (existing) existing.remove();

        var vc = getVC();
        if (!vc) { alert("Virtual cube not initialised."); return; }

        var bindings = vc.getKeybinds();
        var inv = invertMap(bindings);

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

        // header
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

        // hint
        var hint = document.createElement("p");
        hint.className = "kb-hint";
        hint.textContent = "Click \u201CRebind\u201D next to any move, then press the key you want to assign to it.";
        card.appendChild(hint);

        // body
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

        card.appendChild(body);

        // footer
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

        escapeHandler = function (e) {
            if (e.key === "Escape") {
                if (listeningRow) {
                    stopListening();
                } else {
                    closeModal();
                }
            }
        };
        document.addEventListener("keydown", escapeHandler, true);

        requestAnimationFrame(function () { overlay.classList.add("kb-visible"); });
    }

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

        // Ignore bare modifier keys
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
                if (MOVE_LIST[i].method === conflictMethod) {
                    conflictLabel = MOVE_LIST[i].label;
                    break;
                }
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
        // Find which methods lose a key so we can refresh those rows too
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
                // reset button text in case it was stuck
                var b = row.querySelector(".kb-rebind-btn");
                if (b && b.textContent !== "Rebind") b.textContent = "Rebind";
            });
        });
    }

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

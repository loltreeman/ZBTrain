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
        main.appendChild(el("div", "other-orientations",
            '<p class="orientation-label">' + cases.length + " edge-orientation variants</p>" +
            '<p class="zbls-family-hint">Expand to pick individual cases.</p>'));
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
            grid.appendChild(item);
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

    function startTraining(isRecap) {
        var list = [];
        families.forEach(function (f) {
            casesOf(f).forEach(function (c) {
                if (selected[key(f, c)]) list.push({ set: SET, subset: f, caseName: c });
            });
        });
        if (!list.length) return;
        sessionStorage.setItem("selectedCases", JSON.stringify(list));
        sessionStorage.setItem("recapMode", JSON.stringify(!!isRecap));
        location.href = location.pathname.replace(/zbls\.html$/, "") + "trainer.html";
    }

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

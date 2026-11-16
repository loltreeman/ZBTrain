// The ZB guide (guide/*.html). Each page only has its article; this builds
// the rest from the list below: the page list on the left, breadcrumbs,
// "On this page" on the right (from the article's h2s, highlighted as you
// scroll), and previous / next links.

(function () {
    var PAGES = [
        { file: "index.html", title: "Introduction", section: "Getting started" },
        { file: "before-you-start.html", title: "Before you start", section: "Getting started" },
        { file: "case-names.html", title: "Case names", section: "Understanding ZBLL" },
        { file: "recognition.html", title: "Recognition", section: "Understanding ZBLL" },
        { file: "learning-plan.html", title: "Learning plan", section: "Learning ZBLL" },
        { file: "practice.html", title: "Practicing and keeping it", section: "Learning ZBLL" },
        { file: "zbls.html", title: "ZBLS and LSLL", section: "Beyond ZBLL" },
    ];

    var here = location.pathname.split("/").pop() || "index.html";
    var index = PAGES.findIndex(function (p) { return p.file === here; });
    if (index < 0) index = 0;
    var page = PAGES[index];

    function el(tag, cls, html) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html != null) n.innerHTML = html;
        return n;
    }

    // ── Left: pages ─────────────────────────────────────────────────────
    var sidebar = document.getElementById("docsSidebar");
    if (sidebar) {
        var nav = el("nav", "docs-nav");
        nav.setAttribute("aria-label", "Guide pages");
        var current = null, block = null;
        PAGES.forEach(function (p) {
            if (p.section !== current) {
                current = p.section;
                block = el("div", "docs-nav-section");
                block.appendChild(el("p", "docs-nav-title", p.section));
                nav.appendChild(block);
            }
            var a = el("a", "docs-nav-link", p.title);
            a.href = p.file;
            if (p === page) a.setAttribute("aria-current", "page");
            block.appendChild(a);
        });
        sidebar.appendChild(nav);
        sidebar.appendChild(el("div", "docs-nav-cta",
            "Ready to learn? The beginner path picks your first cases for you." +
            '<a class="btn btn-primary btn-sm" href="../learn.html?path=ZBLL">Start the beginner path</a>'));
    }

    // ── Breadcrumbs ─────────────────────────────────────────────────────
    var crumbs = document.getElementById("docsBreadcrumb");
    if (crumbs) {
        crumbs.innerHTML =
            '<a href="index.html">Guide</a><span aria-hidden="true">›</span>' +
            "<span>" + page.section + '</span><span aria-hidden="true">›</span>' +
            '<span aria-current="page">' + page.title + "</span>";
    }

    // ── Right: on this page ─────────────────────────────────────────────
    var article = document.querySelector(".docs-article");
    var toc = document.getElementById("docsToc");
    var headings = article ? Array.prototype.slice.call(article.querySelectorAll("h2")) : [];
    headings = headings.filter(function (h) { return !h.closest(".docs-sources, .docs-cta-box"); });
    headings.forEach(function (h) {
        if (!h.id) h.id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    });
    if (toc && headings.length) {
        toc.appendChild(el("p", "docs-toc-title", "On this page"));
        var links = headings.map(function (h) {
            var a = el("a", null, h.textContent);
            a.href = "#" + h.id;
            toc.appendChild(a);
            return a;
        });
        var top = el("button", "docs-toc-top", "Scroll to top ↑");
        top.type = "button";
        top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
        toc.appendChild(top);

        // Highlight the section you're reading
        function update() {
            var y = window.scrollY + 120;
            var active = 0;
            headings.forEach(function (h, i) { if (h.offsetTop <= y) active = i; });
            links.forEach(function (a, i) { a.classList.toggle("is-active", i === active); });
        }
        window.addEventListener("scroll", update, { passive: true });
        update();
    }

    // ── Previous / next ─────────────────────────────────────────────────
    var pager = document.getElementById("docsPager");
    if (pager) {
        var prev = PAGES[index - 1], next = PAGES[index + 1];
        if (prev) pager.appendChild(el("a", "is-prev", "<span>← Previous</span><b>" + prev.title + "</b>")).href = prev.file;
        if (next) pager.appendChild(el("a", "is-next", "<span>Next →</span><b>" + next.title + "</b>")).href = next.file;
    }

    // ── Mobile: page list as a slide-in menu ────────────────────────────
    var menuBtn = document.getElementById("docsMenuBtn");
    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", function () {
            var open = document.body.classList.toggle("docs-menu-open");
            menuBtn.setAttribute("aria-expanded", String(open));
        });
        document.addEventListener("click", function (e) {
            if (!document.body.classList.contains("docs-menu-open")) return;
            if (e.target === menuBtn || menuBtn.contains(e.target) || sidebar.contains(e.target)) return;
            document.body.classList.remove("docs-menu-open");
            menuBtn.setAttribute("aria-expanded", "false");
        });
    }
})();

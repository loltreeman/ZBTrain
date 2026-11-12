// Display settings: cube size and timer size.
// Each slider sets a CSS variable on <html>; the stylesheet does the rest.
// The virtual cube re-fits itself via a ResizeObserver on its container.

(function () {
    var root = document.documentElement;

    function bindScale(sliderId, outputId, storageKey, cssVar) {
        var slider = document.getElementById(sliderId);
        var output = document.getElementById(outputId);
        if (!slider) return;

        var saved = NaN;
        try { saved = parseFloat(localStorage.getItem(storageKey)); } catch (e) {}
        if (!isNaN(saved)) slider.value = saved;

        function apply() {
            var value = parseFloat(slider.value) || 1;
            root.style.setProperty(cssVar, value);
            if (output) output.textContent = Math.round(value * 100) + "%";
            try { localStorage.setItem(storageKey, value); } catch (e) {}
        }

        slider.addEventListener("input", apply);
        // Double-click resets to 100%
        slider.addEventListener("dblclick", function () {
            slider.value = 1;
            apply();
        });
        apply();
    }

    bindScale("cubeSizeSlider", "cubeSizeValue", "cubeScale", "--cube-scale");

    // Cube view picker (Classic 3D / Isometric / Top / Net)
    var viewSelect = document.getElementById("cubeViewSelect");
    if (viewSelect && window.virtualCube && window.virtualCube.getView) {
        viewSelect.value = window.virtualCube.getView();
        viewSelect.addEventListener("change", function () {
            window.virtualCube.setView(viewSelect.value);
            viewSelect.blur(); // so Space/keys go back to the timer and cube
        });
    }
    bindScale("timerSizeSlider", "timerSizeValue", "timerScale", "--timer-scale");

    // ── Case image style ───────────────────────────────────────────────
    // "diagram" keeps the original SVG. Any cube view name draws the case
    // from its actual scramble (with your orientation) using that view.
    var caseSelect = document.getElementById("caseImageSelect");
    var caseImg = document.getElementById("case-img");
    var caseCanvas = document.getElementById("case-canvas");
    var caseStyle = "diagram";
    var lastCaseMoves = null;
    var CASE_IMAGE_SIZE = 150;

    try {
        var savedStyle = localStorage.getItem("caseImageStyle");
        if (savedStyle) caseStyle = savedStyle;
    } catch (e) {}

    function renderCaseImage() {
        if (!caseImg || !caseCanvas) return;
        var useCanvas = caseStyle !== "diagram" && lastCaseMoves !== null &&
            window.CubeViews && CubeViews.has(caseStyle) &&
            window.virtualCube && window.virtualCube.makeCube;
        caseImg.hidden = useCanvas;
        caseCanvas.hidden = !useCanvas;
        if (!useCanvas) return;
        var cube = window.virtualCube.makeCube(lastCaseMoves);
        CubeViews.renderTo(caseCanvas, caseStyle, cube, CASE_IMAGE_SIZE);
        caseCanvas.setAttribute("aria-label", caseImg.alt || "Case image");
    }

    // Called by trainer.js whenever a new result is shown
    window.updateCaseImage = function (moves) {
        lastCaseMoves = moves || "";
        renderCaseImage();
    };

    if (caseSelect) {
        caseSelect.value = caseStyle;
        if (caseSelect.value !== caseStyle) { caseStyle = "diagram"; caseSelect.value = "diagram"; }
        caseSelect.addEventListener("change", function () {
            caseStyle = caseSelect.value;
            try { localStorage.setItem("caseImageStyle", caseStyle); } catch (e) {}
            renderCaseImage();
            caseSelect.blur();
        });
    }
})();

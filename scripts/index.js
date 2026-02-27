const activeOrientation = {}; // tracks main image rotation per set
const modalSelections = {};   // tracks which cases are selected per subset

const zbllMap = {
  T: {
    "2GLL": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "Diag": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "3": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "4": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "5": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "6": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
  },
  U: {
    "2GLL": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "Diag": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "3": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "4": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "5": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "6": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
  },
  L: {
    "2GLL": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "Diag": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "3": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "4": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "5": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "6": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
  },
  H: {
    "2GLL": ["CsC","AsA","AsC","AsO","CsO","CxO","OsO","OxO"],
    "Diag": ["AsA","AsC","AsO","CsO","CxO","OsC","OsO","OxC"],
    "3": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "4": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
  },
  Pi: {
    "2GLL": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "Diag": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "3": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "4": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "5": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "6": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
  },
  Sune: {
    "2GLL": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "Diag": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "3": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "4": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "5": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "6": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
  },
  Antisune: {
    "2GLL": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "Diag": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "3": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "4": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "5": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "6": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
  },
};

document.querySelectorAll(".zbll-set-container").forEach((setContainer) => {
    const set = setContainer.id.replace("container-", "");
    activeOrientation[set] = 0;

    const mainImg = setContainer.querySelector(".main-angle-svg");
    const orientationButtons = setContainer.querySelectorAll(
        ".orientation-options .case-trigger"
    );

    orientationButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const thumbImg = btn.querySelector("img");

            const oldMainSrc = mainImg.src;
            const oldMainAlt = mainImg.alt;
            const oldMainAngle = mainImg.dataset.angle;
            const oldMainTransform = mainImg.style.transform;

            mainImg.src = thumbImg.src;
            mainImg.alt = thumbImg.alt;
            mainImg.dataset.angle = btn.dataset.angle;
            mainImg.style.transform = thumbImg.style.transform;

            //move saved Main state to Thumbnail
            thumbImg.src = oldMainSrc;
            thumbImg.alt = oldMainAlt;
            btn.dataset.angle = oldMainAngle;
            thumbImg.style.transform = oldMainTransform;

            // update the tracking variable for the modal
            const currentAngle = parseInt(mainImg.dataset.angle) || 0;
            activeOrientation[set] = currentAngle;

            // force all subset images to rotate to match the NEW main angle
            setContainer
                .querySelectorAll(".subset-orientation")
                .forEach((img) => {
                    img.style.transform = `rotate(${currentAngle}deg)`;
                });
        });
    });

    mainImg.addEventListener("click", () =>
        toggleAllCasesForSet(set, setContainer)
    );

    setContainer.querySelectorAll(".zbll-card").forEach((card) => {
        const subset = card.dataset.subset; // Pulls from HTML: data-subset="2GLL"
        if (!subset) return;

        card.addEventListener("click", (e) => {
            // If the user specifically clicked the image, let the image's own listener handle it
            if (e.target.classList.contains("subset-orientation")) return;
            toggleSubsetSelection(set, subset);
        });

        const img = card.querySelector(".subset-orientation");
        if (img) {
            img.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevents the card click from firing
                displayZW(set, subset, activeOrientation[set]);
            });
        }

        // prevent right-click menu and open modal instead (Optional UX)
        card.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            displayZW(set, subset, activeOrientation[set]);
        });
    });
});

function toggleSubsetSelection(set, subset) {
    const key = `${set}-${subset}`;
    const cases = zbllMap[set][subset];

    if (!modalSelections[key]) {
        modalSelections[key] = {};
        cases.forEach((c) => (modalSelections[key][c] = false));
    }

    // check if current subset is 100% full
    const isFull = cases.every((c) => modalSelections[key][c] === true);
    const target = !isFull;

    cases.forEach((c) => {
        modalSelections[key][c] = target;
    });

    updateSetCount(set);
}

function toggleAllCasesForSet(set, setContainer) {
    const subsets = Object.keys(zbllMap[set] || {});
    let totalInSet = 0;
    let currentlySelectedInSet = 0;

    subsets.forEach((coll) => {
        const key = `${set}-${coll}`;
        totalInSet += zbllMap[set][coll].length;
        if (modalSelections[key]) {
            currentlySelectedInSet += Object.values(
                modalSelections[key]
            ).filter((v) => v).length;
        }
    });

    const targetState = currentlySelectedInSet !== totalInSet;

    subsets.forEach((coll) => {
        const key = `${set}-${coll}`;
        if (!modalSelections[key]) modalSelections[key] = {};
        zbllMap[set][coll].forEach((caseName) => {
            modalSelections[key][caseName] = targetState;
        });
    });

    updateSetCount(set);
}

function updateSetCount(set) {
    const countSpan = document.getElementById(`count-${set}`);
    const container = document.getElementById(`container-${set}`);
    const mainImg = container.querySelector(".main-angle-svg");

    if (!countSpan || !mainImg) return;

    let totalSelectedInSet = 0;
    let totalCasesInSet = 0;

    const subsets = Object.keys(zbllMap[set]);
    subsets.forEach((coll) => {
        const key = `${set}-${coll}`;
        const totalInSubset = zbllMap[set][coll].length;
        const selectedInSubset = modalSelections[key]
            ? Object.values(modalSelections[key]).filter((v) => v).length
            : 0;

        totalSelectedInSet += selectedInSubset;
        totalCasesInSet += totalInSubset;

        const subsetImg = container.querySelector(
            `[data-subset="${coll}"] .subset-orientation`
        );
        if (subsetImg) {
            const card = subsetImg.closest(".zbll-card");
            subsetImg.classList.remove("selected-some", "selected-all");
            card.classList.remove("all-selected");

            if (selectedInSubset > 0) {
                if (selectedInSubset === totalInSubset) {
                    subsetImg.classList.add("selected-all");
                    card.classList.add("all-selected");
                } else {
                    subsetImg.classList.add("selected-some");
                }
            }
        }
    });

    countSpan.textContent = totalSelectedInSet;
    mainImg.classList.remove("selected-some", "selected-all");

    if (totalSelectedInSet > 0) {
        if (totalSelectedInSet === totalCasesInSet) {
            mainImg.classList.add("selected-all");
        } else {
            mainImg.classList.add("selected-some");
        }
    }

    updateTrainerButtons();
}

function displayZW(set, coll, angle = 0) {
    const modalBack = document.getElementById("zbllWindowBack");
    const modalWindow = document.getElementById("zbllWindow");
    const zwPics = document.getElementById("zwPics");

    modalBack.classList.add("modal-active");
    modalWindow.classList.add("modal-active");

    const key = `${set}-${coll}`;

    if (!modalSelections[key]) {
        modalSelections[key] = {};
        zbllMap[set][coll].forEach((caseName) => {
            modalSelections[key][caseName] = false;
        });
    }

    zwPics.innerHTML = "";
    const allBtn = document.getElementById("modal-select-all");
    const noneBtn = document.getElementById("modal-select-none");

    if (allBtn) allBtn.onclick = () => selectAllZw(true, key);
    if (noneBtn) noneBtn.onclick = () => selectAllZw(false, key);

    // ── GET heatmap data if active ──
    var heatmapActive = localStorage.getItem('heatmapActive') === 'true';
    var heatmapData = heatmapActive ? buildHeatmapData() : null;
    var isDark = document.body.classList.contains('dark-mode');

    zbllMap[set][coll].forEach((caseName) => {
        const div = document.createElement("div");
        div.className = "zbllItem";

        if (modalSelections[key][caseName] === true) {
            div.classList.add("selected");
        }

        // ── APPLY per-case heatmap color ──
        if (heatmapData) {
            var fullCaseName = set + '-' + coll + '-' + caseName;
            var caseData = heatmapData[fullCaseName];

            if (caseData) {
                var colors = isDark ? heatmapColorDark(caseData.avg) : heatmapColor(caseData.avg);
                div.style.borderColor = colors.border;
                div.style.background  = colors.bg;

                // Add a small time badge
                var badge = document.createElement('div');
                badge.className = 'zbll-item-heatmap-badge';
                badge.textContent = caseData.avg.toFixed(2) + 's';
                badge.style.color = colors.text;
                div.appendChild(badge);
            } else {
                // No data yet — subtle indicator
                div.style.borderColor = '';
                div.style.background  = '';
                var badge = document.createElement('div');
                badge.className = 'zbll-item-heatmap-badge zbll-item-no-data';
                badge.textContent = '—';
                div.appendChild(badge);
            }
        }

        const img = document.createElement("img");
        img.src = `svg/top/${set}-${coll}-${caseName}.svg`;
        img.style.transform = `rotate(${angle}deg)`;
        div.appendChild(img);

        div.addEventListener("click", () => {
            modalSelections[key][caseName] = !modalSelections[key][caseName];
            div.classList.toggle("selected");
            updateZwHeaderSelection(set, coll);
        });

        zwPics.appendChild(div);
    });

    updateZwHeaderSelection(set, coll);
    zwPics.scrollTop = 0;
}

function selectAllZw(selectAll, key) {
    Object.keys(modalSelections[key]).forEach(
        (c) => (modalSelections[key][c] = selectAll)
    );
    document
        .querySelectorAll(".zbllItem")
        .forEach((div) => div.classList.toggle("selected", selectAll));
    const [set, coll] = key.split("-");
    updateZwHeaderSelection(set, coll);
}

function updateZwHeaderSelection(set, coll) {
    const key = `${set}-${coll}`;
    const total = zbllMap[set][coll].length;
    const selected = Object.values(modalSelections[key]).filter((v) => v)
        .length;
    document.getElementById(
        "zwHeaderMessage"
    ).textContent = `${set} – ${coll} (${selected}/${total} selected)`;
    updateSetCount(set);
}

function closeZW() {
    const modalBack = document.getElementById("zbllWindowBack");
    const modalWindow = document.getElementById("zbllWindow");

    modalBack.classList.remove("modal-active");
    modalWindow.classList.remove("modal-active");
}

function toggleExpand(expand) {
    // expand/collapse all sets defined in zbllMap
    Object.keys(zbllMap).forEach((set) => {
        const el = document.getElementById(`subsets-${set}`);
        const arrow = document.getElementById(`arrow-${set}`);
        if (el) {
            el.style.display = expand ? "block" : "none";
            if (arrow) arrow.innerText = expand ? "▲" : "▼";
        }
    });
}

function toggleAll(select) {
    Object.keys(zbllMap).forEach((set) => {
        const subsets = Object.keys(zbllMap[set] || {});
        subsets.forEach((coll) => {
            const key = `${set}-${coll}`;
            if (!modalSelections[key]) modalSelections[key] = {};
            zbllMap[set][coll].forEach(
                (c) => (modalSelections[key][c] = select)
            );
        });
        updateSetCount(set);
    });
}

function updateTrainerButtons() {
    const selected = [];
    Object.entries(modalSelections).forEach(([key, cases]) => {
        Object.entries(cases).forEach(([c, val]) => {
            if (val) selected.push({ key, c });
        });
    });
    const count = selected.length;
    document.getElementById("selected").textContent = `${count} case${
        count === 1 ? "" : "s"
    } selected`;
    document.getElementById("start").disabled = count === 0;
    document.getElementById("recap").disabled = count === 0;
}

function toggleSubsets(set) {
    const el = document.getElementById(`subsets-${set}`);
    const arrow = document.getElementById(`arrow-${set}`);
    if (!el) return;
    const isHidden = el.style.display === "none" || el.style.display === "";
    el.style.display = isHidden ? "block" : "none";
    if (arrow) arrow.innerText = isHidden ? "▲" : "▼";
}

function loadCases(isRecap) {
    // collect selected cases into an array: [{set, subset, caseName}, ...]
    const selected = [];
    Object.entries(modalSelections).forEach(([key, cases]) => {
        const [set, subset] = key.split("-");
        Object.entries(cases).forEach(([caseName, val]) => {
            if (val) selected.push({ set, subset, caseName });
        });
    });

    if (selected.length === 0) {
        alert("No cases selected. Please select some cases first.");
        return;
    }

    // Save to sessionStorage for trainer page to consume
    sessionStorage.setItem("selectedCases", JSON.stringify(selected));
    sessionStorage.setItem("recapMode", JSON.stringify(!!isRecap));

    // Navigate to trainer page (same folder)
    const base = location.pathname.replace(/index.html$/, "");
    location.href = base + "trainer.html";
}

document.addEventListener("DOMContentLoaded", () => {
    syncStorageToLogic();
});

function syncStorageToLogic() {
    const saved = JSON.parse(sessionStorage.getItem("selectedCases")) || [];
    if (saved.length === 0) return;

    // reset local tracker
    // we clear it first to ensure we don't have "ghost" selections
    Object.keys(modalSelections).forEach((key) => delete modalSelections[key]);

    saved.forEach((item) => {
        const key = `${item.set}-${item.subset}`;
        if (!modalSelections[key]) {
            modalSelections[key] = {};
            // Initialize other cases in this subset to false
            if (zbllMap[item.set] && zbllMap[item.set][item.subset]) {
                zbllMap[item.set][item.subset].forEach((c) => {
                    modalSelections[key][c] = false;
                });
            }
        }
        modalSelections[key][item.caseName] = true;
    });

    // Refresh the UI for every set defined in your map
    Object.keys(zbllMap).forEach((set) => {
        updateSetCount(set);
    });

    updateTrainerButtons();
}

function loadCases(isRecap) {
    const selected = [];

    // map the internal modalSelections object back into the array format
    Object.entries(modalSelections).forEach(([key, cases]) => {
        const [set, subset] = key.split("-");
        Object.entries(cases).forEach(([caseName, val]) => {
            if (val) {
                selected.push({ set, subset, caseName });
            }
        });
    });

    if (selected.length === 0) {
        alert("No cases selected. Please select some cases first.");
        return;
    }

    sessionStorage.setItem("selectedCases", JSON.stringify(selected));
    sessionStorage.setItem("recapMode", JSON.stringify(!!isRecap));

    const base = location.pathname.replace(/index.html$/, "");
    location.href = base + "trainer.html";
}


var HEATMAP_THRESHOLDS = {
    great:  3.0,   // < 3s  → green
    good:   5.0,   // < 5s  → yellow
    slow:   7.0,   // < 7s  → orange
                   // ≥ 7s  → red
};

function getAttempts() {
    try {
        return JSON.parse(localStorage.getItem('zbllAttempts') || '[]');
    } catch(e) { return []; }
}

// Build a map: caseName → { avg, count, min }
function buildHeatmapData() {
    var attempts = getAttempts();
    var byCase = {};

    attempts.forEach(function(a) {
        var key = a.caseName;
        if (!key || !a.time) return;
        if (!byCase[key]) byCase[key] = { total: 0, count: 0, min: Infinity };
        byCase[key].total += a.time;
        byCase[key].count++;
        if (a.time < byCase[key].min) byCase[key].min = a.time;
    });

    var result = {};
    Object.keys(byCase).forEach(function(k) {
        var d = byCase[k];
        result[k] = {
            avg: d.total / d.count,
            count: d.count,
            min: d.min
        };
    });
    return result;
}

// ── Get color for a given avg time ───────────────────────────
function heatmapColor(avg) {
    if (avg < HEATMAP_THRESHOLDS.great) return { bg: '#dcfce7', border: '#16a34a', text: '#15803d', label: 'Fast' };
    if (avg < HEATMAP_THRESHOLDS.good)  return { bg: '#fef9c3', border: '#ca8a04', text: '#92400e', label: 'OK' };
    if (avg < HEATMAP_THRESHOLDS.slow)  return { bg: '#ffedd5', border: '#ea580c', text: '#9a3412', label: 'Slow' };
    return                                     { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', label: 'Hard' };
}

function heatmapColorDark(avg) {
    if (avg < HEATMAP_THRESHOLDS.great) return { bg: '#052e16', border: '#16a34a', text: '#4ade80', label: 'Fast' };
    if (avg < HEATMAP_THRESHOLDS.good)  return { bg: '#422006', border: '#ca8a04', text: '#fbbf24', label: 'OK' };
    if (avg < HEATMAP_THRESHOLDS.slow)  return { bg: '#431407', border: '#ea580c', text: '#fb923c', label: 'Slow' };
    return                                     { bg: '#450a0a', border: '#dc2626', text: '#f87171', label: 'Hard' };
}

// ── Apply heatmap colors to all .zbll-card elements ──────────
function applyHeatmap() {
    var data = buildHeatmapData();
    var isDark = document.body.classList.contains('dark-mode');

    // Find all zbll-card elements that have a data-subset attribute
    var cards = document.querySelectorAll('.zbll-card[data-subset]');

    cards.forEach(function(card) {
        var subset = card.getAttribute('data-subset');
        var setContainer = card.closest('[id^="subsets-"]');
        if (!setContainer) return;
        var set = setContainer.id.replace('subsets-', '');

        // Build the case name as trainer stores it: "SET-SUBSET-CaseName"
        // We need to match against attempt caseName format
        // caseName format in attempts: "T-2GLL-CsA" etc.
        // We match by checking if any attempt caseName starts with set + "-" + subset
        var prefix = set + '-' + subset;
        var matchingKeys = Object.keys(data).filter(function(k) {
            return k.startsWith(prefix + '-') || k === prefix;
        });

        if (matchingKeys.length === 0) {
            // No data yet — show neutral "untrained" indicator
            removeHeatmap(card);
            return;
        }

        // Compute average across all cases in this subset
        var totalAvg = 0;
        var totalCount = 0;
        matchingKeys.forEach(function(k) {
            totalAvg += data[k].avg * data[k].count;
            totalCount += data[k].count;
        });
        var subsetAvg = totalAvg / totalCount;

        var colors = isDark ? heatmapColorDark(subsetAvg) : heatmapColor(subsetAvg);

        // Apply to card
        card.style.background = colors.bg;
        card.style.borderColor = colors.border;

        // Add or update the heatmap badge
        var existing = card.querySelector('.heatmap-badge');
        if (!existing) {
            existing = document.createElement('div');
            existing.className = 'heatmap-badge';
            card.appendChild(existing);
        }
        existing.style.color = colors.text;
        existing.style.background = 'transparent';
        existing.innerHTML =
            '<span class="heatmap-avg">' + subsetAvg.toFixed(2) + 's</span>' +
            '<span class="heatmap-count">(' + totalCount + ' solves)</span>';
    });
}

function removeHeatmap(card) {
    card.style.background = '';
    card.style.borderColor = '';
    var badge = card.querySelector('.heatmap-badge');
    if (badge) badge.remove();
}

// ── Heatmap toggle button ─────────────────────────────────────
function initHeatmapToggle() {
    var btn = document.getElementById('heatmapToggle');
    if (!btn) return;

    var active = localStorage.getItem('heatmapActive') === 'true';
    updateHeatmapBtn(btn, active);
    if (active) applyHeatmap();

    btn.addEventListener('click', function() {
        active = !active;
        localStorage.setItem('heatmapActive', active);
        updateHeatmapBtn(btn, active);

        if (active) {
            applyHeatmap();
        } else {
            // Remove all heatmap styling
            document.querySelectorAll('.zbll-card[data-subset]').forEach(removeHeatmap);
        }
    });
}

function updateHeatmapBtn(btn, active) {
    var legendEl = document.getElementById('heatmapLegend');
    if (active) {
        btn.textContent = '🗺 Hide Heatmap';
        btn.classList.add('heatmap-active');
        if (legendEl) legendEl.style.display = 'flex';
    } else {
        btn.textContent = '🗺 Show Heatmap';
        btn.classList.remove('heatmap-active');
        if (legendEl) legendEl.style.display = 'none';
    }
}

// Re-apply heatmap when dark mode toggles
var _origToggleDarkMode = window.toggleDarkMode;
window.toggleDarkMode = function() {
    if (_origToggleDarkMode) _origToggleDarkMode();
    if (localStorage.getItem('heatmapActive') === 'true') {
        setTimeout(applyHeatmap, 50);
    }
};

function renderHeatmapLegend() {
    var el = document.getElementById('heatmapLegend');
    if (!el) return;
    var t = HEATMAP_THRESHOLDS;
    el.innerHTML =
        '<span class="legend-item legend-great">< ' + t.great + 's Fast</span>' +
        '<span class="legend-item legend-good">< ' + t.good + 's OK</span>' +
        '<span class="legend-item legend-slow">< ' + t.slow + 's Slow</span>' +
        '<span class="legend-item legend-hard">≥ ' + t.slow + 's Hard</span>';
}

document.addEventListener('DOMContentLoaded', function() {
    initHeatmapToggle();
    renderHeatmapLegend();
});


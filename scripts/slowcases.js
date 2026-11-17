var slowCaseThreshold = parseFloat(localStorage.getItem('slowCaseThreshold') || '5.0');
var slowCaseSelections = {}; // tracks which slow cases are checked: caseName -> bool

function getSlowCases(thresholdSeconds) {
    var t = thresholdSeconds || slowCaseThreshold;

    // Get the names of cases in this session only 
    var sessionCaseNames = toTrain.map(function(c) {
        return c.getName ? c.getName() : c.name;
    });

    var byCase = {};
    attempts.forEach(function(a) {
        if (!a.caseName) return;

        // only include cases that are in the current session
        if (sessionCaseNames.indexOf(a.caseName) === -1) return;

        if (!byCase[a.caseName]) {
            byCase[a.caseName] = {
                caseName: a.caseName,
                set:      a.set,
                subset:   a.subset,
                caseId:   a.caseId,
                slot:     a.slot || null,
                total:    0,
                count:    0,
                times:    []
            };
        }
        byCase[a.caseName].total += a.time;
        byCase[a.caseName].count++;
        byCase[a.caseName].times.push(a.time);
    });

    return Object.values(byCase)
        .filter(function(c) { return c.count >= 2 && (c.total / c.count) >= t; })
        .sort(function(a, b) { return (b.total/b.count) - (a.total/a.count); });
}

function showSlowCasesPanel() {
    var panel = document.getElementById('slowCasesPanel');
    if (!panel) return;
    panel.style.display = 'block';
    setTimeout(function() {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    refreshSlowCasesList();
}

function hideSlowCasesPanel() {
    var panel = document.getElementById('slowCasesPanel');
    if (panel) panel.style.display = 'none';
}

function getImgPath(c) {
    // Sets registered by a data file (e.g. ZBLS) know their own image paths
    var reg = window.CASE_SETS && window.CASE_SETS[c.set];
    if (reg && c.subset && c.caseId) return reg.img(c.subset, c.caseId);
    // Build the SVG path from set/subset/caseId
    if (c.set && c.subset && c.caseId) {
        return 'svg/top/' + c.set + '-' + c.subset + '-' + c.caseId + '.svg';
    }
    // Fallback: parse from caseName "T-2GLL-CsA"
    var parts = c.caseName.split('-');
    if (parts.length >= 3) {
        return 'svg/top/' + parts[0] + '-' + parts[1] + '-' + parts[2] + '.svg';
    }
    return '';
}

// The case's key for the case info window: "T-2GLL-CsA" or "ZBLS-12-3"
function slowCaseKey(c) {
    if (c.set === 'ZBLS' && c.slot && c.slot !== 'FR') return 'ZBLS-' + c.slot + '-' + c.subset + '-' + c.caseId;
    if (c.set && c.subset && c.caseId) return c.set + '-' + c.subset + '-' + c.caseId;
    var parts = String(c.caseName || '').split('-');
    return parts.length >= 3 ? c.caseName : null;
}

// Same angle as chosen for the set on the case selection page
function slowCaseAngleStyle(c) {
    var set = c.set || String(c.caseName || "").split("-")[0];
    var angle = window.caseOrientation ? parseInt(window.caseOrientation[set], 10) || 0 : 0;
    return angle ? ' style="transform: rotate(' + angle + 'deg)"' : "";
}

function refreshSlowCasesList() {
    var listEl  = document.getElementById('slowCasesList');
    var countEl = document.getElementById('slowCasesCount');
    if (!listEl) return;

    var slowCases = getSlowCases(slowCaseThreshold);

    // Init selections — default all checked
    slowCases.forEach(function(c) {
        if (slowCaseSelections[c.caseName] === undefined) {
            slowCaseSelections[c.caseName] = true;
        }
    });

    // Remove selections for cases no longer slow
    Object.keys(slowCaseSelections).forEach(function(k) {
        var still = slowCases.some(function(c) { return c.caseName === k; });
        if (!still) delete slowCaseSelections[k];
    });

    if (countEl) {
        countEl.textContent = slowCases.length + ' case' + (slowCases.length !== 1 ? 's' : '') + ' above ' + slowCaseThreshold + 's';
    }

    var trainBtn = document.getElementById('trainSlowBtn');

    if (slowCases.length === 0) {
        listEl.innerHTML = '<p class="no-slow-cases">No slow cases — every average is under ' + slowCaseThreshold + 's.</p>';
        if (trainBtn) trainBtn.disabled = true;
        return;
    }

    // Build the list
    listEl.innerHTML = '';

    // Select all / none row
    var bulkRow = document.createElement('div');
    bulkRow.className = 'slow-bulk-row';
    bulkRow.innerHTML =
        '<button class="slow-bulk-btn" onclick="selectAllSlowCases(true)">Select All</button>' +
        '<button class="slow-bulk-btn" onclick="selectAllSlowCases(false)">Select None</button>' +
        '<span class="slow-selected-count" id="slowSelectedCount"></span>';
    listEl.appendChild(bulkRow);

    slowCases.forEach(function(c) {
        var avg       = (c.total / c.count).toFixed(2);
        var best      = Math.min.apply(null, c.times).toFixed(2);
        var colorClass = parseFloat(avg) >= 7 ? 'slow-hard' : parseFloat(avg) >= 5 ? 'slow-medium' : 'slow-ok';
        var imgPath   = getImgPath(c);
        var isChecked = slowCaseSelections[c.caseName] !== false;

        var row = document.createElement('div');
        row.className = 'slow-case-row ' + colorClass + (isChecked ? ' slow-checked' : '');
        row.dataset.caseName = c.caseName;

        row.innerHTML =
            // Checkbox
            '<label class="slow-case-checkbox">' +
                '<input type="checkbox" ' + (isChecked ? 'checked' : '') + ' onchange="toggleSlowCase(\'' + c.caseName + '\', this.checked)">' +
            '</label>' +

            // Case image (click: case info window)
            (imgPath ?
                '<img class="slow-case-img slow-case-open" src="' + imgPath + '" alt="' + c.caseName + '" title="Setup and algs"' + slowCaseAngleStyle(c) + ' onerror="this.style.display=\'none\'">'
                : '') +

            // Case info
            '<div class="slow-case-info">' +
                '<button type="button" class="slow-case-name slow-case-open" title="Setup and algs">' + c.caseName + '</button>' +
                '<div class="slow-case-stats">' +
                    '<span class="slow-avg">' + avg + 's avg</span>' +
                    '<span class="slow-best">best: ' + best + 's</span>' +
                    '<span class="slow-count">' + c.count + ' solve' + (c.count !== 1 ? 's' : '') + '</span>' +
                '</div>' +
            '</div>';

        // Click the picture or name for the case's setup and algs; anywhere
        // else on the row ticks it (the checkbox handles itself)
        row.addEventListener('click', function(e) {
            if (e.target.closest('.slow-case-open')) {
                var key = slowCaseKey(c);
                if (key && window.CaseInfo) CaseInfo.open(key);
                return;
            }
            if (e.target.tagName === 'INPUT') return;
            var cb = row.querySelector('input[type="checkbox"]');
            cb.checked = !cb.checked;
            toggleSlowCase(c.caseName, cb.checked);
        });

        listEl.appendChild(row);
    });

    updateSlowSelectedCount();
    updateTrainSlowBtn();
}

function toggleSlowCase(caseName, checked) {
    slowCaseSelections[caseName] = checked;
    // Update row highlight
    var rows = document.querySelectorAll('.slow-case-row[data-case-name="' + caseName + '"]');
    rows.forEach(function(row) {
        row.classList.toggle('slow-checked', checked);
    });
    updateSlowSelectedCount();
    updateTrainSlowBtn();
}

function selectAllSlowCases(val) {
    Object.keys(slowCaseSelections).forEach(function(k) {
        slowCaseSelections[k] = val;
    });
    // Refresh the whole list to sync checkboxes
    refreshSlowCasesList();
}

function updateSlowSelectedCount() {
    var el = document.getElementById('slowSelectedCount');
    if (!el) return;
    var selected = Object.values(slowCaseSelections).filter(Boolean).length;
    var total    = Object.keys(slowCaseSelections).length;
    el.textContent = selected + ' / ' + total + ' selected';
}

function updateTrainSlowBtn() {
    var btn = document.getElementById('trainSlowBtn');
    if (!btn) return;
    var anySelected = Object.values(slowCaseSelections).some(Boolean);
    btn.disabled = !anySelected;
}

function trainSlowCases() {
    // Only train the CHECKED slow cases
    var selectedNames = Object.keys(slowCaseSelections).filter(function(k) {
        return slowCaseSelections[k] === true;
    });

    if (!selectedNames.length) return;

    var matched = toTrain.filter(function(c) {
        return selectedNames.indexOf(c.getName()) !== -1;
    });

    if (!matched.length) {
        alert('Could not match slow cases to training set. Make sure you are training the same cases.');
        return;
    }

    toTrain = matched;
    toRecap = copyArray(toTrain);

    displayCaseCount(toTrain, 'numSelected', 'selected');

    prevCase = generateScramble();
    awaitingNext = true;
    renderCaseAttempts(currentlyDisplayedCase);

    hideSlowCasesPanel();
    showSlowCasesBanner(matched.length);
}

function showSlowCasesBanner(count) {
    var banner = document.getElementById('slowModeBanner');
    if (!banner) return;
    banner.style.display = 'flex';
    banner.innerHTML =
        '<span>Slow case mode · training ' + count + ' slow case' + (count !== 1 ? 's' : '') + '</span>' +
        '<button onclick="exitSlowCaseMode()">Exit</button>';
}

function exitSlowCaseMode() {
    location.reload();
}

function updateSlowThreshold(val) {
    var v = parseFloat(val);
    if (isNaN(v) || v <= 0) return;
    slowCaseThreshold = v;
    localStorage.setItem('slowCaseThreshold', v);

    var label = document.getElementById('thresholdLabel');
    if (label) label.textContent = v.toFixed(1) + 's';

    // Reset selections when threshold changes so new cases default to checked
    slowCaseSelections = {};
    refreshSlowCasesList();
}

document.addEventListener('DOMContentLoaded', function() {
    var slider = document.getElementById('thresholdSlider');
    var label  = document.getElementById('thresholdLabel');

    if (slider) {
        slider.value = slowCaseThreshold;
        slider.addEventListener('input', function() {
            updateSlowThreshold(this.value);
        });
    }

    if (label) {
        label.textContent = slowCaseThreshold.toFixed(1) + 's';
    }
});
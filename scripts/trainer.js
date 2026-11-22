var selectedCasesRaw = JSON.parse(sessionStorage.getItem("selectedCases")); // this would prefer selectedCases produced by zbllSelect.js / zblsSelect.js (array of {set, subset, caseName, algs?})
var recap = false;
// trainer.html?lsll: last slot + last layer, every case generated (scripts/lsll.js)
var lsllMode = /[?&]lsll\b/.test(location.search) && !!window.LSLL;
if (lsllMode) selectedCasesRaw = [{ set: "LSLL", subset: "all", caseName: "all" }];
// trainer.html?learn=ZBLL / ?learn=ZBLS: spaced repetition (scripts/srs.js)
var learnDeck = (/[?&]learn=(ZBLL|ZBLS)\b/.exec(location.search) || [])[1] || null;
var learnMode = !!learnDeck && !!window.Srs && !lsllMode;
if (learnMode) {
    selectedCasesRaw = Srs.deckCases(learnDeck).map(function (c) {
        return { set: c.set, subset: c.subset, caseName: c.caseName };
    });
}
var toTrain = [];
var currentlyDisplayedCase = null; // Track what is actually on the results screen
var displayedScramble = ""; // Scramble of the case on the results screen (for AUF-adjusted algs)
var displayedSetup = ""; // Orientation + scramble of that case, as the virtual cube showed it (for the alg player)
var justFinishedSolve = false; // Add this with your other global variables
var lockoutActive = false; // Prevents accidental double-starts
var currentOrientation = ""; // To track the orientation used for the current scramble
var solveStartTime = null; // performance.now() when timer starts
var firstMoveTime = null; // performance.now() when first cube move happens
var currentRecogTime = null; // seconds (string) of recognition time
var currentExecTime = null; // seconds (string) of execution time
var recallPendingConfirm = false; // waiting for spacebar after unmask
var recallWasSolved = false; // was the cube actually solved when unmasked

// Case sets other than ZBLL (e.g. ZBLS) register their data in
// window.CASE_SETS (see zblsData.js); ZBLL uses zbllAlgs / zbllScrambles.
function caseSetData(set) {
    return (window.CASE_SETS && window.CASE_SETS[set]) || null;
}

// The key a case's algs, main alg and notes are saved under. ZBLS cases in
// another slot get their own: "ZBLS-FL-12-3" (see zblsSlotTools.js).
function caseStoreKey(c) {
    if (c.set === "ZBLS" && c.slot && c.slot !== "FR") return "ZBLS-" + c.slot + "-" + c.subset + "-" + c.caseName;
    return c.set + "-" + c.subset + "-" + c.caseName;
}

if (selectedCasesRaw && selectedCasesRaw.length) {
    recap = !lsllMode && !learnMode && (JSON.parse(sessionStorage.getItem("recapMode")) || false);

    selectedCasesRaw.forEach((item) => {
        var c = {
            set: item.set,
            subset: item.subset,
            caseName: item.caseName,
            // ZBLS: which F2L slot (FR, FL, BR, BL), chosen on the ZBLS page
            slot: item.set === "ZBLS" ? item.slot || "FR" : null,
            // getSetup: use casemap zbll scrambles if available, choose random entry
            getSetup: function () {
                var reg = caseSetData(this.set);
                if (reg && reg.dynamic) return window.LSLL.generateSetup();
                if (reg) {
                    var list = (reg.scrambles[this.subset] || {})[this.caseName] || [];
                    if (list.length) {
                        var setup = list[Math.floor(Math.random() * list.length)];
                        // ZBLS: move it to the chosen slot, and fix the edge's starting spot
                        if (this.set === "ZBLS" && window.ZBLSSlots) {
                            setup = ZBLSSlots.moveScramble(setup, this.slot);
                            var edge = ZBLSSlots.savedEdge();
                            if (edge !== "any") setup = ZBLSSlots.fixEdge(setup, this.slot, edge);
                        }
                        return setup;
                    }
                }
                try {
                    if (
                        typeof zbllScrambles !== "undefined" &&
                        zbllScrambles[this.set] &&
                        zbllScrambles[this.set][this.subset] &&
                        zbllScrambles[this.set][this.subset][this.caseName]
                    ) {
                        var arr =
                            zbllScrambles[this.set][this.subset][this.caseName];
                        if (arr && arr.length)
                            return arr[Math.floor(Math.random() * arr.length)];
                    }
                } catch (e) {}
                return (
                    item.setup ||
                    this.set + "-" + this.subset + "-" + this.caseName
                );
            },
            getAlgsArray: function () {
                var reg = caseSetData(this.set);
                var frAlgs = reg ? ((reg.algs[this.subset] || {})[this.caseName] || []).slice() : null;
                if (reg && this.slot && this.slot !== "FR" && window.ZBLSSlots) {
                    return ZBLSSlots.algsFor(this.subset, this.caseName, this.slot, frAlgs);
                }
                if (reg) return frAlgs;
                if (typeof zbllAlgs === "undefined") return [];

                const setObj = zbllAlgs[this.set];
                if (!setObj) return [];

                const subsetObj = setObj[this.subset];
                if (!subsetObj) return [];

                return subsetObj[this.caseName] || [];
            },

            getName: function () {
                var reg = caseSetData(this.set);
                if (reg && this.slot && this.slot !== "FR") return reg.name(this.subset, this.caseName) + " (" + this.slot + ")";
                if (reg) return reg.name(this.subset, this.caseName);
                return (
                    item.name ||
                    this.set + "-" + this.subset + "-" + this.caseName
                );
            },
            getImg: function () {
                var reg = caseSetData(this.set);
                // LSLL: the ZBLS case of the case on the results screen
                if (reg && reg.dynamic) {
                    var z = displayedSetup && window.virtualCube
                        ? LSLL.zblsCaseOf(virtualCube.makeCube(displayedSetup)) : null;
                    return z ? z.img : "";
                }
                // Other ZBLS slots have no diagram: the case image draws the cube instead
                if (reg && this.slot && this.slot !== "FR") return "";
                if (reg) return reg.img(this.subset, this.caseName);
                return (
                    item.img ||
                    `svg/top/${this.set}-${this.subset}-${this.caseName}.svg`
                );
            },
        };
        toTrain.push(c);
    });
} else {
    // fallback for older storage format used previously
    var cases = JSON.parse(sessionStorage.getItem("cases")) || [];
    var selected = JSON.parse(sessionStorage.getItem("selected")) || [];
    var caseIds = JSON.parse(sessionStorage.getItem("ids")) || [];
    //get scrambles and algorithms, convert to proper format
    var algs = convertArray(JSON.parse(sessionStorage.getItem("algs") || "[]"));
    var scrambles = convertArray(
        JSON.parse(sessionStorage.getItem("scrambles") || "[]")
    );

    recap = cases.shift(); //whether trainer is in recap mode
    toTrain = loadSelectedCases();
}

var toRecap = copyArray(toTrain);

var timerStatus; // whether timer should be running
var milliseconds;
var timerRef = document.querySelector(".timer-display");
var int = null;
var virtualSolvedByCube = false;
var skipNextPauseAction = false; // prevent double-finalize when onSolve already handled pause
var virtualCubeJustShown = false; // suppress immediate reveal when toggling cube on
var virtualCubeShownTimer = null;

var scrambleRef = document.querySelector(".scramble");
var prevCase;
var prevScramble;
var count;
var keyDownTime = 0;
var tapThreshold = 10; // ms to distinguish tap vs hold
var awaitingNext = false; // waiting to move to next scramble
var revealed = false; // whether current scramble has been revealed to user
var savedHoldThreshold = localStorage.getItem("timerHoldThreshold");
var holdThreshold = savedHoldThreshold !== null ? parseInt(savedHoldThreshold, 10) : 200;
if (isNaN(holdThreshold)) holdThreshold = 200;
var holdTimer = null;
var holdStarted = false;

var startStopTimer = true;

var startStopTimer = true;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trainerSetup);
} else {
    trainerSetup();
}

function trainerSetup() {
    timerStatus = "Stop";
    seconds = 0;
    milliseconds = 0;
    count = 0;

    prevCase = generateScramble();

    // Restore saved CN inputs
    document.getElementById("colourneutrality1").value =
        localStorage.getItem("colourneutrality1") || "";
    document.getElementById("colourneutrality2").value =
        localStorage.getItem("colourneutrality2") || "";
    document.getElementById("colourneutrality3").value =
        localStorage.getItem("colourneutrality3") || "";

    // Restore timer hold threshold setting
    var holdSelect = document.getElementById("timerHoldThresholdSelect");
    if (holdSelect) {
        holdSelect.value = holdThreshold.toString();
        holdSelect.addEventListener("change", function () {
            var val = parseInt(this.value, 10);
            if (!isNaN(val) && val >= 0) {
                holdThreshold = val;
                localStorage.setItem("timerHoldThreshold", val);
            }
        });
    }

    // Restore full CN checkbox
    var fullCN = document.getElementById("fullCN");
    if (fullCN && localStorage.getItem("fullCN") === "true") {
        fullCN.checked = true;
        document.getElementById("customOrientationSection").style.display = "none";
    }

    // Restore virtual cube checkbox and show/hide container
    var cb = document.getElementById("virtualCubeCheckbox");
    var container = document.getElementById("virtualCubeContainer");

    if (localStorage.getItem("virtualCubeEnabled") === "true") {
        cb.checked = true;
    }
    
    if (cb) {
        if (cb.checked) {
            container.style.display = "block";
        } else {
            container.style.display = "none";
        }

        // when the checkbox changes, show/hide cube without altering the scramble or sidebar
        cb.removeEventListener("change", onVirtualCheckboxChange);
        cb.addEventListener("change", onVirtualCheckboxChange);
    }

    // this is to ensure virtual cube is solved and not interactive until a timed attempt starts
    try {
        if (window.virtualCube) {
            window.virtualCube.reset();
            window.virtualCube.disableMoves();
            window.virtualCube.resize && window.virtualCube.resize();
        }
    } catch (e) {}

    cb.removeEventListener("change", onVirtualCheckboxChange);
    cb.addEventListener("change", onVirtualCheckboxChange);

    // Fallback resize after a longer delay to catch any slow paint
    setTimeout(function () {
        try {
            if (
                window.virtualCube &&
                typeof window.virtualCube.resize === "function"
            ) {
                window.virtualCube.resize();
            }
        } catch (e) {}
    }, 100);

    awaitingNext = true;
    try {
        // Only the case you just solved is shown; nothing until the first result
        renderCaseAttempts(currentlyDisplayedCase);
    } catch (e) {}
    // this if loop is to make sure the count of recap is correct depending on mode
    if (recap) {
        displayCaseCount(toRecap, "numRecap", "to recap");
        displayCaseCount(toTrain, "numSelected", "selected");
    } else if (learnMode) {
        var back = document.getElementById("back");
        if (back) back.lastChild.textContent = " Learn";
        renderLearnCounts();
    } else if (lsllMode) {
        document.getElementById("numSelected").textContent = "Any ZBLS + any last layer";
        var algsLabel = document.getElementById("case-algs-label");
        if (algsLabel) algsLabel.textContent = "Cases and algs you used";
    } else {
        displayCaseCount(toTrain, "numSelected", "selected");
    }
}

function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

if (recap) {
    shuffleArray(toRecap);
}

const fullCNCheckbox = document.getElementById("fullCN");
const customSection = document.getElementById("customOrientationSection");

fullCNCheckbox.addEventListener("change", function () {
    localStorage.setItem("fullCN", this.checked);
    if (this.checked) {
        customSection.style.display = "none";
    } else {
        customSection.style.display = "flex";
    }
});

function onVirtualCheckboxChange(e) {
    localStorage.setItem("virtualCubeEnabled", e.target.checked);
    var container = document.getElementById("virtualCubeContainer");
    if (!container) return;

    if (e.target.checked) {
        container.style.display = "block";

        // Clear cached bounds so resizeCanvas remeasures with correct dimensions
        if (window.virtualCube) {
            window.virtualCube._nativeBounds = null;
        }

        try {
            if (window.virtualCube) {
                window.virtualCube.reset();
                window.virtualCube.disableMoves();
            }
        } catch (err) {
            console.error("Error resetting cube:", err);
        }

        // Wait for the browser to paint the container, then resize
        setTimeout(function () {
            try {
                if (
                    window.virtualCube &&
                    typeof window.virtualCube.resize === "function"
                ) {
                    window.virtualCube.resize();
                }
            } catch (e) {}
        }, 50);
    } else {
        hideVirtualCube();
    }
}

var attempts = JSON.parse(localStorage.getItem("zbllAttempts") || "[]");

function saveAttempts() {
    localStorage.setItem("zbllAttempts", JSON.stringify(attempts));
}

// render case-specific attempts/stats in the sidebar and under the timer
function renderCaseAttempts(caseObj) {
    var targetCase = caseObj || currentlyDisplayedCase;
    if (!targetCase) {
        // Before your first solve: say what this area is for
        var summary = document.getElementById("caseStatsSummary");
        var list = document.getElementById("caseAttemptsList");
        if (summary) summary.innerHTML =
            '<p class="case-stats-empty">Solve a case and its times and stats show up here.</p>';
        if (list) list.innerHTML = "";
        return;
    }

    var name = targetCase.getName ? targetCase.getName() : targetCase.name;

    var summaryEl = document.getElementById("caseStatsSummary");
    var listEl = document.getElementById("caseAttemptsList");
    if (!summaryEl || !listEl) return;

    var filtered = attempts
        .map(function (a, i) {
            return Object.assign({}, a, { _idx: i });
        })
        .filter(function (a) {
            return a.caseName === name;
        });

    var count = filtered.length;
    var total = filtered.reduce(function (s, a) {
        return s + (a.time || 0);
    }, 0);
    var avg = count ? total / count : 0;
    var min = count
        ? Math.min.apply(
              null,
              filtered.map(function (a) {
                  return a.time;
              })
          )
        : 0;
    var max = count
        ? Math.max.apply(
              null,
              filtered.map(function (a) {
                  return a.time;
              })
          )
        : 0;

    // Recog/exec averages — only from attempts that have split data
    var splitAttempts = filtered.filter(function (a) {
        return a.recogTime != null && a.execTime != null;
    });
    var avgRecog = "-",
        avgExec = "-";
    if (splitAttempts.length) {
        var totalRecog = splitAttempts.reduce(function (s, a) {
            return s + a.recogTime;
        }, 0);
        var totalExec = splitAttempts.reduce(function (s, a) {
            return s + a.execTime;
        }, 0);
        avgRecog = (totalRecog / splitAttempts.length).toFixed(2) + "s";
        avgExec = (totalExec / splitAttempts.length).toFixed(2) + "s";
    }

    summaryEl.innerHTML =
        '<div class="stat-square"><span class="stat-label">Attempts</span><span class="stat-value">' +
        count +
        "</span></div>" +
        '<div class="stat-square"><span class="stat-label">Average</span><span class="stat-value">' +
        (count ? avg.toFixed(2) + "s" : "-") +
        "</span></div>" +
        '<div class="stat-square"><span class="stat-label">Best</span><span class="stat-value">' +
        (count ? min.toFixed(2) + "s" : "-") +
        "</span></div>" +
        '<div class="stat-square"><span class="stat-label">Worst</span><span class="stat-value">' +
        (count ? max.toFixed(2) + "s" : "-") +
        "</span></div>" +
        // Split row — only show if we have split data
        (splitAttempts.length
            ? '<div class="stat-square stat-recog"><span class="stat-label">Avg Recog</span><span class="stat-value recog-value">' +
              avgRecog +
              "</span></div>" +
              '<div class="stat-square stat-exec"><span class="stat-label">Avg Exec</span><span class="stat-value exec-value">' +
              avgExec +
              "</span></div>"
            : "") +
        renderMoveStats(filtered, targetCase);

    // Attempt tags — show recog/exec as tooltip
    listEl.innerHTML = "";
    filtered
        .slice()
        .reverse()
        .forEach(function (a) {
            var tag = document.createElement("span");
            tag.className = "clickable-tag";
            tag.innerHTML =
                a.result === "DNF"
                    ? "DNF(" + a.time.toFixed(2) + ")"
                    : a.time.toFixed(2);

            // Show split as tooltip if available
            if (a.recogTime != null) {
                var execDisplay =
                    a.execTime != null ? a.execTime.toFixed(2) : "?";
                tag.title =
                    "Recog: " +
                    a.recogTime.toFixed(2) +
                    "s  |  Exec: " +
                    execDisplay +
                    "s";
                tag.innerHTML +=
                    '<span class="tag-split">' +
                    '<span class="tag-recog">' +
                    a.recogTime.toFixed(2) +
                    "</span>" +
                    '<span class="tag-exec">' +
                    execDisplay +
                    "</span>" +
                    "</span>";
            }

            if (a.moves && a.moves.length) {
                tag.classList.add("has-replay");
                tag.title = (tag.title ? tag.title + " · " : "") + "Click to replay this solve";
                tag.onclick = function () {
                    openSolveReplay(a._idx);
                };
            } else {
                tag.onclick = function () {
                    deleteAttempt(a._idx);
                };
            }
            listEl.appendChild(tag);
        });
}

// The moves of the solve that just ended, as [["R", ms], ...] measured from
// when the case appeared. Uses the finished solve if it matches the case on
// screen, otherwise the moves so far (e.g. a solve stopped with Esc).
var lastRecordedSolve = null;

// peek: look without marking the solve as recorded (logAttempt records it)
function getRecordedSolve(peek) {
    if (!window.virtualCube || !window.AlgDetect || !virtualCube.getLastSolve) return null;
    var setup = normSetup(displayedSetup);
    var solve = virtualCube.getLastSolve();
    var moves = null;
    if (solve && solve !== lastRecordedSolve && normSetup(solve.setup) === setup) {
        moves = solve.moves;
        if (!peek) lastRecordedSolve = solve;
    } else if (normSetup(virtualCube.getSetup()) === setup) {
        moves = virtualCube.getMoveLog();
    }
    if (!moves || !moves.length) return null;
    var start = solveStartTime || moves[0].time;
    var out = [];
    moves.forEach(function (m) {
        var tok = AlgDetect.methodNotation[m.method];
        if (tok) out.push([tok, Math.max(0, Math.round(m.time - start))]);
    });
    return out.length ? { setup: setup, moves: out } : null;
}

// Turns, TPS and fluidity for a case, plus where you struggle in your main alg
function renderMoveStats(caseAttempts, caseObj) {
    if (!window.SolveStats) return "";
    var sum = SolveStats.summarize(caseAttempts);
    if (!sum) return "";
    var html =
        '<div class="stat-square" title="Face turns per solve, mistakes included"><span class="stat-label">Avg turns</span><span class="stat-value">' +
        sum.turns.toFixed(1) + "</span></div>" +
        '<div class="stat-square" title="Turns per second from your first turn to your last"><span class="stat-label">Avg TPS</span><span class="stat-value">' +
        sum.tps.toFixed(1) + "</span></div>" +
        '<div class="stat-square" title="Share of execution time spent turning rather than pausing (gaps over ' +
        SolveStats.PAUSE_MS + 'ms count as pauses)"><span class="stat-label">Fluidity</span><span class="stat-value">' +
        Math.round(sum.fluidity * 100) + "%</span></div>" +
        '<div class="stat-square" title="Solves where you undid at least one move"><span class="stat-label">With mistakes</span><span class="stat-value">' +
        Math.round(sum.mistakeRate * 100) + "%</span></div>";

    var algs = caseObj && caseObj.getAlgsArray ? caseObj.getAlgsArray() : [];
    var mainAlg = algs[getMainAlgIndex(caseObj)];
    var spots = SolveStats.troubleSpots(caseAttempts, mainAlg);
    if (spots && spots.solves >= 3) {
        var lines = [];
        if (spots.mistake) {
            lines.push(
                "<li><b>Most undone moves</b> after turn " + spots.mistake.position + ": <code>" +
                escapeHtml(SolveStats.contextAt(spots.algTurns, spots.mistake.position)) + "</code> (" +
                spots.mistake.count + " of " + spots.solves + " solves)</li>"
            );
        }
        if (spots.slowest) {
            lines.push(
                "<li><b>Longest pause</b> after turn " + spots.slowest.position + ": <code>" +
                escapeHtml(SolveStats.contextAt(spots.algTurns, spots.slowest.position)) + "</code> (avg " +
                spots.slowest.avgGap.toFixed(2) + "s)</li>"
            );
        }
        if (lines.length) {
            html += '<div class="alg-insights"><p class="alg-insights-title">Your main alg · ' +
                spots.solves + " solves</p><ul>" + lines.join("") + "</ul></div>";
        }
    }
    return html;
}

// Replay a saved solve in the alg player (click a time under "This case")
function openSolveReplay(index) {
    var a = attempts[index];
    if (!a || !a.moves || !window.AlgPlayer) return;
    var tokens = a.moves.map(function (m) { return m[0]; });
    var stats = window.SolveStats ? SolveStats.analyze(a) : null;
    var trace = window.AlgDetect ? AlgDetect.trace(tokens) : null;
    AlgPlayer.open({
        setup: a.setup || "",
        core: tokens.join(" "),
        title: a.caseName + " · " + (a.result === "DNF" ? "DNF(" + a.time.toFixed(2) + ")" : a.time.toFixed(2) + "s"),
        heading: "Solve replay",
        timings: a.moves.map(function (m) { return m[1]; }),
        undone: trace ? trace.cancelled : null,
        info: stats
            ? [
                  ["Recog", (a.recogTime != null ? a.recogTime : stats.firstMove).toFixed(2) + "s"],
                  ["Turns", String(stats.turns)],
                  ["TPS", stats.tps.toFixed(1)],
                  ["Fluidity", Math.round(stats.fluidity * 100) + "%"],
                  ["Undone", stats.mistakes ? String(stats.mistakes) : "0"],
              ]
            : null,
        onDelete: function () {
            AlgPlayer.close();
            deleteAttempt(index);
        },
    });
}

function deleteAttempt(index) {
    if (index == null) return;

    if (!confirm("Are you sure you want to delete this time?")) return;

    attempts.splice(index, 1);
    saveAttempts();

    // this is to re-render based on the case currently being viewed in the sidebar
    renderCaseAttempts(currentlyDisplayedCase);
}

function clearCaseAttempts() {
    if (!currentlyDisplayedCase) return;
    var name = currentlyDisplayedCase.getName
        ? currentlyDisplayedCase.getName()
        : currentlyDisplayedCase.name;
    if (!confirm("Clear all attempts for " + name + "?")) return;

    attempts = attempts.filter((a) => a.caseName !== name);
    saveAttempts();
    renderCaseAttempts(currentlyDisplayedCase);
}


function clearAllAttempts() {
    if (!confirm("Clear ALL saved attempts? This cannot be undone.")) return;
    attempts = [];
    saveAttempts();
    renderCaseAttempts(currentlyDisplayedCase);
}

function logAttempt(caseObj, timeStr, result) {
    var time = parseFloat(timeStr) || 0;
    var ts = new Date().toISOString();

    // Parse recog/exec from globals set during the solve
    var recogTime = currentRecogTime ? parseFloat(currentRecogTime) : null;
    var execTime = currentExecTime ? parseFloat(currentExecTime) : null;

    var entry = {
        timestamp: ts,
        caseName:
            caseObj && caseObj.getName
                ? caseObj.getName()
                : (caseObj && caseObj.name) || "unknown",
        set: (caseObj && caseObj.set) || null,
        subset: (caseObj && caseObj.subset) || null,
        caseId: (caseObj && caseObj.caseName) || null,
        slot: (caseObj && caseObj.slot) || null,
        orientation:
            caseObj && caseObj._orientation != null
                ? caseObj._orientation
                : null,
        time: time,
        recogTime: recogTime,
        execTime: execTime,
        result: result || "OK",
        solvedByVirtualCube: !!virtualSolvedByCube,
    };

    // Moves you did and when (for replays and TPS / fluidity stats)
    var recorded = getRecordedSolve();
    if (recorded) {
        entry.setup = recorded.setup;
        entry.moves = recorded.moves;
        if (lsllMode) entry.lsll = lsllAttemptInfo(recorded.setup, recorded.moves);
    }
    if (learnMode) {
        try { onLearnAttempt(caseObj, entry); } catch (e) { console.error(e); }
    }

    virtualSolvedByCube = false;

    // Reset split globals for next solve
    currentRecogTime = null;
    currentExecTime = null;

    attempts.push(entry);
    saveAttempts();
    lastLoggedAttempt = entry;
    updateDnfToggle();
}

// ── DNF for the last solve ──────────────────────────────────────────────
// With the virtual cube or a smart cube the trainer knows if you solved it.
// With only the timer, you say so: the button next to the last time.
var lastLoggedAttempt = null;

function updateDnfToggle() {
    var btn = document.getElementById("dnfToggle");
    if (!btn) return;
    var a = lastLoggedAttempt;
    btn.hidden = !a || learnMode;
    if (!a) return;
    var dnf = a.result === "DNF";
    btn.textContent = dnf ? "Undo DNF" : "DNF";
    btn.setAttribute("aria-pressed", String(dnf));
    btn.title = dnf ? "Count the last solve as solved again" : "Mark the last solve as not solved (DNF)";
    var timeEl = document.getElementById("case-time");
    if (timeEl && !timeEl.hidden) timeEl.textContent = a.time.toFixed(2) + (dnf ? " DNF" : "");
}

function toggleLastDnf() {
    var a = lastLoggedAttempt;
    if (!a) return;
    a.result = a.result === "DNF" ? "OK" : "DNF";
    saveAttempts();
    updateDnfToggle();
    try { renderCaseAttempts(currentlyDisplayedCase); } catch (e) {}
    if (timerRef && timerRef.focus) timerRef.focus();
}

document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("dnfToggle");
    if (btn) btn.addEventListener("click", toggleLastDnf);
});

function exportAttemptsCsv() {
    if (!attempts || attempts.length === 0) {
        alert("No attempts to export");
        return;
    }
    var headers = [
        "timestamp",
        "set",
        "subset",
        "caseId",
        "caseName",
        "orientation",
        "time",
        "recogTime",
        "execTime",
        "result",
        "solvedByVirtualCube",
    ];
    var rows = attempts.map((a) =>
        headers.map((h) => JSON.stringify(a[h] || "")).join(",")
    );
    rows.unshift(headers.join(","));
    var csv = rows.join("\n");
    var blob = new Blob([csv], { type: "text/csv" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download =
        "zbll_attempts_" +
        new Date().toISOString().replace(/[:.]/g, "-") +
        ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// ── Statistics panel ──────────────────────────────────────────────────
// Cases grouped by set (T, U, L, … ZBLS, LSLL). Tick the sets you want to
// see; the choice is remembered. Click a case for its setup and algs.
var STATS_SETS_KEY = "statsHiddenSets";
var STATS_SET_ORDER = ["T", "U", "L", "H", "Pi", "Sune", "Antisune", "ZBLS", "LSLL"];

function statsSetOf(a) {
    if (a.set) return a.set;
    var first = String(a.caseName || "").split("-")[0];
    return /^F2L /.test(a.caseName || "") ? "ZBLS" : first || "Other";
}

function statsHiddenSets() {
    try { return JSON.parse(localStorage.getItem(STATS_SETS_KEY)) || {}; } catch (e) { return {}; }
}

function setStatsSetShown(set, shown) {
    var hidden = statsHiddenSets();
    if (shown) delete hidden[set]; else hidden[set] = true;
    try { localStorage.setItem(STATS_SETS_KEY, JSON.stringify(hidden)); } catch (e) {}
    showStatsPanel(true);
}

function setAllStatsSets(shown) {
    var hidden = {};
    if (!shown) attempts.forEach(function (a) { hidden[statsSetOf(a)] = true; });
    try { localStorage.setItem(STATS_SETS_KEY, JSON.stringify(hidden)); } catch (e) {}
    showStatsPanel(true);
}

// The key the case info window uses, or null (LSLL has no single case)
function statsCaseKey(a) {
    if (a.set === "LSLL") return null;
    if (a.set && a.subset && a.caseId) return caseStoreKey({ set: a.set, subset: a.subset, caseName: a.caseId, slot: a.slot });
    return null;
}

function showStatsPanel(keepScroll) {
    var panel = document.getElementById("statsPanel");
    var content = document.getElementById("statsContent");
    panel.style.display = "block";
    if (!keepScroll) {
        setTimeout(function () {
            panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    }

    if (!attempts.length) {
        content.innerHTML = '<p class="stats-empty">No solves yet.</p>';
        return;
    }

    // Group attempts: set → case → attempts
    var sets = {};
    attempts.forEach(function (a) {
        var set = statsSetOf(a);
        var name = a.caseName || a.set + "-" + a.subset + "-" + a.caseId;
        sets[set] = sets[set] || { cases: {}, list: [] };
        sets[set].list.push(a);
        (sets[set].cases[name] = sets[set].cases[name] || []).push(a);
    });
    var setNames = Object.keys(sets).sort(function (a, b) {
        var ia = STATS_SET_ORDER.indexOf(a), ib = STATS_SET_ORDER.indexOf(b);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
    });
    var hidden = statsHiddenSets();

    function summary(list) {
        var times = list.map(function (a) { return a.time; }).filter(function (t) { return t > 0; });
        var splits = list.filter(function (a) { return a.recogTime != null; });
        return {
            count: list.length,
            avg: times.length ? times.reduce(function (s, t) { return s + t; }, 0) / times.length : null,
            best: times.length ? Math.min.apply(null, times) : null,
            worst: times.length ? Math.max.apply(null, times) : null,
            recog: splits.length ? splits.reduce(function (s, a) { return s + a.recogTime; }, 0) / splits.length : null,
            exec: splits.length ? splits.reduce(function (s, a) { return s + (a.execTime || 0); }, 0) / splits.length : null,
            moves: window.SolveStats ? SolveStats.summarize(list) : null,
        };
    }
    function f(n) { return n == null ? "-" : n.toFixed(2); }

    // Which sets to show
    var html = '<div class="stats-filter" role="group" aria-label="Sets to show">' +
        '<span class="stats-filter-label">Show</span>' +
        setNames.map(function (s) {
            return '<label class="stats-set-check"><input type="checkbox"' + (hidden[s] ? "" : " checked") +
                ' onchange="setStatsSetShown(\'' + escapeHtml(s) + '\', this.checked)"> ' + escapeHtml(s) +
                ' <span class="stats-set-n">' + sets[s].list.length + "</span></label>";
        }).join("") +
        '<button type="button" class="btn btn-ghost btn-sm" onclick="setAllStatsSets(true)">All</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" onclick="setAllStatsSets(false)">None</button>' +
        "</div>";

    var shown = setNames.filter(function (s) { return !hidden[s]; });
    if (!shown.length) {
        content.innerHTML = html + '<p class="stats-empty">Tick a set to see its cases.</p>';
        return;
    }

    // One table per set, cases slowest first
    shown.forEach(function (set) {
        var s = summary(sets[set].list);
        var names = Object.keys(sets[set].cases);
        var rows = names.map(function (name) {
            return { name: name, list: sets[set].cases[name], sum: summary(sets[set].cases[name]) };
        }).sort(function (a, b) { return (b.sum.avg || 0) - (a.sum.avg || 0); });
        html += '<details class="stats-set" open><summary>' +
            '<span class="stats-set-name">' + escapeHtml(set) + "</span>" +
            '<span class="stats-set-sum">' + names.length + " case" + (names.length === 1 ? "" : "s") +
            " · " + s.count + " solve" + (s.count === 1 ? "" : "s") + " · avg " + f(s.avg) + "s · best " + f(s.best) + "s</span>" +
            "</summary>" +
            '<div class="stats-table-wrap"><table><tr><th>Case</th><th>Count</th><th>Avg</th><th>Best</th><th>Worst</th>' +
            '<th>Avg Recog</th><th>Avg Exec</th>' +
            '<th title="Face turns per solve, mistakes included">Turns</th>' +
            '<th title="Turns per second while executing">TPS</th>' +
            '<th title="Share of execution time spent turning rather than pausing">Fluidity</th></tr>' +
            rows.map(function (r) {
                var key = statsCaseKey(r.list[0]);
                var nameCell = key
                    ? '<button type="button" class="stats-case-link" title="Setup and algs" onclick="CaseInfo.open(\'' + escapeHtml(key) + '\')">' + escapeHtml(r.name) + "</button>"
                    : escapeHtml(r.name);
                var m = r.sum.moves;
                return "<tr><td>" + nameCell + "</td><td>" + r.sum.count + "</td><td>" + f(r.sum.avg) + "</td><td>" +
                    f(r.sum.best) + "</td><td>" + f(r.sum.worst) + '</td><td class="recog-col">' + f(r.sum.recog) +
                    '</td><td class="exec-col">' + f(r.sum.exec) + "</td><td>" + (m ? m.turns.toFixed(1) : "-") +
                    "</td><td>" + (m ? m.tps.toFixed(1) : "-") + "</td><td>" + (m ? Math.round(m.fluidity * 100) + "%" : "-") + "</td></tr>";
            }).join("") +
            "</table></div></details>";
    });

    content.innerHTML = html;
}

function hideStatsPanel() {
    document.getElementById("statsPanel").style.display = "none";
    // Optional: scroll back to the top when hiding
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * generates a scramble for a random ZBLL Case that is selected
 * @returns {zbllCase} - the case that was generated
 */
// ── Case order: random or weighted by how slow you are on each case ──────
// Weighted (like solved.no's Weighted Mode): each case's chance is
// proportional to its performance, a weighted mean of its last 12 times
// where recent solves count more (DNFs count double). "Strong" squares it, so
// slow cases come up even more. Cases you haven't done yet count as your
// slowest case, so new cases still come up often.
var CASE_ORDER_KEY = "caseOrder";
var PERF_RECENT = 12;     // attempts per case that count
var PERF_DECAY = 0.85;    // each older attempt counts this much less

function getCaseOrder() {
    var sel = document.getElementById("caseOrderSelect");
    return sel ? sel.value : "random";
}

function casePerformance() {
    var byCase = {};
    for (var i = attempts.length - 1; i >= 0; i--) {
        var a = attempts[i];
        var list = byCase[a.caseName] || (byCase[a.caseName] = []);
        if (list.length >= PERF_RECENT || !(a.time > 0)) continue;
        list.push(a.result === "DNF" ? a.time * 2 : a.time);
    }
    var perf = {};
    Object.keys(byCase).forEach(function (name) {
        var sum = 0, wsum = 0;
        byCase[name].forEach(function (t, age) {
            var w = Math.pow(PERF_DECAY, age);
            sum += t * w;
            wsum += w;
        });
        if (wsum) perf[name] = sum / wsum;
    });
    return perf;
}

function pickWeightedCase(arr) {
    var perf = casePerformance();
    var known = arr.map(function (c) { return perf[c.getName()]; }).filter(function (p) { return p > 0; });
    var slowest = known.length ? Math.max.apply(null, known) : 1;
    var power = getCaseOrder() === "strong" ? 2 : 1;
    var weights = arr.map(function (c) {
        if (c === prevCase && arr.length > 1) return 0;
        var p = perf[c.getName()] || slowest;
        return Math.pow(p, power);
    });
    var total = weights.reduce(function (s, w) { return s + w; }, 0);
    if (!(total > 0)) return null;
    var r = Math.random() * total;
    for (var i = 0; i < arr.length; i++) {
        r -= weights[i];
        if (r < 0) return arr[i];
    }
    return arr[arr.length - 1];
}

(function initCaseOrder() {
    var sel = document.getElementById("caseOrderSelect");
    if (!sel) return;
    var saved = localStorage.getItem(CASE_ORDER_KEY);
    if (saved && sel.querySelector('option[value="' + saved + '"]')) sel.value = saved;
    sel.addEventListener("change", function () {
        localStorage.setItem(CASE_ORDER_KEY, sel.value);
        sel.blur();
    });
})();

function generateScramble() {
    resetRecallState();
    var banner = document.getElementById("recallBanner");
    if (banner) banner.style.display = "none";

    var arr = recap ? toRecap : toTrain;
    if (!arr || arr.length === 0) return prevCase; // safety guard

    if (learnMode) {
        var learned = pickLearnCase();
        if (!learned) return prevCase; // nothing due: renderLearnCard says so
        learned._orientation = learned._orientation || 0;
        var learnScramble = learned.getSetup();
        scrambleRef.innerHTML = `<span class="label">Scramble</span><span id="current-scramble">${learnScramble}</span>`;
        prevScramble = learnScramble;
        renderLearnCard(learned);
        return learned;
    }

    var c = !recap && getCaseOrder() !== "random" ? pickWeightedCase(arr) : null;
    var tries = 0;
    while (!c) {
        var rNum = Math.floor(Math.random() * arr.length);
        c = arr[rNum];
        tries++;
        if (c === prevCase && arr.length > 1 && tries < 10) c = null;
    }

    c._orientation = c._orientation || 0;

    var rawScramble = c.getSetup();
    scrambleRef.innerHTML = `<span class="label">Scramble</span><span id="current-scramble">${rawScramble}</span>`;
    prevScramble = rawScramble;

    return c;
}

/**
 * generates the selected zbll cases
 * @returns {Array} - array of selected zbllCase objects
 */
function loadSelectedCases() {
    var selectedCases = [];

    for (var i = 0; i < selected.length; i++) {
        //only proceed if current case is selected
        if (selected[i]) {
            //get case information from arrays
            var caseName = "ZBLL " + caseIds[i].substring(3);
            var imgPath = "Images/F2L " + caseIds[i].substring(3) + ".png";
            var setupAlgs = scrambles[i];
            var alg = algs[i];

            //instantiate new zbllCase object and add to selectedCases
            var c = new zbllCase(
                caseName,
                imgPath,
                setupAlgs,
                alg,
                selected[i]
            );
            selectedCases.push(c);
        }
    }

    return selectedCases;
}

/**
 * convert an existing array to an array of arrays
 * @param {Array} arr - original array (not nested)
 * @returns {Array} - new nested array
 */
function convertArray(arr) {
    var j = 0;
    var newArr = [];

    //convert array to nested array of scrambles/algs
    for (var i = 0; i < selected.length; i++) {
        var subArr = [];
        var count = arr[j]; //length of sub array

        //create sub array of length count
        for (var m = 0; m < count; m++) {
            j++;
            subArr[m] = arr[j];
        }

        //add subArr to newArr at index i
        newArr[i] = subArr;
        j++;
    }

    return newArr;
}

/**
 * create a copy of an existing array
 * @param {Array} arr - original array to be copied
 * @returns {Array} - copied array
 */
function copyArray(arr) {
    var newArr = [];

    for (var i = 0; i < arr.length; i++) {
        newArr[i] = arr[i];
    }

    return newArr;
}

/**
 * display number of cases to train
 * @param {Array} arr - cases to train
 * @param {String} id - id of HTML element to display to
 * @param {String} message - message to display
 */
function displayCaseCount(arr, id, message) {
    var output;
    var count = arr.length;

    if (count === 1) {
        output = count + " case " + message;
    } else {
        output = count + " cases " + message;
    }

    document.getElementById(id).innerHTML = output;
    startStopTimer = true;
}

/**
 * removes a specifed ZBLL case from toRecap
 * @param {zbllCase} c - case to remove
 */
function removeElement(c) {
    var index = toRecap.indexOf(c);
    if (index > -1) toRecap.splice(index, 1);

    displayCaseCount(toRecap, "numRecap", "to recap");

    // "recap" check: some paths call this twice for the same solve
    if (toRecap.length === 0 && recap) {
        recap = false;
        // Save the fact that recap is over
        sessionStorage.setItem("recapMode", JSON.stringify(false));
        showRecapDone();
    }
}

// ── Recap complete ──────────────────────────────────────────────────────
// Everything stops (continuous training too) and you see how each case went.
// Then recap or train either the cases you tick (slow ones and DNFs are
// ticked for you) or all the cases you picked, or go back and add more.
var recapDoneOpen = false;
var recapStartedAt = recap ? new Date().toISOString() : null; // this recap's solves are logged after this
var recapCases = recap ? toRecap.slice() : [];                 // the cases in this recap
var recapRows = [];                                             // [{ c, attempts, time, ... }] for the dialog
var allPickedCases = toTrain.slice();                           // everything you picked on the selection page

// Train only these cases from now on (all of them: allPickedCases)
function setTrainCases(cases) {
    toTrain.length = 0;
    cases.forEach(function (c) { toTrain.push(c); });
    displayCaseCount(toTrain, "numSelected", "selected");
}

function startRecap(cases) {
    recap = true;
    sessionStorage.setItem("recapMode", JSON.stringify(true));
    toRecap = copyArray(cases);
    shuffleArray(toRecap);
    recapCases = toRecap.slice();
    recapStartedAt = new Date().toISOString();
    displayCaseCount(toRecap, "numRecap", "to recap");
}

// How each case went in this recap, slowest first (DNFs on top)
function recapResults() {
    var attempts = [];
    try { attempts = JSON.parse(localStorage.getItem("zbllAttempts") || "[]"); } catch (e) {}
    attempts = attempts.filter(function (a) { return recapStartedAt && a.timestamp >= recapStartedAt; });
    var rows = recapCases.map(function (c) {
        var name = c.getName();
        var mine = attempts.filter(function (a) { return a.caseName === name; });
        var ok = mine.filter(function (a) { return a.result !== "DNF" && a.time > 0; });
        var last = ok[ok.length - 1];
        return {
            c: c,
            name: name,
            count: mine.length,
            dnf: mine.length > 0 && !ok.length,
            time: ok.length ? Math.min.apply(null, ok.map(function (a) { return a.time; })) : null,
            recog: last && last.recogTime != null ? last.recogTime : null,
            exec: last && last.execTime != null ? last.execTime : null,
        };
    });
    rows.sort(function (a, b) {
        if (a.dnf !== b.dnf) return a.dnf ? -1 : 1;
        return (b.time == null ? -1 : b.time) - (a.time == null ? -1 : a.time);
    });
    return rows;
}

function recapSelected() {
    var out = [];
    document.querySelectorAll("#recapDone .recap-pick").forEach(function (box) {
        if (box.checked) out.push(recapRows[parseInt(box.dataset.i, 10)].c);
    });
    return out;
}

function updateRecapPicks() {
    var n = recapSelected().length;
    var count = document.querySelector("#recapDone [data-ref=ticked]");
    if (count) count.textContent = n ? n + " ticked case" + (n === 1 ? "" : "s") : "No cases ticked";
    document.querySelectorAll('#recapDone [data-act="again-picked"], #recapDone [data-act="train-picked"]').forEach(function (btn) {
        btn.disabled = !n;
    });
}

function showRecapDone() {
    recapDoneOpen = true;
    if (continuousTimeout) { clearTimeout(continuousTimeout); continuousTimeout = null; }
    // Some ways of ending a solve log it just after this is called
    setTimeout(renderRecapDone, 0);
}

function renderRecapDone() {
    if (!recapDoneOpen) return;
    recapRows = recapResults();
    var n = recapRows.length;
    var times = recapRows.filter(function (r) { return r.time != null; }).map(function (r) { return r.time; });
    var avg = times.length ? times.reduce(function (s, t) { return s + t; }, 0) / times.length : null;
    var dnfs = recapRows.filter(function (r) { return r.dnf; }).length;
    var fmt = function (t) { return t == null ? "–" : Number(t).toFixed(2); };
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); };
    // Ticked to start with: DNFs and anything slower than this recap's average
    var weak = function (r) { return r.dnf || (avg != null && r.time != null && r.time > avg); };

    var overlay = document.getElementById("recapDone");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "recapDone";
        overlay.className = "case-info-overlay";
        document.body.appendChild(overlay);
        overlay.addEventListener("click", function (e) {
            var btn = e.target.closest("[data-act]");
            if (!btn) return;
            var act = btn.dataset.act;
            if (act === "pick-weak" || act === "pick-all" || act === "pick-none") {
                overlay.querySelectorAll(".recap-pick").forEach(function (box) {
                    box.checked = act === "pick-all" || (act === "pick-weak" && box.dataset.weak === "1");
                });
                updateRecapPicks();
            } else if (act === "info") {
                if (window.CaseInfo) CaseInfo.open(caseStoreKey(recapRows[parseInt(btn.dataset.i, 10)].c));
            } else {
                closeRecapDone(act);
            }
        });
        overlay.addEventListener("change", function (e) {
            if (e.target.classList.contains("recap-pick")) updateRecapPicks();
        });
        // While it's open, keys don't start the timer or turn the cube
        window.addEventListener("keydown", function (e) {
            if (!recapDoneOpen || document.body.classList.contains("case-info-open")) return;
            if (e.key === "Escape") { e.preventDefault(); closeRecapDone("train"); }
            if (e.key !== "Tab" && e.key !== "Enter") e.stopPropagation();
            if (e.key === " " && e.target.tagName !== "BUTTON") e.preventDefault();
        }, true);
        window.addEventListener("keyup", function (e) {
            if (recapDoneOpen) e.stopPropagation();
        }, true);
    }
    var rowsHtml = recapRows.map(function (r, i) {
        var split = r.recog != null && r.exec != null ? fmt(r.recog) + " + " + fmt(r.exec) : "–";
        return '<tr class="' + (r.dnf ? "is-dnf" : weak(r) ? "is-slow" : "") + '">' +
            '<td><input type="checkbox" class="recap-pick" data-i="' + i + '" data-weak="' + (weak(r) ? 1 : 0) + '"' +
            (weak(r) ? " checked" : "") + ' aria-label="Recap ' + esc(r.name) + ' again"></td>' +
            '<td class="recap-case"><span class="recap-thumb" data-i="' + i + '"></span><span class="recap-name">' + esc(r.name) + "</span>" +
            (window.CaseInfo ? ' <button type="button" class="case-info-btn" data-act="info" data-i="' + i + '" title="Setup and algs" aria-label="Setup and algs for ' + esc(r.name) + '">i</button>' : "") +
            "</td>" +
            '<td class="num">' + (r.dnf ? '<span class="recap-dnf">DNF</span>' : fmt(r.time)) + "</td>" +
            '<td class="num recap-split">' + split + "</td></tr>";
    }).join("");

    overlay.innerHTML =
        '<div class="case-info-card recap-done-card" role="dialog" aria-modal="true" aria-labelledby="recapDoneTitle">' +
        '<div class="case-info-header"><h3 id="recapDoneTitle">Recap complete 🎉</h3></div>' +
        '<div class="case-info-body">' +
        '<div class="recap-summary">' +
        '<div class="case-info-stat"><span>Cases</span><b>' + n + "</b></div>" +
        '<div class="case-info-stat"><span>Average</span><b>' + (avg == null ? "–" : avg.toFixed(2) + "s") + "</b></div>" +
        '<div class="case-info-stat"><span>Best</span><b>' + (times.length ? Math.min.apply(null, times).toFixed(2) + "s" : "–") + "</b></div>" +
        '<div class="case-info-stat"><span>DNFs</span><b>' + dnfs + "</b></div>" +
        "</div>" +
        "<p>Slowest first. Cases slower than your average" + (dnfs ? " and DNFs" : "") + " are ticked, so you can recap or train just those." +
        (isContinuousOn() ? " Continuous training is paused until you choose." : "") + "</p>" +
        '<div class="recap-pick-row" role="group" aria-label="Tick">Tick:' +
        '<button type="button" class="chip" data-act="pick-weak">Slow ones</button>' +
        '<button type="button" class="chip" data-act="pick-all">All</button>' +
        '<button type="button" class="chip" data-act="pick-none">None</button>' +
        "</div>" +
        '<div class="recap-table-wrap"><table class="recap-table">' +
        '<thead><tr><th></th><th>Case</th><th class="num">Time</th><th class="num" title="Recognition + execution">Recog + exec</th></tr></thead>' +
        "<tbody>" + rowsHtml + "</tbody></table></div>" +
        // Recap = each case once; train = random cases until you stop
        '<div class="recap-next">' +
        '<div class="recap-next-row"><span class="recap-next-label" data-ref="ticked"></span>' +
        '<button type="button" class="btn btn-primary btn-sm" data-act="again-picked">Recap</button>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-act="train-picked">Train</button></div>' +
        '<div class="recap-next-row"><span class="recap-next-label">All ' + allPickedCases.length + " cases you picked</span>" +
        '<button type="button" class="btn btn-secondary btn-sm" data-act="again">Recap</button>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-act="train-all">Train</button></div>' +
        "</div>" +
        '<p class="recap-next-hint">Recap does each case once. Train keeps giving you cases until you stop.</p>' +
        '<div class="recap-done-actions">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-act="back" title="Your selection is kept, so you can tick more cases">Add more cases</button>' +
        "</div></div></div>";
    // Each case's picture: its diagram, or the cube drawn for other ZBLS slots
    overlay.querySelectorAll(".recap-thumb").forEach(function (slot) {
        var c = recapRows[parseInt(slot.dataset.i, 10)].c;
        var src = c.getImg ? c.getImg() : "";
        if (src) {
            var img = document.createElement("img");
            img.src = encodeURI(src);
            img.alt = "";
            img.loading = "lazy";
            // The angle you picked on the ZBLL page
            var angle = parseInt(caseOrientation[c.set], 10) || 0;
            if (angle) img.style.transform = "rotate(" + angle + "deg)";
            slot.appendChild(img);
        } else if (window.CubeViews && window.virtualCube) {
            var canvas = document.createElement("canvas");
            slot.appendChild(canvas);
            try { CubeViews.renderTo(canvas, "classic", virtualCube.makeCube(c.getSetup()), 48); } catch (e) { slot.removeChild(canvas); }
        }
    });
    overlay.hidden = false;
    updateRecapPicks();
    var first = overlay.querySelector('[data-act="again-picked"]');
    (first.disabled ? overlay.querySelector('[data-act="train-all"]') : first).focus();
    updateContinuousHint();
}

function closeRecapDone(choice) {
    if (choice === "back") { goBack(); return; }
    var picked = /-picked$/.test(choice) ? recapSelected() : null;
    if (picked && !picked.length) return;
    var overlay = document.getElementById("recapDone");
    if (overlay) overlay.hidden = true;
    recapDoneOpen = false;
    if (choice === "again") {
        setTrainCases(allPickedCases);
        startRecap(allPickedCases);
    } else if (choice === "again-picked") {
        startRecap(picked);
    } else {
        // Train: the ticked cases, all of them, or (Escape) whatever you were training
        if (choice === "train-picked") setTrainCases(picked);
        else if (choice === "train-all") setTrainCases(allPickedCases);
        var numRecap = document.getElementById("numRecap");
        if (numRecap) numRecap.textContent = "";
    }
    // The next case comes from what you just chose
    if (choice !== "train" && timerStatus === "Stop") prevCase = generateScramble();
    if (timerRef && timerRef.focus) timerRef.focus();
    updateContinuousHint();
    // Pick up continuous training where it left off
    if (isContinuousOn() && !continuousPaused && timerStatus === "Stop") scheduleContinuousNext();
}

var originalGetAlgsArray = toTrain.length > 0 ? toTrain[0].getAlgsArray : null;
if (originalGetAlgsArray) {
    toTrain.forEach((c) => {
        var origFunc = c.getAlgsArray;
        // Your algs: the built-in list, or your edited version of it
        c.getOwnAlgs = function () {
            var caseKey = caseStoreKey(this);
            var savedAlgs = JSON.parse(
                localStorage.getItem("customAlgs") || "{}"
            );

            if (savedAlgs[caseKey]) {
                return savedAlgs[caseKey];
            }

            return origFunc.call(this);
        };
        // Your algs, then any extra ones from alg sheets you've turned on
        // (sheets.html). Only your own list is ever saved, so removing a
        // sheet removes its algs.
        c.getAlgsArray = function () {
            var own = this.getOwnAlgs();
            var caseKey = caseStoreKey(this);
            return window.AlgSheets ? own.concat(AlgSheets.extraAlgs(caseKey, own)) : own;
        };
    });
}

/* displays information about previous ZBLL Case */
function displayCaseInfo() {
    count++;
    currentlyDisplayedCase = prevCase;
    if (recallMaskApplied) removeRecallMask();

    // COMPUTE exec time FIRST, before anything else reads it ──
    if (currentRecogTime !== null) {
        var totalTime = parseFloat(timerRef.textContent) || 0;
        var recog = parseFloat(currentRecogTime) || 0;
        currentExecTime = Math.max(0, totalTime - recog).toFixed(2);
    }

    // Now both values are ready for display and logging
    updateSplitDisplay(currentRecogTime, currentExecTime);

    document.querySelector("#case-text").innerHTML = "Result #" + count;
    document.querySelector("#case-time").innerHTML = timerRef.textContent;
    document.querySelector("#case-time").hidden = false;
    document.querySelector("#case-name").innerHTML = prevCase.getName();
    displayedScramble = prevScramble;
    displayedSetup = currentOrientation + " " + prevScramble;
    document.querySelector("#case-scram").innerHTML = prevScramble;
    document.querySelector("#case-algs").innerHTML = getAlgList();

    try {
        logAttempt(prevCase, timerRef.textContent, "OK");
    } catch (e) {
        console.error(e);
    }

    if (recap) removeElement(prevCase);

    renderCaseAttempts(currentlyDisplayedCase);

    var imgRef = document.querySelector("#case-img");
    imgRef.src = prevCase.getImg();
    rotateCaseImage(prevCase);
    if (window.updateCaseImage) window.updateCaseImage(currentOrientation + " " + prevScramble);
    imgRef.alt = prevCase.getName();
    imgRef.width = 150;
    imgRef.height = 150;

    try {
        renderCaseAttempts(currentlyDisplayedCase);
    } catch (e) {}

    awaitingNext = true;
    revealed = false;
}

function displayTimer() {
    milliseconds += 10;

    var time = String((milliseconds / 1000).toFixed(2));

    //display time
    timerRef.innerHTML = `${time}`;
}

// check if screen held down
document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchend", handleTouchEnd, false);
document.addEventListener("keydown", handleKeyDown, false);
document.addEventListener("keyup", handleKeyUp, false);

function handleTouchStart(event) {
    // Only allow timer interaction if touching the timer area
    if (
        !event.target.closest(".timer-wrapper") &&
        !event.target.closest(".timer-display")
    ) {
        return;
    }

    if (event.target.tagName === "BUTTON") {
        // do nothing if again button clicked
        return;
    }

    //start or stop timer depending on value of timerStatus
    if (timerStatus === "Stop") {
        if (learnNeedsRating()) return;
        timerRef.style.color = "var(--timer-armed)";
    } else if (timerStatus === "Start") {
        //stop timer and change timerStatus
        timerStatus = "Paused";
        clearInterval(int);

        //change text color
        timerRef.style.color = "var(--timer-stopped)";
    }
}

function handleTouchEnd(event) {
    // Only allow timer interaction if touching the timer area
    if (
        !event.target.closest(".timer-wrapper") &&
        !event.target.closest(".timer-display")
    ) {
        return;
    }

    if (event.target.tagName === "BUTTON") {
        // do nothing if again button clicked
        return;
    }

    timerRef.style.color = "";

    //start or stop timer depending on value of timerStatus
    if (timerStatus === "Stop") {
        if (learnNeedsRating()) return;
        //reset time and change timerStatus
        milliseconds = 0;

        if (int !== null) {
            clearInterval(int);
        }
        int = setInterval(displayTimer, 10);

        timerStatus = "Start";
    } else if (timerStatus === "Paused") {
        timerStatus = "Stop";

        //remove c from if in recap mode
        if (recap) {
            removeElement(prevCase);
        }

        //generate new scramble and display prevCase information
        displayCaseInfo();
        prevCase = generateScramble();
    }
}

function handleKeyDown(event) {
    if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
    ) {
        event.stopPropagation();
        return;
    }

    if (
        event.key === " " ||
        event.key === "Backspace" ||
        event.key === "Escape"
    ) {
        event.preventDefault();
    }

    if (event.key === "Escape" && isContinuousOn()) pauseContinuous();

    if (event.key === "Escape" && timerStatus === "Start") {
        clearInterval(int); // Stop the clock
        timerStatus = "Stop";
        timerRef.style.color = "";

        // log the solve and move to next case internally
        if (recap) removeElement(prevCase);
        var lastAttemptScramble = prevScramble;
        displayCaseInfo(); // records the solve
        prevCase = generateScramble(); // generates the next case for the display
        window.lastAttemptedScramble = lastAttemptScramble;

        // reset Virtual Cube to the scrambled state of the solve just finished
        var container = document.getElementById("virtualCubeContainer");
        var isVirtualOn = container && container.style.display !== "none";
        if (isVirtualOn && window.virtualCube) {
            try {
                window.virtualCube.reset();
                // use the orientation and scramble of the solve we just stopped
                var practiceSetup =
                    currentOrientation + " " + lastAttemptScramble;
                window.virtualCube.applyScramble(practiceSetup);
                window.virtualCube.enableMoves();
            } catch (e) {
                console.error("Error resetting to scrambled state:", e);
            }
        }

        lockoutActive = true;
        setTimeout(() => {
            lockoutActive = false;
        }, 500);
        awaitingNext = true;
        holdStarted = false;
        return;
    }

    if (event.key === " ") {
        if (timerStatus === "Start") {
            timerStatus = "Paused";
            clearInterval(int);
            return;
        }

        if (timerStatus === "Stop" && !lockoutActive) {
            if (holdTimer) return;
            if (learnNeedsRating()) return;

            if (holdThreshold === 0) {
                holdStarted = true;
                timerRef.style.color = "var(--timer-ready)";
            } else {
                timerRef.style.color = "var(--timer-hold)";
                holdStarted = false;

                holdTimer = setTimeout(function () {
                    holdStarted = true;
                    timerRef.style.color = "var(--timer-ready)";
                }, holdThreshold);
            }
        }
    }
}

function handleKeyUp(event) {
    // if we are in an input box, don't trigger timer logic
    if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
    ) {
        event.stopPropagation();
        return;
    }

    if (event.key === "Enter") {
        if (timerStatus === "Start" || timerStatus === "Paused") {
            if (int !== null) {
                clearInterval(int);
                int = null;
            }
            timerStatus = "Stop";
            timerRef.style.color = "";
            holdStarted = false;

            // Remove masks
            var recallCheckbox = document.getElementById("recallModeCheckbox");
            if (recallCheckbox && recallCheckbox.checked) {
                removeRecallMask();
            } else if (useUserDefinedMask && useUserDefinedMask.checked) {
                if (typeof restoreOriginalColors === "function") {
                    restoreOriginalColors();
                    if (
                        window.virtualCube &&
                        typeof window.virtualCube.draw === "function"
                    ) {
                        window.virtualCube.draw();
                    }
                }
            }

            // Calculate times
            if (currentRecogTime !== null) {
                var totalTime = parseFloat(timerRef.textContent) || 0;
                var recog = parseFloat(currentRecogTime) || 0;
                currentExecTime = Math.max(0, totalTime - recog).toFixed(2);
            }
            updateSplitDisplay(currentRecogTime, currentExecTime);

            count++;
            currentlyDisplayedCase = prevCase;
            var lastAttemptScramble = prevScramble;

            document.querySelector("#case-text").innerHTML = "Result #" + count;
            document.querySelector("#case-time").innerHTML =
                timerRef.textContent;
            document.querySelector("#case-time").hidden = false;
            document.querySelector("#case-name").innerHTML = prevCase.getName();
            displayedScramble = prevScramble;
    displayedSetup = currentOrientation + " " + prevScramble;
    document.querySelector("#case-scram").innerHTML = prevScramble;
            document.querySelector("#case-algs").innerHTML = getAlgList();

            try {
                logAttempt(prevCase, timerRef.textContent, "OK");
            } catch (e) {}
            if (recap) removeElement(prevCase);
            renderCaseAttempts(currentlyDisplayedCase);

            var imgRef = document.querySelector("#case-img");
            imgRef.src = prevCase.getImg();
    rotateCaseImage(prevCase);
    if (window.updateCaseImage) window.updateCaseImage(currentOrientation + " " + prevScramble);
            imgRef.alt = prevCase.getName();
            imgRef.width = 150;
            imgRef.height = 150;

            prevCase = generateScramble();
            window.lastAttemptedScramble = lastAttemptScramble;

            lockoutActive = true;
            setTimeout(() => {
                lockoutActive = false;
            }, 500);
            awaitingNext = true;

            // Reapply scramble to practice
            var container = document.getElementById("virtualCubeContainer");
            var isVirtualOn = container && container.style.display !== "none";
            if (isVirtualOn && window.virtualCube) {
                try {
                    window.virtualCube.reset();
                    var practiceSetup =
                        currentOrientation + " " + window.lastAttemptedScramble;
                    window.virtualCube.applyScramble(practiceSetup);
                    window.virtualCube.enableMoves();
                } catch (e) {}
            }

            var banner = document.getElementById("recallBanner");
            if (banner) banner.style.display = "none";
            return;
        }
    }

    if (event.key === " ") {
        event.preventDefault();
        timerRef.style.color = "";
        clearTimeout(holdTimer);
        holdTimer = null;

        var container = document.getElementById("virtualCubeContainer");
        var isVirtualOn = container && container.style.display !== "none";

        if (timerStatus === "Paused") {
            if (recallPendingConfirm) {
                recallPendingConfirm = false;
                timerStatus = "Paused";
                holdStarted = false;

                // Check NOW — after user has inspected
                recallWasSolved = false;
                if (window.cube3) {
                    // Use originalIsSolved directly (mask is already removed)
                    if (originalIsSolved.call(window.cube3)) {
                        recallWasSolved = true;
                    } else {
                        // Check 1 AUF away
                        for (var turns = 1; turns <= 3; turns++) {
                            for (var t = 0; t < turns; t++)
                                window.cube3.rotate_u();
                            var res = originalIsSolved.call(window.cube3);
                            for (var t = 0; t < turns; t++)
                                window.cube3.rotate_up();
                            if (res) {
                                recallWasSolved = true;
                                break;
                            }
                        }
                    }
                }

                var result = recallWasSolved ? "OK" : "DNF";
                var lastAttemptScramble = prevScramble;

                count++;
                currentlyDisplayedCase = prevCase;
                updateSplitDisplay(currentRecogTime, currentExecTime);
                document.querySelector("#case-text").innerHTML =
                    "Result #" + count;
                document.querySelector("#case-time").innerHTML =
                    timerRef.textContent + (result === "DNF" ? " DNF" : "");
                document.querySelector("#case-time").hidden = false;
                document.querySelector(
                    "#case-name"
                ).innerHTML = prevCase.getName();
                displayedScramble = prevScramble;
    displayedSetup = currentOrientation + " " + prevScramble;
    document.querySelector("#case-scram").innerHTML = prevScramble;
                document.querySelector("#case-algs").innerHTML = getAlgList();

                try {
                    logAttempt(prevCase, timerRef.textContent, result);
                } catch (e) {}
                if (recap) removeElement(prevCase);
                renderCaseAttempts(currentlyDisplayedCase);

                var imgRef = document.querySelector("#case-img");
                imgRef.src = prevCase.getImg();
    rotateCaseImage(prevCase);
    if (window.updateCaseImage) window.updateCaseImage(currentOrientation + " " + prevScramble);
                imgRef.alt = prevCase.getName();
                imgRef.width = 150;
                imgRef.height = 150;

                prevCase = generateScramble();
                window.lastAttemptedScramble = lastAttemptScramble;

                lockoutActive = true;
                setTimeout(() => {
                    lockoutActive = false;
                }, 500);

                var banner = document.getElementById("recallBanner");
                if (banner) banner.style.display = "none";
                return;
            }

            if (skipNextPauseAction) {
                skipNextPauseAction = false;
                timerStatus = "Stop";
                awaitingNext = true;
                holdStarted = false;

                if (
                    isVirtualOn &&
                    window.virtualCube &&
                    window.lastAttemptedScramble
                ) {
                    try {
                        window.virtualCube.reset();
                        // Use the orientation saved during the solve
                        var practiceSetup =
                            currentOrientation +
                            " " +
                            window.lastAttemptedScramble;
                        window.virtualCube.applyScramble(practiceSetup);
                        window.virtualCube.enableMoves();
                    } catch (e) {
                        console.error("Error resetting to practice:", e);
                    }
                }
                return;
            }

            var recallCheckbox = document.getElementById("recallModeCheckbox");
            var isVirtualOn = container && container.style.display !== "none";

            if (
                (recallCheckbox && recallCheckbox.checked) ||
                (useUserDefinedMask && useUserDefinedMask.checked)
            ) {
                // Remove masks
                if (recallCheckbox && recallCheckbox.checked) {
                    removeRecallMask();
                } else if (useUserDefinedMask && useUserDefinedMask.checked) {
                    if (typeof restoreOriginalColors === "function") {
                        restoreOriginalColors();
                        if (
                            window.virtualCube &&
                            typeof window.virtualCube.draw === "function"
                        ) {
                            window.virtualCube.draw();
                        }
                    }
                }
                recallWasSolved = false;
                recallPendingConfirm = true;
                skipNextPauseAction = true;
                window.lastAttemptedScramble = prevScramble;
                awaitingNext = true;

                var banner = document.getElementById("recallBanner");
                if (banner) {
                    banner.textContent = "Inspect — press Space to confirm";
                    banner.classList.add("is-inspect");
                    banner.style.display = "flex";
                    banner.style.opacity = "1";
                }
                return;
            }

            timerStatus = "Stop";
            if (recap) removeElement(prevCase);
            var lastAttemptScramble = prevScramble;

            if (currentRecogTime !== null) {
                var totalTime = parseFloat(timerRef.textContent) || 0;
                var recog = parseFloat(currentRecogTime) || 0;
                currentExecTime = Math.max(0, totalTime - recog).toFixed(2);
            }
            updateSplitDisplay(currentRecogTime, currentExecTime);

            var isVirtualOn = container && container.style.display !== "none";
            var cubeUnsolved =
                isVirtualOn &&
                window.virtualCube &&
                !window.virtualCube.isSolved();
            var result = cubeUnsolved ? "DNF" : "OK";

            count++;
            currentlyDisplayedCase = prevCase;
            document.querySelector("#case-text").innerHTML = "Result #" + count;
            document.querySelector("#case-time").innerHTML =
                timerRef.textContent + (result === "DNF" ? " DNF" : "");
            document.querySelector("#case-time").hidden = false;
            document.querySelector("#case-name").innerHTML = prevCase.getName();
            displayedScramble = prevScramble;
    displayedSetup = currentOrientation + " " + prevScramble;
    document.querySelector("#case-scram").innerHTML = prevScramble;
            document.querySelector("#case-algs").innerHTML = getAlgList();

            try {
                logAttempt(prevCase, timerRef.textContent, result);
            } catch (e) {}
            renderCaseAttempts(currentlyDisplayedCase);

            var imgRef = document.querySelector("#case-img");
            imgRef.src = prevCase.getImg();
    rotateCaseImage(prevCase);
    if (window.updateCaseImage) window.updateCaseImage(currentOrientation + " " + prevScramble);
            imgRef.alt = prevCase.getName();
            imgRef.width = 150;
            imgRef.height = 150;

            prevCase = generateScramble();
            window.lastAttemptedScramble = lastAttemptScramble;
            lockoutActive = true;
            setTimeout(() => {
                lockoutActive = false;
            }, 500);
            awaitingNext = true;
            holdStarted = false;
            return;
        }

        if (timerStatus === "Stop") {
            if (holdStarted && lockoutActive) {
                holdStarted = false;
                return;
            }

            if (holdStarted) {
                continuousPaused = false; // Space resumes continuous training
                beginSolve(isVirtualOn);
            } else {
                if (
                    isVirtualOn &&
                    window.virtualCube &&
                    window.lastAttemptedScramble
                ) {
                    try {
                        window.virtualCube.reset();
                        var practiceSetup =
                            currentOrientation +
                            " " +
                            window.lastAttemptedScramble;
                        window.virtualCube.applyScramble(practiceSetup);
                        window.virtualCube.enableMoves();
                        window.virtualCube.resize &&
                            window.virtualCube.resize();
                    } catch (e) {
                        console.error("Practice reveal error", e);
                    }
                }
            }
        }
        holdStarted = false;
    }
}

// Show the next case on the virtual cube and start the timer.
// Used by the Space key and by continuous training.
function beginSolve(isVirtualOn) {
    // Recap finished: wait until you choose what's next
    if (recapDoneOpen) return;
    // Learning mode: rate the case you just did first
    if (learnNeedsRating()) return;
    // Learning mode with nothing due: check again (a learning case may be due by now)
    if (learnMode && !learnUpcoming) {
        prevCase = generateScramble();
        if (!learnUpcoming) return;
    }
    if (isVirtualOn && window.virtualCube) {
        try {
            window.virtualCube.reset();

            var oriData = generateOrientation();
            currentOrientation = Array.isArray(oriData) ? oriData[0] : oriData;

            var fullSetup = currentOrientation + " " + (prevScramble || "");
            window.virtualCube.applyScramble(fullSetup);
            window.virtualCube.enableMoves();
        } catch (e) {
            console.error("Virtual cube setup error:", e);
        }
    }

    // Record solve start time for recog split
    solveStartTime = performance.now();
    firstMoveTime = null;
    currentRecogTime = null;
    currentExecTime = null;
    window._firstMoveFired = false;
    milliseconds = 0;
    if (int !== null) clearInterval(int);
    int = setInterval(displayTimer, 10);
    timerStatus = "Start";
    awaitingNext = false;
    revealed = true;
    updateContinuousHint();
}

// ── Case image angle ────────────────────────────────────────────────────
// Rotate the case diagram to the angle chosen for its set on the case
// selection page ("Other angles"), the same way that page rotates it.
var caseOrientation = {};
try {
    caseOrientation = JSON.parse(sessionStorage.getItem("caseOrientation") || "{}") || {};
} catch (e) {}

function rotateCaseImage(caseObj) {
    var img = document.getElementById("case-img");
    if (!img || !caseObj) return;
    var angle = parseInt(caseOrientation[caseObj.set], 10) || 0;
    img.style.transform = angle ? "rotate(" + angle + "deg)" : "";
}

// ── Continuous training (like csTimer) ──────────────────────────────────
// After each solve, the next case starts on its own. Esc pauses; Space resumes.
var CONTINUOUS_DELAY_MS = 600;
var continuousPaused = false;
var continuousTimeout = null;

function isVirtualCubeOn() {
    var container = document.getElementById("virtualCubeContainer");
    return !!(container && container.style.display !== "none");
}

function isContinuousOn() {
    var cb = document.getElementById("continuousCheckbox");
    return !!(cb && cb.checked && isVirtualCubeOn());
}

function scheduleContinuousNext() {
    if (!isContinuousOn() || continuousPaused || recapDoneOpen) return;
    // Learning mode: wait for you before a new case (read its alg first) or when nothing is due
    if (learnMode && (!learnUpcoming || learnUpcoming.kind === "new")) {
        updateContinuousHint();
        return;
    }
    if (continuousTimeout) clearTimeout(continuousTimeout);
    continuousTimeout = setTimeout(function () {
        continuousTimeout = null;
        if (!isContinuousOn() || continuousPaused || recapDoneOpen) return;
        if (timerStatus !== "Stop") return;
        beginSolve(true);
    }, CONTINUOUS_DELAY_MS);
    updateContinuousHint();
}

function pauseContinuous() {
    continuousPaused = true;
    if (continuousTimeout) clearTimeout(continuousTimeout);
    continuousTimeout = null;
    updateContinuousHint();
}

function updateContinuousHint() {
    var hint = document.querySelector(".timer-hint");
    if (!hint) return;
    if (recapDoneOpen) {
        hint.textContent = "Recap complete · choose what's next";
    } else if (learnMode && learnUpcoming && learnUpcoming.kind === "new") {
        hint.innerHTML = "New case: read the alg, then hold <kbd>Space</kbd>";
    } else if (!isContinuousOn()) {
        hint.innerHTML = "Hold <kbd>Space</kbd> to start";
    } else if (continuousPaused) {
        hint.innerHTML = "Continuous training paused · <kbd>Space</kbd> to resume";
    } else {
        hint.innerHTML = "Continuous training · <kbd>Esc</kbd> to pause";
    }
}

(function initContinuous() {
    var cb = document.getElementById("continuousCheckbox");
    if (!cb) return;
    cb.checked = localStorage.getItem("continuousTraining") === "true";
    cb.addEventListener("change", function () {
        localStorage.setItem("continuousTraining", this.checked);
        continuousPaused = false;
        if (!this.checked && continuousTimeout) {
            clearTimeout(continuousTimeout);
            continuousTimeout = null;
        }
        updateContinuousHint();
        this.blur();
    });
    var vc = document.getElementById("virtualCubeCheckbox");
    if (vc) vc.addEventListener("change", function () { setTimeout(updateContinuousHint, 0); });
    updateContinuousHint();
})();

// The set being trained decides the goal (what "solved" means), the page
// title and where "Select cases" goes back to.
var trainingSet = toTrain.length ? toTrain[0].set : null;
var trainingSetInfo = caseSetData(trainingSet);
if (window.CubeGoals) CubeGoals.active = trainingSetInfo ? trainingSetInfo.goal : "zbll";
if (trainingSetInfo) document.title = trainingSetInfo.label + " Trainer";

if (learnMode) document.title = "Learn " + learnDeck + " | ZBTrain";

function goBack() {
    if (learnMode) { window.location.href = "learn.html"; return; }
    window.location.href = trainingSetInfo ? trainingSetInfo.selectPage : "zbll.html";
}

function toggleVirtualCube() {
    var container = document.getElementById("virtualCubeContainer");
    if (!container) return;

    if (container.style.display === "none" || container.style.display === "") {
        showVirtualCube();
    } else {
        hideVirtualCube();
    }

    try {
        if (
            window.virtualCube &&
            typeof window.virtualCube.resize === "function"
        )
            window.virtualCube.resize();
    } catch (e) {}
}

function showVirtualCube() {
    var container = document.getElementById("virtualCubeContainer");
    if (!container) return;
    container.style.display = "block";
    // focus timer by default so space-start works reliably
    if (timerRef) timerRef.focus && timerRef.focus();
    // prevent the very next short-spacepress from auto-revealing the scramble
    virtualCubeJustShown = true;
    if (virtualCubeShownTimer) clearTimeout(virtualCubeShownTimer);
    virtualCubeShownTimer = setTimeout(function () {
        virtualCubeJustShown = false;
        virtualCubeShownTimer = null;
    }, 800);
}

function hideVirtualCube() {
    var container = document.getElementById("virtualCubeContainer");
    if (!container) return;
    container.style.display = "none";
}

function generateOrientation() {
    var cn1 = document.getElementById("colourneutrality1").value;
    if (document.getElementById("fullCN").checked) {
        var firstRotation = ["", "x", "x'", "x2", "y", "y'"];
        // each one of these first rotations puts a different color face on F
        var secondRotation = ["", "z", "z'", "z2"];
        // each second rotation puts a different edge on UF
        // each unique combination of a first and second rotation
        // must result in a unique orientation because a different color is on F
        // and a different edge is on UF. Hence all 6x4=24 rotations are reached.

        var rand1 = Math.floor(Math.random() * 6);
        var rand2 = Math.floor(Math.random() * 4);
        var randomPart = firstRotation[rand1] + secondRotation[rand2];
        if (randomPart == "x2z2") {
            randomPart = "y2";
        }
        var fullOrientation = cn1 + randomPart; // Preorientation to perform starting from white top green front
        return [fullOrientation, randomPart];
    }
    var cn2 = document.getElementById("colourneutrality2").value;
    var cn3 = document.getElementById("colourneutrality3").value;

    //todo: warn if user enters invalid strings

    localStorage.setItem("colourneutrality1", cn1);
    localStorage.setItem("colourneutrality2", cn2);
    localStorage.setItem("colourneutrality3", cn3);

    var rand1 = Math.floor(Math.random() * 4);
    var rand2 = Math.floor(Math.random() * 4);

    //console.log(cn1 + cn2.repeat(rand1) + cn3.repeat(rand2));
    var randomPart = cn2.repeat(rand1) + cn3.repeat(rand2); // Random part of the orientation
    var fullOrientation = cn1 + randomPart; // Preorientation to perform starting from white top green front
    return [fullOrientation, randomPart];
}

// Get the initial face orientation mapping (before user rotations)
// Returns an object mapping view faces (U, R, F, D, L, B) to absolute faces
// This is based on holdingOrientation + colourneutrality1, not current cube state
function getFaceOrientation() {
    // Center indices (absolute positions): U=4, R=13, F=22, D=31, L=40, B=49
    // Color to face mapping: 1=U, 2=R, 3=F, 4=D, 5=L, 6=B
    const colorToFace = { 1: "U", 2: "R", 3: "F", 4: "D", 5: "L", 6: "B" };

    // Create a temporary cube to calculate initial state
    // (holdingOrientation + colourneutrality1 applied, but no scramble or user rotations)
    const tempCube = new RubiksCube();
    tempCube.resetCube();

    // Apply holdingOrientation
    const holdingOri = holdingOrientation.value || "";
    if (holdingOri) {
        tempCube.doAlgorithm(holdingOri);
    }

    // Apply preorientation (CN + random) if available, otherwise fallback to cn1
    if (currentPreOrientation !== null) {
        tempCube.doAlgorithm(currentPreOrientation);
    } else {
        const cn1 = document.getElementById("colourneutrality1").value || "";
        if (cn1) {
            tempCube.doAlgorithm(cn1);
        }
    }

    // Get the colors at the center positions (absolute positions)
    // These colors tell us which absolute face is at each view position
    const uCenterColor = tempCube.cubestate[4][0]; // View U position has which absolute face color
    const rCenterColor = tempCube.cubestate[13][0]; // View R position has which absolute face color
    const fCenterColor = tempCube.cubestate[22][0]; // View F position has which absolute face color
    const dCenterColor = tempCube.cubestate[31][0]; // View D position has which absolute face color
    const lCenterColor = tempCube.cubestate[40][0]; // View L position has which absolute face color
    const bCenterColor = tempCube.cubestate[49][0]; // View B position has which absolute face color

    // Create mapping: view position -> absolute face
    // Example: if uCenterColor is 2 (Red), then view U = absolute R
    const viewToAbsolute = {
        U: colorToFace[uCenterColor],
        R: colorToFace[rCenterColor],
        F: colorToFace[fCenterColor],
        D: colorToFace[dCenterColor],
        L: colorToFace[lCenterColor],
        B: colorToFace[bCenterColor],
    };

    // Create reverse mapping: absolute face -> view position
    const absoluteToView = {};
    for (let viewFace in viewToAbsolute) {
        const absFace = viewToAbsolute[viewFace];
        absoluteToView[absFace] = viewFace;
    }

    return { viewToAbsolute, absoluteToView };
}

if (window.virtualCube && typeof window.virtualCube.onSolve === "function") {
    window.virtualCube.onSolve(function () {
        virtualSolvedByCube = true;

        if (timerStatus !== "Start") return;

        // Stop timer
        if (int !== null) {
            clearInterval(int);
            int = null;
        }
        timerStatus = "Paused";
        timerRef.style.color = "";

        if (currentRecogTime !== null) {
            var totalTime = parseFloat(timerRef.textContent) || 0;
            var recog = parseFloat(currentRecogTime) || 0;
            currentExecTime = Math.max(0, totalTime - recog).toFixed(2);
        }

        lockoutActive = true;
        setTimeout(() => {
            lockoutActive = false;
        }, 800);

        var recallCheckbox = document.getElementById("recallModeCheckbox");

        if (recallCheckbox && recallCheckbox.checked) {
            // 1. Reveal full cube — remove ALL grey
            removeRecallMask();

            // 2. DON'T check yet — just show the cube and wait for spacebar
            // Store the cube state snapshot for checking on confirm
            recallWasSolved = false; // will be determined on spacebar press
            recallPendingConfirm = true;
            skipNextPauseAction = true;
            window.lastAttemptedScramble = prevScramble;
            awaitingNext = true;

            // 3. Show neutral "inspect" banner
            var banner = document.getElementById("recallBanner");
            if (banner) {
                banner.textContent = "Inspect — press Space to confirm";
                banner.classList.add("is-inspect");
                banner.style.display = "flex";
                banner.style.opacity = "1";
            }
        } else if (useUserDefinedMask && useUserDefinedMask.checked) {
            if (typeof restoreOriginalColors === "function") {
                restoreOriginalColors();
                if (
                    window.virtualCube &&
                    typeof window.virtualCube.draw === "function"
                ) {
                    window.virtualCube.draw();
                }
            }
            recallWasSolved = false;
            recallPendingConfirm = true;
            skipNextPauseAction = true;
            window.lastAttemptedScramble = prevScramble;
            awaitingNext = true;

            var banner = document.getElementById("recallBanner");
            if (banner) {
                banner.textContent = "Inspect — press Space to confirm";
                banner.classList.add("is-inspect");
                banner.style.display = "flex";
                banner.style.opacity = "1";
            }
        } else {
            // Normal mode — auto-finalize immediately, no spacebar needed
            timerStatus = "Stop";
            var lastAttemptScramble = prevScramble;
            displayCaseInfo();
            prevCase = generateScramble();
            window.lastAttemptedScramble = lastAttemptScramble;

            lockoutActive = true;
            setTimeout(() => {
                lockoutActive = false;
            }, 500);
            awaitingNext = true;
            holdStarted = false;
            scheduleContinuousNext();
        }
    });
}

function getMainAlgKey(caseObj) {
    return "mainAlg:" + caseStoreKey(caseObj);
}

function getMainAlgIndex(caseObj) {
    var key = getMainAlgKey(caseObj);
    var stored = localStorage.getItem(key);
    return stored !== null ? parseInt(stored, 10) : 0; // default to first alg
}

function setMainAlg(caseObj, index) {
    var key = getMainAlgKey(caseObj);
    localStorage.setItem(key, index);
}

// ── Replace your existing getAlgList() with this ─────────────

// ── Detected alg from the last solve (see scripts/algDetect.js) ─────────
var detectedAlg = null; // { key, methods, source, dismissed, result }

function normSetup(text) {
    return String(text || "").trim().split(/\s+/).join(" ");
}

function getDetectedAlg(algs, mainIdx) {
    if (!window.AlgDetect || !window.virtualCube || !virtualCube.getLastSolve) return null;
    var solve = virtualCube.getLastSolve();
    if (!solve || !solve.moves.length) return null;
    if (normSetup(solve.setup) !== normSetup(displayedSetup)) return null;
    var key = normSetup(solve.setup) + "|" + solve.moves.length + "|" + solve.moves[0].time;
    if (!detectedAlg || detectedAlg.key !== key) {
        detectedAlg = {
            key: key,
            methods: solve.moves.map(function (m) { return m.method; }),
            source: solve.moves.some(function (m) { return m.source === "smartcube"; })
                ? "smart cube" : "virtual cube",
            dismissed: false,
        };
    }
    // Recompute every time: the alg list changes when you add or edit algs
    detectedAlg.result = AlgDetect.detect(detectedAlg.methods, algs, mainIdx);
    return detectedAlg;
}

function renderDetectedBanner(det, mainIdx) {
    if (!det || det.dismissed) return "";
    var r = det.result;
    if (r.index === mainIdx) return "";
    if (r.index >= 0) {
        return (
            '<div class="alg-detect">' +
            '<p class="alg-detect-text">You used a different alg from your main one.</p>' +
            '<div class="alg-detect-actions">' +
            '<button type="button" class="btn btn-primary" onclick="handleSetMainAlg(' + r.index + ')">Make it main</button>' +
            '<button type="button" class="btn btn-ghost" onclick="dismissDetectedAlg()">Dismiss</button>' +
            "</div></div>"
        );
    }
    if (!r.cleaned) return "";
    return (
        '<div class="alg-detect is-new">' +
        '<p class="alg-detect-title">New alg detected</p>' +
        '<p class="alg-detect-text">You solved this with an alg that is not in your list (from your ' + det.source + ").</p>" +
        '<div class="alg-text">' + escapeHtml(r.cleaned) + "</div>" +
        (r.messy
            ? '<p class="alg-detect-warn">This solve had a lot of corrections, so it may not be a clean alg. Check it before adding.</p>'
            : "") +
        '<div class="alg-detect-actions">' +
        '<button type="button" class="btn btn-primary" onclick="handleAddDetectedAlg(true)">Add as main</button>' +
        '<button type="button" class="btn btn-secondary" onclick="handleAddDetectedAlg(false)">Add</button>' +
        '<button type="button" class="btn btn-ghost" onclick="dismissDetectedAlg()">Dismiss</button>' +
        "</div></div>"
    );
}

function dismissDetectedAlg() {
    if (detectedAlg) detectedAlg.dismissed = true;
    document.querySelector("#case-algs").innerHTML = getAlgList();
}

// Save the detected alg to this case's list (same storage as editing an alg)
function handleAddDetectedAlg(asMain) {
    if (!currentlyDisplayedCase || !detectedAlg || !detectedAlg.result) return;
    var alg = detectedAlg.result.cleaned;
    if (!alg) return;
    var algs = (currentlyDisplayedCase.getOwnAlgs || currentlyDisplayedCase.getAlgsArray).call(currentlyDisplayedCase) || [];
    var caseKey = caseStoreKey(currentlyDisplayedCase);
    var savedAlgs = JSON.parse(localStorage.getItem("customAlgs") || "{}");
    if (!savedAlgs[caseKey]) savedAlgs[caseKey] = algs.slice();
    savedAlgs[caseKey].push(alg);
    localStorage.setItem("customAlgs", JSON.stringify(savedAlgs));
    if (asMain) setMainAlg(currentlyDisplayedCase, savedAlgs[caseKey].length - 1);
    detectedAlg.dismissed = true;
    document.querySelector("#case-algs").innerHTML = getAlgList();
}

// ── AUF-adjusted algorithm display (see scripts/algAuf.js) ──────────────
var adjustedAlgs = {}; // alg index → { pre, core, post, ok } for the displayed case

function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, function (ch) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
}

function renderAdjustedAlg(alg, idx) {
    var a = window.AlgAuf && displayedScramble
        ? AlgAuf.adjust(displayedScramble, alg)
        : { pre: "", core: alg, post: "", ok: false };
    adjustedAlgs[idx] = a;
    if (!a.ok) {
        return '<div class="alg-text" title="Could not check this alg against the scramble">' +
            escapeHtml(alg) + "</div>";
    }
    return (
        '<div class="alg-text">' +
        (a.pre ? '<span class="auf auf-pre" title="Pre-AUF">' + a.pre + "</span> " : "") +
        '<span class="alg-core">' + escapeHtml(a.core) + "</span>" +
        (a.post ? ' <span class="auf auf-post" title="Post-AUF">' + a.post + "</span>" : "") +
        "</div>"
    );
}

// Open the alg player (scripts/algPlayer.js) for one alg of the displayed case
function openAlgPlayerFor(idx) {
    if (!window.AlgPlayer || !currentlyDisplayedCase) return;
    var algs = currentlyDisplayedCase.getAlgsArray();
    var a = adjustedAlgs[idx];
    AlgPlayer.open({
        setup: displayedSetup,
        pre: a && a.ok ? a.pre : "",
        core: a && a.ok ? a.core : algs[idx],
        post: a && a.ok ? a.post : "",
        title: currentlyDisplayedCase.getName ? currentlyDisplayedCase.getName() : "",
    });
}

// The alg exactly as shown (with AUFs), for copying
function getDisplayedAlgText(idx, fallback) {
    var a = adjustedAlgs[idx];
    return a && a.ok && window.AlgAuf ? AlgAuf.toText(a) : fallback;
}

// ── Case info window (scripts/caseInfo.js) ──────────────────────────────
// Click the case picture on the results panel for its setup and algs.
function displayedCaseKey() {
    var c = currentlyDisplayedCase;
    if (!c || c.set === "LSLL") return null;
    return caseStoreKey(c);
}

(function initCaseInfoLinks() {
    var img = document.getElementById("case-img");
    var canvas = document.getElementById("case-canvas");
    [img, canvas].forEach(function (node) {
        if (!node) return;
        node.classList.add("case-info-link");
        node.title = "Setup and algs";
        node.addEventListener("click", function () {
            var key = displayedCaseKey();
            if (key && window.CaseInfo) CaseInfo.open(key);
        });
    });
})();

// Making an alg your main one in the window: show it first here too
window.onCaseInfoChange = function (key) {
    if (key === displayedCaseKey()) document.querySelector("#case-algs").innerHTML = getAlgList();
};

// ── Learning mode (trainer.html?learn=ZBLL / ZBLS, scheduling in srs.js) ──
// The queue decides the next case. After each solve the trainer suggests a
// rating (Again / Hard / Good / Easy) and saves it; click another to change it.
//
// No initial values here: trainerSetup() can run before this part of the
// file, and "var x = null" would then wipe what it set.
var learnUpcoming;  // { key, kind, card, caseObj } for the case about to be solved
var learnPeeked;    // you opened "Show alg" for the upcoming case
var learnPending;   // { key, caseObj, before, suggestion, rating, saved } for the case just solved
var learnCaseMap;   // case key → case object in toTrain

function learnKeyOf(c) {
    return c.set === "ZBLS" ? "ZBLS-" + c.subset + "-" + c.caseName : c.set + "-" + c.subset + "-" + c.caseName;
}

function pickLearnCase() {
    if (!learnCaseMap) {
        learnCaseMap = {};
        toTrain.forEach(function (c) { learnCaseMap[learnKeyOf(c)] = c; });
    }
    // Not the case you just solved again straight away, unless it's all that's left
    var exclude = learnPending ? learnPending.key : null;
    var q = Srs.queue(learnDeck, Date.now(), exclude);
    if (!q.next && exclude) q = Srs.queue(learnDeck, Date.now());
    learnPeeked = false;
    if (!q.next || !learnCaseMap[q.next.key]) {
        learnUpcoming = null;
        renderLearnCard(null, q);
        return null;
    }
    learnUpcoming = {
        key: q.next.key,
        kind: q.kind,
        card: Srs.getCard(q.next.key),
        caseObj: learnCaseMap[q.next.key],
    };
    return learnUpcoming.caseObj;
}

function renderLearnCounts() {
    var node = document.getElementById("numSelected");
    if (!node || !learnMode) return;
    var q = Srs.queue(learnDeck, Date.now());
    var s = Srs.streak();
    node.innerHTML =
        '<span class="learn-count count-new" title="New cases left today">' + q.counts.new + " new</span> · " +
        '<span class="learn-count count-learning" title="Cases you are still learning">' + q.counts.learning + " learning</span> · " +
        '<span class="learn-count count-review" title="Reviews due today">' + q.counts.review + " review</span>" +
        (s.days ? ' · <span title="Days in a row you studied">🔥 ' + s.days + "</span>" : "");
}

// The upcoming case: what kind it is, and its alg if it's new (or you ask)
function renderLearnCard(caseObj, q) {
    var box = document.getElementById("learnCard");
    if (!box || !learnMode) return;
    box.hidden = false;
    renderLearnCounts();

    if (!caseObj) {
        var waiting = q && q.waitingUntil;
        var at = waiting ? new Date(waiting) : null;
        box.className = "learn-card is-done";
        box.innerHTML =
            '<p class="learn-card-title">' + (waiting ? "Nothing due right now" : "All done for today 🎉") + "</p>" +
            '<p class="learn-card-text">' + (waiting
                ? "Your next learning case is due at " + at.getHours() + ":" + String(at.getMinutes()).padStart(2, "0") + ". Hold Space to check again."
                : "Come back tomorrow for your next cases. You can change how many new cases you get each day on the Learn page.") +
            '</p><a class="btn btn-secondary" href="learn.html">Back to Learn</a>';
        scrambleRef.innerHTML = '<span class="label">Scramble</span><span id="current-scramble">—</span>';
        return;
    }

    var kind = learnUpcoming.kind;
    var labels = { new: "New case", learning: "Learning", review: "Review" };
    var showAlg = kind === "new" || learnPeeked;
    var algHtml = "";
    if (showAlg) {
        var algs = caseObj.getAlgsArray() || [];
        var main = algs[getMainAlgIndex(caseObj)] || algs[0];
        if (main) {
            var a = window.AlgAuf ? AlgAuf.adjust(prevScramble, main) : { ok: false };
            algHtml = '<div class="alg-text learn-alg">' + (a.ok
                ? (a.pre ? '<span class="auf auf-pre">' + a.pre + "</span> " : "") +
                  '<span class="alg-core">' + escapeHtml(a.core) + "</span>" +
                  (a.post ? ' <span class="auf auf-post">' + a.post + "</span>" : "")
                : escapeHtml(main)) + "</div>";
        } else {
            algHtml = '<p class="learn-card-text">No alg saved for this case yet.</p>';
        }
    }
    box.className = "learn-card is-" + kind;
    box.innerHTML =
        '<div class="learn-card-head">' +
        '<span class="learn-badge">' + labels[kind] + "</span>" +
        (kind === "new" ? '<span class="learn-card-name">' + escapeHtml(caseObj.getName()) + "</span>" : "") +
        (!showAlg ? '<button type="button" class="btn btn-ghost btn-sm" onclick="learnShowAlg()">Show alg</button>' : "") +
        "</div>" +
        (kind === "new"
            ? '<div class="learn-new"><img class="learn-new-img" src="' + encodeURI(caseObj.getImg()) + '" alt="">' +
              "<div>" + algHtml + '<p class="learn-card-text">Read the alg, then hold Space to solve it.</p></div></div>'
            : algHtml);
    rotateLearnImage(caseObj);
    updateContinuousHint();
}

function rotateLearnImage(caseObj) {
    var img = document.querySelector("#learnCard .learn-new-img");
    if (!img) return;
    // caseOrientation may not be set up yet on the first case (see above)
    var ori = {};
    try { ori = JSON.parse(sessionStorage.getItem("caseOrientation") || "{}") || {}; } catch (e) {}
    var angle = parseInt(ori[caseObj.set], 10) || 0;
    img.style.transform = angle ? "rotate(" + angle + "deg)" : "";
}

// "Show alg" on a case you're reviewing: counts as a peek (rated Hard at best)
function learnShowAlg() {
    if (!learnUpcoming) return;
    learnPeeked = true;
    renderLearnCard(learnUpcoming.caseObj);
}

// After a solve: suggest a rating for the case and save it
function onLearnAttempt(caseObj, entry) {
    var key = learnKeyOf(caseObj);
    var before = Srs.getCard(key);
    var algs = caseObj.getAlgsArray() || [];
    var mainIdx = getMainAlgIndex(caseObj);
    var stats = window.SolveStats ? SolveStats.analyze(entry) : null;
    var detect = null;
    if (entry.moves && entry.moves.length && window.AlgDetect && algs.length) {
        detect = AlgDetect.detectNotation(entry.moves.map(function (m) { return m[0]; }), algs, mainIdx);
    }
    var solved = entry.result !== "DNF";
    // Stopped early on the virtual cube (Esc): not solved
    if (solved && entry.moves && isVirtualCubeOn() && window.virtualCube && !virtualCube.isSolved()) solved = false;
    var settings = Srs.getSettings(learnDeck);
    var suggestion = Srs.suggest({
        solved: solved,
        time: entry.time,
        recog: entry.recogTime,
        stats: stats,
        detect: detect,
        peeked: !!learnPeeked && before.state !== "new",
        wasNew: before.state === "new",
        goal: settings.goal,
    });
    learnPending = {
        key: key,
        caseObj: caseObj,
        before: before,
        suggestion: suggestion,
        rating: null,
        saved: false,
    };
    entry.learn = { state: before.state, suggested: suggestion.rating };
    // Not saved until you pick a rating: the next case waits for it
    renderLearnRating();
    renderLearnCounts();
    updateRatingGate();
}

// Learning mode: you rate each case before the next one. Until then the next
// scramble is hidden and the timer won't start. Returns true (and points you
// at the rating buttons) while that's the case.
function learnNeedsRating() {
    if (!learnMode || !learnPending || learnPending.saved) return false;
    var box = document.getElementById("learnRating");
    if (box) {
        box.classList.remove("needs-rating");
        void box.offsetWidth; // restart the nudge animation
        box.classList.add("needs-rating");
        if (box.scrollIntoView) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    return true;
}

function updateRatingGate() {
    var waiting = !!(learnMode && learnPending && !learnPending.saved);
    document.body.classList.toggle("learn-awaiting-rating", waiting);
    var hint = document.querySelector(".timer-hint");
    if (hint && waiting) hint.innerHTML = "Rate the case you just did to see the next one";
    else updateContinuousHint();
}

// Keys 1–4 pick Again / Hard / Good / Easy while a rating is due
document.addEventListener("keydown", function (e) {
    if (!learnMode || !learnPending || learnPending.saved) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    var r = { "1": 1, "2": 2, "3": 3, "4": 4 }[e.key];
    if (!r) return;
    e.preventDefault();
    chooseLearnRating(r);
});

// Leaving without rating: keep the suggestion, as before
window.addEventListener("pagehide", function () {
    if (learnMode && learnPending && !learnPending.saved) saveLearnPending();
});

// Save the rating (the suggestion, or the one you picked)
function saveLearnPending() {
    if (!learnPending || learnPending.saved) return;
    var r = learnPending.rating || learnPending.suggestion.rating;
    learnPending.after = Srs.rate(learnPending.key, r);
    learnPending.rating = r;
    learnPending.saved = true;
}

// You clicked a rating: save it now (or change the one you saved)
function chooseLearnRating(r) {
    var p = learnPending;
    if (!p) return;
    if (p.saved) Srs.unrate(p.key, p.before, p.rating);
    p.rating = r;
    p.saved = false;
    p.picked = true;
    saveLearnPending();
    renderLearnRating();
    renderLearnCounts();
    // Nothing was due before: this rating may have changed that
    if (!learnUpcoming) prevCase = generateScramble();
    updateRatingGate();
    if (isContinuousOn() && !continuousPaused && timerStatus === "Stop") scheduleContinuousNext();
}

function renderLearnRating() {
    var box = document.getElementById("learnRating");
    var p = learnPending;
    if (!box || !p) return;
    box.hidden = false;
    var now = Date.now();
    var suggested = p.suggestion.rating;
    var buttons = [1, 2, 3, 4].map(function (r) {
        var preview = Srs.schedule(p.before, r, now);
        var cls = "rate-btn rate-" + r +
            (r === suggested ? " is-suggested" : "") +
            (r === p.rating ? " is-picked" : "");
        return '<button type="button" class="' + cls + '" onclick="chooseLearnRating(' + r + ')"' +
            ' aria-pressed="' + (r === p.rating) + '">' +
            '<span class="rate-name">' + Srs.RATINGS[r] + "</span>" +
            '<span class="rate-when">' + Srs.describeDue(preview, now) + "</span></button>";
    }).join("");
    var note = (p.picked ? "You picked <b>" + Srs.RATINGS[p.rating] + "</b>. Suggested: " : "Suggested: <b>" + Srs.RATINGS[suggested] + "</b> · ") +
        (p.picked ? Srs.RATINGS[suggested] + " · " : "") +
        p.suggestion.reasons.map(escapeHtml).join(" · ") +
        '<span class="rate-hint">' + (p.saved ? "Tap another to change it." : "Pick one to see the next case (or press 1–4).") + "</span>";
    box.classList.toggle("is-waiting", !p.saved);
    if (p.saved) box.classList.remove("needs-rating");
    box.innerHTML =
        '<label>' + (p.saved ? "How well did you know it?" : "How well did you know it? Rate it to go on") + "</label>" +
        '<div class="rate-row">' + buttons + "</div>" +
        '<p class="rate-note">' + note + "</p>";
}


// ── LSLL breakdown: which ZBLS and ZBLL case came up, and the algs you used ──
var lsllAnalysis = null; // { key, result } for the solve on the results screen

function getLsllAnalysis() {
    if (!window.LSLL || !displayedSetup) return null;
    var key = normSetup(displayedSetup) + "|" + count;
    if (!lsllAnalysis || lsllAnalysis.key !== key) {
        // The moves are read once, when the result is first shown: by the
        // time you add an alg the virtual cube already has the next case
        var rec = getRecordedSolve(true);
        lsllAnalysis = {
            key: key,
            moves: rec ? rec.moves : null,
            zbls: LSLL.zblsCaseOf(virtualCube.makeCube(displayedSetup)),
            added: {},
        };
    }
    // Analysed every time: adding an alg changes what matches
    lsllAnalysis.result = lsllAnalysis.moves ? LSLL.analyze(displayedSetup, lsllAnalysis.moves) : null;
    return lsllAnalysis;
}

function lsllStep(label, c, used, time, kind) {
    if (!c) {
        return '<section class="lsll-step"><div class="lsll-step-body">' +
            '<p class="lsll-step-label">' + label + "</p>" +
            '<p class="lsll-step-case">Not recognised</p></div></section>';
    }
    var img = c.img
        ? '<img class="lsll-step-img" src="' + encodeURI(c.img) + '" alt="' + escapeHtml(c.name) + '">'
        : '<span class="lsll-step-img lsll-step-noimg" aria-hidden="true"></span>';
    var alg = "";
    if (used) {
        if (used.index >= 0) {
            alg = '<p class="lsll-alg-note">Your alg ' + (used.index + 1) + " of " + c.algs.length + "</p>" +
                '<div class="alg-text">' + escapeHtml(used.alg) + "</div>";
        } else if (used.cleaned) {
            var added = lsllAnalysis && lsllAnalysis.added[kind];
            alg = '<p class="lsll-alg-note">' + (added ? "Added to your algs" : "Not in your algs") + "</p>" +
                '<div class="alg-text">' + escapeHtml(used.cleaned) + "</div>" +
                (added ? "" : '<div class="alg-detect-actions"><button type="button" class="btn btn-secondary" onclick="addLsllAlg(\'' + kind + '\')">Add to ' + escapeHtml(c.name) + "</button></div>");
        }
    } else if (c.algs && c.algs.length) {
        alg = '<p class="lsll-alg-note">Alg</p><div class="alg-text">' + escapeHtml(c.algs[0]) + "</div>";
    }
    return (
        '<section class="lsll-step">' + img +
        '<div class="lsll-step-body">' +
        '<p class="lsll-step-label">' + label +
        (time != null ? ' <span class="lsll-step-time">' + time.toFixed(2) + "s</span>" : "") + "</p>" +
        '<p class="lsll-step-case">' + escapeHtml(c.name) + "</p>" + alg +
        "</div></section>"
    );
}

function getLsllBreakdown() {
    var a = getLsllAnalysis();
    if (!a) return "<p class='no-algs'>No case info.</p>";
    var r = a.result;
    if (!r) {
        return lsllStep("ZBLS", a.zbls, null, null, "zbls") +
            '<p class="lsll-hint">Solve on the virtual cube or a smart cube to see which ZBLL came up and which algs you used.</p>';
    }
    var html = lsllStep("ZBLS", r.zbls, r.zblsUsed, r.times.zbls, "zbls");
    if (r.split < 0) {
        html += '<p class="lsll-hint">The cube never reached F2L solved with the last-layer edges oriented, so there is no ZBLL to show.</p>';
    } else if (r.zbll && r.zbll.skip) {
        html += '<section class="lsll-step"><div class="lsll-step-body"><p class="lsll-step-label">ZBLL</p><p class="lsll-step-case">LL skip</p></div></section>';
    } else {
        html += lsllStep("ZBLL", r.zbll, r.zbll && !r.zbll.other ? r.zbllUsed : null, r.times.zbll, "zbll");
    }
    html += '<p class="lsll-hint">Recognition ' + r.times.recog.toFixed(2) + "s before your first turn.</p>";
    return '<div class="lsll-breakdown">' + html + "</div>";
}

// Save the alg you used for one step to that case's list (same storage as editing an alg)
function addLsllAlg(kind) {
    var a = lsllAnalysis;
    var r = a && a.result;
    var c = r && r[kind];
    var used = r && (kind === "zbls" ? r.zblsUsed : r.zbllUsed);
    if (!c || !c.key || !used || !used.cleaned) return;
    var savedAlgs = JSON.parse(localStorage.getItem("customAlgs") || "{}");
    if (!savedAlgs[c.key]) savedAlgs[c.key] = (c.ownAlgs || c.algs).slice();
    savedAlgs[c.key].push(used.cleaned);
    localStorage.setItem("customAlgs", JSON.stringify(savedAlgs));
    a.added[kind] = true;
    document.querySelector("#case-algs").innerHTML = getAlgList();
}

// What gets saved with an LSLL attempt
function lsllAttemptInfo(setup, moves) {
    var r = window.LSLL && moves ? LSLL.analyze(setup, moves) : null;
    if (!r) return null;
    return {
        zbls: r.zbls ? r.zbls.name : null,
        zbll: r.zbll ? r.zbll.name : null,
        zblsAlg: r.zblsUsed ? r.zblsUsed.index : -1,
        zbllAlg: r.zbllUsed ? r.zbllUsed.index : -1,
        zblsTime: r.split >= 0 ? +r.times.zbls.toFixed(2) : null,
        zbllTime: r.split >= 0 ? +r.times.zbll.toFixed(2) : null,
    };
}

function getAlgList() {
    adjustedAlgs = {};
    if (!currentlyDisplayedCase)
        return "<p class='no-algs'>No algorithms found.</p>";
    if (lsllMode) return getLsllBreakdown();

    var algs = currentlyDisplayedCase.getAlgsArray();
    if (!algs || algs.length === 0) {
        return "<p class='no-algs'>No algorithms found.</p>";
    }

    var mainIdx = getMainAlgIndex(currentlyDisplayedCase);
    var detected = getDetectedAlg(algs, mainIdx);
    var usedIdx = detected ? detected.result.index : -1;

    // Sort so main alg is always first
    var sorted = algs.map(function (alg, idx) {
        return { alg: alg, idx: idx };
    });
    sorted.sort(function (a, b) {
        if (a.idx === mainIdx) return -1;
        if (b.idx === mainIdx) return 1;
        return 0;
    });

    return renderDetectedBanner(detected, mainIdx) + sorted
        .map(function (item) {
            var isMain = item.idx === mainIdx;
            var note = getAlgNote(currentlyDisplayedCase, item.idx);

            return (
                '<div class="alg-entry' +
                (isMain ? " alg-main" : "") +
                '" data-alg-idx="' +
                item.idx +
                '">' +
                '<div class="alg-entry-top">' +
                (isMain
                    ? '<span class="alg-main-badge">Main</span>'
                    : '<button class="alg-set-main-btn" onclick="handleSetMainAlg(' +
                      item.idx +
                      ')">Set Main</button>') +
                (item.idx === usedIdx
                    ? '<span class="alg-used-badge" title="The alg you used in your last solve">Used</span>'
                    : "") +
                '<button class="alg-play-btn" onclick="openAlgPlayerFor(' +
                item.idx +
                ')" title="Play" aria-label="Play this algorithm"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg></button>' +
                '<button class="alg-edit-btn" onclick="handleEditAlg(' +
                item.idx +
                ')" title="Edit" aria-label="Edit"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>' +
                '<button class="alg-copy-btn" onclick="handleCopyAlg(' +
                item.idx +
                ')" title="Copy" aria-label="Copy"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg></button>' +
                '<button class="alg-note-btn" onclick="handleToggleNote(' +
                item.idx +
                ')" title="Note" aria-label="Note"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg></button>' +
                "</div>" +
                renderAdjustedAlg(item.alg, item.idx) +
                '<div class="alg-note-row" id="alg-note-row-' +
                item.idx +
                '" style="display:' +
                (note ? "flex" : "none") +
                '">' +
                '<input class="alg-note-input" type="text" placeholder="e.g. start on right index, good for U2 AUF..." ' +
                'value="' +
                note.replace(/"/g, "&quot;") +
                '" ' +
                'onchange="handleSaveNote(' +
                item.idx +
                ', this.value)" ' +
                'oninput="handleSaveNote(' +
                item.idx +
                ', this.value)">' +
                "</div>" +
                "</div>"
            );
        })
        .join("");
}

function getNoteKey(caseObj, index) {
    return "algNote:" + caseStoreKey(caseObj) + ":" + index;
}

function getAlgNote(caseObj, index) {
    return localStorage.getItem(getNoteKey(caseObj, index)) || "";
}

function handleToggleNote(index) {
    var row = document.getElementById("alg-note-row-" + index);
    if (!row) return;
    var isVisible = row.style.display !== "none";
    row.style.display = isVisible ? "none" : "flex";
    if (!isVisible) {
        // Focus the input when opening
        var input = row.querySelector(".alg-note-input");
        if (input)
            setTimeout(function () {
                input.focus();
            }, 50);
    }
}

function handleSaveNote(index, value) {
    if (!currentlyDisplayedCase) return;
    var key = getNoteKey(currentlyDisplayedCase, index);
    if (value.trim()) {
        localStorage.setItem(key, value);
    } else {
        localStorage.removeItem(key);
    }
}

// ── Action handlers ───────────────────────────────────────────

function handleSetMainAlg(index) {
    if (!currentlyDisplayedCase) return;
    setMainAlg(currentlyDisplayedCase, index);
    document.querySelector("#case-algs").innerHTML = getAlgList();
}

function handleEditAlg(index) {
    if (!currentlyDisplayedCase) return;
    var algs = currentlyDisplayedCase.getAlgsArray();
    if (!algs || index >= algs.length) return;

    var currentAlg = algs[index];
    var newAlg = prompt("Edit algorithm:", currentAlg);
    if (newAlg === null) return;

    var caseKey = caseStoreKey(currentlyDisplayedCase);
    var own = (currentlyDisplayedCase.getOwnAlgs || currentlyDisplayedCase.getAlgsArray).call(currentlyDisplayedCase) || [];
    var savedAlgs = JSON.parse(localStorage.getItem("customAlgs") || "{}");
    if (!savedAlgs[caseKey]) savedAlgs[caseKey] = own.slice();
    // An alg from a sheet: your edited version goes in your own list
    if (index < own.length) savedAlgs[caseKey][index] = newAlg;
    else savedAlgs[caseKey].push(newAlg);
    localStorage.setItem("customAlgs", JSON.stringify(savedAlgs));

    document.querySelector("#case-algs").innerHTML = getAlgList();
}

function handleCopyAlg(index) {
    if (!currentlyDisplayedCase) return;
    var algs = currentlyDisplayedCase.getAlgsArray();
    if (!algs || index >= algs.length) return;
    var copyText = getDisplayedAlgText(index, algs[index]);

    navigator.clipboard
        .writeText(copyText)
        .then(function () {
            // Brief visual feedback on the button
            var btn = document.querySelector(
                '[data-alg-idx="' + index + '"] .alg-copy-btn'
            );
            if (btn) {
                btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
                setTimeout(function () {
                    btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>';
                }, 1000);
            }
        })
        .catch(function () {
            // Fallback for older browsers
            var ta = document.createElement("textarea");
            ta.value = copyText;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
        });
}

const useUserDefinedMask = document.getElementById("useUserDefinedMask");
const maskSettings = document.getElementById("maskSettings");
const initialMaskInput = document.getElementById("initialMask");
const finalMaskInput = document.getElementById("finalMask");

// Mapping from sticker notation to Cube3 cubie positions and face indices
const stickerToCubie3Map = {
    // U face (top layer) - face index 2
    UBL: { cubie: "BLU", face: 2 },
    UB: { cubie: "B_U", face: 2 },
    UBR: { cubie: "BRU", face: 2 },
    UL: { cubie: "_LU", face: 2 },
    U: { cubie: "__U", face: 2 },
    UR: { cubie: "_RU", face: 2 },
    UFL: { cubie: "FLU", face: 2 },
    UF: { cubie: "F_U", face: 2 },
    UFR: { cubie: "FRU", face: 2 },

    // R face (right layer) - face index 1
    RUF: { cubie: "FRU", face: 1 },
    RU: { cubie: "_RU", face: 1 },
    RUB: { cubie: "BRU", face: 1 },
    RF: { cubie: "FR_", face: 1 },
    R: { cubie: "_R_", face: 1 },
    RB: { cubie: "BR_", face: 1 },
    RDF: { cubie: "FRD", face: 1 },
    RD: { cubie: "_RD", face: 1 },
    RDB: { cubie: "BRD", face: 1 },

    // F face (front layer) - face index 0
    FLU: { cubie: "FLU", face: 0 },
    FU: { cubie: "F_U", face: 0 },
    FUR: { cubie: "FRU", face: 0 },
    FL: { cubie: "FL_", face: 0 },
    F: { cubie: "F__", face: 0 },
    FR: { cubie: "FR_", face: 0 },
    FDL: { cubie: "FLD", face: 0 },
    FD: { cubie: "F_D", face: 0 },
    FDR: { cubie: "FRD", face: 0 },

    // D face (bottom layer) - face index 5
    DLF: { cubie: "FLD", face: 5 },
    DF: { cubie: "F_D", face: 5 },
    DRF: { cubie: "FRD", face: 5 },
    DL: { cubie: "_LD", face: 5 },
    D: { cubie: "__D", face: 5 },
    DR: { cubie: "_RD", face: 5 },
    DLB: { cubie: "BLD", face: 5 },
    DB: { cubie: "B_D", face: 5 },
    DRB: { cubie: "BRD", face: 5 },

    // L face (left layer) - face index 4
    LBU: { cubie: "BLU", face: 4 },
    LU: { cubie: "_LU", face: 4 },
    LFU: { cubie: "FLU", face: 4 },
    LB: { cubie: "BL_", face: 4 },
    L: { cubie: "_L_", face: 4 },
    LF: { cubie: "FL_", face: 4 },
    LBD: { cubie: "BLD", face: 4 },
    LD: { cubie: "_LD", face: 4 },
    LFD: { cubie: "FLD", face: 4 },

    // B face (back layer) - face index 3
    BRU: { cubie: "BRU", face: 3 },
    BU: { cubie: "B_U", face: 3 },
    BLU: { cubie: "BLU", face: 3 },
    BR: { cubie: "BR_", face: 3 },
    B: { cubie: "B__", face: 3 },
    BL: { cubie: "BL_", face: 3 },
    BDR: { cubie: "BRD", face: 3 },
    BD: { cubie: "B_D", face: 3 },
    BDL: { cubie: "BLD", face: 3 },
};

var originalCubeColors = null;
var currentMaskState = { initial: "", final: "" };

function parseMaskInput(maskInput) {
    if (!maskInput) return [];

    var stickers = [];
    var parts = maskInput.split(",");

    for (var i = 0; i < parts.length; i++) {
        var s = parts[i].trim().toUpperCase();
        if (s.length === 0) continue;

        // Check if this is a piece mask (ends with !)
        if (s.endsWith("!")) {
            var pieceNotation = s.slice(0, -1); // Remove the !
            var expandedStickers = expandPieceMask(pieceNotation);
            stickers = stickers.concat(expandedStickers);
            continue;
        }

        if (s.length === 3) {
            var normalized = s.split("").sort().join("");
            var firstChar = s[0];

            for (var key in stickerToCubie3Map) {
                if (key.length === 3 && key[0] === firstChar) {
                    var normalizedKey = key.split("").sort().join("");
                    if (normalizedKey === normalized) {
                        stickers.push(key);
                        break;
                    }
                }
            }
        } else if (stickerToCubie3Map[s]) {
            stickers.push(s);
        }
    }

    return stickers;
}

function expandPieceMask(pieceNotation) {
    var stickers = [];
    var normalized = pieceNotation.split("").sort().join("");

    // find all stickers that belong to this piece
    for (var key in stickerToCubie3Map) {
        var keyNormalized = key.split("").sort().join("");
        if (keyNormalized === normalized) {
            stickers.push(key);
        }
    }

    return stickers;
}

// store the original logic to use when mask is disabled
var originalIsSolved = Cube3.prototype.isSolved;

Cube3.prototype.isSolved = function () {
    var self = this;

    function checkWithOriginals() {
        var swapped = false;
        // Swap colors and original_colors temporarily
        for (var ck in self.cubies) {
            var cubie = self.cubies[ck];
            if (cubie && cubie.original_colors) {
                var temp = cubie.colors;
                cubie.colors = cubie.original_colors;
                cubie.original_colors = temp;
                swapped = true;
            }
        }

        var result = originalIsSolved.call(self);

        // Swap them back
        if (swapped) {
            for (var ck in self.cubies) {
                var cubie = self.cubies[ck];
                if (cubie && cubie.original_colors) {
                    var temp = cubie.colors;
                    cubie.colors = cubie.original_colors;
                    cubie.original_colors = temp;
                }
            }
        }
        return result;
    }

    if (recallMaskApplied) {
        // Check solved as-is
        if (checkWithOriginals()) return true;

        // Check 1 AUF away: try U, U2, U'
        for (var turns = 1; turns <= 3; turns++) {
            for (var t = 0; t < turns; t++) self.rotate_u();
            var res = checkWithOriginals();
            for (var t = 0; t < turns; t++) self.rotate_up();
            if (res) return true;
        }

        return false;
    }

    if (!useUserDefinedMask || !useUserDefinedMask.checked) {
        return originalIsSolved.call(this);
    }

    var maskColor = "rgba(128, 128, 128, 0.85)";

    var centers = {
        F: this.cubies["F__"].colors[0],
        R: this.cubies["_R_"].colors[1],
        U: this.cubies["__U"].colors[2],
        B: this.cubies["B__"].colors[3],
        L: this.cubies["_L_"].colors[4],
        D: this.cubies["__D"].colors[5],
    };
    var sides = ["F", "R", "U", "B", "L", "D"];
    for (var s = 0; s < sides.length; s++) {
        var centerColor = centers[sides[s]];
        for (var cubiePos in this.cubies) {
            if (
                (s === 0 && cubiePos[0] === "F") ||
                (s === 3 && cubiePos[0] === "B") ||
                (s === 1 && cubiePos[1] === "R") ||
                (s === 4 && cubiePos[1] === "L") ||
                (s === 2 && cubiePos[2] === "U") ||
                (s === 5 && cubiePos[2] === "D")
            ) {
                var c = this.cubies[cubiePos].colors[s];
                if (c === maskColor || c === this.internal_color) continue;
                if (c !== centerColor) return false;
            }
        }
    }
    return true;
};

function applyMaskToVirtualCube() {
    if (!window.cube3) return;

    var maskEnabled = useUserDefinedMask && useUserDefinedMask.checked;
    var initialMask = initialMaskInput ? initialMaskInput.value.trim() : "";
    var finalMask = finalMaskInput ? finalMaskInput.value.trim() : "";

    // always restore original colors first
    if (originalCubeColors !== null) {
        restoreOriginalColors();
    }

    if (!maskEnabled || (initialMask === "" && finalMask === "")) {
        // If masking is disabled or both inputs are empty, just restore and return
        if (window.virtualCube && window.virtualCube.draw) {
            window.virtualCube.draw();
        }
        return;
    }

    // save original colors if we haven't yet
    if (originalCubeColors === null) {
        saveOriginalColors();
    }

    currentMaskState = { initial: initialMask, final: finalMask };

    // parse masks
    var initialStickers = parseMaskInput(initialMask);
    var finalStickers = parseMaskInput(finalMask);
    var allMasked = initialStickers.concat(finalStickers);

    // apply gray color to masked stickers
    var maskColor = "rgba(128, 128, 128, 0.85)";

    for (var i = 0; i < allMasked.length; i++) {
        var sticker = allMasked[i];
        var mapping = stickerToCubie3Map[sticker];

        if (mapping && window.cube3.cubies[mapping.cubie]) {
            window.cube3.cubies[mapping.cubie].colors[mapping.face] = maskColor;
        }
    }

    // redraw the cube
    if (window.virtualCube && window.virtualCube.draw) {
        window.virtualCube.draw();
    }
}

function saveOriginalColors() {
    if (!window.cube3) return;

    originalCubeColors = {};

    for (var cubieKey in window.cube3.cubies) {
        var cubie = window.cube3.cubies[cubieKey];
        originalCubeColors[cubieKey] = cubie.colors.slice();
    }
}

function restoreOriginalColors() {
    if (!window.cube3 || !originalCubeColors) return;

    for (var cubieKey in originalCubeColors) {
        if (window.cube3.cubies[cubieKey]) {
            window.cube3.cubies[cubieKey].colors = originalCubeColors[
                cubieKey
            ].slice();
        }
    }
}

// load saved settings on page load
document.addEventListener("DOMContentLoaded", function () {
    const savedMaskEnabled =
        localStorage.getItem("useUserDefinedMask") === "true";
    const savedInitialMask = localStorage.getItem("initialMask") || "";
    const savedFinalMask = localStorage.getItem("finalMask") || "";

    if (useUserDefinedMask) {
        useUserDefinedMask.checked = savedMaskEnabled;
        maskSettings.style.display = savedMaskEnabled ? "block" : "none";
    }

    if (initialMaskInput) initialMaskInput.value = savedInitialMask;
    if (finalMaskInput) finalMaskInput.value = savedFinalMask;

    setTimeout(function () {
        applyMaskToVirtualCube();
    }, 150);
});

// UPDATE existing cubeFirstMove listener:
document.addEventListener("cubeFirstMove", function (e) {
    if (timerStatus !== "Start") return;
    if (!solveStartTime) return;
    if (currentRecogTime !== null) return;

    var firstMoveAt = e.detail ? e.detail.time : performance.now();
    var recogSeconds = (firstMoveAt - solveStartTime) / 1000;
    currentRecogTime = recogSeconds.toFixed(2);

    var splitEl = document.getElementById("splitDisplay");
    if (splitEl) {
        splitEl.style.display = "flex";
        splitEl.innerHTML =
            '<span class="split-item split-recog">Recog <b>' +
            currentRecogTime +
            "s</b></span>" +
            '<span class="split-divider">|</span>' +
            '<span class="split-item split-exec">Executing…</span>';
    }

    // Recall mode mask
    var recallCheckbox = document.getElementById("recallModeCheckbox");
    if (recallCheckbox && recallCheckbox.checked && !recallMaskApplied) {
        setTimeout(function () {
            applyRecallMask();
            var banner = document.getElementById("recallBanner");
            if (banner) {
                banner.style.display = "flex";
                banner.style.opacity = "1";
            }
        }, 30);
    }
});

document.addEventListener("cubeAUFMove", function (e) {
    if (timerStatus !== "Start") return;
    if (currentRecogTime !== null) return;

    var splitEl = document.getElementById("splitDisplay");
    if (splitEl) {
        var elapsed = ((e.detail.time - solveStartTime) / 1000).toFixed(2);
        splitEl.style.display = "flex";
        splitEl.innerHTML =
            '<span class="split-item split-recog">Recognizing <b>' +
            elapsed +
            "s</b></span>" +
            '<span class="split-divider">|</span>' +
            '<span class="split-item split-exec is-pending">Waiting for alg</span>';
    }

    var recallCheckbox = document.getElementById("recallModeCheckbox");
    if (recallCheckbox && recallCheckbox.checked && !recallMaskApplied) {
        applyRecallMask();
        var banner = document.getElementById("recallBanner");
        if (banner) {
            banner.style.display = "flex";
            banner.style.opacity = "1";
        }
    }
});

var recallCb = document.getElementById("recallModeCheckbox");
if (recallCb) {
    recallCb.checked = localStorage.getItem("recallMode") === "true";
    recallCb.addEventListener("change", function () {
        localStorage.setItem("recallMode", this.checked);
    });
}

if (useUserDefinedMask) {
    useUserDefinedMask.addEventListener("change", function () {
        maskSettings.style.display = this.checked ? "block" : "none";
        localStorage.setItem("useUserDefinedMask", this.checked);
        console.log("Mask enabled:", this.checked);
        applyMaskToVirtualCube();
    });
}

if (initialMaskInput) {
    initialMaskInput.addEventListener("input", function () {
        localStorage.setItem("initialMask", this.value);
        console.log("Initial mask:", this.value);
        applyMaskToVirtualCube();
    });
}

if (finalMaskInput) {
    finalMaskInput.addEventListener("input", function () {
        localStorage.setItem("finalMask", this.value);
        console.log("Final mask:", this.value);
        applyMaskToVirtualCube();
    });
}

if (window.virtualCube && window.virtualCube.applyScramble) {
    var originalApplyScramble = window.virtualCube.applyScramble;

    window.virtualCube.applyScramble = function (scramble) {
        originalApplyScramble.call(this, scramble);

        saveOriginalColors();

        // Apply right away: applyMaskToVirtualCube restores the colours saved
        // above, so running it later (it used to be on a 10ms timer) could wipe
        // out moves made in between, e.g. from a smart cube or continuous mode.
        snapshotRecallStickers();
        applyMaskToVirtualCube();
    };
}

if (window.virtualCube && window.virtualCube.reset) {
    var originalReset = window.virtualCube.reset;

    window.virtualCube.reset = function () {
        originalReset.call(this);

        originalCubeColors = null;
        saveOriginalColors();

        // Run now, not on a timer: a delayed call would restore saved colours
        // over any moves made in the meantime (see the applyScramble wrapper).
        applyMaskToVirtualCube();
    };
}

var recallMaskApplied = false;

function snapshotRecallStickers() {
    if (!window.cube3) return;
    var uCenter = window.cube3.cubies["__U"];
    window._recallLLColor = uCenter ? uCenter.colors[2] : null;
    window._recallSnapshot = true;
}

function applyRecallMask() {
    if (!window.cube3 || !window._recallSnapshot) return;
    if (!window._recallLLColor) return;

    var maskColor = "rgba(128, 128, 128, 0.85)";
    var llColor = window._recallLLColor;

    // Mask ALL LL stickers (12 side + 9 U-face) except LL color ones
    var allLLStickers = [
        { cubie: "FLU", face: 0 },
        { cubie: "F_U", face: 0 },
        { cubie: "FRU", face: 0 },
        { cubie: "FRU", face: 1 },
        { cubie: "_RU", face: 1 },
        { cubie: "BRU", face: 1 },
        { cubie: "BRU", face: 3 },
        { cubie: "B_U", face: 3 },
        { cubie: "BLU", face: 3 },
        { cubie: "BLU", face: 4 },
        { cubie: "_LU", face: 4 },
        { cubie: "FLU", face: 4 },
        { cubie: "FLU", face: 2 },
        { cubie: "F_U", face: 2 },
        { cubie: "FRU", face: 2 },
        { cubie: "_RU", face: 2 },
        { cubie: "__U", face: 2 },
        { cubie: "_LU", face: 2 },
        { cubie: "BLU", face: 2 },
        { cubie: "B_U", face: 2 },
        { cubie: "BRU", face: 2 },
    ];

    allLLStickers.forEach(function (s) {
        var cubie = window.cube3.cubies[s.cubie];
        if (!cubie) return;
        var color = cubie.original_colors
            ? cubie.original_colors[s.face]
            : cubie.colors[s.face];
        if (color !== maskColor && color !== llColor) {
            cubie.colors[s.face] = maskColor;
        }
    });

    if (window.virtualCube && window.virtualCube.draw)
        window.virtualCube.draw();
    recallMaskApplied = true;
}

function removeRecallMask() {
    if (!recallMaskApplied) return;

    if (window.cube3) {
        for (var cubieKey in window.cube3.cubies) {
            var cubie = window.cube3.cubies[cubieKey];
            if (cubie && cubie.original_colors) {
                cubie.colors = cubie.original_colors.slice();
            }
        }
    }

    window._recallOriginalColors = null;
    window._recallGreyPositions = null;
    recallMaskApplied = false;

    if (window.virtualCube && window.virtualCube.draw)
        window.virtualCube.draw();
}
function resetRecallState() {
    window._recallOriginalColors = null;
    window._recallSnapshot = null;
    window._recallLLColor = null;
    recallMaskApplied = false;
}

var includeRecognitionTime = document.getElementById("includeRecognitionTime");
var isIncludeRecognitionTime =
    localStorage.getItem("includeRecognitionTime") === "true";
if (includeRecognitionTime) {
    includeRecognitionTime.addEventListener("click", function () {
        localStorage.setItem("includeRecognitionTime", this.checked);
        isIncludeRecognitionTime = includeRecognitionTime.checked;
    });
}

function toggleSettings() {
    const sidebar = document.getElementById("settingsSidebar");
    if (sidebar) {
        sidebar.classList.toggle("active");

        if (sidebar.classList.contains("active")) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }
}

function updateSplitDisplay(recog, exec) {
    var el = document.getElementById("splitDisplay");
    if (!el) return;

    if (recog == null) {
        el.style.display = "none";
        el.innerHTML = "";
        return;
    }

    el.style.display = "flex";
    el.innerHTML =
        '<span class="split-item split-recog">Recog <b>' +
        parseFloat(recog).toFixed(2) +
        "s</b></span>" +
        '<span class="split-divider">|</span>' +
        '<span class="split-item split-exec">Exec <b>' +
        parseFloat(exec).toFixed(2) +
        "s</b></span>";
}

var selectedCasesRaw = JSON.parse(sessionStorage.getItem("selectedCases")); // this would prefer selectedCases produced by index.js (array of {set, subset, caseName, algs?})
var recap = false;
var toTrain = [];
var currentlyDisplayedCase = null; // Track what is actually on the results screen
var justFinishedSolve = false; // Add this with your other global variables
var lockoutActive = false; // Prevents accidental double-starts
var currentOrientation = ""; // To track the orientation used for the current scramble
var solveStartTime = null; // performance.now() when timer starts
var firstMoveTime = null; // performance.now() when first cube move happens
var currentRecogTime = null; // seconds (string) of recognition time
var currentExecTime = null; // seconds (string) of execution time
var recallPendingConfirm = false; // waiting for spacebar after unmask
var recallWasSolved = false; // was the cube actually solved when unmasked

if (selectedCasesRaw && selectedCasesRaw.length) {
    recap = JSON.parse(sessionStorage.getItem("recapMode")) || false;

    selectedCasesRaw.forEach((item) => {
        var c = {
            set: item.set,
            subset: item.subset,
            caseName: item.caseName,
            // getSetup: use casemap zbll scrambles if available, choose random entry
            getSetup: function () {
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
                } catch (e) { }
                return (
                    item.setup ||
                    this.set + "-" + this.subset + "-" + this.caseName
                );
            },
            getAlgsArray: function () {
                if (typeof zbllAlgs === "undefined") return [];

                const setObj = zbllAlgs[this.set];
                if (!setObj) return [];

                const subsetObj = setObj[this.subset];
                if (!subsetObj) return [];

                return subsetObj[this.caseName] || [];
            },

            getName: function () {
                return (
                    item.name ||
                    this.set + "-" + this.subset + "-" + this.caseName
                );
            },
            getImg: function () {
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
var holdThreshold = 200; // ms to auto-start on hold
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

    // Restore full CN checkbox
    var fullCN = document.getElementById("fullCN");
    if (fullCN && localStorage.getItem("fullCN") === "true") {
        fullCN.checked = true;
        document.getElementById("customOrientationSection").style.display = "none";
    }

    // Restore virtual cube checkbox and show/hide container
    var cb = document.getElementById("virtualCubeCheckbox");
var container = document.getElementById("virtualCubeContainer");
if (cb) {
    if (localStorage.getItem("virtualCubeEnabled") === "true") {
        cb.checked = true;
    }

    if (cb.checked) {
        container.style.display = "block";
        setTimeout(function () {
            try {
                if (window.virtualCube) {
                    window.virtualCube.reset(); // reset now calls resizeCanvas internally
                    window.virtualCube.disableMoves();
                }
            } catch (e) {}
            document.body.focus();
        }, 150);
    } else {
        container.style.display = "none";
        try {
            if (window.virtualCube) {
                window.virtualCube.reset();
                window.virtualCube.disableMoves();
            }
        } catch (e) {}
    }

    cb.removeEventListener("change", onVirtualCheckboxChange);
    cb.addEventListener("change", onVirtualCheckboxChange);
}

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
    }, 300);

    awaitingNext = true;
    try {
        renderCaseAttempts(prevCase);
    } catch (e) {}

    if (recap) {
        displayCaseCount(toRecap, "numRecap", "to recap");
        displayCaseCount(toTrain, "numSelected", "selected");
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
        setTimeout(function () {
            try {
                if (window.virtualCube) {
                    window.virtualCube.reset();
                    window.virtualCube.disableMoves();
                }
            } catch (e) {}
            document.body.focus();
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
    if (!targetCase) return;

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
            : "");

    // Attempt tags — show recog/exec as tooltip
    listEl.innerHTML = "";
    filtered
        .slice()
        .reverse()
        .forEach(function (a) {
            var tag = document.createElement("span");
            tag.className = "clickable-tag";
            tag.innerHTML = a.time.toFixed(2);

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

            tag.onclick = function () {
                deleteAttempt(a._idx);
            };
            listEl.appendChild(tag);
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

function clearCaseAttempts() {
    if (!prevCase) return;
    var name = prevCase.getName ? prevCase.getName() : prevCase.name;
    if (!confirm("Clear all attempts for " + name + "?")) return;
    attempts = attempts.filter((a) => a.caseName !== name);
    saveAttempts();
    renderCaseAttempts(prevCase);
}

function clearAllAttempts() {
    if (!confirm("Clear ALL saved attempts? This cannot be undone.")) return;
    attempts = [];
    saveAttempts();
    renderCaseAttempts(prevCase);
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

    virtualSolvedByCube = false;

    // Reset split globals for next solve
    currentRecogTime = null;
    currentExecTime = null;

    attempts.push(entry);
    saveAttempts();
}

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

function showStatsPanel() {
    var panel = document.getElementById("statsPanel");
    var content = document.getElementById("statsContent");
    panel.style.display = "block";
    setTimeout(function () {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    // Per-case stats
    var byCase = {};
    attempts.forEach(function (a) {
        var key = a.caseName || a.set + "-" + a.subset + "-" + a.caseId;
        if (!byCase[key])
            byCase[key] = {
                count: 0,
                total: 0,
                min: Infinity,
                max: 0,
                recogTotal: 0,
                execTotal: 0,
                splitCount: 0,
            };
        byCase[key].count++;
        byCase[key].total += a.time;
        byCase[key].min = Math.min(byCase[key].min, a.time);
        byCase[key].max = Math.max(byCase[key].max, a.time);
        if (a.recogTime != null) {
            byCase[key].recogTotal += a.recogTime;
            byCase[key].execTotal += a.execTime;
            byCase[key].splitCount++;
        }
    });

    var html = "<h4>Per-case stats</h4>";
    html +=
        "<table><tr><th>Case</th><th>Count</th><th>Avg</th><th>Best</th><th>Worst</th><th>Avg Recog</th><th>Avg Exec</th></tr>";
    Object.keys(byCase)
        .sort()
        .forEach(function (k) {
            var s = byCase[k];
            var avg = s.count ? (s.total / s.count).toFixed(2) : "-";
            var avgRecog = s.splitCount
                ? (s.recogTotal / s.splitCount).toFixed(2)
                : "-";
            var avgExec = s.splitCount
                ? (s.execTotal / s.splitCount).toFixed(2)
                : "-";
            html +=
                "<tr>" +
                "<td>" +
                k +
                "</td>" +
                "<td>" +
                s.count +
                "</td>" +
                "<td>" +
                avg +
                "</td>" +
                "<td>" +
                (s.min === Infinity ? "-" : s.min.toFixed(2)) +
                "</td>" +
                "<td>" +
                s.max.toFixed(2) +
                "</td>" +
                '<td class="recog-col">' +
                avgRecog +
                "</td>" +
                '<td class="exec-col">' +
                avgExec +
                "</td>" +
                "</tr>";
        });
    html += "</table>";

    // Per-subset stats
    var bySubset = {};
    attempts.forEach(function (a) {
        var key = (a.set || "") + "-" + (a.subset || "");
        if (!bySubset[key]) bySubset[key] = { count: 0, total: 0 };
        bySubset[key].count++;
        bySubset[key].total += a.time;
    });
    html += "<h4>Per-subset stats</h4>";
    html += "<table><tr><th>Subset</th><th>Count</th><th>Avg</th></tr>";
    Object.keys(bySubset)
        .sort()
        .forEach(function (k) {
            var s = bySubset[k];
            var avg = s.count ? (s.total / s.count).toFixed(2) : "-";
            html +=
                "<tr><td>" +
                k +
                "</td><td>" +
                s.count +
                "</td><td>" +
                avg +
                "</td></tr>";
        });
    html += "</table>";

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
function generateScramble() {
    resetRecallState();
    var banner = document.getElementById("recallBanner");
    if (banner) banner.style.display = "none";

    var arr = recap ? toRecap : toTrain;
    if (!arr || arr.length === 0) return prevCase; // safety guard

    var c;
    var attempts = 0;
    do {
        var rNum = Math.floor(Math.random() * arr.length);
        c = arr[rNum];
        attempts++;
    } while (c === prevCase && arr.length > 1 && attempts < 10);

    c._orientation = c._orientation || 0;

    var rawScramble = c.getSetup();
    scrambleRef.innerHTML = `<span class="label">Scramble:</span> ${rawScramble}`;
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

    if (toRecap.length === 0) {
        recap = false;
        // Save the fact that recap is over
        sessionStorage.setItem("recapMode", JSON.stringify(false));

        setTimeout(() => {
            alert("Recap complete!");
        }, 200);
    }
}

var originalGetAlgsArray = toTrain.length > 0 ? toTrain[0].getAlgsArray : null;
if (originalGetAlgsArray) {
    toTrain.forEach((c) => {
        var origFunc = c.getAlgsArray;
        c.getAlgsArray = function () {
            var caseKey = this.set + "-" + this.subset + "-" + this.caseName;
            var savedAlgs = JSON.parse(
                localStorage.getItem("customAlgs") || "{}"
            );

            if (savedAlgs[caseKey]) {
                return savedAlgs[caseKey];
            }

            return origFunc.call(this);
        };
    });
}

/* displays information about previous ZBLL Case */
function displayCaseInfo() {
    count++;
    currentlyDisplayedCase = prevCase;
    if (recallMaskApplied) removeRecallMask();

    // ── COMPUTE exec time FIRST, before anything else reads it ──
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
    imgRef.alt = prevCase.getName();
    imgRef.width = 150;
    imgRef.height = 150;

    try {
        renderCaseAttempts(currentlyDisplayedCase);
    } catch (e) { }

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
        timerRef.style.color = "#40B5AD";
    } else if (timerStatus === "Start") {
        //stop timer and change timerStatus
        timerStatus = "Paused";
        clearInterval(int);

        //change text color
        timerRef.style.color = "#E34234";
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

            timerRef.style.color = "#FFD700";
            holdStarted = false;

            holdTimer = setTimeout(function () {
                holdStarted = true;
                timerRef.style.color = "#32CD32";
            }, holdThreshold);
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
                timerRef.textContent + " DNF";
            document.querySelector("#case-time").hidden = false;
            document.querySelector("#case-name").innerHTML = prevCase.getName();
            document.querySelector("#case-scram").innerHTML = prevScramble;
            document.querySelector("#case-algs").innerHTML = getAlgList();

            try {
                logAttempt(prevCase, timerRef.textContent, "DNF");
            } catch (e) { }
            if (recap) removeElement(prevCase);
            renderCaseAttempts(currentlyDisplayedCase);

            var imgRef = document.querySelector("#case-img");
            imgRef.src = prevCase.getImg();
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
                } catch (e) { }
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
                document.querySelector("#case-scram").innerHTML = prevScramble;
                document.querySelector("#case-algs").innerHTML = getAlgList();

                try {
                    logAttempt(prevCase, timerRef.textContent, result);
                } catch (e) { }
                if (recap) removeElement(prevCase);
                renderCaseAttempts(currentlyDisplayedCase);

                var imgRef = document.querySelector("#case-img");
                imgRef.src = prevCase.getImg();
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
                    banner.textContent = "👀 Inspect — press space to confirm";
                    banner.style.background = "rgba(80, 80, 180, 0.9)";
                    banner.style.display = "flex";
                    banner.style.opacity = "1";
                }
                return;
            }

            timerStatus = "Stop";
            if (recap) removeElement(prevCase);
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
            return;
        }

        if (timerStatus === "Stop") {
            if (holdStarted && lockoutActive) {
                holdStarted = false;
                return;
            }

            if (holdStarted) {
                if (isVirtualOn && window.virtualCube) {
                    try {
                        window.virtualCube.reset();

                        var oriData = generateOrientation();
                        currentOrientation = Array.isArray(oriData)
                            ? oriData[0]
                            : oriData;

                        var fullSetup =
                            currentOrientation + " " + (prevScramble || "");
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
function goBack() {
    window.location.href = "index.html";
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
    } catch (e) { }
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
                banner.textContent = "👀 Inspect — press space to confirm";
                banner.style.background = "rgba(80, 80, 180, 0.9)";
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
                banner.textContent = "👀 Inspect — press space to confirm";
                banner.style.background = "rgba(80, 80, 180, 0.9)";
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
            setTimeout(() => { lockoutActive = false; }, 500);
            awaitingNext = true;
            holdStarted = false;
        }
    });
}

function getMainAlgKey(caseObj) {
    return (
        "mainAlg:" + caseObj.set + "-" + caseObj.subset + "-" + caseObj.caseName
    );
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

function getAlgList() {
    if (!currentlyDisplayedCase)
        return "<p class='no-algs'>No algorithms found.</p>";

    var algs = currentlyDisplayedCase.getAlgsArray();
    if (!algs || algs.length === 0) {
        return "<p class='no-algs'>No algorithms found.</p>";
    }

    var mainIdx = getMainAlgIndex(currentlyDisplayedCase);

    // Sort so main alg is always first
    var sorted = algs.map(function (alg, idx) {
        return { alg: alg, idx: idx };
    });
    sorted.sort(function (a, b) {
        if (a.idx === mainIdx) return -1;
        if (b.idx === mainIdx) return 1;
        return 0;
    });

    return sorted
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
                    ? '<span class="alg-main-badge">★ Main</span>'
                    : '<button class="alg-set-main-btn" onclick="handleSetMainAlg(' +
                    item.idx +
                    ')">Set Main</button>') +
                '<button class="alg-edit-btn" onclick="handleEditAlg(' +
                item.idx +
                ')">✏</button>' +
                '<button class="alg-copy-btn" onclick="handleCopyAlg(' +
                item.idx +
                ')" title="Copy">⧉</button>' +
                '<button class="alg-note-btn" onclick="handleToggleNote(' +
                item.idx +
                ')" title="Note">📝</button>' +
                "</div>" +
                '<div class="alg-text">' +
                item.alg +
                "</div>" +
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
    return (
        "algNote:" +
        caseObj.set +
        "-" +
        caseObj.subset +
        "-" +
        caseObj.caseName +
        ":" +
        index
    );
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

    var caseKey =
        currentlyDisplayedCase.set +
        "-" +
        currentlyDisplayedCase.subset +
        "-" +
        currentlyDisplayedCase.caseName;
    var savedAlgs = JSON.parse(localStorage.getItem("customAlgs") || "{}");
    if (!savedAlgs[caseKey]) savedAlgs[caseKey] = [...algs];
    savedAlgs[caseKey][index] = newAlg;
    localStorage.setItem("customAlgs", JSON.stringify(savedAlgs));

    document.querySelector("#case-algs").innerHTML = getAlgList();
}

function handleCopyAlg(index) {
    if (!currentlyDisplayedCase) return;
    var algs = currentlyDisplayedCase.getAlgsArray();
    if (!algs || index >= algs.length) return;

    navigator.clipboard
        .writeText(algs[index])
        .then(function () {
            // Brief visual feedback on the button
            var btn = document.querySelector(
                '[data-alg-idx="' + index + '"] .alg-copy-btn'
            );
            if (btn) {
                btn.textContent = "✓";
                setTimeout(function () {
                    btn.textContent = "⧉";
                }, 1000);
            }
        })
        .catch(function () {
            // Fallback for older browsers
            var ta = document.createElement("textarea");
            ta.value = algs[index];
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
            '<span class="split-item split-recog">👁 Recog: <b>' +
            currentRecogTime +
            "s</b></span>" +
            '<span class="split-divider">|</span>' +
            '<span class="split-item split-exec">⚡ Executing...</span>';
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
            '<span class="split-item split-recog">👁 Recognizing... <b>' +
            elapsed +
            "s</b></span>" +
            '<span class="split-divider">|</span>' +
            '<span class="split-item split-exec" style="opacity:0.4;">⚡ Waiting for alg</span>';
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

        setTimeout(function () {
            snapshotRecallStickers();
            applyMaskToVirtualCube();
        }, 10);
    };
}

if (window.virtualCube && window.virtualCube.reset) {
    var originalReset = window.virtualCube.reset;

    window.virtualCube.reset = function () {
        originalReset.call(this);

        originalCubeColors = null;
        saveOriginalColors();

        setTimeout(function () {
            applyMaskToVirtualCube();
        }, 10);
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
        '<span class="split-item split-recog">👁 Recog: <b>' +
        parseFloat(recog).toFixed(2) +
        "s</b></span>" +
        '<span class="split-divider">|</span>' +
        '<span class="split-item split-exec">⚡ Exec: <b>' +
        parseFloat(exec).toFixed(2) +
        "s</b></span>";
}

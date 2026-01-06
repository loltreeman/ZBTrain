
// Prefer selectedCases produced by index.js (array of {set, subset, caseName, algs?})
var selectedCasesRaw = JSON.parse(sessionStorage.getItem('selectedCases'));
var recap = false;
var toTrain = [];
var currentlyDisplayedCase = null; // Track what is actually on the results screen
var justFinishedSolve = false; // Add this with your other global variables
var lockoutActive = false; // Prevents accidental double-starts
var currentOrientation = ""; // To track the orientation used for the current scramble


if (selectedCasesRaw && selectedCasesRaw.length) {
    recap = JSON.parse(sessionStorage.getItem('recapMode')) || false;

    // Build lightweight case objects compatible with the rest of this file
    selectedCasesRaw.forEach(item => {
        var c = {
            set: item.set,
            subset: item.subset,
            caseName: item.caseName,
            // getSetup: use casemap zbllMap scrambles if available, choose random entry
            getSetup: function() {
                try {
                    if (typeof zbllMap !== 'undefined' && zbllMap[this.set] && zbllMap[this.set][this.subset] && zbllMap[this.set][this.subset][this.caseName]) {
                        var arr = zbllMap[this.set][this.subset][this.caseName];
                        if (arr && arr.length) return arr[Math.floor(Math.random()*arr.length)];
                    }
                } catch (e) {}
                return (item.setup || (this.set + "-" + this.subset + "-" + this.caseName));
            },
            getAlgsArray: function() {
            if (typeof zbllAlgs === 'undefined') return [];
            
            // This is the specific path to your data
            const setObj = zbllAlgs[this.set];
            if (!setObj) return [];
            
            const subsetObj = setObj[this.subset];
            if (!subsetObj) return [];
            
            return subsetObj[this.caseName] || [];
        },

        getName: function() { return (item.name || (this.set + "-" + this.subset + "-" + this.caseName)); },
        getImg: function() { return (item.img || (`svg/top/${this.set}-${this.subset}-${this.caseName}.svg`)); }
    };
    toTrain.push(c);
    });
} else {
    // fallback for older storage format used previously
    var cases = JSON.parse(sessionStorage.getItem("cases")) || [];
    var selected = JSON.parse(sessionStorage.getItem("selected")) || [];
    var caseIds = JSON.parse(sessionStorage.getItem("ids")) || [];
    //get scrambles and algorithms, convert to proper format
    var algs = convertArray(JSON.parse(sessionStorage.getItem("algs") || '[]'));
    var scrambles = convertArray(JSON.parse(sessionStorage.getItem("scrambles") || '[]'));

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

//setup trainer
trainerSetup();


/**
 * sets up trainer screen
 */
function trainerSetup() {
    timerStatus = "Stop";
    seconds = 0;
    milliseconds = 0;
    count = 0;
    // Always generate the first scramble and show it in the header
    prevCase = generateScramble();
    // Add this inside trainerSetup()
document.getElementById("colourneutrality1").value = localStorage.getItem("colourneutrality1") || "";
document.getElementById("colourneutrality2").value = localStorage.getItem("colourneutrality2") || "";
document.getElementById("colourneutrality3").value = localStorage.getItem("colourneutrality3") || "";

    // Wire up the checkbox that controls whether the virtual cube is visible
    var cb = document.getElementById('virtualCubeCheckbox');
    var container = document.getElementById('virtualCubeContainer');
    if (cb) {
        // Set initial container visibility based on checkbox
        if (cb.checked) {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }

        // when the checkbox changes, show/hide cube without altering the scramble or sidebar
        cb.removeEventListener('change', onVirtualCheckboxChange);
        cb.addEventListener('change', onVirtualCheckboxChange);
    }

    // this is to ensure virtual cube is solved and not interactive until a timed attempt starts
    try { if (window.virtualCube) { window.virtualCube.reset(); window.virtualCube.disableMoves(); window.virtualCube.resize && window.virtualCube.resize(); } } catch (e) {}

    awaitingNext = true;
    try { renderCaseAttempts(prevCase); } catch (e) {}
    // this if loop is to make sure the count of recap is correct depending on mode
    if (recap) {
        // in recap mode, show how many cases are left to recap
        displayCaseCount(toRecap, "numRecap", "to recap");
        displayCaseCount(toTrain, "numSelected", "selected");
    } else {
        displayCaseCount(toTrain, "numSelected", "selected");
    }
}

const fullCNCheckbox = document.getElementById('fullCN');
const customSection = document.getElementById('customOrientationSection');

fullCNCheckbox.addEventListener('change', function() {
    if (this.checked) {
        customSection.style.display = 'none'; 
    } else {
        customSection.style.display = 'flex'; 
    }
});

function onVirtualCheckboxChange(e) {
    var container = document.getElementById('virtualCubeContainer');
    if (!container) return;
    
    if (e.target.checked) {
        showVirtualCube();
        // reset the cube to solved state when toggling it on
        try {
            if (window.virtualCube) {
                window.virtualCube.reset();
                window.virtualCube.disableMoves();
                window.virtualCube.resize && window.virtualCube.resize();
            }
        } catch (err) {
            console.error('Error resetting cube:', err);
        }
    } else {
        hideVirtualCube();
    }
}

// Persisted attempt log (localStorage)
var attempts = JSON.parse(localStorage.getItem('zbllAttempts') || '[]');

function saveAttempts() {
    localStorage.setItem('zbllAttempts', JSON.stringify(attempts));
}

// Render case-specific attempts/stats in the sidebar and under the timer
function renderCaseAttempts(caseObj) {
    // Fallback to currentlyDisplayedCase if caseObj is null
    var targetCase = caseObj || currentlyDisplayedCase;
    if (!targetCase) return;

    var name = targetCase.getName ? targetCase.getName() : targetCase.name;
    
    var summaryEl = document.getElementById('caseStatsSummary');
    var listEl = document.getElementById('caseAttemptsList');
    if (!summaryEl || !listEl) return;

    // Filter attempts
    var filtered = attempts.map((a, i) => Object.assign({}, a, { _idx: i }))
                           .filter(a => a.caseName === name);

    var count = filtered.length;
    var total = filtered.reduce((s, a) => s + (a.time || 0), 0);
    var avg = count ? (total / count) : 0;
    var min = count ? Math.min(...filtered.map(a => a.time)) : 0;
    var max = count ? Math.max(...filtered.map(a => a.time)) : 0;

    // to update the summary
    summaryEl.innerHTML = `
        <div class="stat-square"><span class="stat-label">Attempts</span><span class="stat-value">${count}</span></div>
        <div class="stat-square"><span class="stat-label">Average</span><span class="stat-value">${avg.toFixed(2)}s</span></div>
        <div class="stat-square"><span class="stat-label">Best</span><span class="stat-value">${count ? min.toFixed(2) : '-'}</span></div>
        <div class="stat-square"><span class="stat-label">Worst</span><span class="stat-value">${count ? max.toFixed(2) : '-'}</span></div>
    `;
    
    // Update the tag list
    listEl.innerHTML = '';
    filtered.slice().reverse().forEach(a => {
        const timeTag = document.createElement('span');
        timeTag.className = 'clickable-tag';
        timeTag.innerHTML = a.time.toFixed(2);
        timeTag.onclick = () => deleteAttempt(a._idx); // Simplified call
        listEl.appendChild(timeTag);
    });
}

function deleteAttempt(index) {
    if (index == null) return;
    
    if (!confirm('Are you sure you want to delete this time?')) return;
    
    attempts.splice(index, 1);
    saveAttempts();
    
    // this is to re-render based on the case currently being viewed in the sidebar
    renderCaseAttempts(currentlyDisplayedCase);
}

function clearCaseAttempts() {
    if (!currentlyDisplayedCase) return;
    var name = currentlyDisplayedCase.getName ? currentlyDisplayedCase.getName() : currentlyDisplayedCase.name;
    if (!confirm('Clear all attempts for ' + name + '?')) return;
    
    attempts = attempts.filter(a => a.caseName !== name);
    saveAttempts();
    renderCaseAttempts(currentlyDisplayedCase);
}

function clearCaseAttempts() {
    if (!prevCase) return;
    var name = prevCase.getName ? prevCase.getName() : prevCase.name;
    if (!confirm('Clear all attempts for ' + name + '?')) return;
    attempts = attempts.filter(a => a.caseName !== name);
    saveAttempts();
    renderCaseAttempts(prevCase);
}

function clearAllAttempts() {
    if (!confirm('Clear ALL saved attempts? This cannot be undone.')) return;
    attempts = [];
    saveAttempts();
    renderCaseAttempts(prevCase);
}

function logAttempt(caseObj, timeStr, result) {
    var time = parseFloat(timeStr) || 0;
    var ts = new Date().toISOString();
    var entry = {
        timestamp: ts,
        caseName: (caseObj && caseObj.getName) ? caseObj.getName() : (caseObj && caseObj.name) || 'unknown',
        set: caseObj && caseObj.set || null,
        subset: caseObj && caseObj.subset || null,
        caseId: caseObj && caseObj.caseName || null,
        orientation: caseObj && caseObj._orientation != null ? caseObj._orientation : null,
        time: time,
        result: result || 'OK'
    };
    // mark whether this attempt was solved using the virtual cube
    entry.solvedByVirtualCube = !!virtualSolvedByCube;
    // reset flag after logging
    virtualSolvedByCube = false;
    attempts.push(entry);
    saveAttempts();
}

function exportAttemptsCsv() {
    if (!attempts || attempts.length === 0) { alert('No attempts to export'); return; }
    var headers = ['timestamp','set','subset','caseId','caseName','orientation','time','result','solvedByVirtualCube'];
    var rows = attempts.map(a => headers.map(h => JSON.stringify(a[h] || '')).join(','));
    rows.unshift(headers.join(','));
    var csv = rows.join('\n');
    var blob = new Blob([csv], {type: 'text/csv'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'zbll_attempts_' + (new Date()).toISOString().replace(/[:.]/g,'-') + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function showStatsPanel() {
    var panel = document.getElementById('statsPanel');
    var content = document.getElementById('statsContent');
    
    // 1. Show the panel
    panel.style.display = 'block';

    // 2. Smoothly scroll to the panel so you don't have to scroll manually
    panel.scrollIntoView({ behavior: 'smooth' });

    // --- compute per-case stats ---
    var byCase = {};
    attempts.forEach(a => {
        var key = a.caseName || (a.set + '-' + a.subset + '-' + a.caseId);
        if (!byCase[key]) byCase[key] = {count:0,total:0,min:Infinity,max:0};
        byCase[key].count++;
        byCase[key].total += a.time;
        byCase[key].min = Math.min(byCase[key].min, a.time);
        byCase[key].max = Math.max(byCase[key].max, a.time);
    });

    var html = '<h4>Per-case stats</h4>';
    html += '<table style="width:100%;border-collapse:collapse"><tr><th>Case</th><th>Count</th><th>Avg</th><th>Best</th><th>Worst</th></tr>';
    Object.keys(byCase).sort().forEach(k => {
        var s = byCase[k];
        var avg = s.count? (s.total / s.count).toFixed(2) : '-';
        html += `<tr><td>${k}</td><td>${s.count}</td><td>${avg}</td><td>${s.min===Infinity?'-':s.min.toFixed(2)}</td><td>${s.max.toFixed(2)}</td></tr>`;
    });
    html += '</table>';

    // --- subset stats ---
    var bySubset = {};
    attempts.forEach(a => {
        var key = (a.set||'') + '-' + (a.subset||'');
        if (!bySubset[key]) bySubset[key] = {count:0,total:0};
        bySubset[key].count++;
        bySubset[key].total += a.time;
    });
    html += '<h4>Per-subset stats</h4>';
    html += '<table style="width:100%;border-collapse:collapse"><tr><th>Subset</th><th>Count</th><th>Avg</th></tr>';
    Object.keys(bySubset).sort().forEach(k => {
        var s = bySubset[k];
        var avg = s.count? (s.total / s.count).toFixed(2) : '-';
        html += `<tr><td>${k}</td><td>${s.count}</td><td>${avg}</td></tr>`;
    });
    html += '</table>';

    content.innerHTML = html;
}

function hideStatsPanel() { 
    document.getElementById('statsPanel').style.display = 'none'; 
    // Optional: scroll back to the top when hiding
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * generates a scramble for a random ZBLL Case that is selected
 * @returns {zbllCase} - the case that was generated
 */
function generateScramble() {
    var c; 
    var arr = recap ? toRecap : toTrain;

    // Pick random case
    var rNum = Math.floor(Math.random() * arr.length);
    c = arr[rNum];
    c._orientation = c._orientation || 0;
    
    // 1. Get the raw moves
    var rawScramble = c.getSetup(); 

    // 2. Update Header (WITH label)
    scrambleRef.innerHTML = `<span class="label">Scramble:</span> ${rawScramble}`;
    
    // 3. Store the clean moves for the sidebar
    prevScramble = rawScramble;

    // 4. Do NOT apply scramble immediately to the cube. The cube will be reset and scrambled when timing starts.

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
            var c = new zbllCase(caseName, imgPath, setupAlgs, alg, selected[i]);
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
        sessionStorage.setItem('recapMode', JSON.stringify(false));

        setTimeout(() => { alert("Recap complete!"); }, 200);
    }
}

function getAlgList() {
    var algs = prevCase.getAlgsArray();
    
    if (!algs || algs.length === 0) {
        return "<p class='no-algs'>No algorithms found.</p>";
    }

    // Map each algorithm string into a styled div with click handler
    return algs.map((alg, idx) => `<div class="alg-entry" onclick="editAlgorithm(${idx})">${alg}</div>`).join('');
}

function editAlgorithm(index) {
    if (!currentlyDisplayedCase) return;
    
    var algs = currentlyDisplayedCase.getAlgsArray();
    if (!algs || index >= algs.length) return;
    
    var currentAlg = algs[index];
    var newAlg = prompt('Edit algorithm:', currentAlg);
    
    if (newAlg === null) return; // User cancelled
    
    // Save to localStorage
    var caseKey = currentlyDisplayedCase.set + '-' + currentlyDisplayedCase.subset + '-' + currentlyDisplayedCase.caseName;
    var savedAlgs = JSON.parse(localStorage.getItem('customAlgs') || '{}');
    
    if (!savedAlgs[caseKey]) {
        savedAlgs[caseKey] = [...algs]; // Copy original algs
    }
    
    savedAlgs[caseKey][index] = newAlg;
    localStorage.setItem('customAlgs', JSON.stringify(savedAlgs));
    
    // Refresh the display
    document.querySelector("#case-algs").innerHTML = getAlgList();
}

// Modify getAlgsArray to check for custom algs
var originalGetAlgsArray = toTrain.length > 0 ? toTrain[0].getAlgsArray : null;
if (originalGetAlgsArray) {
    toTrain.forEach(c => {
        var origFunc = c.getAlgsArray;
        c.getAlgsArray = function() {
            var caseKey = this.set + '-' + this.subset + '-' + this.caseName;
            var savedAlgs = JSON.parse(localStorage.getItem('customAlgs') || '{}');
            
            if (savedAlgs[caseKey]) {
                return savedAlgs[caseKey];
            }
            
            return origFunc.call(this);
        };
    });
}



/* displays information about previous ZBLL Case */
function displayCaseInfo() {
    count++; //increment number of results
    currentlyDisplayedCase = prevCase; // LOCK the case here before prevCase changes

    //display case information
    document.querySelector("#case-text").innerHTML = "Result #" + count;
    document.querySelector("#case-time").innerHTML = timerRef.textContent;
    document.querySelector("#case-time").hidden = false;
    document.querySelector("#case-name").innerHTML = prevCase.getName();
    document.querySelector("#case-scram").innerHTML = prevScramble;
    document.querySelector("#case-algs").innerHTML = getAlgList();

    // log attempt for stats (time recorded)
    try { logAttempt(prevCase, timerRef.textContent, 'OK'); } catch (e) { console.error(e); }

    // Remove from recap list if in recap mode
    if (recap) {
        removeElement(prevCase);
    }

    // Refresh the statistics immediately
    renderCaseAttempts(currentlyDisplayedCase);

    //display image of case
    var imgRef = document.querySelector("#case-img");
    imgRef.src = prevCase.getImg();
    imgRef.alt = prevCase.getName();
    imgRef.width = 150;
    imgRef.height = 150;

    // update per-case attempts view now that an attempt was recorded
    try { renderCaseAttempts(currentlyDisplayedCase); } catch (e) {}

    // mark that we're ready for the next scramble; user must hold space to advance
    awaitingNext = true;
    revealed = false;
}



/**
 * Displays time while timer is running
 */
function displayTimer() {
    milliseconds += 10;

    var time = String((milliseconds / 1000).toFixed(2));

    //display time
    timerRef.innerHTML = `${time}`;
}



// check if screen held down
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);
document.addEventListener('keydown', handleKeyDown, false);
document.addEventListener('keyup', handleKeyUp, false);

/*
 * handles screen tap start
 */
function handleTouchStart() {
    if (event.target.tagName === 'BUTTON') { // do nothing if again button clicked
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

/*
 * handles screen tap end
 */
function handleTouchEnd() {
    if (event.target.tagName === 'BUTTON') { // do nothing if again button clicked
        return;
    }

    //change text to black
    timerRef.style.color = "black";

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



// check if space bar is held down
function handleKeyDown(event) {

    // 1. If we are in an input box, stop EVERYTHING else from happening
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        // StopPropagation prevents the virtual cube library from hearing the key
        event.stopPropagation(); 
        return; 
    }

    // 2. Normal timer prevention
    if (event.key === ' ' || event.key === 'Backspace') event.preventDefault();

    if (event.key === ' ') {
        if (timerStatus === "Start") {
            timerStatus = "Paused";
            clearInterval(int);
            return;
        }

        // Start charging only if lockout is inactive
        if (timerStatus === "Stop" && !lockoutActive) {
            if (holdTimer) return; 

            timerRef.style.color = "#FFD700"; 
            holdStarted = false;

            holdTimer = setTimeout(function() {
                holdStarted = true;
                timerRef.style.color = "#32CD32";
            }, holdThreshold);
        }
    }
}

function handleKeyUp(event) {
    // 1. If we are in an input box, don't trigger timer logic
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        event.stopPropagation();
        return; 
    }

    if (event.key === ' ') {
        event.preventDefault();
        timerRef.style.color = "black"; 
        clearTimeout(holdTimer);
        holdTimer = null; 

        var container = document.getElementById('virtualCubeContainer');
        var isVirtualOn = container && container.style.display !== 'none';

        // CASE A: Finishing/Acknowledging a solve
        if (timerStatus === "Paused") {
            if (skipNextPauseAction) {
                skipNextPauseAction = false;
                timerStatus = "Stop";
                awaitingNext = true;
                holdStarted = false;
                
                if (isVirtualOn && window.virtualCube && window.lastAttemptedScramble) {
                    try {
                        window.virtualCube.reset();
                        // Use the orientation saved during the solve
                        var practiceSetup = currentOrientation + " " + window.lastAttemptedScramble;
                        window.virtualCube.applyScramble(practiceSetup);
                        window.virtualCube.enableMoves();
                    } catch(e) { console.error('Error resetting to practice:', e); }
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
            setTimeout(() => { lockoutActive = false; }, 500);
            awaitingNext = true;
            holdStarted = false; 
            return; 
        }

        // CASE B: Starting a new solve or practice reveal
        if (timerStatus === "Stop") {
            if (holdStarted && lockoutActive) {
                holdStarted = false;
                return;
            }

            if (holdStarted) {
                // START TIMED ATTEMPT
                if (isVirtualOn && window.virtualCube) {
                    try {
                        window.virtualCube.reset();
                        
                        // FIX: generateOrientation returns [full, random]. We need index [0].
                        var oriData = generateOrientation();
                        currentOrientation = Array.isArray(oriData) ? oriData[0] : oriData;
                        
                        var fullSetup = currentOrientation + " " + (prevScramble || '');
                        window.virtualCube.applyScramble(fullSetup);
                        window.virtualCube.enableMoves();
                    } catch (e) { console.error("Virtual cube setup error:", e); }
                }
                
                milliseconds = 0;
                if (int !== null) clearInterval(int);
                int = setInterval(displayTimer, 10);
                timerStatus = "Start";
                awaitingNext = false;
                revealed = true; 
            }
            else {
                // SHORT PRESS: Practice reveal
                if (isVirtualOn && window.virtualCube && window.lastAttemptedScramble) {
                    try {
                        window.virtualCube.reset();
                        // Use the orientation saved during the solve
                        var practiceSetup = currentOrientation + " " + window.lastAttemptedScramble;
                        window.virtualCube.applyScramble(practiceSetup);
                        window.virtualCube.enableMoves();
                        window.virtualCube.resize && window.virtualCube.resize();
                    } catch (e) { console.error('Practice reveal error', e); }
                }
            }
        }   
        holdStarted = false;
    }
}
function goBack() {
    window.location.href = 'index.html';
}

// Virtual Cube integration ----------------------------------------------
function toggleVirtualCube() {
    var container = document.getElementById('virtualCubeContainer');
    if (!container) return;
    
    if (container.style.display === 'none' || container.style.display === '') {
        showVirtualCube();
    } else {
        hideVirtualCube();
    }

    // Keep the current scramble/sidebar state intact. Only resize the cube if visible.
    try { if (window.virtualCube && typeof window.virtualCube.resize === 'function') window.virtualCube.resize(); } catch(e) {}
}

function showVirtualCube() {
    var container = document.getElementById('virtualCubeContainer');
    if (!container) return;
    container.style.display = 'block';
    // focus timer by default so space-start works reliably
    if (timerRef) timerRef.focus && timerRef.focus();
    // Prevent the very next short-spacepress from auto-revealing the scramble
    virtualCubeJustShown = true;
    if (virtualCubeShownTimer) clearTimeout(virtualCubeShownTimer);
    virtualCubeShownTimer = setTimeout(function() { virtualCubeJustShown = false; virtualCubeShownTimer = null; }, 800);
}

function hideVirtualCube() {
    var container = document.getElementById('virtualCubeContainer');
    if (!container) return;
    container.style.display = 'none';
}

function generateOrientation() {
    var cn1 = document.getElementById("colourneutrality1").value;
    if (document.getElementById("fullCN").checked) {
        var firstRotation = ["", "x", "x'", "x2", "y", "y'"]
        // each one of these first rotations puts a different color face on F
        var secondRotation = ["", "z", "z'", "z2"]
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
    const colorToFace = { 1: 'U', 2: 'R', 3: 'F', 4: 'D', 5: 'L', 6: 'B' };

    // Create a temporary cube to calculate initial state
    // (holdingOrientation + colourneutrality1 applied, but no scramble or user rotations)
    const tempCube = new RubiksCube();
    tempCube.resetCube();

    // Apply holdingOrientation
    const holdingOri = holdingOrientation.value || '';
    if (holdingOri) {
        tempCube.doAlgorithm(holdingOri);
    }

    // Apply preorientation (CN + random) if available, otherwise fallback to cn1
    if (currentPreOrientation !== null) {
        tempCube.doAlgorithm(currentPreOrientation);
    } else {
        const cn1 = document.getElementById("colourneutrality1").value || '';
        if (cn1) {
            tempCube.doAlgorithm(cn1);
        }
    }

    // Get the colors at the center positions (absolute positions)
    // These colors tell us which absolute face is at each view position
    const uCenterColor = tempCube.cubestate[4][0];  // View U position has which absolute face color
    const rCenterColor = tempCube.cubestate[13][0]; // View R position has which absolute face color
    const fCenterColor = tempCube.cubestate[22][0]; // View F position has which absolute face color
    const dCenterColor = tempCube.cubestate[31][0]; // View D position has which absolute face color
    const lCenterColor = tempCube.cubestate[40][0]; // View L position has which absolute face color
    const bCenterColor = tempCube.cubestate[49][0]; // View B position has which absolute face color

    // Create mapping: view position -> absolute face
    // Example: if uCenterColor is 2 (Red), then view U = absolute R
    const viewToAbsolute = {
        'U': colorToFace[uCenterColor],
        'R': colorToFace[rCenterColor],
        'F': colorToFace[fCenterColor],
        'D': colorToFace[dCenterColor],
        'L': colorToFace[lCenterColor],
        'B': colorToFace[bCenterColor]
    };

    // Create reverse mapping: absolute face -> view position
    const absoluteToView = {};
    for (let viewFace in viewToAbsolute) {
        const absFace = viewToAbsolute[viewFace];
        absoluteToView[absFace] = viewFace;
    }

    return { viewToAbsolute, absoluteToView };
}

if (window.virtualCube && typeof window.virtualCube.onSolve === 'function') {
    window.virtualCube.onSolve(function() {
        virtualSolvedByCube = true;

        if (timerStatus === 'Start') {
            // 1. STOP THE TIMER IMMEDIATELY
            if (int !== null) {
                clearInterval(int);
                int = null;
            }

            timerStatus = 'Paused'; // Spacebar will now acknowledge the result
            timerRef.style.color = 'black'; 

            // 2. Prevent the timer from instantly restarting if space is bumped
            lockoutActive = true;
            setTimeout(() => { lockoutActive = false; }, 800);

            try {
                // 3. Process the solve stats
                var lastAttemptScramble = prevScramble;
                skipNextPauseAction = true; // Tells handleKeyUp we already handled the pause
                
                displayCaseInfo(); // Logs the time and shows the image/algs
                
                prevCase = generateScramble(); // Prepares the NEXT case
                window.lastAttemptedScramble = lastAttemptScramble;
                
                awaitingNext = true;
            } catch (e) {
                console.error('Error during auto-solve finalization:', e);
            }
        }
    });
}


localStorage.removeItem('customAlgs');


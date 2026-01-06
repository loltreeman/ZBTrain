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
    "2GLL": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "Diag": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "3": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "4": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "5": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "6": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
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

document.querySelectorAll(".zbll-set-container").forEach(setContainer => {
  const set = setContainer.id.replace("container-", "");
  activeOrientation[set] = 0;

  const mainImg = setContainer.querySelector(".main-angle-svg");
  const orientationButtons = setContainer.querySelectorAll(".orientation-options .case-trigger");

  orientationButtons.forEach(btn => {
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

      // 3. Move saved Main state to Thumbnail
      thumbImg.src = oldMainSrc;
      thumbImg.alt = oldMainAlt;
      btn.dataset.angle = oldMainAngle;
      thumbImg.style.transform = oldMainTransform;

      // --- SYNC SUBSETS ---
      // Update the tracking variable for the modal
      const currentAngle = parseInt(mainImg.dataset.angle) || 0;
      activeOrientation[set] = currentAngle;

      // Force all subset images to rotate to match the NEW main angle
      setContainer.querySelectorAll(".subset-orientation").forEach(img => {
        img.style.transform = `rotate(${currentAngle}deg)`;
      });
    });
  });

  // 2. Main Image Click -> Toggle Whole Set (72 cases)
  mainImg.addEventListener("click", () => toggleAllCasesForSet(set, setContainer));

  // 3. SUBSET CARD LOGIC (Click card to toggle all / Click image for modal)
  setContainer.querySelectorAll(".zbll-card").forEach(card => {
    const subset = card.dataset.subset; // Pulls from HTML: data-subset="2GLL"
    if (!subset) return; 

    // CARD AREA CLICK -> Toggle selection for just this subset
    card.addEventListener("click", (e) => {
      // If the user specifically clicked the image, let the image's own listener handle it
      if (e.target.classList.contains('subset-orientation')) return;
      toggleSubsetSelection(set, subset);
    });

    // SUBSET IMAGE CLICK -> Open Modal
    const img = card.querySelector(".subset-orientation");
    if (img) {
      img.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevents the card click from firing
        displayZW(set, subset, activeOrientation[set]);
      });
    }

    // Prevent right-click menu and open modal instead (Optional UX)
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
    cases.forEach(c => modalSelections[key][c] = false);
  }

  // Check if current subset is 100% full
  const isFull = cases.every(c => modalSelections[key][c] === true);
  const target = !isFull;

  cases.forEach(c => {
    modalSelections[key][c] = target;
  });

  updateSetCount(set);
}

function toggleAllCasesForSet(set, setContainer) {
  const subsets = Object.keys(zbllMap[set] || {});
  let totalInSet = 0;
  let currentlySelectedInSet = 0;

  subsets.forEach(coll => {
    const key = `${set}-${coll}`;
    totalInSet += zbllMap[set][coll].length;
    if (modalSelections[key]) {
      currentlySelectedInSet += Object.values(modalSelections[key]).filter(v => v).length;
    }
  });

  const targetState = (currentlySelectedInSet !== totalInSet);

  subsets.forEach(coll => {
    const key = `${set}-${coll}`;
    if (!modalSelections[key]) modalSelections[key] = {};
    zbllMap[set][coll].forEach(caseName => {
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
  subsets.forEach(coll => {
    const key = `${set}-${coll}`;
    const totalInSubset = zbllMap[set][coll].length;
    const selectedInSubset = modalSelections[key] ? Object.values(modalSelections[key]).filter(v => v).length : 0;
    
    totalSelectedInSet += selectedInSubset;
    totalCasesInSet += totalInSubset;

    // Apply colors to Subset Cards
    const subsetImg = container.querySelector(`[data-subset="${coll}"] .subset-orientation`);
    if (subsetImg) {
      const card = subsetImg.closest('.zbll-card');
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
    
    // 1. Show Modal
    modalBack.classList.add("modal-active");
    modalWindow.classList.add("modal-active");

    // 2. Setup Key and Safety Initialization
    const key = `${set}-${coll}`;
    
    // SAFETY CHECK: If this subset has never been touched, initialize all cases to 'false'
    // This ensures (0/12 selected) shows up instead of an error or blank text
    if (!modalSelections[key]) {
        modalSelections[key] = {};
        zbllMap[set][coll].forEach(caseName => {
            modalSelections[key][caseName] = false;
        });
    }

    // 3. Clear and Update Buttons
    zwPics.innerHTML = "";
    const allBtn = document.getElementById("modal-select-all");
    const noneBtn = document.getElementById("modal-select-none");
    
    if (allBtn) allBtn.onclick = () => selectAllZw(true, key);
    if (noneBtn) noneBtn.onclick = () => selectAllZw(false, key);

    // 4. Generate Grid Items
    zbllMap[set][coll].forEach(caseName => {
        const div = document.createElement("div");
        div.className = "zbllItem";
        
        // Accurate visual check: does this case exist in our tracker as 'true'?
        if (modalSelections[key][caseName] === true) {
            div.classList.add("selected");
        }

        const img = document.createElement("img");
        img.src = `svg/top/${set}-${coll}-${caseName}.svg`;
        img.style.transform = `rotate(${angle}deg)`;
        div.appendChild(img);

        div.addEventListener("click", () => {
            modalSelections[key][caseName] = !modalSelections[key][caseName];
            div.classList.toggle("selected");
            // This updates the (X/Total) header every time you click an item
            updateZwHeaderSelection(set, coll);
        });

        zwPics.appendChild(div);
    });

    // 5. Force Header Sync immediately upon opening
    updateZwHeaderSelection(set, coll);
    zwPics.scrollTop = 0;
}

function selectAllZw(selectAll, key) {
  Object.keys(modalSelections[key]).forEach(c => modalSelections[key][c] = selectAll);
  document.querySelectorAll(".zbllItem").forEach(div => div.classList.toggle("selected", selectAll));
  const [set, coll] = key.split("-");
  updateZwHeaderSelection(set, coll);
}

function updateZwHeaderSelection(set, coll) {
  const key = `${set}-${coll}`;
  const total = zbllMap[set][coll].length;
  const selected = Object.values(modalSelections[key]).filter(v => v).length;
  document.getElementById("zwHeaderMessage").textContent = `${set} – ${coll} (${selected}/${total} selected)`;
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
  Object.keys(zbllMap).forEach(set => {
    const el = document.getElementById(`subsets-${set}`);
    const arrow = document.getElementById(`arrow-${set}`);
    if (el) {
      el.style.display = expand ? "block" : "none";
      if (arrow) arrow.innerText = expand ? "▲" : "▼";
    }
  });
}

function toggleAll(select) {
  Object.keys(zbllMap).forEach(set => {
    const subsets = Object.keys(zbllMap[set] || {});
    subsets.forEach(coll => {
      const key = `${set}-${coll}`;
      if (!modalSelections[key]) modalSelections[key] = {};
      zbllMap[set][coll].forEach(c => modalSelections[key][c] = select);
    });
    updateSetCount(set);
  });
}

function updateTrainerButtons() {
  const selected = [];
  Object.entries(modalSelections).forEach(([key, cases]) => {
    Object.entries(cases).forEach(([c, val]) => { if(val) selected.push({key, c}); });
  });
  const count = selected.length;
  document.getElementById("selected").textContent = `${count} case${count === 1 ? "" : "s"} selected`;
  document.getElementById("start").disabled = count === 0;
  document.getElementById("recap").disabled = count === 0;
}

function toggleSubsets(set) {
  const el = document.getElementById(`subsets-${set}`);
  const arrow = document.getElementById(`arrow-${set}`);
  if (!el) return;
  const isHidden = (el.style.display === "none" || el.style.display === "");
  el.style.display = isHidden ? "block" : "none";
  if (arrow) arrow.innerText = isHidden ? "▲" : "▼";
}

function loadCases(isRecap) {
  // collect selected cases into an array: [{set, subset, caseName}, ...]
  const selected = [];
  Object.entries(modalSelections).forEach(([key, cases]) => {
    const [set, subset] = key.split('-');
    Object.entries(cases).forEach(([caseName, val]) => {
      if (val) selected.push({ set, subset, caseName });
    });
  });

  if (selected.length === 0) {
    alert('No cases selected. Please select some cases first.');
    return;
  }

  // Save to sessionStorage for trainer page to consume
  sessionStorage.setItem('selectedCases', JSON.stringify(selected));
  sessionStorage.setItem('recapMode', JSON.stringify(!!isRecap));

  // Navigate to trainer page (same folder)
  const base = location.pathname.replace(/index.html$/, '');
  location.href = base + 'trainer.html';
}


document.addEventListener('DOMContentLoaded', () => {
    syncStorageToLogic();
});

/**
 * Rebuilds the modalSelections object from sessionStorage 
 * so the UI reflects what you previously picked in the trainer.
 */
function syncStorageToLogic() {
    const saved = JSON.parse(sessionStorage.getItem('selectedCases')) || [];
    if (saved.length === 0) return;

    // Reset local tracker
    // We clear it first to ensure we don't have "ghost" selections
    Object.keys(modalSelections).forEach(key => delete modalSelections[key]);

    saved.forEach(item => {
        const key = `${item.set}-${item.subset}`;
        if (!modalSelections[key]) {
            modalSelections[key] = {};
            // Initialize other cases in this subset to false
            if (zbllMap[item.set] && zbllMap[item.set][item.subset]) {
                zbllMap[item.set][item.subset].forEach(c => {
                    modalSelections[key][c] = false;
                });
            }
        }
        modalSelections[key][item.caseName] = true;
    });

    // Refresh the UI for every set defined in your map
    Object.keys(zbllMap).forEach(set => {
        updateSetCount(set);
    });
    
    updateTrainerButtons();
}

/**
 * Refined loadCases: Now ensures we save the most 
 * up-to-date selection before leaving.
 */
function loadCases(isRecap) {
    const selected = [];
    
    // Map the internal modalSelections object back into the array format
    Object.entries(modalSelections).forEach(([key, cases]) => {
        const [set, subset] = key.split('-');
        Object.entries(cases).forEach(([caseName, val]) => {
            if (val) {
                selected.push({ set, subset, caseName });
            }
        });
    });

    if (selected.length === 0) {
        alert('No cases selected. Please select some cases first.');
        return;
    }

    // Save to sessionStorage
    sessionStorage.setItem('selectedCases', JSON.stringify(selected));
    sessionStorage.setItem('recapMode', JSON.stringify(!!isRecap));

    // Navigate
    const base = location.pathname.replace(/index.html$/, '');
    location.href = base + 'trainer.html';
}
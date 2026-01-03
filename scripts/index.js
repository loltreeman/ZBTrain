/******************************
 * ZBLL Trainer JS
 ******************************/

// ----------------------------
// Data & State
// ----------------------------
const activeOrientation = {}; // tracks main image rotation per set
const modalSelections = {};   // tracks which cases are selected per subset

// Master map of sets → subsets → cases
const zbllMap = {
  T: {
    "2GLL": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"],
    "Diag": ["CsC","AsA","AsC","AsO","CsA","CsO","CxO","OsA","OsC","OsO","OxC","OxO"]
  },
  U: { "BBFF": [], "FBFB": [] }
  // ... add all other sets/subsets here
};

// ----------------------------
// Initialize Sets
// ----------------------------
document.querySelectorAll(".zbll-set-container").forEach(setContainer => {
  const set = setContainer.id.replace("container-", "");
  activeOrientation[set] = 0;

  const mainImg = setContainer.querySelector(".main-angle-svg");
  const orientationButtons = setContainer.querySelectorAll(".orientation-options .case-trigger");
  const subsetImages = setContainer.querySelectorAll(".subset-orientation");

  // Rotate main image on thumbnail click
  orientationButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const thumbImg = btn.querySelector("img");
      const newAngle = parseInt(btn.dataset.angle);
      const oldAngle = activeOrientation[set];

      mainImg.style.transform = `rotate(${newAngle}deg)`;
      mainImg.dataset.angle = newAngle;

      thumbImg.style.transform = `rotate(${oldAngle}deg)`;
      btn.dataset.angle = oldAngle;

      activeOrientation[set] = newAngle;

      // Rotate subset thumbnails too
      subsetImages.forEach(img => img.style.transform = `rotate(${newAngle}deg)`);
    });
  });

  // Main image click → toggle select/deselect all cases
  mainImg.addEventListener("click", () => toggleAllCasesForSet(set, setContainer));
  
  // Subset thumbnail click → open modal
  subsetImages.forEach(img => {
    img.addEventListener("click", () => {
      const coll = img.src.split("/").pop().replace(".svg","").split("-")[1];
      displayZW(set, coll, activeOrientation[set]);
    });
  });
});

// ----------------------------
// Toggle Subsets Visibility
// ----------------------------
function toggleSubsets(set) {
  const el = document.getElementById(`subsets-${set}`);
  const arrow = document.querySelector(`#arrow-${set}`);
  const isHidden = el.style.display === "none";

  el.style.display = isHidden ? "block" : "none";
  arrow.innerText = isHidden ? "▲" : "▼";
}

// ----------------------------
// Toggle All Cases for a Set
// ----------------------------
function toggleAllCasesForSet(set, setContainer) {
  const subsets = Object.keys(zbllMap[set] || {});

  subsets.forEach(coll => {
    const key = `${set}-${coll}`;

    // Initialize selection if it doesn't exist
    if (!modalSelections[key]) {
      modalSelections[key] = {};
      zbllMap[set][coll].forEach(c => modalSelections[key][c] = false);
    }

    // Determine if all are selected
    const allSelected = Object.values(modalSelections[key]).every(v => v);

    // Toggle selection for all cases
    Object.keys(modalSelections[key]).forEach(c => modalSelections[key][c] = !allSelected);
  });

  // Highlight subset cards if all selected
  setContainer.querySelectorAll(".zbll-card").forEach(card => {
    const subsetImg = card.querySelector(".subset-orientation");
    if (!subsetImg) return;
    const subset = subsetImg.src.split("/").pop().replace(".svg","").split("-")[1]; // e.g., "2GLL"
    const key = `${set}-${subset}`;
    const allSelected = Object.values(modalSelections[key] || {}).every(v => v);

    card.classList.toggle("all-selected", allSelected);
  });

  // Update main count
  updateSetCount(set);
}


// ----------------------------
// Modal: Display ZBLL Cases
// ----------------------------
function displayZW(set, coll, angle = 0) {
  const modalBack = document.getElementById("zbllWindowBack");
  const modalWindow = document.getElementById("zbllWindow");
  const zwPics = document.getElementById("zwPics");
  const zwHeader = document.getElementById("zwHeaderMessage");

  modalBack.style.display = "block";
  modalWindow.style.display = "block";
  zwPics.innerHTML = "";

  const key = `${set}-${coll}`;

  // Initialize selections if needed
  if (!modalSelections[key]) {
    modalSelections[key] = {};
    (zbllMap[set][coll] || []).forEach(c => modalSelections[key][c] = false);
  }

  // Build modal items
  (zbllMap[set][coll] || []).forEach(caseName => {
    const div = document.createElement("div");
    div.className = "zbllItem";
    div.dataset.case = caseName;

    const img = document.createElement("img");
    img.src = `svg/top/${set}-${coll}-${caseName}.svg`;
    img.style.transform = `rotate(${angle}deg)`;
    div.appendChild(img);

    // Apply selection
    div.classList.toggle("selected", modalSelections[key][caseName]);

    // Toggle selection on click
    div.addEventListener("click", () => {
      modalSelections[key][caseName] = !modalSelections[key][caseName];
      div.classList.toggle("selected", modalSelections[key][caseName]);
      updateZwHeaderSelection(set, coll);
    });

    zwPics.appendChild(div);
  });

  // Update header
  updateZwHeaderSelection(set, coll);

  // Hook up All/None buttons
  document.querySelector(".modal-btns button:nth-child(1)").onclick = () => selectAllZw(true, key);
  document.querySelector(".modal-btns button:nth-child(2)").onclick = () => selectAllZw(false, key);
}

// ----------------------------
// Close Modal
// ----------------------------
function closeZW() {
  document.getElementById("zbllWindowBack").style.display = "none";
  document.getElementById("zbllWindow").style.display = "none";
}

// ----------------------------
// Select / Deselect All in Modal
// ----------------------------
function selectAllZw(selectAll, key) {
  Object.keys(modalSelections[key]).forEach(c => modalSelections[key][c] = selectAll);

  const zwPics = document.getElementById("zwPics");
  zwPics.querySelectorAll(".zbllItem").forEach(div => {
    div.classList.toggle("selected", selectAll);
  });

  const [set, coll] = key.split("-");
  updateZwHeaderSelection(set, coll);
}

// ----------------------------
// Update Modal Header & Main Count
// ----------------------------
function updateZwHeaderSelection(set, coll) {
  const key = `${set}-${coll}`;
  const total = Object.keys(modalSelections[key]).length;
  const selected = Object.values(modalSelections[key]).filter(v => v).length;

  document.getElementById("zwHeaderMessage").textContent = `${set} – ${coll} (${selected}/${total} selected)`;
  updateSetCount(set);
}

// ----------------------------
// Update Top Set Count
// ----------------------------
function updateSetCount(set) {
  const countSpan = document.getElementById(`count-${set}`);
  if (!countSpan) return;

  let selected = 0;
  Object.keys(modalSelections)
    .filter(k => k.startsWith(`${set}-`))
    .forEach(key => selected += Object.values(modalSelections[key]).filter(v => v).length);

  countSpan.textContent = selected;
}

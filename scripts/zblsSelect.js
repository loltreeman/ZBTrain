// ═══════════════════════════════════════════════════════
// F2L/ZBLL Case Selector - Checkbox-based Selection
// Works with existing checkbox HTML structure
// ═══════════════════════════════════════════════════════

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCaseSelection();
    setupCollapsibles();
    updateAllCounts();
});

// Initialize case selection listeners
function initializeCaseSelection() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="case"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateAllCounts();
        });
    });
}

// Setup collapsible sections
function setupCollapsibles() {
    const collapsibles = document.querySelectorAll('.collapsible');

    // Bind subset buttons
    const subsetButtons = document.querySelectorAll('.subset-btn');
    subsetButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent toggling collapse when clicking the small buttons
            const subset = this.dataset.subset;
            const action = this.dataset.action;

            if (subset) {
                toggleSubset(subset, action === 'all');
            }
        });
    });

    collapsibles.forEach(button => {
        // Toggle on click or Enter/Space key
        button.addEventListener('click', function() {
            toggleCollapse(this);
        });
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCollapse(this);
            }
        });

        // Start with sections collapsed (only show preview)
        const parentGroup = button.closest('.toggleGroup');
        const gridContainer = parentGroup ? parentGroup.querySelector('.grid-container') : null;
        if (gridContainer) {
            gridContainer.style.display = 'none';
            parentGroup.classList.remove('expanded');
            button.setAttribute('aria-expanded', 'false');
            const icon = button.querySelector('.collapse-icon');
            if (icon) icon.textContent = '▸';
        }
    });
}

// helper to toggle a collapse element and add expanded class to group
function toggleCollapse(button) {
    const parentGroup = button.closest('.toggleGroup');
    if (!parentGroup) return;
    const gridContainer = parentGroup.querySelector('.grid-container');
    if (!gridContainer) return;
    const icon = button.querySelector('.collapse-icon');

    const isCollapsed = parentGroup.classList.contains('expanded') === false;

    if (isCollapsed) {
        parentGroup.classList.add('expanded');
        gridContainer.style.display = 'grid';
        button.setAttribute('aria-expanded', 'true');
        if (icon) icon.textContent = '▾';
    } else {
        parentGroup.classList.remove('expanded');
        gridContainer.style.display = 'none';
        button.setAttribute('aria-expanded', 'false');
        if (icon) icon.textContent = '▸';
    }
}

// Toggle all checkboxes for a subset (e.g., F2L1)
function toggleSubset(subsetClass, shouldSelect) {
    const checkboxes = document.querySelectorAll(`input.${subsetClass}[name="case"]`);
    checkboxes.forEach(cb => cb.checked = shouldSelect);
    updateAllCounts();
    saveSelections();
}

// Expand/collapse all sections (updated to set expanded class on parent groups)
function toggleExpand(shouldExpand) {
    const collapsibles = document.querySelectorAll('.collapsible');
    collapsibles.forEach(button => {
        const parentGroup = button.closest('.toggleGroup');
        const gridContainer = parentGroup ? parentGroup.querySelector('.grid-container') : null;
        const icon = button.querySelector('.collapse-icon');
        if (gridContainer) {
            if (shouldExpand) {
                parentGroup.classList.add('expanded');
                gridContainer.style.display = 'grid';
                button.setAttribute('aria-expanded', 'true');
                if (icon) icon.textContent = '▾';
            } else {
                parentGroup.classList.remove('expanded');
                gridContainer.style.display = 'none';
                button.setAttribute('aria-expanded', 'false');
                if (icon) icon.textContent = '▸';
            }
        }
    });
}

// Update all counts
function updateAllCounts() {
    updateSubsetCounts();
    updateGlobalCount();
    updateStartButtons();
}

// Update individual subset counts (F2L1, F2L2, etc.)
function updateSubsetCounts() {
    // Get all unique class names from checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="case"]');
    const subsetClasses = new Set();
    
    checkboxes.forEach(checkbox => {
        // Get the class that represents the subset (e.g., "F2L1")
        const classes = checkbox.className.split(' ');
        classes.forEach(cls => {
            if (cls && cls !== 'case') {
                subsetClasses.add(cls);
            }
        });
    });
    
    // Update count for each subset
    subsetClasses.forEach(subsetClass => {
        const subsetCheckboxes = document.querySelectorAll(`input.${subsetClass}[name="case"]`);
        const checkedCount = document.querySelectorAll(`input.${subsetClass}[name="case"]:checked`).length;
        
        // Update count element (e.g., F2L1Count)
        const countElement = document.getElementById(`${subsetClass}Count`);
        if (countElement) {
            countElement.textContent = checkedCount;
        }
    });
}

// Update global selection count
function updateGlobalCount() {
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"][name="case"]');
    const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"][name="case"]:checked');
    
    const countElement = document.getElementById('selected');
    if (countElement) {
        const count = checkedCheckboxes.length;
        countElement.textContent = `${count} case${count !== 1 ? 's' : ''} selected`;
    }
}

// Enable/disable start buttons based on selection
function updateStartButtons() {
    const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"][name="case"]:checked');
    const hasSelection = checkedCheckboxes.length > 0;
    
    const startButton = document.getElementById('start');
    const recapButton = document.getElementById('recap');
    
    if (startButton) {
        startButton.disabled = !hasSelection;
    }
    if (recapButton) {
        recapButton.disabled = !hasSelection;
    }
}

// Select all cases
function toggleAll(shouldSelect) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="case"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = shouldSelect;
    });
    
    updateAllCounts();
}

// Expand/collapse all sections
function toggleExpand(shouldExpand) {
    const collapsibles = document.querySelectorAll('.collapsible');
    
    collapsibles.forEach(button => {
        const gridContainer = button.nextElementSibling;
        
        if (gridContainer && gridContainer.classList.contains('grid-container')) {
            if (shouldExpand) {
                gridContainer.style.display = 'grid';
                button.setAttribute('aria-expanded', 'true');
            } else {
                gridContainer.style.display = 'none';
                button.setAttribute('aria-expanded', 'false');
            }
        }
    });
}

// Get selected cases (for starting training)
function getSelectedCases() {
    const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"][name="case"]:checked');
    return Array.from(checkedCheckboxes).map(checkbox => ({
        id: checkbox.id,
        class: checkbox.className,
        label: checkbox.nextElementSibling
    }));
}

// Load cases function (placeholder - connect to your training logic)
function loadCases(isRecap) {
    const selectedCases = getSelectedCases();
    
    if (selectedCases.length === 0) {
        alert('Please select at least one case to start training.');
        return;
    }
    
    console.log(`Starting ${isRecap ? 'recap' : 'training'} with ${selectedCases.length} cases:`, selectedCases);
    
    // TODO: Connect to your actual training/recap logic
    // For now, just log the selected cases
    alert(`${isRecap ? 'Recap' : 'Training'} mode with ${selectedCases.length} case(s)`);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + A: Select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const hasVisibleCheckboxes = document.querySelectorAll('input[type="checkbox"][name="case"]').length > 0;
        if (hasVisibleCheckboxes) {
            e.preventDefault();
            toggleAll(true);
        }
    }
    
    // Ctrl/Cmd + D: Deselect all
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleAll(false);
    }
    
    // Ctrl/Cmd + E: Expand all
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        toggleExpand(true);
    }
    
    // Ctrl/Cmd + W: Collapse all
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        toggleExpand(false);
    }
});

// Save selections to localStorage
function saveSelections() {
    const selections = {};
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="case"]');
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selections[checkbox.id] = true;
        }
    });
    
    localStorage.setItem('case-selections', JSON.stringify(selections));
}

// Load selections from localStorage
function loadSelections() {
    const saved = localStorage.getItem('case-selections');
    if (!saved) return;
    
    try {
        const selections = JSON.parse(saved);
        
        Object.keys(selections).forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        updateAllCounts();
    } catch (e) {
        console.error('Error loading saved selections:', e);
    }
}

// Auto-save on change
document.addEventListener('DOMContentLoaded', function() {
    loadSelections();
    
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="case"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', saveSelections);
    });
});
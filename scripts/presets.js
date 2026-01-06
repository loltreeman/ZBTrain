// This presets.js is also made by masadl | 2017HAYA03, just modified it to fit to what I have now

let deleteUndoStack = [];

document.addEventListener('DOMContentLoaded', function () {
    setupPresetControls();
    migratePresets();
    refreshPresetList();
    updateUndoButton();
});

function setupPresetControls() {
    const saveBtn = document.getElementById('savePresetBtn');
    if (saveBtn) saveBtn.addEventListener('click', savePreset);

    const loadBtn = document.getElementById('loadPresetBtn');
    if (loadBtn) loadBtn.addEventListener('click', loadPreset);

    const delBtn = document.getElementById('deletePresetBtn');
    if (delBtn) delBtn.addEventListener('click', deletePreset);

    const undoBtn = document.getElementById('undoDeleteBtn');
    if (undoBtn) undoBtn.addEventListener('click', undoDelete);

    const upBtn = document.getElementById('moveUpBtn');
    if (upBtn) upBtn.addEventListener('click', () => movePreset(-1));

    const downBtn = document.getElementById('moveDownBtn');
    if (downBtn) downBtn.addEventListener('click', () => movePreset(1));

    const expBtn = document.getElementById('exportPresetsBtn');
    if (expBtn) expBtn.addEventListener('click', exportPresets);

    const impBtn = document.getElementById('importPresetsBtn');
    if (impBtn) impBtn.addEventListener('click', importPresets);

    const list = document.getElementById('presetList');
    if (list) {
        list.addEventListener('change', function () {
            updateControlButtons();
        });
    }
}

function updateControlButtons() {
    // Optional: disable move up/down if at edges
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function migratePresets() {
    const orderRaw = localStorage.getItem('presetOrder');
    let currentOrder = orderRaw ? JSON.parse(orderRaw) : [];

    // Check if we need migration
    // 1. Look for keys that are NOT UUIDs
    // 2. Look for order items that are NOT UUIDs

    // Simple heuristic: UUID is 36 chars.
    const needsMigration = currentOrder.some(key => key.length !== 36) ||
        Object.keys(localStorage).some(k => k.startsWith('preset_') && k.length !== 43); // preset_ + 36

    if (!needsMigration) return;

    console.log("Migrating presets to ID-based system...");

    const newOrder = [];
    const processedKeys = new Set();

    currentOrder.forEach(key => {
        if (key.length === 36) {
            newOrder.push(key);
            processedKeys.add('preset_' + key);
        } else {
            const oldKey = 'preset_' + key;
            const raw = localStorage.getItem(oldKey);
            if (raw) {
                const data = JSON.parse(raw);
                const newId = generateUUID();
                const newData = {
                    id: newId,
                    name: key,
                    algSet: data.algSet,
                    checked: data.checked
                };
                localStorage.setItem('preset_' + newId, JSON.stringify(newData));
                localStorage.removeItem(oldKey);
                newOrder.push(newId);
                processedKeys.add(oldKey);
            }
        }
    });

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('preset_') && !processedKeys.has(key)) {
            const suffix = key.substring(7);
            if (suffix.length === 36) {
                if (!newOrder.includes(suffix)) newOrder.push(suffix);
            } else {
                const raw = localStorage.getItem(key);
                if (raw) {
                    const data = JSON.parse(raw);
                    const newId = generateUUID();
                    const newData = {
                        id: newId,
                        name: suffix,
                        algSet: data.algSet,
                        checked: data.checked
                    };
                    localStorage.setItem('preset_' + newId, JSON.stringify(newData));
                    localStorage.removeItem(key);
                    newOrder.push(newId);
                }
            }
        }
    }

    localStorage.setItem('presetOrder', JSON.stringify(newOrder));
}

function getPresetOrderIds() {
    const orderRaw = localStorage.getItem('presetOrder');
    if (orderRaw) {
        return JSON.parse(orderRaw);
    }
    return [];
}

function getPresetData(id) {
    const raw = localStorage.getItem('preset_' + id);
    return raw ? JSON.parse(raw) : null;
}

function refreshPresetList() {
    const list = document.getElementById('presetList');
    if (!list) return;

    const selectedId = list.value; 
    list.innerHTML = '';
    const ids = getPresetOrderIds();

    ids.forEach(id => {
        const data = getPresetData(id);
        if (data) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = data.name || "(No Name)";
            list.appendChild(option);
        }
    });

    if (selectedId && document.querySelector(`option[value="${selectedId}"]`)) {
        list.value = selectedId;
    }
}

function savePreset() {
    const nameInput = document.getElementById('presetNameInput');
    let name = nameInput.value.trim();

    if (!name) {
        alert("Please enter a name for the preset.");
        return;
    }

    const presetData = {
        id: generateUUID(),
        name: name,
        modalSelections: JSON.parse(JSON.stringify(modalSelections)), 
        activeOrientation: JSON.parse(JSON.stringify(activeOrientation))
    };

    localStorage.setItem('preset_' + presetData.id, JSON.stringify(presetData));

    const order = getPresetOrderIds();
    order.push(presetData.id);
    localStorage.setItem('presetOrder', JSON.stringify(order));

    refreshPresetList();
    document.getElementById('presetList').value = presetData.id;
    nameInput.value = "";
}

function loadPreset() {
    const list = document.getElementById('presetList');
    const id = list.value;

    if (!id) return;

    const data = getPresetData(id);
    if (!data) return;

    if (data.modalSelections) {
        for (let key in modalSelections) delete modalSelections[key];
        Object.assign(modalSelections, data.modalSelections);
    }

    if (data.activeOrientation) {
        Object.assign(activeOrientation, data.activeOrientation);
    }

    Object.keys(zbllMap).forEach(set => {
        updateSetCount(set);
        
        const container = document.getElementById(`container-${set}`);
        if (container && activeOrientation[set] !== undefined) {
            container.querySelectorAll(".subset-orientation").forEach(img => {
                img.style.transform = `rotate(${activeOrientation[set]}deg)`;
            });
        }
    });

    updateTrainerButtons();
    
    console.log(`Preset "${data.name}" loaded successfully.`);
}

function deletePreset() {
    const list = document.getElementById('presetList');
    const id = list.value;
    const previousIndex = list.selectedIndex;

    if (!id) {
        alert("Please select a preset to delete.");
        return;
    }

    const data = getPresetData(id);
    if (!data) return;

    const order = getPresetOrderIds();
    const index = order.indexOf(id);

    deleteUndoStack.push({
        id: id,
        data: data,
        index: index
    });
    if (deleteUndoStack.length > 20) deleteUndoStack.shift();
    updateUndoButton();

    localStorage.removeItem('preset_' + id);

    if (index > -1) {
        order.splice(index, 1);
        localStorage.setItem('presetOrder', JSON.stringify(order));
    }

    refreshPresetList();

    if (list.options.length > 0) {
        const newIndex = Math.min(previousIndex, list.options.length - 1);
        if (newIndex >= 0) {
            list.selectedIndex = newIndex;
        }
    }
}

function undoDelete() {
    if (deleteUndoStack.length === 0) return;

    const item = deleteUndoStack.pop();
    updateUndoButton();

    localStorage.setItem('preset_' + item.id, JSON.stringify(item.data));

    const order = getPresetOrderIds();
    if (item.index >= 0 && item.index <= order.length) {
        order.splice(item.index, 0, item.id);
    } else {
        order.push(item.id);
    }
    localStorage.setItem('presetOrder', JSON.stringify(order));

    refreshPresetList();

    const list = document.getElementById('presetList');
    list.value = item.id;
    list.dispatchEvent(new Event('change'));
}

function updateUndoButton() {
    const btn = document.getElementById('undoDeleteBtn');
    if (btn) {
        // btn.style.visibility = deleteUndoStack.length > 0 ? 'visible' : 'hidden'; // Old logic
        btn.disabled = deleteUndoStack.length === 0;
    }
}

function movePreset(direction) {
    const list = document.getElementById('presetList');
    const id = list.value;
    if (!id) return;

    const order = getPresetOrderIds();
    const index = order.indexOf(id);

    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= order.length) return;

    [order[index], order[newIndex]] = [order[newIndex], order[index]];
    localStorage.setItem('presetOrder', JSON.stringify(order));

    refreshPresetList();
    list.value = id;
}

function exportPresets() {
    const order = getPresetOrderIds();
    const allData = order.map(id => getPresetData(id)).filter(d => d);
    
    if (allData.length === 0) return;

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zbtrain_presets.json";
    link.click();
}

function importPresets() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';

    fileInput.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            processCSVImport(content);
        };
        reader.readAsText(file);
    };

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

function processCSVImport(csvText) {
    const lines = csvText.split(/\r\n|\n/);
    let count = 0;
    const order = getPresetOrderIds();

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = parseCSVLine(line);
        if (parts.length >= 3) {
            const name = parts[0];
            const algSet = parts[1];
            const checkedStr = parts[2];
            const checked = checkedStr ? checkedStr.split('|') : [];

            const newId = generateUUID();
            const presetData = { id: newId, name: name, algSet: algSet, checked: checked };

            localStorage.setItem('preset_' + newId, JSON.stringify(presetData));
            order.push(newId);
            count++;
        }
    }

    localStorage.setItem('presetOrder', JSON.stringify(order));
    refreshPresetList();
    // alert("Imported " + count + " presets.");
}

function parseCSVLine(text) {
    const ret = [];
    let entry = [];
    let inQuote = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
            if (inQuote && text[i + 1] === '"') {
                entry.push('"');
                i++;
            } else {
                inQuote = !inQuote;
            }
        } else if (c === ',' && !inQuote) {
            ret.push(entry.join(''));
            entry = [];
        } else {
            entry.push(c);
        }
    }
    ret.push(entry.join(''));
    return ret;
}

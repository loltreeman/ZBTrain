// Smart cube support (Settings → Smart cube).
//
// Uses smartcube-web-bluetooth (bundled in vendor/) to connect over Web
// Bluetooth. Each move the cube reports is passed to the virtual cube as if
// you had pressed its key, so timing, recognition/execution splits, recall
// mode, solve detection and alg detection all work the same way.
//
// Like csTimer's training mode, the physical cube's state doesn't matter:
// only your moves are used, applied to the case shown on screen.

import { connectSmartCube } from "../vendor/smartcube-web-bluetooth.js";

const STD = { U: "White", D: "Yellow", F: "Green", B: "Blue", R: "Red", L: "Orange" };
const COLOUR_FACE = { White: "U", Yellow: "D", Green: "F", Blue: "B", Red: "R", Orange: "L" };
const ADJACENT = {
    White: ["Green", "Red", "Blue", "Orange"],
    Yellow: ["Green", "Orange", "Blue", "Red"],
    Green: ["White", "Orange", "Yellow", "Red"],
    Blue: ["White", "Red", "Yellow", "Orange"],
    Red: ["White", "Green", "Yellow", "Blue"],
    Orange: ["White", "Blue", "Yellow", "Green"],
};
// All 24 ways to hold a cube, as rotations from white-top / green-front
const ORIENTATIONS = [];
["", "x", "x2", "x'", "z", "z'"].forEach((a) =>
    ["", "y", "y2", "y'"].forEach((b) => ORIENTATIONS.push((a + " " + b).trim()))
);

const els = {
    section: document.getElementById("smartCubeSection"),
    button: document.getElementById("smartCubeConnect"),
    label: document.querySelector("#smartCubeConnect span"),
    status: document.getElementById("smartCubeStatus"),
    dot: document.getElementById("smartCubeDot"),
    grip: document.getElementById("smartCubeGrip"),
    hint: document.getElementById("smartCubeHint"),
};

const CONNECTED_HINT =
    "Keyboard turning is off while your smart cube is connected, so only the cube can turn the cube. Space still starts each solve.";
const defaultHint = els.hint ? els.hint.textContent : "";

let conn = null;
let subscription = null;
let battery = null;
let faceMap = null;      // physical face letter → face on screen
let faceMapFor = null;   // setup / grip the map was built for

// ── Grip: which physical face is which on-screen face ────────────────

function centres(cube) {
    const s = window.CubeViews.getStickers(cube);
    const out = {};
    Object.keys(s).forEach((f) => (out[f] = s[f][4]));
    return out;
}

// Colour value (as the virtual cube draws it) for each standard face
function standardColours() {
    return centres(window.virtualCube.makeCube(""));
}

function buildFaceMap() {
    const grip = els.grip.value;
    const setup = window.virtualCube.getSetup ? window.virtualCube.getSetup() : "";
    const key = grip + "|" + setup;
    if (faceMap && faceMapFor === key) return faceMap;

    const std = standardColours();
    let screen; // face on screen → colour value, for the way you hold the cube
    if (grip === "auto") {
        // Hold it the way the case is shown: same colours on top and front
        screen = centres(window.virtualCube.makeCube(setup));
    } else {
        const [top, front] = grip.split("/");
        const rot = ORIENTATIONS.find((r) => {
            const c = centres(window.virtualCube.makeCube(r));
            return c.U === std[COLOUR_FACE[top]] && c.F === std[COLOUR_FACE[front]];
        }) || "";
        screen = centres(window.virtualCube.makeCube(rot));
    }
    faceMap = {};
    Object.keys(STD).forEach((physical) => {
        const colour = std[physical];
        const onScreen = Object.keys(screen).find((f) => screen[f] === colour);
        faceMap[physical] = onScreen || physical;
    });
    faceMapFor = key;
    return faceMap;
}

function fillGripOptions() {
    Object.keys(ADJACENT).forEach((top) => {
        const group = document.createElement("optgroup");
        group.label = top + " top";
        ADJACENT[top].forEach((front) => {
            const opt = document.createElement("option");
            opt.value = top + "/" + front;
            opt.textContent = top + " top, " + front.toLowerCase() + " front";
            group.appendChild(opt);
        });
        els.grip.appendChild(group);
    });
    try {
        const saved = localStorage.getItem("smartCubeGrip");
        if (saved) els.grip.value = saved;
        if (!els.grip.value) els.grip.value = "auto";
    } catch (e) {}
    els.grip.addEventListener("change", () => {
        try { localStorage.setItem("smartCubeGrip", els.grip.value); } catch (e) {}
        faceMap = null;
        els.grip.blur();
    });
}

// ── Moves ─────────────────────────────────────────────────────────────

function onMove(move) {
    const m = /^([URFDLB])(2|')?$/.exec(String(move).trim());
    if (!m || !window.virtualCube) return;
    const face = buildFaceMap()[m[1]];
    window.virtualCube.applyMove(face + (m[2] || ""), "smartcube");
}

// ── Connection ────────────────────────────────────────────────────────

function setStatus(text, state) {
    els.status.textContent = text;
    els.dot.dataset.state = state || "";
}

function showConnected() {
    const name = conn ? conn.deviceName : "";
    setStatus(
        "Connected" + (name ? ": " + name : "") + (battery != null ? " · " + battery + "%" : ""),
        "on"
    );
    els.label.textContent = "Disconnect";
    els.hint.textContent = CONNECTED_HINT;
}

function showDisconnected(message) {
    conn = null;
    battery = null;
    if (subscription) subscription.unsubscribe();
    subscription = null;
    setStatus(message || "Not connected", "");
    els.label.textContent = "Connect smart cube";
    if (defaultHint) els.hint.textContent = defaultHint;
}

// GAN cubes encrypt their data with the cube's MAC address. The library
// tries to find it automatically; if it can't, ask (and remember it).
async function macAddressProvider(device, isFallbackCall) {
    const key = "smartCubeMac:" + (device && device.name);
    let saved = null;
    try { saved = localStorage.getItem(key); } catch (e) {}
    if (!isFallbackCall) return saved || null;
    const mac = window.prompt(
        "Enter the MAC address of " + (device && device.name ? device.name : "your cube") +
        " (looks like AB:12:CD:34:EF:56).\nSee “Bluetooth and MAC address help” in Settings if you're not sure.",
        saved || ""
    );
    if (mac) {
        try { localStorage.setItem(key, mac.trim()); } catch (e) {}
        return mac.trim();
    }
    return null;
}

function onEvent(event) {
    if (event.type === "MOVE") onMove(event.move);
    else if (event.type === "BATTERY") { battery = event.batteryLevel; showConnected(); }
    else if (event.type === "DISCONNECT") showDisconnected("Disconnected");
}

async function toggleConnection() {
    if (conn) {
        try { await conn.disconnect(); } catch (e) {}
        showDisconnected();
        return;
    }
    els.button.disabled = true;
    try {
        conn = await connectSmartCube({
            macAddressProvider,
            onStatus: (text) => setStatus(text, "busy"),
        });
        subscription = conn.events$.subscribe(onEvent);
        showConnected();
        if (conn.capabilities && conn.capabilities.battery) {
            conn.sendCommand({ type: "REQUEST_BATTERY" }).catch(() => {});
        }
    } catch (e) {
        const cancelled = e && (e.name === "NotFoundError" || /cancel/i.test(e.message || ""));
        showDisconnected(cancelled ? "Not connected" : "Couldn't connect: " + (e && e.message ? e.message : e));
    } finally {
        els.button.disabled = false;
    }
}

// ── Start ─────────────────────────────────────────────────────────────

if (els.section) {
    fillGripOptions();
    if (!navigator.bluetooth) {
        els.button.disabled = true;
        els.hint.textContent =
            "This browser can't connect to Bluetooth cubes. Use Chrome or Edge on a computer or Android phone.";
    } else {
        els.button.addEventListener("click", toggleConnection);
    }
}

window.SmartCube = {
    isConnected: () => !!conn,
    // For testing without a cube: feed a move as if the cube reported it
    simulateMove: onMove,
};

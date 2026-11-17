#!/usr/bin/env node
// Refreshes scripts/topSolverAlgs.js from reco.nz.
//
//   node tools/updateTopSolvers.js            Xuanyi Geng, Qixian Cao, Tymon Kolasiński
//   node tools/updateTopSolvers.js --all      every ZB solver on reco.nz
//   node tools/updateTopSolvers.js --dry-run  show what it would add, change nothing
//
// Options: --delay <ms> between requests (default 1500), --max <n> solve pages
// to fetch this run (default 400), --recheck to fetch solves that are already
// in the file again.
//
// It reads the list of 3x3 ZB solves (https://reco.nz/?sort=id_desc&3x3=on&ZB=on),
// opens each new solve, takes the steps labelled ZBLS and ZBLL, works out which
// case each one is with ZBTrain's own alg checker, and adds the alg and a link
// to the solve. Existing entries (from Yota Ueda's sheet) are kept.
//
// Being polite to reco.nz:
//   - one request at a time, with a pause between them
//   - every page it fetches is saved in tools/.reco-cache, so it's never fetched twice
//   - solves already in topSolverAlgs.js are skipped, so later runs only fetch new ones
//   - only the list pages (about 15) are fetched again on every run
//   - if the site says slow down (429) or has an error, it waits and tries again,
//     and stops after a few failures
// Needs Node 18 or newer (for fetch).

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "scripts", "topSolverAlgs.js");
const CACHE = path.join(__dirname, ".reco-cache");
const BASE = "https://reco.nz";
const LIST = BASE + "/?sort=id_desc&3x3=on&ZB=on";
const USER_AGENT = "ZBTrain-alg-updater (https://zbtrain.vercel.app)";

const args = process.argv.slice(2);
const opt = (name, def) => {
    const i = args.indexOf("--" + name);
    return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : def;
};
const ALL = args.includes("--all");
const DRY = args.includes("--dry-run");
const RECHECK = args.includes("--recheck");
const DELAY = Math.max(500, parseInt(opt("delay", "1500"), 10));
const MAX = parseInt(opt("max", "400"), 10);

// Short codes used in topSolverAlgs.js ("x12630" = Xuanyi Geng, solve 12630)
const KNOWN = { "Xuanyi Geng": "x", "Qixian Cao": "q", "Tymon Kolasiński": "t" };

// ── ZBTrain's scripts in Node (for the alg checker) ─────────────────────
const store = {};
const ctx = {
    console, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    sessionStorage: { getItem: () => null, setItem() {} },
    document: { getElementById: () => null, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ getContext: () => null, style: {} }), body: { appendChild() {} } },
    navigator: {}, location: { pathname: "/", search: "" },
    performance: { now: () => Date.now() },
    CustomEvent: function () {},
    addEventListener() {},
};
ctx.window = ctx;
vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(path.join(ROOT, "scripts", f), "utf8"), ctx, { filename: f });
["scrambles.js", "algorithms.js", "zblsData.js", "zblsSlots.js", "zblsSlotTools.js", "cubeGoals.js", "cube.js", "cube3x3.js",
    "algAuf.js", "algDetect.js", "virtualCubeEmbed.js", "lsll.js", "topSolverAlgs.js", "algSheets.js"].forEach(load);
const { AlgSheets } = ctx;
const data = vm.runInContext("topSolverAlgs", ctx);
const names = Object.assign({}, vm.runInContext("TOP_SOLVERS", ctx));

// ── Fetching, slowly and with a cache ───────────────────────────────────
fs.mkdirSync(CACHE, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastRequest = 0;
let requests = 0;

async function get(url, cacheName) {
    const file = cacheName && path.join(CACHE, cacheName);
    if (file && fs.existsSync(file)) return fs.readFileSync(file, "utf8");
    for (let attempt = 1; attempt <= 4; attempt++) {
        const wait = lastRequest + DELAY - Date.now();
        if (wait > 0) await sleep(wait);
        lastRequest = Date.now();
        requests++;
        let res;
        try {
            res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
        } catch (e) {
            console.warn(`  network error (${e.message}), waiting before trying again`);
            await sleep(DELAY * 4 * attempt);
            continue;
        }
        if (res.ok) {
            const text = await res.text();
            if (file) fs.writeFileSync(file, text);
            return text;
        }
        if (res.status === 404) return null;
        // Slow down: wait as long as the site asks, or longer each time
        const retryAfter = parseInt(res.headers.get("retry-after"), 10);
        const pause = retryAfter > 0 ? retryAfter * 1000 : DELAY * 10 * attempt;
        console.warn(`  ${res.status} from reco.nz, waiting ${Math.round(pause / 1000)}s`);
        await sleep(pause);
    }
    throw new Error("reco.nz kept failing at " + url + ". Stopped; run it again later (fetched pages are cached).");
}

// ── Reading the pages ───────────────────────────────────────────────────
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

// List page → [{ id, solver }], and whether there's a next page
function parseList(html) {
    const rows = [];
    const re = /data-id='(\d+)'>\s*<td>\d+<\/td>\s*<td>([^<]*)<\/td>\s*<td>[^<]*<\/td>\s*<td>([^<]*)<\/td>/g;
    let m;
    while ((m = re.exec(html))) if (m[2] === "3x3") rows.push({ id: m[1], solver: decode(m[3]).trim() });
    return { rows, more: /href='[^']*page=\d+'>\s*Next/i.test(html) || /page=\d+[^>]*>\s*Next/i.test(html) };
}

// Solve page → [{ moves, comment }] from its alg.cubing.net link
function parseSolve(html) {
    const m = /alg\.cubing\.net\/\?([^"'\s>]+)/.exec(html);
    if (!m) return null;
    const params = new URLSearchParams(decode(m[1]));
    return (params.get("alg") || "").split("\n").map((line) => {
        const i = line.indexOf("//");
        return { moves: (i >= 0 ? line.slice(0, i) : line).trim(), comment: i >= 0 ? line.slice(i + 2).trim() : "" };
    });
}

// Moves next to each other on the same face combine: "y y'" → nothing, "R R" → "R2"
function cancel(tokens) {
    const out = [];
    tokens.forEach((tok) => {
        const m = /^([A-Za-z]w?)(2|')?$/.exec(tok);
        if (!m) { out.push(tok); return; }
        const amount = m[2] === "2" ? 2 : m[2] === "'" ? 3 : 1;
        const prev = out.length && /^([A-Za-z]w?)(2|')?$/.exec(out[out.length - 1]);
        if (prev && prev[1] === m[1]) {
            const total = ((prev[2] === "2" ? 2 : prev[2] === "'" ? 3 : 1) + amount) % 4;
            out.pop();
            if (total) out.push(m[1] + (total === 2 ? "2" : total === 3 ? "'" : ""));
        } else out.push(tok);
    });
    return out.length === tokens.length ? out : cancel(out);
}

// "y U2' L' U2 L" → "U2 L' U2 L": cancelled moves, no rotations at either end, X2' → X2
function tidy(moves) {
    const t = cancel(AlgSheets.cleanAlg(moves).replace(/\b([A-Za-z]w?)2'/g, "$12").split(/\s+/).filter(Boolean));
    while (t.length && /^[xyz]/.test(t[0])) t.shift();
    while (t.length && /^[xyz]/.test(t[t.length - 1])) t.pop();
    return t.join(" ");
}

// The ZBLS and ZBLL steps of one solve
function zbSteps(steps) {
    const out = [];
    steps.forEach((s) => {
        if (!s.moves) return;
        const kind = /\bzbll\b/i.test(s.comment) ? "ZBLL" : /\bzbls\b/i.test(s.comment) ? "ZBLS" : null;
        if (!kind) return;
        const alg = tidy(s.moves);
        if (alg.split(" ").length >= 3) out.push({ kind, alg });
    });
    return out;
}

function codeFor(solver) {
    if (KNOWN[solver]) return KNOWN[solver];
    for (const c in names) if (names[c] === solver) return c;
    // Initials, then a letter if they're taken: "Bofan Zhang" → "bz"
    let base = solver.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").split(/\s+/).map((w) => w[0]).join("") || "s";
    let code = base, n = 0;
    while (names[code]) code = base + String.fromCharCode(97 + n++);
    names[code] = solver;
    return code;
}

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
    const known = new Set(); // solve ids already in the file
    Object.values(data).forEach((list) => list.forEach((e) => e[1].split(" ").forEach((r) => known.add(r.replace(/^[a-z]+/, "")))));
    const wanted = (solver) => ALL || KNOWN[solver];

    // 1. The whole list (about 15 pages), newest first
    console.log("Reading the list of ZB solves…");
    const solves = [];
    for (let page = 1; page <= 100; page++) {
        const html = await get(LIST + (page > 1 ? "&page=" + page : ""));
        const { rows, more } = parseList(html || "");
        const fresh = rows.filter((r) => wanted(r.solver) && (RECHECK || !known.has(r.id)));
        solves.push(...fresh);
        console.log(`  page ${page}: ${rows.length} solves, ${fresh.length} new`);
        if (!rows.length || !more) break;
    }
    const todo = solves.slice(0, MAX);
    console.log(`${solves.length} solves to read${solves.length > MAX ? `, reading ${MAX} this run (--max)` : ""}.`);

    // 2. Each solve's ZBLS and ZBLL
    const added = [];
    const skipped = { noRecon: 0, noZb: 0, unknownCase: 0 };
    for (let i = 0; i < todo.length; i++) {
        const s = todo[i];
        const html = await get(`${BASE}/solve/${s.id}`, `solve-${s.id}.html`);
        if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${todo.length}`);
        const steps = html && parseSolve(html);
        if (!steps) { skipped.noRecon++; continue; }
        const zb = zbSteps(steps);
        if (!zb.length) { skipped.noZb++; continue; }
        const recon = codeFor(s.solver) + s.id;
        zb.forEach(({ alg }) => {
            const res = AlgSheets.checkAlg(alg);
            if (!res.ok) { skipped.unknownCase++; return; }
            const list = (data[res.key] = data[res.key] || []);
            if (list.some((e) => e[1].split(" ").includes(recon))) return;
            // Same alg (any AUF or way of writing it) → add the solve to it
            let entry = list.find((e) => e[0] === alg) ||
                list.find((e) => ctx.AlgDetect && ctx.AlgDetect.canonicalKey(e[0]) && ctx.AlgDetect.canonicalKey(e[0]) === ctx.AlgDetect.canonicalKey(alg));
            if (!entry) list.push((entry = [alg, ""]));
            entry[1] = (entry[1] ? entry[1] + " " : "") + recon;
            added.push(`${res.key}: ${alg}  (${s.solver}, solve ${s.id})`);
        });
    }

    // 3. Report and write
    console.log(`\nAdded ${added.length} alg uses from ${todo.length} solves (${requests} requests to reco.nz).`);
    if (skipped.noRecon || skipped.noZb || skipped.unknownCase) {
        console.log(`Skipped: ${skipped.noRecon} with no reconstruction, ${skipped.noZb} with no step labelled ZBLS/ZBLL, ${skipped.unknownCase} steps that aren't a ZBLS or ZBLL case.`);
    }
    added.slice(0, 15).forEach((a) => console.log("  + " + a));
    if (added.length > 15) console.log(`  … and ${added.length - 15} more`);
    if (DRY) return console.log("\nDry run: nothing written.");
    if (!added.length) return console.log("Nothing new.");
    write();
    console.log("\nWrote " + path.relative(ROOT, OUT));
}

function write() {
    const src = fs.readFileSync(OUT, "utf8");
    const header = src.slice(0, src.indexOf("var TOP_SOLVERS"));
    const solverLines = Object.keys(names).map((c) => `    ${c}: ${JSON.stringify(names[c])},`).join("\n");
    const caseLines = Object.keys(data).sort().map((k) => JSON.stringify(k) + ":" + JSON.stringify(data[k])).join(",\n");
    fs.writeFileSync(OUT, header +
        "var TOP_SOLVERS = {\n" + solverLines + "\n};\n\n" +
        "var topSolverAlgs = {\n" + caseLines + ",\n};\n");
}

main().catch((e) => { console.error("\n" + e.message); process.exit(1); });

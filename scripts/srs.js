// Learning mode: spaced repetition for ZBLL and ZBLS cases.
//
// Scheduling works like Anki's classic (SM-2 based) scheduler, written from
// scratch here. Each case is a "card":
//   new        → not seen yet
//   learning   → seen today; comes back after short steps (1 min, 10 min)
//   review     → learned; comes back after an interval in days that grows
//                each time you get it right (interval × ease)
//   relearning → a review case you got wrong; short steps again, then back
//                to review
// Ratings: 1 Again (couldn't do it), 2 Hard, 3 Good, 4 Easy.
//
// A "day" starts at 4am local time, like Anki, so late-night sessions count
// for the day before.
//
// Everything is kept in localStorage:
//   srsCards     { caseKey: card }
//   srsLog       { "YYYY-MM-DD": { deck: { new, reviews, again, done } } }
//   srsSettings  { deck: { newPerDay, goal, include: { caseKey: true } } }
//                New cases only come from the cases in "include", which you
//                pick on the Learn page (nothing is picked at first).

(function (window) {
    var CARDS_KEY = "srsCards";
    var LOG_KEY = "srsLog";
    var SETTINGS_KEY = "srsSettings";

    var MINUTE = 60 * 1000;
    var DAY = 24 * 60 * MINUTE;
    var DAY_STARTS_AT_HOUR = 4;

    var CONFIG = {
        learnSteps: [1, 10],      // minutes
        relearnSteps: [10],       // minutes
        graduatingInterval: 1,    // days, after the last learning step
        easyInterval: 4,          // days, when a new case is rated Easy
        startingEase: 2.5,
        minEase: 1.3,
        easyBonus: 1.3,
        hardFactor: 1.2,
        maxInterval: 365,
        learnAheadMinutes: 20,    // with nothing else left, show learning cases this early
        knownInterval: 21,        // a case counts as "known" from this interval (Anki's "mature")
        newEvery: 4,              // mix one new case in every few reviews
    };

    var RATINGS = ["", "Again", "Hard", "Good", "Easy"];

    // ── Storage ─────────────────────────────────────────────────────────

    function load(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
    }

    function save(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }

    // ── Decks: which cases each one holds, in the order new ones are taught ──

    var SUBSET_ORDER = ["2GLL", "Diag", "3", "4", "5", "6"];

    function zbllCases() {
        if (typeof zbllAlgs === "undefined") return [];
        var out = [];
        Object.keys(zbllAlgs).forEach(function (set) {
            var subsets = Object.keys(zbllAlgs[set]).sort(function (a, b) {
                var ia = SUBSET_ORDER.indexOf(a), ib = SUBSET_ORDER.indexOf(b);
                return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
            });
            subsets.forEach(function (sub) {
                Object.keys(zbllAlgs[set][sub]).forEach(function (c) {
                    out.push({
                        key: set + "-" + sub + "-" + c,
                        set: set, subset: sub, caseName: c,
                        group: set + " " + sub,
                        name: set + "-" + sub + "-" + c,
                        img: "svg/top/" + set + "-" + sub + "-" + c + ".svg",
                    });
                });
            });
        });
        return out;
    }

    function zblsCases() {
        var reg = window.CASE_SETS && window.CASE_SETS.ZBLS;
        if (!reg) return [];
        var out = [];
        Object.keys(reg.algs).sort(function (a, b) { return a - b; }).forEach(function (f) {
            Object.keys(reg.algs[f]).sort(function (a, b) { return a - b; }).forEach(function (c) {
                out.push({
                    key: "ZBLS-" + f + "-" + c,
                    set: "ZBLS", subset: f, caseName: c,
                    group: "F2L " + f,
                    name: reg.name(f, c),
                    img: reg.img(f, c),
                });
            });
        });
        return out;
    }

    var DECKS = {
        ZBLL: { label: "ZBLL", cases: zbllCases, defaultNew: 5 },
        ZBLS: { label: "ZBLS", cases: zblsCases, defaultNew: 5 },
    };

    var caseCache = {};
    function deckCases(deck) {
        if (!caseCache[deck]) caseCache[deck] = DECKS[deck] ? DECKS[deck].cases() : [];
        return caseCache[deck];
    }

    function deckOfKey(key) { return /^ZBLS-/.test(key) ? "ZBLS" : "ZBLL"; }

    // ── Days ────────────────────────────────────────────────────────────

    // The study day a time belongs to, as "YYYY-MM-DD"
    function dayId(ms) {
        var d = new Date((ms == null ? Date.now() : ms) - DAY_STARTS_AT_HOUR * 60 * MINUTE);
        return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    function pad(n) { return n < 10 ? "0" + n : "" + n; }

    // When the current study day ends
    function endOfToday(now) {
        var d = new Date(now - DAY_STARTS_AT_HOUR * 60 * MINUTE);
        d.setHours(0, 0, 0, 0);
        return d.getTime() + DAY + DAY_STARTS_AT_HOUR * 60 * MINUTE;
    }

    // A review due in `days` days: at the start of that study day
    function dueInDays(now, days) {
        return endOfToday(now) + (days - 1) * DAY;
    }

    // ── Settings ────────────────────────────────────────────────────────

    function getSettings(deck) {
        var all = load(SETTINGS_KEY, {});
        var s = all[deck] || {};
        return {
            newPerDay: s.newPerDay != null ? s.newPerDay : (DECKS[deck] ? DECKS[deck].defaultNew : 5),
            goal: s.goal || null,      // target time in seconds, or null
            include: s.include || {},  // cases you chose to learn (new cases only come from these)
        };
    }

    function setSettings(deck, patch) {
        var all = load(SETTINGS_KEY, {});
        var s = getSettings(deck);
        Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
        all[deck] = s;
        save(SETTINGS_KEY, all);
        return s;
    }

    // ── Cards ───────────────────────────────────────────────────────────

    function allCards() { return load(CARDS_KEY, {}); }

    function getCard(key) {
        return allCards()[key] || { state: "new" };
    }

    function putCard(key, card) {
        var cards = allCards();
        cards[key] = card;
        save(CARDS_KEY, cards);
    }

    function fuzz(days) {
        if (days < 3) return days;
        var spread = Math.max(1, Math.round(days * 0.05));
        return days + Math.round((Math.random() * 2 - 1) * spread);
    }

    // The card after a rating. Pure: doesn't save anything.
    function schedule(card, rating, now) {
        now = now || Date.now();
        var c = JSON.parse(JSON.stringify(card || { state: "new" }));
        c.reps = (c.reps || 0) + 1;
        c.last = now;
        c.lastRating = rating;

        function toStep(steps, i) {
            c.step = i;
            c.due = now + steps[i] * MINUTE;
        }

        function graduate(days) {
            c.state = "review";
            c.interval = days;
            c.ease = c.ease || CONFIG.startingEase;
            c.step = 0;
            c.due = dueInDays(now, days);
        }

        if (c.state === "new" || c.state === "learning") {
            var steps = CONFIG.learnSteps;
            var i = c.state === "new" ? 0 : (c.step || 0);
            c.state = "learning";
            c.ease = c.ease || CONFIG.startingEase;
            if (rating === 1) toStep(steps, 0);
            else if (rating === 2) {
                // Hard: repeat this step (first step: halfway to the next)
                c.step = i;
                var mins = i === 0 && steps.length > 1 ? (steps[0] + steps[1]) / 2 : steps[i];
                c.due = now + mins * MINUTE;
            } else if (rating === 3) {
                if (card.state === "new") toStep(steps, Math.min(1, steps.length - 1));
                else if (i + 1 < steps.length) toStep(steps, i + 1);
                else graduate(CONFIG.graduatingInterval);
                if (card.state === "new" && steps.length === 1) graduate(CONFIG.graduatingInterval);
            } else graduate(CONFIG.easyInterval);
            return c;
        }

        if (c.state === "relearning") {
            var rsteps = CONFIG.relearnSteps;
            var j = c.step || 0;
            if (rating === 1) toStep(rsteps, 0);
            else if (rating === 2) { c.step = j; c.due = now + rsteps[j] * MINUTE; }
            else if (rating === 3 && j + 1 < rsteps.length) toStep(rsteps, j + 1);
            else {
                c.state = "review";
                c.step = 0;
                c.interval = Math.max(1, c.interval || 1) + (rating === 4 ? 1 : 0);
                c.due = dueInDays(now, c.interval);
            }
            return c;
        }

        // review
        var ease = c.ease || CONFIG.startingEase;
        var ivl = c.interval || 1;
        var overdue = Math.max(0, Math.floor((now - (c.due || now)) / DAY));
        if (rating === 1) {
            c.lapses = (c.lapses || 0) + 1;
            c.ease = Math.max(CONFIG.minEase, ease - 0.2);
            c.state = "relearning";
            c.interval = 1;
            toStep(CONFIG.relearnSteps, 0);
            return c;
        }
        var next;
        if (rating === 2) {
            next = ivl * CONFIG.hardFactor;
            c.ease = Math.max(CONFIG.minEase, ease - 0.15);
        } else if (rating === 3) {
            next = (ivl + overdue / 2) * ease;
        } else {
            next = (ivl + overdue) * ease * CONFIG.easyBonus;
            c.ease = ease + 0.15;
        }
        next = Math.min(CONFIG.maxInterval, Math.max(ivl + 1, Math.round(fuzz(next))));
        c.interval = next;
        c.due = dueInDays(now, next);
        return c;
    }

    // Short text for when a card would come back, e.g. "10m", "4d", "2mo"
    function describeDue(card, now) {
        var ms = (card.due || now) - now;
        if (card.state === "review") {
            var d = card.interval;
            if (d < 30) return d + "d";
            if (d < 365) return (d / 30).toFixed(d < 60 ? 1 : 0).replace(/\.0$/, "") + "mo";
            return (d / 365).toFixed(1).replace(/\.0$/, "") + "y";
        }
        var m = Math.max(1, Math.round(ms / MINUTE));
        return m < 60 ? m + "m" : Math.round(m / 60) + "h";
    }

    // ── Daily log (limits, streaks) ─────────────────────────────────────

    function todayLog(deck, now) {
        var log = load(LOG_KEY, {});
        var day = log[dayId(now)] || {};
        return day[deck] || { new: 0, reviews: 0, again: 0, done: false };
    }

    function updateTodayLog(deck, now, fn) {
        var log = load(LOG_KEY, {});
        var id = dayId(now);
        log[id] = log[id] || {};
        var entry = log[id][deck] || { new: 0, reviews: 0, again: 0, done: false };
        fn(entry);
        log[id][deck] = entry;
        save(LOG_KEY, log);
    }

    // Days in a row you studied (did at least one case). Today counts once
    // you've studied today; until then the streak is still alive from yesterday.
    function streak(now) {
        now = now || Date.now();
        var log = load(LOG_KEY, {});
        function studied(id) {
            var day = log[id];
            if (!day) return false;
            return Object.keys(day).some(function (d) { return (day[d].new || 0) + (day[d].reviews || 0) > 0; });
        }
        var n = 0;
        var t = now;
        if (!studied(dayId(t))) t -= DAY;
        while (studied(dayId(t))) { n++; t -= DAY; }
        return { days: n, today: studied(dayId(now)) };
    }

    // ── The queue ───────────────────────────────────────────────────────

    // Counts and the next case to study for a deck
    function queue(deck, now, exclude) {
        now = now || Date.now();
        var cards = allCards();
        var settings = getSettings(deck);
        var log = todayLog(deck, now);
        var end = endOfToday(now);
        var learning = [], reviews = [], fresh = [], aheadLearning = [];
        deckCases(deck).forEach(function (c) {
            var card = cards[c.key] || { state: "new" };
            if (c.key === exclude) return;
            if (card.state === "new") {
                if (settings.include[c.key]) fresh.push(c);
            } else if (card.state === "learning" || card.state === "relearning") {
                if (card.due <= now) learning.push({ c: c, due: card.due });
                else if (card.due <= now + CONFIG.learnAheadMinutes * MINUTE) aheadLearning.push({ c: c, due: card.due });
                else if (card.due < end) aheadLearning.push({ c: c, due: card.due, later: true });
            } else if (card.due < end) {
                reviews.push({ c: c, due: card.due });
            }
        });
        var newLeft = Math.max(0, settings.newPerDay - log.new);
        learning.sort(byDue);
        reviews.sort(byDue);
        aheadLearning.sort(byDue);

        var next = null, kind = null;
        if (learning.length) { next = learning[0].c; kind = "learning"; }
        else {
            var newDue = newLeft > 0 && fresh.length;
            // Mix new cases in among reviews
            var reviewsSinceNew = log.reviews - log.new * CONFIG.newEvery;
            if (newDue && (!reviews.length || reviewsSinceNew >= CONFIG.newEvery)) { next = fresh[0]; kind = "new"; }
            else if (reviews.length) { next = reviews[0].c; kind = "review"; }
            else if (newDue) { next = fresh[0]; kind = "new"; }
            else {
                var soon = aheadLearning.filter(function (a) { return !a.later; });
                if (soon.length) { next = soon[0].c; kind = "learning"; }
            }
        }
        var later = aheadLearning.filter(function (a) { return a.later; });
        return {
            next: next,
            kind: kind,
            counts: {
                new: Math.min(newLeft, fresh.length),
                learning: learning.length + aheadLearning.length,
                review: reviews.length,
            },
            // Learning cases due later today, once nothing else is left
            waitingUntil: !next && later.length ? later[0].due : null,
        };
    }

    function byDue(a, b) { return a.due - b.due; }

    // Rate a case: schedule it, save it and update today's counts
    function rate(key, rating, now) {
        now = now || Date.now();
        var deck = deckOfKey(key);
        var before = getCard(key);
        var after = schedule(before, rating, now);
        putCard(key, after);
        updateTodayLog(deck, now, function (e) {
            if (before.state === "new") e.new++;
            else e.reviews++;
            if (rating === 1) e.again++;
        });
        var q = queue(deck, now);
        if (!q.next && !q.waitingUntil) updateTodayLog(deck, now, function (e) { e.done = true; });
        return after;
    }

    // Take back a rating (to change it): put the card back as it was
    function unrate(key, before, rating, now) {
        now = now || Date.now();
        var cards = allCards();
        if (!before || before.state === "new") delete cards[key];
        else cards[key] = before;
        save(CARDS_KEY, cards);
        updateTodayLog(deckOfKey(key), now, function (e) {
            if (!before || before.state === "new") e.new = Math.max(0, e.new - 1);
            else e.reviews = Math.max(0, e.reviews - 1);
            if (rating === 1) e.again = Math.max(0, e.again - 1);
            e.done = false;
        });
    }

    // Mark cases you already know: straight to review, spread over the next
    // week so they don't all come back on the same day
    function markKnown(keys, now) {
        now = now || Date.now();
        var cards = allCards();
        keys.forEach(function (key) {
            var card = cards[key];
            if (card && card.state !== "new") return;
            var days = 1 + Math.floor(Math.random() * 7);
            cards[key] = {
                state: "review", interval: 7, ease: CONFIG.startingEase,
                due: dueInDays(now, days), reps: 0, last: now, marked: true,
            };
        });
        save(CARDS_KEY, cards);
    }

    function resetCards(keys) {
        var cards = allCards();
        keys.forEach(function (key) { delete cards[key]; });
        save(CARDS_KEY, cards);
    }

    // Progress for a deck: how many cases are in each stage
    function progress(deck) {
        var cards = allCards();
        var out = { total: 0, new: 0, learning: 0, learned: 0, known: 0 };
        deckCases(deck).forEach(function (c) {
            var card = cards[c.key] || { state: "new" };
            out.total++;
            if (card.state === "new") out.new++;
            else if (card.state === "review") {
                out.learned++;
                if (card.interval >= CONFIG.knownInterval) out.known++;
            } else out.learning++;
        });
        return out;
    }

    // ── Suggested rating ────────────────────────────────────────────────
    // From what the trainer recorded about a solve. Returns
    // { rating, reasons: [text] }. You can always pick another rating.
    //
    // info: {
    //   solved: bool, time: seconds, recog: seconds|null,
    //   stats: SolveStats.analyze() result or null (needs recorded moves),
    //   detect: AlgDetect result or null, mainIndex, peeked: bool,
    //   wasNew: bool, goal: seconds|null
    // }
    var GRADE = {
        slowRecog: 3,      // seconds before your first turn → Hard
        fastRecog: 1,      // ≤ this and a clean solve → Easy
        longPause: 1,      // a pause this long mid-alg → Hard
        manyMistakes: 3,   // this many undone moves → Again
    };

    function suggest(info) {
        var reasons = [];
        if (!info.solved) return { rating: 1, reasons: ["Not solved"] };

        var rating = 3;
        function cap(r, why) {
            if (r < rating) rating = r;
            reasons.push(why);
        }

        var s = info.stats;
        var d = info.detect;
        if (s) {
            if (s.mistakes >= GRADE.manyMistakes) cap(1, s.mistakes + " corrections");
            else if (s.mistakes > 0) cap(2, s.mistakes === 1 ? "1 correction" : s.mistakes + " corrections");
            if (s.longestPause >= GRADE.longPause) cap(2, "Paused " + s.longestPause.toFixed(1) + "s mid-alg");
        }
        if (d && d.index < 0 && d.cleaned) {
            if (d.messy) cap(1, "Didn't look like one alg");
            else cap(2, "Used an alg that isn't in your list");
        }
        var recog = info.recog != null ? info.recog : (s ? s.firstMove : null);
        if (recog != null && recog > GRADE.slowRecog) cap(2, recog.toFixed(1) + "s to recognise");
        if (info.goal && info.time > info.goal * 2) cap(2, "Over twice your goal time");
        if (info.peeked) cap(2, "You looked at the alg");

        if (rating === 3 && !info.wasNew && s) {
            var clean = s.mistakes === 0 && s.longestPause < 0.5 &&
                recog != null && recog <= GRADE.fastRecog &&
                (!d || d.index >= 0) &&
                (!info.goal || info.time <= info.goal);
            if (clean) { rating = 4; reasons.push("Fast and clean"); }
        }
        if (!reasons.length) {
            reasons.push(s ? "Clean solve" : "No move data from a virtual or smart cube, so rate how it felt");
        }
        return { rating: rating, reasons: reasons };
    }

    window.Srs = {
        CONFIG: CONFIG,
        RATINGS: RATINGS,
        decks: DECKS,
        deckCases: deckCases,
        deckOfKey: deckOfKey,
        getCard: getCard,
        schedule: schedule,
        describeDue: describeDue,
        rate: rate,
        unrate: unrate,
        queue: queue,
        progress: progress,
        streak: streak,
        todayLog: todayLog,
        getSettings: getSettings,
        setSettings: setSettings,
        markKnown: markKnown,
        resetCards: resetCards,
        suggest: suggest,
        dayId: dayId,
    };
})(window);

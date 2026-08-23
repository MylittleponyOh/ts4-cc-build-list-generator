// ==========================================
// THE LIST — S4TI CC CREDIT LIST GENERATOR
// ==========================================

// ------------------------------------------
// LIVE DATABASE (Google Sheet via opensheet.elk.sh)
// ------------------------------------------
// The "CC LIST Database" Sheet (tab "Feuille 1") is the
// source of truth. Expected columns: InstanceID | SetName | Creator | Link

const DATABASE_URL =
    "https://opensheet.elk.sh/1GOsgK3OpenLMWzv9UxEmK7yRn2Rts6KIiFKZmF6LWvQ/Feuille%201";

let DATABASE_INDEX = {};

async function loadDatabase() {

    try {

        const response = await fetch(DATABASE_URL);
        const rows = await response.json();

        // Each Instance ID maps to an ARRAY of candidates, not a single
        // entry — this is what lets "Multiple matches" work: if two rows
        // share the same Instance ID (an override situation, where the
        // ID is shared on purpose), both are kept instead of the second
        // one silently overwriting the first.
        const index = {};

        rows.forEach((row) => {

            const id = (row.InstanceID || "").trim();

            if (!id) {
                return;
            }

            const entry = {
                creator: row.Creator || "",
                setName: row.SetName || "",
                link: row.Link || "",
                part: row.Part || ""
            };

            if (!index[id]) {
                index[id] = [];
            }

            index[id].push(entry);
        });

        DATABASE_INDEX = index;

        updateKnownCreators();

    } catch (error) {

        console.error("Could not load the database:", error);
        DATABASE_INDEX = {};
    }
}

// Known creators, pulled straight from the live database — powers the
// custom autocomplete on the submission forms. Still just a suggestion:
// typing a name that isn't listed yet is always allowed, for new
// creators. (Not a native <datalist> — its dropdown position can't be
// controlled with CSS and rendered oddly, even in Chrome, so this is a
// small custom component we fully control instead.)
let KNOWN_CREATORS = [];

function updateKnownCreators() {

    const names = new Set();

    Object.values(DATABASE_INDEX).forEach((candidates) => {
        candidates.forEach((candidate) => {
            if (candidate.creator && candidate.creator.trim()) {
                names.add(candidate.creator.trim());
            }
        });
    });

    KNOWN_CREATORS = Array.from(names).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
    );
}

const databaseLoadPromise = loadDatabase();

// ------------------------------------------
// CUSTOM CREATOR AUTOCOMPLETE
// ------------------------------------------

function setupCreatorAutocomplete(input, suggestionsBox) {

    function render(query) {

        const trimmed = query.trim().toLowerCase();

        const matches = trimmed
            ? KNOWN_CREATORS.filter((name) => name.toLowerCase().includes(trimmed))
            : KNOWN_CREATORS;

        if (matches.length === 0) {
            suggestionsBox.classList.remove("show");
            suggestionsBox.innerHTML = "";
            return;
        }

        // Capped so a huge creator list never renders hundreds of rows
        // at once — typing narrows it down fast anyway.
        suggestionsBox.innerHTML = matches
            .slice(0, 50)
            .map((name) => `<div class="autocomplete-suggestion">${escapeHTML(name)}</div>`)
            .join("");

        suggestionsBox.classList.add("show");
    }

    input.addEventListener("input", () => render(input.value));
    input.addEventListener("focus", () => render(input.value));

    suggestionsBox.addEventListener("click", (event) => {

        const item = event.target.closest(".autocomplete-suggestion");

        if (!item) {
            return;
        }

        input.value = item.textContent;
        suggestionsBox.classList.remove("show");
        suggestionsBox.innerHTML = "";
    });

    document.addEventListener("click", (event) => {

        if (event.target !== input && !suggestionsBox.contains(event.target)) {
            suggestionsBox.classList.remove("show");
        }
    });
}

setupCreatorAutocomplete(
    document.getElementById("fieldCreator"),
    document.getElementById("fieldCreatorSuggestions")
);

setupCreatorAutocomplete(
    document.getElementById("bundleCreator"),
    document.getElementById("bundleCreatorSuggestions")
);

// ------------------------------------------
// SOFT MULTI-PART DETECTION
// ------------------------------------------
// Some creators (Felixandre, Harrie, Pierisim...) release big
// collections in several parts, without ever naming which part an
// item belongs to in the file itself. This can't be detected from the
// Instance ID or filename — nothing in the data says it. This is just
// a nudge: if the typed Set Name already has multiple known "Part"
// values recorded in the verified database, we flag it and focus the
// Part field, but never block submitting without one.

function findKnownParts(setNameQuery) {

    const typed = setNameQuery.trim().toLowerCase();
    const knownParts = new Set();

    if (!typed) {
        return knownParts;
    }

    Object.values(DATABASE_INDEX).forEach((candidates) => {
        candidates.forEach((candidate) => {
            if (
                candidate.setName &&
                candidate.setName.trim().toLowerCase() === typed &&
                candidate.part &&
                candidate.part.trim()
            ) {
                knownParts.add(candidate.part.trim());
            }
        });
    });

    return knownParts;
}

function wirePartHint(setNameInput, hintBox, hintListSpan, partInput) {

    setNameInput.addEventListener("input", () => {

        const knownParts = findKnownParts(setNameInput.value);

        if (knownParts.size > 1) {

            hintListSpan.textContent = Array.from(knownParts).join(", ");
            hintBox.style.display = "block";
            partInput.focus();

        } else {

            hintBox.style.display = "none";
        }
    });
}

const fieldSetNameInput = document.getElementById("fieldSetName");
const partHint = document.getElementById("partHint");
const partHintList = document.getElementById("partHintList");
const fieldPartInput = document.getElementById("fieldPart");

wirePartHint(fieldSetNameInput, partHint, partHintList, fieldPartInput);

const bundleSetNameInput = document.getElementById("bundleSetName");
const bundlePartHint = document.getElementById("bundlePartHint");
const bundlePartHintList = document.getElementById("bundlePartHintList");
const bundlePartInput = document.getElementById("bundlePart");

wirePartHint(bundleSetNameInput, bundlePartHint, bundlePartHintList, bundlePartInput);


// ------------------------------------------
// GLOBAL CLAIMED INDEX (Form responses Sheet)
// ------------------------------------------
// Reads the "Réponses au formulaire 1" tab of the CC_List_Propositions
// Form — this tells us if ANY user (not just this browser) has already
// submitted a link for a given Instance ID, so we don't collect 50
// duplicate requests for the same popular unknown set.

const CLAIMED_URL =
    "https://opensheet.elk.sh/14jZ0bHqsi-CfscRTJptWwyu18tFbSnUsz_EyGztPOCI/R%C3%A9ponses%20au%20formulaire%201";

let CLAIMED_SET = new Set();

async function loadClaimed() {

    try {

        const response = await fetch(CLAIMED_URL);
        const rows = await response.json();

        const claimed = new Set();

        rows.forEach((row) => {

            const id = (row["Instance ID"] || "").trim();

            if (id) {
                claimed.add(id);
            }
        });

        CLAIMED_SET = claimed;

    } catch (error) {

        console.error("Could not load the claimed index:", error);
        CLAIMED_SET = new Set();
    }
}

const claimedLoadPromise = loadClaimed();


function lookupCandidates(item) {

    for (const instance of item.instances) {

        const trimmed = instance.trim();
        const candidates = DATABASE_INDEX[trimmed];

        if (candidates && candidates.length) {
            return { instance: trimmed, candidates };
        }
    }

    return null;
}

// Best-effort guess at which candidate matches, based on the creator
// name that usually appears as the first segment of the pasted filename
// (e.g. "Valia_Cozy_Cabin_Door" → "Valia"). Only ever used to PRE-SELECT
// a suggestion — the user can always change it, never auto-applied.
function guessCandidateIndex(item, candidates) {

    const rawName = item.name.replace(/\.package$/i, "");
    const guessedCreator = rawName.split("_")[0]?.trim().toLowerCase();

    if (!guessedCreator) {
        return -1;
    }

    return candidates.findIndex(
        (c) => c.creator.trim().toLowerCase() === guessedCreator
    );
}


// ------------------------------------------
// PENDING SUBMISSIONS (localStorage, per-browser for now)
// ------------------------------------------

const SUBMISSIONS_KEY = "cc_pending_submissions";

function getSubmissions() {

    try {
        return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveSubmissions(submissions) {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}

function getPendingIndex() {

    const index = {};

    getSubmissions().forEach((sub) => {

        const id = (sub.instance || "").trim();

        if (id) {
            index[id] = sub;
        }
    });

    return index;
}


// ------------------------------------------
// ELEMENTS
// ------------------------------------------

const ccInput = document.getElementById("ccInput");
const generateButton = document.getElementById("generateButton");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const result = document.getElementById("result");
const itemCount = document.getElementById("itemCount");
const characterCount = document.getElementById("characterCount");
const toast = document.getElementById("toast");

let generatedItems = [];

// Which candidate the user picked for each ambiguous "Multiple matches"
// Instance ID, e.g. { "0x...": 1 } or { "0x...": "none" }. Intentionally
// NOT persisted anywhere — starts fresh every time a list is generated,
// since re-choosing each time is safer than silently remembering a
// possibly-wrong guess across different builds.
let multipleSelections = {};

// ------------------------------------------
// TAG & FLAG (optional, per-generation only)
// ------------------------------------------
// Purely cosmetic — never touches the database. The on/off preference
// is remembered (localStorage), but the actual ticked categories are
// NOT: they reset every time a new list is generated, since categories
// like "Early Access" or "Free" can go stale fast and re-checking is
// safer than trusting an old guess.

const TAG_FLAG_KEY = "cc_tagflag_enabled";
const TAG_CATEGORIES = ["Early Access", "Free", "Permanently Paywalled", "CurseForge"];

let tagFlagEnabled = localStorage.getItem(TAG_FLAG_KEY) === "true";
let itemTags = {}; // { [key]: "Early Access" | "Free" | ... }, one flag max per key

const tagFlagToggle = document.getElementById("tagFlagToggle");
tagFlagToggle.setAttribute("aria-pressed", String(tagFlagEnabled));

tagFlagToggle.addEventListener("click", () => {

    tagFlagEnabled = !tagFlagEnabled;
    tagFlagToggle.setAttribute("aria-pressed", String(tagFlagEnabled));
    localStorage.setItem(TAG_FLAG_KEY, String(tagFlagEnabled));

    if (generatedItems.length > 0) {
        renderResults(generatedItems);
    }
});

// ------------------------------------------
// BUNDLE & LINK (unknown items only, this session only)
// ------------------------------------------
// Lets a builder select several "unknown" items and submit them
// together under one set/creator/link, instead of one at a time.
// Unlike Tag & Flag, this is NOT remembered between visits — it's a
// working mode for the current list, not a lasting preference.

let bundleModeEnabled = false;
let bundleSelection = {}; // { [instance]: itemName }

const bundleModeToggle = document.getElementById("bundleModeToggle");

bundleModeToggle.addEventListener("click", () => {

    bundleModeEnabled = !bundleModeEnabled;
    bundleModeToggle.setAttribute("aria-pressed", String(bundleModeEnabled));
    bundleSelection = {};

    if (generatedItems.length > 0) {
        renderResults(generatedItems);
    }
});

function tagFlagRowHTML(key) {

    if (!tagFlagEnabled) {
        return "";
    }

    const selected = itemTags[key];

    const chips = TAG_CATEGORIES.map((category) => `
        <label class="tag-chip">
            <input type="radio" name="tagflag-${escapeHTML(key)}" data-tagkey="${escapeHTML(key)}" value="${escapeHTML(category)}" ${selected === category ? "checked" : ""}>
            ${escapeHTML(category)}
        </label>
    `).join("");

    return `<div class="tag-flag-row">${chips}</div>`;
}


// ==========================================
// CHARACTER COUNTER
// ==========================================

function updateCharacterCount() {

    const count = ccInput.value.length;

    characterCount.textContent = `${count.toLocaleString("en-US")} characters`;

    generateButton.disabled = ccInput.value.trim().length === 0;
}

ccInput.addEventListener("input", updateCharacterCount);


// ==========================================
// NORMALIZE NAME
// ==========================================

function normalizeName(name) {

    return name
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}


// ==========================================
// CHECK HEX IDENTIFIER
// ==========================================

function isHexIdentifier(value) {

    /*
     * S4TI can display entries like:
     *
     * [0x832A3ABF0870E3BB.0x034AEECB]
     *
     * These are not CC names.
     */

    return /^0x[0-9a-f]+\.0x[0-9a-f]+$/i.test(value.trim());
}


// ==========================================
// PARSE S4TI LIST
// ==========================================

function parseS4TI(text) {

    const lines = text.split(/\r?\n/);

    const items = [];
    let currentItem = null;

    for (const rawLine of lines) {

        const line = rawLine.trim();

        if (!line) {
            continue;
        }

        if (/^Instance\s*:/i.test(line)) {

            if (currentItem) {

                const instance = line.replace(/^Instance\s*:/i, "").trim();

                if (instance) {
                    currentItem.instances.push(instance);
                }
            }

            continue;
        }

        if (line.startsWith("[") && line.endsWith("]")) {

            const name = line.slice(1, -1).trim();

            if (!name) {
                currentItem = null;
                continue;
            }

            if (isHexIdentifier(name)) {
                currentItem = null;
                continue;
            }

            currentItem = {
                name: name,
                instances: []
            };

            items.push(currentItem);

            continue;
        }

        // Other S4TI lines (Name/Creator/Homepage from the user's own
        // local S4TI annotations) aren't needed for identification here.
    }

    const uniqueItems = new Map();

    for (const item of items) {

        const key = normalizeName(item.name);

        if (!uniqueItems.has(key)) {

            uniqueItems.set(key, {
                name: item.name,
                instances: [...item.instances]
            });

        } else {

            const existing = uniqueItems.get(key);
            existing.instances.push(...item.instances);
        }
    }

    return Array.from(uniqueItems.values());
}


// ==========================================
// FORMAT NAME
// ==========================================

function formatCCName(name) {

    return name
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// A "file" (one [bracket] entry from S4TI) can carry more than one
// Instance ID — merged packages and multi-part objects are the common
// cases. This counts real instances, not just distinct file entries.
function instanceCount(items) {

    return items.reduce((sum, item) => sum + item.instances.length, 0);
}

// One representative Instance ID per distinct item — NOT every instance
// within an item. A single S4TI entry can list several "Instance:" lines
// for two very different reasons: a genuine merged package (several
// distinct objects bundled together), or just ordinary color swatches
// of the SAME object. Nothing in the text tells them apart, so treating
// every instance as its own submission floods the database with
// redundant rows for plain swatched items and risks false "multiple
// matches" from coincidental overlaps. One instance per named item is
// enough to identify it, whichever case it actually is.
function representativeInstances(items) {

    return items
        .map((item) => (item.instances[0] || "").trim())
        .filter(Boolean);
}


// ==========================================
// CLASSIFY + GROUP ITEMS
// ==========================================
// Every item falls into exactly one bucket, checked in this
// priority order:
//
// 1. pending    — the user already submitted info for this exact
//                 Instance ID (locally). We show their own submitted
//                 link right away, flagged as awaiting validation,
//                 and hide the propose button so they can't submit twice.
// 2. recognized — found in the live database, with a link.
// 3. missing    — found in the live database, but the link is empty.
// 4. unknown    — not found anywhere.
//
// Within each bucket, items sharing the same creator + set name are
// grouped into a single row.

function classifyAndGroup(items) {

    const pendingIndex = getPendingIndex();

    const buckets = {
        pending: new Map(),
        recognized: new Map(),
        missing: new Map(),
        multiple: new Map()
    };

    const claimedItems = [];
    const unknownItems = [];

    items.forEach((item) => {

        const lookup = lookupCandidates(item);
        const candidates = lookup ? lookup.candidates : [];
        const primaryInstance = lookup ? lookup.instance : (item.instances[0] || "").trim();

        // 1. An unambiguous, validated match with a link always wins —
        // this is what makes a "pending" item flip back to "recognized"
        // automatically once it's actually approved.
        if (candidates.length === 1 && candidates[0].link && candidates[0].link.trim()) {

            const match = candidates[0];
            const key = `${match.creator}::${match.setName}::${match.part || ""}`;

            if (!buckets.recognized.has(key)) {
                buckets.recognized.set(key, { ...match, items: [] });
            }

            buckets.recognized.get(key).items.push(item);
            return;
        }

        // 2. The user's own submission, whatever the database currently
        // says — this way, resolving an ambiguity via "submit a
        // different link" isn't re-prompted every single time.
        //
        // IMPORTANT: a merged package can list several Instance IDs
        // under one entry in S4TI. A pending submission might be keyed
        // to any one of them, not necessarily the first — so every
        // instance the item carries has to be checked, not just one.
        let pending = null;

        for (const rawInstance of item.instances) {

            const trimmed = rawInstance.trim();

            if (pendingIndex[trimmed]) {
                pending = pendingIndex[trimmed];
                break;
            }
        }

        if (pending) {

            const key = `${pending.creator}::${pending.setName}::${pending.part || ""}`;

            if (!buckets.pending.has(key)) {
                buckets.pending.set(key, {
                    creator: pending.creator,
                    setName: pending.setName,
                    part: pending.part || "",
                    link: pending.link,
                    items: []
                });
            }

            buckets.pending.get(key).items.push(item);
            return;
        }

        // 3. Several different candidates share this Instance ID
        // (typically an override situation) — the tool can't know
        // which one is really installed, so the person has to choose.
        if (candidates.length > 1) {

            if (!buckets.multiple.has(primaryInstance)) {
                buckets.multiple.set(primaryInstance, { instance: primaryInstance, candidates, items: [] });
            }

            buckets.multiple.get(primaryInstance).items.push(item);
            return;
        }

        // 4. Someone else already submitted a link for this exact
        // Instance ID (from the global Form responses Sheet). Same
        // multi-instance reasoning as the pending check above.
        const isClaimed = item.instances.some((rawInstance) => CLAIMED_SET.has(rawInstance.trim()));

        if (isClaimed) {
            claimedItems.push(item);
            return;
        }

        // 5. Exactly one candidate, but no link yet.
        if (candidates.length === 1) {

            const match = candidates[0];
            const key = `${match.creator}::${match.setName}::${match.part || ""}`;

            if (!buckets.missing.has(key)) {
                buckets.missing.set(key, {
                    ...match,
                    items: [],
                    firstInstance: primaryInstance
                });
            }

            buckets.missing.get(key).items.push(item);
            return;
        }

        unknownItems.push(item);
    });

    return {
        pendingGroups: Array.from(buckets.pending.values()),
        recognizedGroups: Array.from(buckets.recognized.values()),
        missingGroups: Array.from(buckets.missing.values()),
        multipleGroups: Array.from(buckets.multiple.values()),
        claimedItems,
        unknownItems
    };
}


// ==========================================
// GENERATE LIST
// ==========================================

function generateList() {

    const text = ccInput.value.trim();

    multipleSelections = {};
    itemTags = {};
    bundleSelection = {};
    bundleModeEnabled = false;
    bundleModeToggle.setAttribute("aria-pressed", "false");

    if (!text) {

        generatedItems = [];
        updateCount(0);
        copyButton.disabled = true;
        showEmptyState();
        return;
    }

    const items = parseS4TI(text);

    generatedItems = items;

    if (items.length === 0) {

        result.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">?</div>
                <h4>No CC found</h4>
                <p>No usable CC entries were found in this S4TI export.</p>
            </div>
        `;

        updateCount(0);
        copyButton.disabled = true;
        return;
    }

    renderResults(items);
    updateCount(items.length);
    copyButton.disabled = false;
}


// ==========================================
// DISPLAY RESULTS
// ==========================================

// Wraps a status category's inner HTML into a collapsible <details>
// section (closed by default, to keep the results panel scannable).
// Returns "" if there's nothing to show for this status.
function wrapStatusSection(statusClass, badgeText, count, innerHTML) {

    if (count === 0) {
        return "";
    }

    return `
        <details class="status-group">
            <summary class="status-group-summary">
                <span class="cc-status ${statusClass}">${badgeText}</span>
                <span class="status-group-count">${count}</span>
            </summary>
            <div class="status-group-body">
                ${innerHTML}
            </div>
        </details>
    `;
}

function renderResults(items) {

    const list = document.createElement("div");
    list.className = "result-list";

    const { pendingGroups, recognizedGroups, missingGroups, multipleGroups, claimedItems, unknownItems } =
        classifyAndGroup(items);

    // PENDING GROUPS (user's own submission, awaiting validation)

    const pendingHTML = pendingGroups.map((group) => {

        const itemsListHTML = group.items
            .map((it) => `<li>${escapeHTML(formatCCName(it.name))}</li>`)
            .join("");

        const safeLink = sanitizeUrl(group.link);
        const tagKey = `${group.creator}::${group.setName}::${group.part || ""}`;

        return `
            <div class="cc-item pending">
                <div class="cc-item-row">
                    <span class="cc-name">${escapeHTML(group.setName)}${group.part ? ` - ${escapeHTML(group.part)}` : ""}</span>
                    <span class="cc-status pending">⏳ pending (${group.items.length})</span>
                </div>

                <div class="cc-meta">
                    by <span class="cc-creator">${escapeHTML(group.creator)}</span>
                </div>

                ${
                    safeLink
                        ? `<a href="${escapeHTML(safeLink)}" target="_blank" rel="noopener noreferrer" class="cc-link">🔗 View the link</a>`
                        : `<span class="cc-link-invalid">⚠ Invalid link format</span>`
                }

                <span class="pending-note">Submission pending review</span>

                ${tagFlagRowHTML(tagKey)}

                <details class="cc-details">
                    <summary>View the ${instanceCount(group.items)} items</summary>
                    <ul>${itemsListHTML}</ul>
                </details>
            </div>
        `;
    }).join("");

    list.innerHTML += wrapStatusSection("pending", "⏳ pending", pendingGroups.length, pendingHTML);

    // RECOGNIZED GROUPS (in database, with a link)

    const recognizedHTML = recognizedGroups.map((group) => {

        const itemsListHTML = group.items
            .map((it) => `<li>${escapeHTML(formatCCName(it.name))}</li>`)
            .join("");

        const safeLink = sanitizeUrl(group.link);
        const tagKey = `${group.creator}::${group.setName}::${group.part || ""}`;

        return `
            <div class="cc-item recognized">
                <div class="cc-item-row">
                    <span class="cc-name">${escapeHTML(group.setName)}${group.part ? ` - ${escapeHTML(group.part)}` : ""}</span>
                    <span class="cc-status recognized">✓ recognized (${group.items.length})</span>
                </div>

                <div class="cc-meta">
                    by <span class="cc-creator">${escapeHTML(group.creator)}</span>
                </div>

                ${
                    safeLink
                        ? `<a href="${escapeHTML(safeLink)}" target="_blank" rel="noopener noreferrer" class="cc-link">🔗 View the link</a>`
                        : `<span class="cc-link-invalid">⚠ Invalid link format</span>`
                }

                ${tagFlagRowHTML(tagKey)}

                <details class="cc-details">
                    <summary>View the ${instanceCount(group.items)} items</summary>
                    <ul>${itemsListHTML}</ul>
                </details>
            </div>
        `;
    }).join("");

    list.innerHTML += wrapStatusSection("recognized", "✓ recognized", recognizedGroups.length, recognizedHTML);

    // MISSING-LINK GROUPS (in database, no link yet)

    const missingHTML = missingGroups.map((group) => {

        const itemsListHTML = group.items
            .map((it) => `<li>${escapeHTML(formatCCName(it.name))}</li>`)
            .join("");

        const tagKey = `${group.creator}::${group.setName}::${group.part || ""}`;

        return `
            <div class="cc-item missing-link">
                <div class="cc-item-row">
                    <span class="cc-name">${escapeHTML(group.setName)}${group.part ? ` - ${escapeHTML(group.part)}` : ""}</span>
                    <span class="cc-status missing">⚠ link missing (${group.items.length})</span>
                </div>

                <div class="cc-meta">
                    by <span class="cc-creator">${escapeHTML(group.creator)}</span>
                </div>

                <button
                    class="propose-button"
                    type="button"
                    data-instances="${escapeHTML(representativeInstances(group.items).join(","))}"
                    data-setname="${escapeHTML(group.setName)}"
                    data-creator="${escapeHTML(group.creator)}"
                >
                    + Submit a link
                </button>

                ${tagFlagRowHTML(tagKey)}

                <details class="cc-details">
                    <summary>View the ${instanceCount(group.items)} items</summary>
                    <ul>${itemsListHTML}</ul>
                </details>
            </div>
        `;
    }).join("");

    list.innerHTML += wrapStatusSection("missing", "⚠ link missing", missingGroups.length, missingHTML);

    // MULTIPLE MATCHES (same Instance ID, several known candidates —
    // typical of overrides. The person picks which one they actually have.)

    const multipleHTML = multipleGroups.map((group) => {

        const suggestedIndex = guessCandidateIndex(group.items[0], group.candidates);
        const currentSelection = multipleSelections[group.instance];

        const itemsListHTML = group.items
            .map((it) => `<li>${escapeHTML(formatCCName(it.name))}</li>`)
            .join("");

        const optionsHTML = group.candidates
            .map((candidate, index) => {

                const isChecked =
                    currentSelection === index ||
                    (currentSelection === undefined && suggestedIndex === index);

                return `
                    <label class="multi-option">
                        <input
                            type="radio"
                            name="multi-${escapeHTML(group.instance)}"
                            data-instance="${escapeHTML(group.instance)}"
                            value="${index}"
                            ${isChecked ? "checked" : ""}
                        >
                        <span>${escapeHTML(candidate.setName)}, <strong>${escapeHTML(candidate.creator)}</strong></span>
                        ${index === suggestedIndex ? '<span class="multi-suggested">suggested</span>' : ""}
                    </label>
                `;
            })
            .join("");

        const noneChecked = currentSelection === "none";

        let resolvedLinkHTML = "";

        if (currentSelection !== undefined && currentSelection !== "none") {

            const chosen = group.candidates[currentSelection];
            const safeLink = sanitizeUrl(chosen.link);

            resolvedLinkHTML = safeLink
                ? `<a href="${escapeHTML(safeLink)}" target="_blank" rel="noopener noreferrer" class="cc-link">🔗 View the link</a>`
                : `<span class="cc-link-invalid">⚠ Invalid link format</span>`;
        }

        const tagRowHTML = currentSelection !== undefined
            ? tagFlagRowHTML(group.instance)
            : "";

        return `
            <div class="cc-item multiple">
                <div class="cc-item-row">
                    <span class="cc-name">${escapeHTML(formatCCName(group.items[0].name))}</span>
                    <span class="cc-status multiple">🔀 multiple matches (${group.items.length})</span>
                </div>

                <div class="cc-meta">
                    This Instance ID matches more than one known set, pick the one you actually have:
                </div>

                <div class="multi-options">
                    ${optionsHTML}
                    <label class="multi-option">
                        <input
                            type="radio"
                            name="multi-${escapeHTML(group.instance)}"
                            data-instance="${escapeHTML(group.instance)}"
                            value="none"
                            ${noneChecked ? "checked" : ""}
                        >
                        <span>None of these, submit a different link</span>
                    </label>
                </div>

                ${resolvedLinkHTML}

                ${
                    noneChecked
                        ? `<button class="propose-button" type="button" data-instances="${escapeHTML(group.instance)}" data-setname="" data-creator="">+ Submit a link</button>`
                        : ""
                }

                ${tagRowHTML}

                <details class="cc-details">
                    <summary>View the ${instanceCount(group.items)} items</summary>
                    <ul>${itemsListHTML}</ul>
                </details>
            </div>
        `;
    }).join("");

    list.innerHTML += wrapStatusSection("multiple", "🔀 multiple matches", multipleGroups.length, multipleHTML);

    // CLAIMED ITEMS (already submitted by someone else, awaiting validation)

    const claimedHTML = claimedItems.map((item) => `
        <div class="cc-item claimed">
            <div class="cc-item-row">
                <span class="cc-name">${escapeHTML(formatCCName(item.name))}</span>
                <span class="cc-status claimed">🔒 claimed</span>
            </div>

            <div class="cc-meta cc-meta-unknown">
                Already reported by another user, awaiting validation
            </div>
        </div>
    `).join("");

    list.innerHTML += wrapStatusSection("claimed", "🔒 claimed", claimedItems.length, claimedHTML);

    // UNKNOWN ITEMS (not in the database at all)

    const sortedUnknown = bundleModeEnabled
        ? [...unknownItems].sort((a, b) =>
            formatCCName(a.name).localeCompare(formatCCName(b.name), undefined, { sensitivity: "base" })
        )
        : unknownItems;

    let unknownHTML = "";

    if (bundleModeEnabled && sortedUnknown.length > 0) {

        const selectedCount = Object.keys(bundleSelection).length;

        unknownHTML += `
            <div class="bundle-bar">
                <span>${selectedCount} item${selectedCount === 1 ? "" : "s"} selected</span>
                <button id="bundleLinkButton" class="bundle-link-button" type="button" ${selectedCount === 0 ? "disabled" : ""}>
                    Link selected
                </button>
            </div>
        `;
    }

    unknownHTML += sortedUnknown.map((item) => {

        const instances = representativeInstances([item]);
        const representative = instances[0] || "";
        const displayName = formatCCName(item.name);

        if (bundleModeEnabled) {

            const isChecked = !!bundleSelection[representative];

            return `
                <div class="cc-item unknown">
                    <div class="cc-item-row">
                        <label class="bundle-checkbox">
                            <input
                                type="checkbox"
                                data-bundle-instance="${escapeHTML(representative)}"
                                data-bundle-name="${escapeHTML(displayName)}"
                                ${isChecked ? "checked" : ""}
                            >
                            <span class="cc-name">${escapeHTML(displayName)}</span>
                        </label>
                        <span class="cc-status unknown">? unknown</span>
                    </div>

                    <div class="cc-meta cc-meta-unknown">Not in the database yet</div>
                </div>
            `;
        }

        return `
            <div class="cc-item unknown">
                <div class="cc-item-row">
                    <span class="cc-name">${escapeHTML(displayName)}</span>
                    <span class="cc-status unknown">? unknown</span>
                </div>

                <div class="cc-meta cc-meta-unknown">Not in the database yet</div>

                <button
                    class="propose-button"
                    type="button"
                    data-instances="${escapeHTML(instances.join(","))}"
                    data-setname=""
                    data-creator=""
                >
                    + Submit a link
                </button>
            </div>
        `;
    }).join("");

    list.innerHTML += wrapStatusSection("unknown", "? unknown", sortedUnknown.length, unknownHTML);

    result.innerHTML = "";
    result.appendChild(list);
}


// ==========================================
// EMPTY STATE
// ==========================================

function showEmptyState() {

    result.innerHTML = `
        <div class="empty-state">
            <img src="logo.png" alt="" class="empty-icon">
            <h4>Nothing here yet</h4>
            <p>Paste your export on the left and hit "<span class="nowrap">Create the list</span>".</p>
        </div>
    `;
}


// ==========================================
// UPDATE COUNT
// ==========================================

function updateCount(count) {
    itemCount.textContent = `${count} CC`;
}


// ==========================================
// CLEAR
// ==========================================

function clearAll() {

    ccInput.value = "";
    generatedItems = [];
    updateCharacterCount();
    updateCount(0);
    copyButton.disabled = true;
    showEmptyState();
}

clearButton.addEventListener("click", clearAll);


const refreshButton = document.getElementById("refreshButton");

refreshButton.addEventListener("click", async () => {

    if (generatedItems.length === 0) {
        showToast("Nothing to refresh yet, create a list first.");
        return;
    }

    refreshButton.disabled = true;
    refreshButton.textContent = "⟳ Checking...";

    await Promise.all([loadDatabase(), loadClaimed()]);
    renderResults(generatedItems);

    refreshButton.disabled = false;
    refreshButton.textContent = "⟳ Refresh";

    showToast("Database re-checked!");
});


// ==========================================
// GENERATE BUTTON
// ==========================================

generateButton.addEventListener("click", async () => {

    generateButton.disabled = true;
    generateButton.textContent = "Loading...";

    await Promise.all([databaseLoadPromise, claimedLoadPromise]);

    generateButton.disabled = ccInput.value.trim().length === 0;
    generateButton.innerHTML = 'Create the list';

    generateList();
});


// ==========================================
// COPY RESULT
// ==========================================

// ------------------------------------------
// COPY FORMAT (persisted preference)
// ------------------------------------------

const COPY_FORMAT_KEY = "cc_copy_format";
let copyFormat = localStorage.getItem(COPY_FORMAT_KEY) || "markdown";

const copyFormatRadios = document.querySelectorAll('input[name="copyFormat"]');

copyFormatRadios.forEach((radio) => {

    radio.checked = radio.value === copyFormat;

    radio.addEventListener("change", () => {
        copyFormat = radio.value;
        localStorage.setItem(COPY_FORMAT_KEY, copyFormat);
    });
});

// Builds one credit line according to the currently selected format.
// `link` should already be sanitized (or falsy if none/invalid).
function buildCreditLine(setName, creator, link, suffix = "") {

    if (!link) {

        switch (copyFormat) {
            case "name-link":
                return `${creator} **${setName}** (link needed)${suffix}`;
            case "plain":
                return `${setName} by ${creator}: link needed${suffix}`;
            case "creators-list":
                return `${setName} [link needed]${suffix}`;
            case "markdown":
            default:
                return `${setName} (${creator}), [link needed]${suffix}`;
        }
    }

    switch (copyFormat) {
        case "name-link":
            return `${creator} **[${setName}](${link})**${suffix}`;
        case "plain":
            return `${setName} by ${creator}: ${link}${suffix}`;
        case "creators-list":
            return `${setName} [download](${link})${suffix}`;
        case "markdown":
        default:
            return `${setName} (${creator}), [download here](${link})${suffix}`;
    }
}

async function copyResult() {

    if (generatedItems.length === 0) {
        return;
    }

    const { pendingGroups, recognizedGroups, missingGroups, multipleGroups, claimedItems, unknownItems } =
        classifyAndGroup(generatedItems);

    const rawLines = [];

    // Only populated (and only shown) when the "creators-list" format
    // is selected — a plain, casse-safe recap of every known creator
    // used in the build, separate from any per-platform tagging.
    const creatorsUsed = new Set();

    function trackCreator(creator) {
        if (copyFormat === "creators-list" && creator) {
            creatorsUsed.add(creator);
        }
    }

    recognizedGroups.forEach((group) => {

        const safeLink = sanitizeUrl(group.link);
        const key = `${group.creator}::${group.setName}::${group.part || ""}`;
        const displaySetName = group.part ? `${group.setName} - ${group.part}` : group.setName;

        trackCreator(group.creator);

        rawLines.push({
            text: buildCreditLine(displaySetName, group.creator, safeLink),
            category: tagFlagEnabled ? itemTags[key] : undefined
        });
    });

    pendingGroups.forEach((group) => {

        const safeLink = sanitizeUrl(group.link);
        const key = `${group.creator}::${group.setName}::${group.part || ""}`;
        const displaySetName = group.part ? `${group.setName} - ${group.part}` : group.setName;

        trackCreator(group.creator);

        rawLines.push({
            text: buildCreditLine(displaySetName, group.creator, safeLink, " (pending validation)"),
            category: tagFlagEnabled ? itemTags[key] : undefined
        });
    });

    multipleGroups.forEach((group) => {

        const suggestedIndex = guessCandidateIndex(group.items[0], group.candidates);
        const explicitSelection = multipleSelections[group.instance];
        const selection = explicitSelection !== undefined
            ? explicitSelection
            : (suggestedIndex >= 0 ? suggestedIndex : undefined);

        const label = formatCCName(group.items[0].name);

        if (selection === undefined) {
            rawLines.push({ text: `${label}, [choose a match in the tool before copying]`, category: undefined });
            return;
        }

        if (selection === "none") {
            rawLines.push({ text: `${label}, [link needed]`, category: undefined });
            return;
        }

        const chosen = group.candidates[selection];
        const safeLink = sanitizeUrl(chosen.link);

        trackCreator(chosen.creator);

        rawLines.push({
            text: buildCreditLine(chosen.setName, chosen.creator, safeLink),
            category: tagFlagEnabled ? itemTags[group.instance] : undefined
        });
    });

    missingGroups.forEach((group) => {

        const key = `${group.creator}::${group.setName}::${group.part || ""}`;
        const displaySetName = group.part ? `${group.setName} - ${group.part}` : group.setName;

        trackCreator(group.creator);

        rawLines.push({
            text: buildCreditLine(displaySetName, group.creator, ""),
            category: tagFlagEnabled ? itemTags[key] : undefined
        });
    });

    claimedItems.forEach((item) => {
        rawLines.push({
            text: `${formatCCName(item.name)}, [already reported, awaiting validation]`,
            category: undefined
        });
    });

    unknownItems.forEach((item) => {
        rawLines.push({ text: `${formatCCName(item.name)}, [link needed]`, category: undefined });
    });

    let text;

    if (tagFlagEnabled) {

        // Group by category, plain text headers (no emoji). Anything
        // without a flag is appended at the end with no header at all —
        // not even a placeholder like "(no flag)".
        const grouped = {};
        TAG_CATEGORIES.forEach((cat) => { grouped[cat] = []; });
        const untagged = [];

        rawLines.forEach(({ text: line, category }) => {

            if (category && grouped[category]) {
                grouped[category].push(line);
            } else {
                untagged.push(line);
            }
        });

        const sections = [];

        TAG_CATEGORIES.forEach((cat) => {
            if (grouped[cat].length > 0) {
                sections.push(`${cat}\n${grouped[cat].join("\n")}`);
            }
        });

        if (untagged.length > 0) {
            sections.push(untagged.join("\n"));
        }

        text = sections.join("\n\n");

    } else {

        text = rawLines.map((l) => l.text).join("\n");
    }

    if (copyFormat === "creators-list" && creatorsUsed.size > 0) {

        const names = Array.from(creatorsUsed).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base" })
        );

        text += `\n\nCreators\n${names.join(", ")}`;
    }

    let copySucceeded = false;

    try {
        await navigator.clipboard.writeText(text);
        copySucceeded = true;
    } catch (error) {
        console.error("Clipboard API failed:", error);
    }

    if (!copySucceeded) {

        try {

            const temporaryTextarea = document.createElement("textarea");
            temporaryTextarea.value = text;
            document.body.appendChild(temporaryTextarea);
            temporaryTextarea.select();
            document.execCommand("copy");
            temporaryTextarea.remove();

        } catch (fallbackError) {
            console.error("Fallback copy also failed:", fallbackError);
        }
    }

    // Always shown, exactly once — regardless of which method above
    // actually succeeded. Previously this lived inside each branch, so
    // a failure in the fallback itself (document.execCommand can also
    // throw in some focus-related edge cases) would silently kill the
    // function before ever reaching it.
    showToast("List copied!");
}

copyButton.addEventListener("click", copyResult);


// ==========================================
// SUBMISSION MODAL (single item / missing link)
// ==========================================
// The dialog only sends the person's data. Behind the scenes it
// also posts to the "CC_List_Propositions" Google Form (its own,
// separate response Sheet — never the live database), and keeps
// a local copy so the tool can show "pending" state immediately
// on this browser while waiting on real validation.

const GOOGLE_FORM_ACTION_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSdqWNunZ8ghcE3SNIvI5jvryRLfDvzF_UgVLYNkUcrcyAwPrQ/formResponse";

const GOOGLE_FORM_ENTRIES = {
    itemName: "entry.189940358",
    instance: "entry.2096533801",
    setName: "entry.261787736",
    part: "entry.1436122946",
    creator: "entry.762747753",
    link: "entry.1012285333",
    source: "entry.1815124886"
};

const submitModal = document.getElementById("submitModal");
const modalItemName = document.getElementById("modalItemName");
const closeModalButton = document.getElementById("closeModal");
const submitForm = document.getElementById("submitForm");

const adminPanel = document.getElementById("adminPanel");
const adminToggle = document.getElementById("adminToggle");
const closeAdminButton = document.getElementById("closeAdmin");
const adminList = document.getElementById("adminList");
const clearAllButton = document.getElementById("clearAllSubmissions");

let currentProposedItemName = "";
let currentProposedInstances = [];
let currentProposedNames = {}; // { [instance]: real item name for THIS row }
let currentProposedSource = ""; // moderation tag, e.g. "Sent through Bundle & Link"

function openSubmitModal(itemName, instancesCsv, setNameGuess, creatorGuess, namesByInstance, source) {

    currentProposedItemName = itemName;
    currentProposedInstances = (instancesCsv || "")
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

    // Same anti-abuse logic as AYACC (Are You A CC Creator): tagging
    // WHERE a submission came from lets moderation catch mismatched
    // items slipped into the same bundle under one link. Regular
    // single-item submissions leave this blank on purpose.
    currentProposedSource = source || "";

    // For a single item/group, every instance shares the same name
    // (the group's set name, or the item's own name) — that's already
    // correct. For a Bundle & Link submission, each instance is a
    // genuinely different object, so namesByInstance carries each
    // one's real name instead of falling back to the (possibly
    // truncated) modal summary text.
    currentProposedNames = {};

    currentProposedInstances.forEach((instance) => {
        currentProposedNames[instance] =
            (namesByInstance && namesByInstance[instance]) || itemName;
    });

    modalItemName.textContent = `For item: ${itemName}`;

    submitForm.reset();

    document.getElementById("fieldSetName").value = setNameGuess || "";
    document.getElementById("fieldCreator").value = creatorGuess || "";

    partHint.style.display = "none";

    if (setNameGuess) {
        fieldSetNameInput.dispatchEvent(new Event("input"));
    }

    submitModal.classList.add("show");
}

function closeSubmitModal() {
    submitModal.classList.remove("show");
}

closeModalButton.addEventListener("click", closeSubmitModal);

result.addEventListener("change", (event) => {

    if (event.target.matches('input[type="checkbox"][data-bundle-instance]')) {

        const instance = event.target.dataset.bundleInstance;
        const name = event.target.dataset.bundleName;

        if (event.target.checked) {
            bundleSelection[instance] = name;
        } else {
            delete bundleSelection[instance];
        }

        const count = Object.keys(bundleSelection).length;
        const bar = document.querySelector(".bundle-bar");

        if (bar) {

            bar.querySelector("span").textContent = `${count} item${count === 1 ? "" : "s"} selected`;

            const linkBtn = document.getElementById("bundleLinkButton");

            if (linkBtn) {
                linkBtn.disabled = count === 0;
            }
        }

        return;
    }

    if (event.target.matches('input[type="radio"][data-instance]')) {

        const instance = event.target.dataset.instance;
        const value = event.target.value;

        multipleSelections[instance] = value === "none" ? "none" : Number(value);

        renderResults(generatedItems);
        return;
    }

    if (event.target.matches('input[type="radio"][data-tagkey]')) {

        const key = event.target.dataset.tagkey;
        itemTags[key] = event.target.value;
    }
});

// Clicking an already-selected tag chip clears it — lets someone change
// their mind back to "no flag" without needing to pick a different one.
result.addEventListener("click", (event) => {

    const input = event.target.closest('input[type="radio"][data-tagkey]');

    if (!input) {
        return;
    }

    const key = input.dataset.tagkey;

    if (itemTags[key] === input.value) {

        delete itemTags[key];
        input.checked = false;
    }
});

result.addEventListener("click", (event) => {

    if (event.target.id === "bundleLinkButton") {

        const instances = Object.keys(bundleSelection);
        const names = Object.values(bundleSelection);

        if (instances.length === 0) {
            return;
        }

        const summary = names.length <= 3
            ? names.join(", ")
            : `${names.slice(0, 3).join(", ")}, +${names.length - 3} more`;

        openSubmitModal(
            `${instances.length} items, ${summary}`,
            instances.join(","),
            "",
            "",
            bundleSelection,
            "Sent through Bundle & Link"
        );

        return;
    }

    if (event.target.classList.contains("propose-button")) {

        const button = event.target;
        const item = button.closest(".cc-item");

        const name = item
            ? item.querySelector(".cc-name").textContent.trim()
            : "this item";

        openSubmitModal(
            name,
            button.dataset.instances,
            button.dataset.setname,
            button.dataset.creator
        );
    }
});


// A cell starting with =, +, -, or @ can be interpreted as a formula by
// Google Sheets and execute automatically just from being displayed —
// no click needed. Formatting the destination columns as "Plain text"
// already guards against this, but that setting can drift or get reset,
// so this is a second, independent layer: prefixing with a leading
// apostrophe forces Sheets to always treat the value as literal text,
// regardless of how the column happens to be formatted.
function neutralizeFormula(value) {

    const str = (value || "").toString();

    if (/^[=+\-@]/.test(str)) {
        return `'${str}`;
    }

    return str;
}

async function submitToGoogleForm(entryValues) {

    const body = new URLSearchParams();

    body.append(GOOGLE_FORM_ENTRIES.itemName, neutralizeFormula(entryValues.itemName));
    body.append(GOOGLE_FORM_ENTRIES.instance, neutralizeFormula(entryValues.instance));
    body.append(GOOGLE_FORM_ENTRIES.setName, neutralizeFormula(entryValues.setName));
    body.append(GOOGLE_FORM_ENTRIES.part, neutralizeFormula(entryValues.part));
    body.append(GOOGLE_FORM_ENTRIES.creator, neutralizeFormula(entryValues.creator));
    body.append(GOOGLE_FORM_ENTRIES.link, neutralizeFormula(entryValues.link));
    body.append(GOOGLE_FORM_ENTRIES.source, neutralizeFormula(entryValues.source));

    try {

        // "no-cors" is required to post to Google Forms from another
        // domain without the browser blocking it. The response is
        // opaque, so we treat "fetch didn't throw" as success.
        await fetch(GOOGLE_FORM_ACTION_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString()
        });

        return true;

    } catch (error) {

        console.error("Failed to submit to the Google Form:", error);
        return false;
    }
}

submitForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const submitBtn = submitForm.querySelector(".modal-submit");
    submitBtn.disabled = true;

    const setName = document.getElementById("fieldSetName").value.trim();
    const part = document.getElementById("fieldPart").value.trim();
    const creator = document.getElementById("fieldCreator").value.trim();
    const link = document.getElementById("fieldLink").value.trim();

    // A merged package can carry several Instance IDs under one entry.
    // Submitting registers ALL of them, sharing the same set/creator/
    // link — otherwise only the first instance would ever become
    // recognized, leaving the rest of the merged file stuck as
    // "unknown" forever even after this exact submission is approved.
    const instances = currentProposedInstances.length > 0
        ? currentProposedInstances
        : [""];

    const submissions = getSubmissions();

    for (let i = 0; i < instances.length; i++) {

        if (instances.length > 1) {
            submitBtn.textContent = `Sending ${i + 1} / ${instances.length}...`;
        } else {
            submitBtn.textContent = "Sending...";
        }

        const submission = {
            itemName: currentProposedNames[instances[i]] || currentProposedItemName,
            instance: instances[i],
            setName: setName,
            part: part,
            creator: creator,
            link: link,
            source: currentProposedSource,
            submittedAt: new Date().toISOString()
        };

        await submitToGoogleForm(submission);
        submissions.push(submission);
    }

    saveSubmissions(submissions);

    closeSubmitModal();

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit suggestion";

    showToast("Suggestion sent! You just made the next list easier for YOU & everyone else!");

    // Clear the bundle checkboxes for the next batch, but leave Link &
    // Bundle mode itself on — the builder likely has more sets to link.
    bundleSelection = {};

    // Re-render immediately so the item now shows as "pending"
    // instead of the propose button, without needing a new paste.
    if (generatedItems.length > 0) {
        renderResults(generatedItems);
    }
});


// ==========================================
// TOOLBOX (help icon, bottom-right)
// ==========================================

const toolboxToggle = document.getElementById("toolboxToggle");
const toolboxModal = document.getElementById("toolboxModal");
const closeToolboxButton = document.getElementById("closeToolbox");

function openToolboxModal() {
    toolboxModal.classList.add("show");
}

function closeToolboxModal() {
    toolboxModal.classList.remove("show");
}

toolboxToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toolboxModal.classList.contains("show") ? closeToolboxModal() : openToolboxModal();
});

closeToolboxButton.addEventListener("click", closeToolboxModal);

document.addEventListener("click", (event) => {

    const isOutside =
        toolboxModal.classList.contains("show") &&
        !toolboxModal.contains(event.target) &&
        event.target !== toolboxToggle;

    if (isOutside) {
        closeToolboxModal();
    }
});


// ==========================================
// SETTINGS (preferences icon, top-right)
// ==========================================

const settingsToggle = document.getElementById("settingsToggle");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsButton = document.getElementById("closeSettings");

function openSettingsPanel() {
    settingsPanel.classList.add("show");
}

function closeSettingsPanel() {
    settingsPanel.classList.remove("show");
}

settingsToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    settingsPanel.classList.contains("show") ? closeSettingsPanel() : openSettingsPanel();
});

closeSettingsButton.addEventListener("click", closeSettingsPanel);

document.addEventListener("click", (event) => {

    const isOutside =
        settingsPanel.classList.contains("show") &&
        !settingsPanel.contains(event.target) &&
        event.target !== settingsToggle;

    if (isOutside) {
        closeSettingsPanel();
    }
});


// ==========================================
// BUNDLE SUBMISSION (whole set at once, for creators)
// ==========================================

const bundleModal = document.getElementById("bundleModal");
const bundleToggle = document.getElementById("bundleToggle");
const closeBundleButton = document.getElementById("closeBundle");
const bundleForm = document.getElementById("bundleForm");

function openBundleModal() {
    closeToolboxModal();
    bundleForm.reset();
    document.getElementById("bundleProgress").classList.remove("show");
    document.getElementById("bundleProgressFill").style.width = "0%";
    bundlePartHint.style.display = "none";
    bundleModal.classList.add("show");
}

function closeBundleModal() {
    bundleModal.classList.remove("show");
}

bundleToggle.addEventListener("click", openBundleModal);
closeBundleButton.addEventListener("click", closeBundleModal);

bundleForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const submitBtn = bundleForm.querySelector(".modal-submit");

    const exportText = document.getElementById("bundleExport").value.trim();
    const setName = document.getElementById("bundleSetName").value.trim();
    const part = document.getElementById("bundlePart").value.trim();
    const creator = document.getElementById("bundleCreator").value.trim();
    const link = document.getElementById("bundleLink").value.trim();

    const items = parseS4TI(exportText);

    // Make sure we're checking against fresh data, not whatever was
    // loaded when the page first opened.
    await Promise.all([loadDatabase(), loadClaimed()]);

    const submissionsToSend = [];
    let skippedCount = 0;

    items.forEach((item) => {

        const allTrimmedInstances = item.instances
            .map((i) => i.trim())
            .filter(Boolean);

        if (allTrimmedInstances.length === 0) {
            return;
        }

        // Already fully recognized (has a working link), or already
        // claimed by someone else's submission — nothing useful to add
        // by re-submitting it. IMPORTANT: check EVERY instance the item
        // carries, not just the first one — a swatched item might have
        // its instances listed in any order, and only one of them may
        // already be registered in the database. If ANY instance is
        // already covered, treat the whole item as known (this is what
        // makes "same item, different color" not get half-skipped).
        const alreadyCovered = allTrimmedInstances.some((instance) => {

            const existing = DATABASE_INDEX[instance];
            const hasLink = existing && existing.some((c) => c.link && c.link.trim());

            return hasLink || CLAIMED_SET.has(instance);
        });

        if (alreadyCovered) {
            skippedCount += 1;
            return;
        }

        const instance = representativeInstances([item])[0];

        if (!instance) {
            return;
        }

        submissionsToSend.push({
            itemName: formatCCName(item.name),
            instance
        });
    });

    if (submissionsToSend.length === 0) {

        showToast(
            skippedCount > 0
                ? "Everything in this export is already known or claimed. Nothing to submit."
                : "No Instance ID found in that export."
        );

        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = `Sending 0 / ${submissionsToSend.length}...`;

    const progressBar = document.getElementById("bundleProgress");
    const progressFill = document.getElementById("bundleProgressFill");

    progressBar.classList.add("show");
    progressFill.style.width = "0%";

    const submissions = getSubmissions();

    let sent = 0;

    for (const entry of submissionsToSend) {

        const submission = {
            itemName: entry.itemName,
            instance: entry.instance,
            setName: setName,
            part: part,
            creator: creator,
            link: link,
            source: "Sent through AYACC",
            submittedAt: new Date().toISOString()
        };

        await submitToGoogleForm(submission);
        submissions.push(submission);

        sent += 1;
        const percent = Math.round((sent / submissionsToSend.length) * 100);

        progressFill.style.width = `${percent}%`;
        submitBtn.textContent = `Sending ${sent} / ${submissionsToSend.length}...`;
    }

    saveSubmissions(submissions);

    closeBundleModal();

    progressBar.classList.remove("show");
    progressFill.style.width = "0%";

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit the whole set";

    showToast(
        skippedCount > 0
            ? `Submitted ${submissionsToSend.length} items (${skippedCount} already known, skipped)`
            : `Submitted ${submissionsToSend.length} items for review`
    );

    if (generatedItems.length > 0) {
        renderResults(generatedItems);
    }
});


// ==========================================
// ADMIN PANEL (local test only)
// ==========================================

function renderAdminList() {

    const submissions = getSubmissions();

    if (submissions.length === 0) {

        adminList.innerHTML = `
            <p class="admin-empty">No submissions recorded yet.</p>
        `;

        return;
    }

    adminList.innerHTML = submissions
        .map((sub, index) => {

            const safeLink = sanitizeUrl(sub.link);

            return `
            <div class="admin-entry">
                <div class="admin-entry-header">
                    <strong>${escapeHTML(sub.itemName)}</strong>
                    <button class="admin-delete" data-index="${index}" type="button">✕</button>
                </div>
                <div class="admin-entry-body">
                    Set: ${escapeHTML(sub.setName)} · Creator: ${escapeHTML(sub.creator)}<br>
                    Link: ${
                        safeLink
                            ? `<a href="${escapeHTML(safeLink)}" target="_blank" rel="noopener noreferrer">${escapeHTML(safeLink)}</a>`
                            : `<span class="cc-link-invalid">⚠ Invalid link format</span>`
                    }
                    ${sub.source ? `<br>Source: ${escapeHTML(sub.source)}` : ""}
                </div>
                <button class="admin-copy" data-index="${index}" type="button">
                    ⧉ Copy as JSON
                </button>
            </div>
        `;
        })
        .join("");
}

function openAdminPanel() {
    closeToolboxModal();
    renderAdminList();
    adminPanel.classList.add("show");
}

function closeAdminPanel() {
    adminPanel.classList.remove("show");
}

adminToggle.addEventListener("click", openAdminPanel);
closeAdminButton.addEventListener("click", closeAdminPanel);

adminPanel.addEventListener("click", (event) => {
    if (event.target === adminPanel) {
        closeAdminPanel();
    }
});

adminList.addEventListener("click", async (event) => {

    const index = event.target.dataset.index;

    if (index === undefined) {
        return;
    }

    const submissions = getSubmissions();

    if (event.target.classList.contains("admin-delete")) {
        submissions.splice(index, 1);
        saveSubmissions(submissions);
        renderAdminList();
    }

    if (event.target.classList.contains("admin-copy")) {

        const entry = submissions[index];

        try {
            await navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
            showToast("Copied as JSON!");
        } catch (error) {
            // clipboard unavailable, silently ignore
        }
    }
});

clearAllButton.addEventListener("click", () => {

    const submissions = getSubmissions();

    if (submissions.length === 0) {
        return;
    }

    const confirmed = window.confirm(
        `Clear all ${submissions.length} local submissions? This can't be undone.`
    );

    if (!confirmed) {
        return;
    }

    saveSubmissions([]);
    renderAdminList();

    if (generatedItems.length > 0) {
        renderResults(generatedItems);
    }

    showToast("All local submissions cleared.");
});


// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(value) {

    return (value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Only http:// and https:// are allowed as clickable links. This blocks
// javascript:, data:, vbscript: and similar schemes that would otherwise
// execute code when someone clicks "View the link" — escapeHTML() alone
// does NOT catch this, since these payloads don't need any HTML special
// characters to work.
function sanitizeUrl(url) {

    const trimmed = (url || "").trim();

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    return "";
}


// ==========================================
// INITIALIZATION
// ==========================================

updateCharacterCount();

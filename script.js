// ==========================================
// THE LIST — S4TI CC CREDIT LIST GENERATOR
// ==========================================

// ------------------------------------------
// LIVE DATABASE (Google Sheet via opensheet.elk.sh)
// ------------------------------------------
// The "CC LIST Database" Sheet (tab "Feuille 1") is the
// source of truth. Expected columns: InstanceID | SetName | Creator | Link

const DATABASE_URL =
    "https://opensheet.elk.sh/1nTZL5uIfGKlp3ZUzgA3ApBmJuiVS45LVCHuGLVHw4X8/Feuille%201";

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
                link: row.Link || ""
            };

            if (!index[id]) {
                index[id] = [];
            }

            index[id].push(entry);
        });

        DATABASE_INDEX = index;

    } catch (error) {

        console.error("Could not load the database:", error);
        DATABASE_INDEX = {};
    }
}

const databaseLoadPromise = loadDatabase();


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
        const instance = lookup ? lookup.instance : (item.instances[0] || "").trim();
        const candidates = lookup ? lookup.candidates : [];

        // 1. An unambiguous, validated match with a link always wins —
        // this is what makes a "pending" item flip back to "recognized"
        // automatically once it's actually approved.
        if (candidates.length === 1 && candidates[0].link && candidates[0].link.trim()) {

            const match = candidates[0];
            const key = `${match.creator}::${match.setName}`;

            if (!buckets.recognized.has(key)) {
                buckets.recognized.set(key, { ...match, items: [] });
            }

            buckets.recognized.get(key).items.push(item);
            return;
        }

        // 2. The user's own submission, whatever the database currently
        // says — this way, resolving an ambiguity via "submit a
        // different link" isn't re-prompted every single time.
        const pending = pendingIndex[instance];

        if (pending) {

            const key = `${pending.creator}::${pending.setName}`;

            if (!buckets.pending.has(key)) {
                buckets.pending.set(key, {
                    creator: pending.creator,
                    setName: pending.setName,
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

            if (!buckets.multiple.has(instance)) {
                buckets.multiple.set(instance, { instance, candidates, items: [] });
            }

            buckets.multiple.get(instance).items.push(item);
            return;
        }

        // 4. Someone else already submitted a link for this exact
        // Instance ID (from the global Form responses Sheet).
        if (CLAIMED_SET.has(instance)) {
            claimedItems.push(item);
            return;
        }

        // 5. Exactly one candidate, but no link yet.
        if (candidates.length === 1) {

            const match = candidates[0];
            const key = `${match.creator}::${match.setName}`;

            if (!buckets.missing.has(key)) {
                buckets.missing.set(key, {
                    ...match,
                    items: [],
                    firstInstance: instance
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

function renderResults(items) {

    const list = document.createElement("div");
    list.className = "result-list";

    const { pendingGroups, recognizedGroups, missingGroups, multipleGroups, claimedItems, unknownItems } =
        classifyAndGroup(items);

    // PENDING GROUPS (user's own submission, awaiting validation)

    pendingGroups.forEach((group) => {

        const element = document.createElement("div");
        element.className = "cc-item pending";

        const itemsListHTML = group.items
            .map((it) => `<li>${escapeHTML(formatCCName(it.name))}</li>`)
            .join("");

        const safeLink = sanitizeUrl(group.link);
        const tagKey = `${group.creator}::${group.setName}`;

        element.innerHTML = `
            <div class="cc-item-row">
                <span class="cc-name">${escapeHTML(group.setName)}</span>
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
                <summary>View the ${group.items.length} items</summary>
                <ul>${itemsListHTML}</ul>
            </details>
        `;

        list.appendChild(element);
    });

    // RECOGNIZED GROUPS (in database, with a link)

    recognizedGroups.forEach((group) => {

        const element = document.createElement("div");
        element.className = "cc-item recognized";

        const itemsListHTML = group.items
            .map((it) => `<li>${escapeHTML(formatCCName(it.name))}</li>`)
            .join("");

        const safeLink = sanitizeUrl(group.link);
        const tagKey = `${group.creator}::${group.setName}`;

        element.innerHTML = `
            <div class="cc-item-row">
                <span class="cc-name">${escapeHTML(group.setName)}</span>
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
                <summary>View the ${group.items.length} items</summary>
                <ul>${itemsListHTML}</ul>
            </details>
        `;

        list.appendChild(element);
    });

    // MISSING-LINK GROUPS (in database, no link yet)

    missingGroups.forEach((group) => {

        const element = document.createElement("div");
        element.className = "cc-item missing-link";

        const itemsListHTML = group.items
            .map((it) => `<li>${escapeHTML(formatCCName(it.name))}</li>`)
            .join("");

        const tagKey = `${group.creator}::${group.setName}`;

        element.innerHTML = `
            <div class="cc-item-row">
                <span class="cc-name">${escapeHTML(group.setName)}</span>
                <span class="cc-status missing">⚠ link missing (${group.items.length})</span>
            </div>

            <div class="cc-meta">
                by <span class="cc-creator">${escapeHTML(group.creator)}</span>
            </div>

            <button
                class="propose-button"
                type="button"
                data-instance="${escapeHTML(group.firstInstance)}"
                data-setname="${escapeHTML(group.setName)}"
                data-creator="${escapeHTML(group.creator)}"
            >
                + Submit a link
            </button>

            ${tagFlagRowHTML(tagKey)}

            <details class="cc-details">
                <summary>View the ${group.items.length} items</summary>
                <ul>${itemsListHTML}</ul>
            </details>
        `;

        list.appendChild(element);
    });

    // MULTIPLE MATCHES (same Instance ID, several known candidates —
    // typical of overrides. The person picks which one they actually have.)

    multipleGroups.forEach((group) => {

        const element = document.createElement("div");
        element.className = "cc-item multiple";

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

        element.innerHTML = `
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
                    ? `<button class="propose-button" type="button" data-instance="${escapeHTML(group.instance)}" data-setname="" data-creator="">+ Submit a link</button>`
                    : ""
            }

            ${tagRowHTML}

            <details class="cc-details">
                <summary>View the ${group.items.length} items</summary>
                <ul>${itemsListHTML}</ul>
            </details>
        `;

        list.appendChild(element);
    });

    // CLAIMED ITEMS (already submitted by someone else, awaiting validation)

    claimedItems.forEach((item) => {

        const element = document.createElement("div");
        element.className = "cc-item claimed";

        element.innerHTML = `
            <div class="cc-item-row">
                <span class="cc-name">${escapeHTML(formatCCName(item.name))}</span>
                <span class="cc-status claimed">🔒 claimed</span>
            </div>

            <div class="cc-meta cc-meta-unknown">
                Already reported by another user, awaiting validation
            </div>
        `;

        list.appendChild(element);
    });

    // UNKNOWN ITEMS (not in the database at all)

    unknownItems.forEach((item) => {

        const element = document.createElement("div");
        element.className = "cc-item unknown";

        const firstInstance = item.instances[0] || "";

        element.innerHTML = `
            <div class="cc-item-row">
                <span class="cc-name">${escapeHTML(formatCCName(item.name))}</span>
                <span class="cc-status unknown">? unknown</span>
            </div>

            <div class="cc-meta cc-meta-unknown">Not in the database yet</div>

            <button
                class="propose-button"
                type="button"
                data-instance="${escapeHTML(firstInstance)}"
                data-setname=""
                data-creator=""
            >
                + Submit a link
            </button>
        `;

        list.appendChild(element);
    });

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
            <p>Paste your export on the left and hit "Create the list".</p>
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

async function copyResult() {

    if (generatedItems.length === 0) {
        return;
    }

    const { pendingGroups, recognizedGroups, missingGroups, multipleGroups, claimedItems, unknownItems } =
        classifyAndGroup(generatedItems);

    const rawLines = [];

    recognizedGroups.forEach((group) => {

        const safeLink = sanitizeUrl(group.link);
        const key = `${group.creator}::${group.setName}`;

        const text = safeLink
            ? `${group.setName} (${group.creator}), [download here](${safeLink})`
            : `${group.setName} (${group.creator}), [link needed]`;

        rawLines.push({ text, category: tagFlagEnabled ? itemTags[key] : undefined });
    });

    pendingGroups.forEach((group) => {

        const safeLink = sanitizeUrl(group.link);
        const key = `${group.creator}::${group.setName}`;

        const text = safeLink
            ? `${group.setName} (${group.creator}), [download here](${safeLink}) (pending validation)`
            : `${group.setName} (${group.creator}), [link needed] (pending validation)`;

        rawLines.push({ text, category: tagFlagEnabled ? itemTags[key] : undefined });
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

        const text = safeLink
            ? `${chosen.setName} (${chosen.creator}), [download here](${safeLink})`
            : `${chosen.setName} (${chosen.creator}), [link needed]`;

        rawLines.push({ text, category: tagFlagEnabled ? itemTags[group.instance] : undefined });
    });

    missingGroups.forEach((group) => {

        const key = `${group.creator}::${group.setName}`;

        rawLines.push({
            text: `${group.setName} (${group.creator}), [link needed]`,
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

    try {

        await navigator.clipboard.writeText(text);
        showToast("List copied!");

    } catch (error) {

        const temporaryTextarea = document.createElement("textarea");
        temporaryTextarea.value = text;
        document.body.appendChild(temporaryTextarea);
        temporaryTextarea.select();
        document.execCommand("copy");
        temporaryTextarea.remove();
        showToast("List copied!");
    }
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
    creator: "entry.762747753",
    link: "entry.1012285333"
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
let currentProposedInstance = "";

function openSubmitModal(itemName, instanceId, setNameGuess, creatorGuess) {

    currentProposedItemName = itemName;
    currentProposedInstance = instanceId || "";

    modalItemName.textContent = `For item: ${itemName}`;

    submitForm.reset();

    document.getElementById("fieldSetName").value = setNameGuess || "";
    document.getElementById("fieldCreator").value = creatorGuess || "";

    submitModal.classList.add("show");
}

function closeSubmitModal() {
    submitModal.classList.remove("show");
}

closeModalButton.addEventListener("click", closeSubmitModal);

submitModal.addEventListener("click", (event) => {
    if (event.target === submitModal) {
        closeSubmitModal();
    }
});

result.addEventListener("change", (event) => {

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

    if (event.target.classList.contains("propose-button")) {

        const button = event.target;
        const item = button.closest(".cc-item");

        const name = item
            ? item.querySelector(".cc-name").textContent.trim()
            : "this item";

        openSubmitModal(
            name,
            button.dataset.instance,
            button.dataset.setname,
            button.dataset.creator
        );
    }
});


async function submitToGoogleForm(entryValues) {

    const body = new URLSearchParams();

    body.append(GOOGLE_FORM_ENTRIES.itemName, entryValues.itemName || "");
    body.append(GOOGLE_FORM_ENTRIES.instance, entryValues.instance || "");
    body.append(GOOGLE_FORM_ENTRIES.setName, entryValues.setName || "");
    body.append(GOOGLE_FORM_ENTRIES.creator, entryValues.creator || "");
    body.append(GOOGLE_FORM_ENTRIES.link, entryValues.link || "");

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
    submitBtn.textContent = "Sending...";

    const submission = {
        itemName: currentProposedItemName,
        instance: currentProposedInstance,
        setName: document.getElementById("fieldSetName").value.trim(),
        creator: document.getElementById("fieldCreator").value.trim(),
        link: document.getElementById("fieldLink").value.trim(),
        submittedAt: new Date().toISOString()
    };

    await submitToGoogleForm(submission);

    const submissions = getSubmissions();
    submissions.push(submission);
    saveSubmissions(submissions);

    closeSubmitModal();

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit suggestion";

    showToast("Suggestion sent, thank you! 🦄");

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
    bundleModal.classList.add("show");
}

function closeBundleModal() {
    bundleModal.classList.remove("show");
}

bundleToggle.addEventListener("click", openBundleModal);
closeBundleButton.addEventListener("click", closeBundleModal);

bundleModal.addEventListener("click", (event) => {
    if (event.target === bundleModal) {
        closeBundleModal();
    }
});

bundleForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const submitBtn = bundleForm.querySelector(".modal-submit");

    const exportText = document.getElementById("bundleExport").value.trim();
    const setName = document.getElementById("bundleSetName").value.trim();
    const creator = document.getElementById("bundleCreator").value.trim();
    const link = document.getElementById("bundleLink").value.trim();

    const items = parseS4TI(exportText);

    const submissionsToSend = [];

    items.forEach((item) => {
        item.instances.forEach((instance) => {
            if (instance.trim()) {
                submissionsToSend.push({
                    itemName: formatCCName(item.name),
                    instance: instance.trim()
                });
            }
        });
    });

    if (submissionsToSend.length === 0) {
        showToast("No Instance ID found in that export.");
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
            creator: creator,
            link: link,
            note: "Submitted as a whole set",
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

    showToast(`Submitted ${submissionsToSend.length} items for review 🦄`);

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
                    ${sub.note ? `<br>Note: ${escapeHTML(sub.note)}` : ""}
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

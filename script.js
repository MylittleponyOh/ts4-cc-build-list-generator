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

        const index = {};

        rows.forEach((row) => {

            const id = (row.InstanceID || "").trim();

            if (!id) {
                return;
            }

            index[id] = {
                creator: row.Creator || "",
                setName: row.SetName || "",
                link: row.Link || ""
            };
        });

        DATABASE_INDEX = index;

    } catch (error) {

        console.error("Could not load the database:", error);
        DATABASE_INDEX = {};
    }
}

const databaseLoadPromise = loadDatabase();


function lookupItem(item) {

    for (const instance of item.instances) {

        const match = DATABASE_INDEX[instance.trim()];

        if (match) {
            return match;
        }
    }

    return null;
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


// ==========================================
// CHARACTER COUNTER
// ==========================================

function updateCharacterCount() {

    const count = ccInput.value.length;

    characterCount.textContent = `${count.toLocaleString("en-US")} characters`;
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
        missing: new Map()
    };

    const unknownItems = [];

    items.forEach((item) => {

        const instance = (item.instances[0] || "").trim();
        const dbMatch = lookupItem(item);

        // A real database match with a link always wins — this is what
        // makes a "pending" item flip back to "recognized" automatically
        // once it's actually approved and copied into the Sheet, without
        // needing to manually clear the local submission first.
        if (dbMatch && dbMatch.link && dbMatch.link.trim()) {

            const key = `${dbMatch.creator}::${dbMatch.setName}`;

            if (!buckets.recognized.has(key)) {
                buckets.recognized.set(key, { ...dbMatch, items: [] });
            }

            buckets.recognized.get(key).items.push(item);
            return;
        }

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

        if (dbMatch) {

            const key = `${dbMatch.creator}::${dbMatch.setName}`;

            if (!buckets.missing.has(key)) {
                buckets.missing.set(key, {
                    ...dbMatch,
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
        unknownItems
    };
}


// ==========================================
// GENERATE LIST
// ==========================================

function generateList() {

    const text = ccInput.value.trim();

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

    const { pendingGroups, recognizedGroups, missingGroups, unknownItems } =
        classifyAndGroup(items);

    // PENDING GROUPS (user's own submission, awaiting validation)

    pendingGroups.forEach((group) => {

        const element = document.createElement("div");
        element.className = "cc-item pending";

        const itemsListHTML = group.items
            .map((it) => `<li>${escapeHTML(formatCCName(it.name))}</li>`)
            .join("");

        element.innerHTML = `
            <div class="cc-item-row">
                <span class="cc-name">${escapeHTML(group.setName)}</span>
                <span class="cc-status pending">⏳ pending (${group.items.length})</span>
            </div>

            <div class="cc-meta">
                by <span class="cc-creator">${escapeHTML(group.creator)}</span>
            </div>

            <a href="${escapeHTML(group.link)}" target="_blank" rel="noopener noreferrer" class="cc-link">
                🔗 View the link
            </a>

            <span class="pending-note">Submission pending review</span>

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

        element.innerHTML = `
            <div class="cc-item-row">
                <span class="cc-name">${escapeHTML(group.setName)}</span>
                <span class="cc-status recognized">✓ recognized (${group.items.length})</span>
            </div>

            <div class="cc-meta">
                by <span class="cc-creator">${escapeHTML(group.creator)}</span>
            </div>

            <a href="${escapeHTML(group.link)}" target="_blank" rel="noopener noreferrer" class="cc-link">
                🔗 View the link
            </a>

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

            <details class="cc-details">
                <summary>View the ${group.items.length} items</summary>
                <ul>${itemsListHTML}</ul>
            </details>
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


// ==========================================
// GENERATE BUTTON
// ==========================================

generateButton.addEventListener("click", async () => {

    generateButton.disabled = true;
    generateButton.textContent = "Loading...";

    await databaseLoadPromise;

    generateButton.disabled = false;
    generateButton.innerHTML = '<img src="mark.png" alt="" class="button-mark"> Create the list';

    generateList();
});


// ==========================================
// COPY RESULT
// ==========================================

async function copyResult() {

    if (generatedItems.length === 0) {
        return;
    }

    const { pendingGroups, recognizedGroups, missingGroups, unknownItems } =
        classifyAndGroup(generatedItems);

    const lines = [
        ...recognizedGroups.map(
            (group) => `${group.setName} (${group.creator}) — [download here](${group.link})`
        ),
        ...pendingGroups.map(
            (group) =>
                `${group.setName} (${group.creator}) — [download here](${group.link}) (pending validation)`
        ),
        ...missingGroups.map(
            (group) => `${group.setName} (${group.creator}) — [link needed]`
        ),
        ...unknownItems.map(
            (item) => `${formatCCName(item.name)} — [link needed]`
        )
    ];

    const text = lines.join("\n");

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
        note: document.getElementById("fieldNote").value.trim(),
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
// BUNDLE SUBMISSION (whole set at once, for creators)
// ==========================================

const bundleModal = document.getElementById("bundleModal");
const bundleToggle = document.getElementById("bundleToggle");
const closeBundleButton = document.getElementById("closeBundle");
const bundleForm = document.getElementById("bundleForm");

function openBundleModal() {
    bundleForm.reset();
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
    submitBtn.textContent = `Sending ${submissionsToSend.length} items...`;

    const submissions = getSubmissions();

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
    }

    saveSubmissions(submissions);

    closeBundleModal();

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
        .map((sub, index) => `
            <div class="admin-entry">
                <div class="admin-entry-header">
                    <strong>${escapeHTML(sub.itemName)}</strong>
                    <button class="admin-delete" data-index="${index}" type="button">✕</button>
                </div>
                <div class="admin-entry-body">
                    Set: ${escapeHTML(sub.setName)} · Creator: ${escapeHTML(sub.creator)}<br>
                    Link: <a href="${escapeHTML(sub.link)}" target="_blank" rel="noopener noreferrer">${escapeHTML(sub.link)}</a>
                    ${sub.note ? `<br>Note: ${escapeHTML(sub.note)}` : ""}
                </div>
                <button class="admin-copy" data-index="${index}" type="button">
                    ⧉ Copy as JSON
                </button>
            </div>
        `)
        .join("");
}

function openAdminPanel() {
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


// ==========================================
// INITIALIZATION
// ==========================================

updateCharacterCount();

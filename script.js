// ==========================================
// TS4 CC BUILD LIST GENERATOR
// S4TI PARSER - V2
// ==========================================

// ------------------------------------------
// LIVE DATABASE (Google Sheet via opensheet.elk.sh)
// ------------------------------------------
// Le Sheet "CC LIST Database" (onglet "Feuille 1") sert de
// source de vérité. Colonnes attendues : InstanceID | SetName | Creator | Link

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

        console.error("Impossible de charger la base de données :", error);

        DATABASE_INDEX = {};
    }
}

const databaseLoadPromise = loadDatabase();


// ------------------------------------------
// LOOKUP AN ITEM AGAINST THE DATABASE
// ------------------------------------------

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
// GROUP ITEMS BY SET (recognized only)
// ------------------------------------------

function groupItems(items) {

    const recognizedGroups = new Map();
    const unknownItems = [];

    items.forEach((item) => {

        const match = lookupItem(item);

        if (match) {

            const key = `${match.creator}::${match.setName}`;

            if (!recognizedGroups.has(key)) {

                recognizedGroups.set(key, {
                    creator: match.creator,
                    setName: match.setName,
                    link: match.link,
                    items: []
                });
            }

            recognizedGroups.get(key).items.push(item);

        } else {

            unknownItems.push(item);
        }
    });

    return {
        recognizedGroups: Array.from(recognizedGroups.values()),
        unknownItems
    };
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

// Liste actuellement générée
let generatedItems = [];


// ==========================================
// CHARACTER COUNTER
// ==========================================

function updateCharacterCount() {
    const count = ccInput.value.length;

    characterCount.textContent =
        `${count.toLocaleString("fr-FR")} caractères`;
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
     * S4TI peut afficher des entrées comme :
     *
     * [0x832A3ABF0870E3BB.0x034AEECB]
     *
     * Ce ne sont pas des noms de CC.
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

        // --------------------------------------
        // EMPTY LINE
        // --------------------------------------

        if (!line) {
            continue;
        }


        // --------------------------------------
        // INSTANCE LINE
        // --------------------------------------

        if (/^Instance\s*:/i.test(line)) {

            if (currentItem) {

                const instance = line
                    .replace(/^Instance\s*:/i, "")
                    .trim();

                if (instance) {
                    currentItem.instances.push(instance);
                }
            }

            continue;
        }


        // --------------------------------------
        // POSSIBLE CC NAME
        // --------------------------------------

        /*
         * Important :
         *
         * On ne fait PAS :
         *
         * /\[([^\]]+)\]/
         *
         * car certains noms contiennent eux-mêmes
         * des crochets.
         *
         * Exemple :
         *
         * [[crypticsim] sasha lip liner]
         */

        if (line.startsWith("[") && line.endsWith("]")) {

            const name = line
                .slice(1, -1)
                .trim();

            // [] → ignore
            if (!name) {
                currentItem = null;
                continue;
            }

            // [0x....0x....] → ignore
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


        // --------------------------------------
        // EVERYTHING ELSE
        // --------------------------------------

        /*
         * Les autres lignes S4TI ne sont pas
         * nécessaires pour l'identification
         * pour le moment.
         */
    }


    // ==========================================
    // DEDUPLICATION
    // ==========================================

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

                <h4>Aucun CC trouvé</h4>

                <p>
                    Aucune entrée CC exploitable n'a été trouvée
                    dans cette liste S4TI.
                </p>
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

    const { recognizedGroups, unknownItems } = groupItems(items);


    // RECOGNIZED GROUPS (one card per set)

    recognizedGroups.forEach((group) => {

        const element = document.createElement("div");

        element.className = "cc-item recognized";

        const itemsListHTML = group.items
            .map((it) => `<li>${escapeHTML(formatCCName(it.name))}</li>`)
            .join("");

        element.innerHTML = `
            <div class="cc-item-row">
                <span class="cc-name">
                    ${escapeHTML(group.setName)}
                </span>
                <span class="cc-status recognized">
                    ✓ reconnu (${group.items.length})
                </span>
            </div>

            <div class="cc-meta">
                par
                <span class="cc-creator">${escapeHTML(group.creator)}</span>
            </div>

            <a href="${escapeHTML(group.link)}" target="_blank" rel="noopener noreferrer" class="cc-link">
                🔗 Voir le lien
            </a>

            <details class="cc-details">
                <summary>Voir les ${group.items.length} items</summary>
                <ul>${itemsListHTML}</ul>
            </details>
        `;

        list.appendChild(element);
    });


    // UNKNOWN ITEMS (one card each, no grouping yet)

    unknownItems.forEach((item) => {

        const element = document.createElement("div");

        element.className = "cc-item unknown";

        element.innerHTML = `
            <div class="cc-item-row">
                <span class="cc-name">
                    ${escapeHTML(formatCCName(item.name))}
                </span>
                <span class="cc-status unknown">
                    ? inconnu
                </span>
            </div>

            <div class="cc-meta cc-meta-unknown">
                Pas encore dans la base
            </div>

            <button class="propose-button" type="button">
                + Proposer un lien
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

            <div class="empty-icon">✦</div>

            <h4>Ton résultat apparaîtra ici</h4>

            <p>
                Colle ta liste S4TI puis clique sur
                « Générer la liste ».
            </p>

        </div>
    `;
}


// ==========================================
// UPDATE COUNT
// ==========================================

function updateCount(count) {

    itemCount.textContent =
        `${count} CC`;
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
    generateButton.textContent = "Chargement...";

    await databaseLoadPromise;

    generateButton.disabled = false;
    generateButton.innerHTML = '<span>✦</span> Generate the list';

    generateList();
});


// ==========================================
// COPY RESULT
// ==========================================

async function copyResult() {

    if (generatedItems.length === 0) {
        return;
    }


    const { recognizedGroups, unknownItems } = groupItems(generatedItems);

    const lines = [
        ...recognizedGroups.map(
            (group) =>
                `${group.setName} (${group.creator}) — [download here](${group.link})`
        ),
        ...unknownItems.map(
            (item) => `${formatCCName(item.name)} — [lien à vérifier]`
        )
    ];

    const text = lines.join("\n");


    try {

        await navigator.clipboard.writeText(text);

        showToast("Liste copiée !");

    } catch (error) {

        const temporaryTextarea =
            document.createElement("textarea");

        temporaryTextarea.value = text;

        document.body.appendChild(temporaryTextarea);

        temporaryTextarea.select();

        document.execCommand("copy");

        temporaryTextarea.remove();

        showToast("Liste copiée !");
    }
}

copyButton.addEventListener("click", copyResult);


// ==========================================
// PROPOSE A LINK — SUBMISSION MODAL
// ==========================================
// Stockage local uniquement pour l'instant (localStorage).
// Chaque proposition reste dans le navigateur de la personne
// qui l'a soumise — pas encore de synchronisation entre
// utilisatrices. À remplacer par un vrai backend plus tard.

const SUBMISSIONS_KEY = "cc_pending_submissions";

const submitModal = document.getElementById("submitModal");
const modalItemName = document.getElementById("modalItemName");
const closeModalButton = document.getElementById("closeModal");
const submitForm = document.getElementById("submitForm");

const adminPanel = document.getElementById("adminPanel");
const adminToggle = document.getElementById("adminToggle");
const closeAdminButton = document.getElementById("closeAdmin");
const adminList = document.getElementById("adminList");

let currentProposedItemName = "";


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

function openSubmitModal(itemName) {

    currentProposedItemName = itemName;

    modalItemName.textContent = `Pour l'item : ${itemName}`;

    submitForm.reset();

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

        const item = event.target.closest(".cc-item");

        const name = item
            ? item.querySelector(".cc-name").textContent.trim()
            : "cet item";

        openSubmitModal(name);
    }
});

submitForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const submission = {
        itemName: currentProposedItemName,
        setName: document.getElementById("fieldSetName").value.trim(),
        creator: document.getElementById("fieldCreator").value.trim(),
        link: document.getElementById("fieldLink").value.trim(),
        note: document.getElementById("fieldNote").value.trim(),
        submittedAt: new Date().toISOString()
    };

    const submissions = getSubmissions();
    submissions.push(submission);
    saveSubmissions(submissions);

    closeSubmitModal();

    showToast("Proposition envoyée, merci ! 🦄");
});


// ------------------------------------------
// ADMIN PANEL (local test only)
// ------------------------------------------

function renderAdminList() {

    const submissions = getSubmissions();

    if (submissions.length === 0) {

        adminList.innerHTML = `
            <p class="admin-empty">Aucune proposition enregistrée pour l'instant.</p>
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
                    Set : ${escapeHTML(sub.setName)} · Créateurice : ${escapeHTML(sub.creator)}<br>
                    Lien : <a href="${escapeHTML(sub.link)}" target="_blank" rel="noopener noreferrer">${escapeHTML(sub.link)}</a>
                    ${sub.note ? `<br>Note : ${escapeHTML(sub.note)}` : ""}
                </div>
                <button class="admin-copy" data-index="${index}" type="button">
                    ⧉ Copier en JSON
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
            showToast("Copié en JSON !");
        } catch (error) {
            // clipboard unavailable, silently ignore
        }
    }
});


// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2000);
}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(value) {

    return value
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

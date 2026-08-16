// ==========================================
// TS4 CC BUILD LIST GENERATOR
// S4TI PARSER - V2
// ==========================================

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


    items.forEach((item, index) => {

        const element = document.createElement("div");

        element.className = "cc-item";

        element.innerHTML = `
            <span class="cc-name">
                ${escapeHTML(formatCCName(item.name))}
            </span>

            <span class="cc-number">
                CC #${index + 1}
            </span>
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

generateButton.addEventListener("click", generateList);


// ==========================================
// COPY RESULT
// ==========================================

async function copyResult() {

    if (generatedItems.length === 0) {
        return;
    }


    const text = generatedItems
        .map(item => formatCCName(item.name))
        .join("\n");


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

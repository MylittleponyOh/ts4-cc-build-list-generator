// ==========================================
// CC BUILD LIST GENERATOR
// ==========================================


// Elements
const ccInput = document.getElementById("ccInput");
const generateButton = document.getElementById("generateButton");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");

const result = document.getElementById("result");
const itemCount = document.getElementById("itemCount");
const characterCount = document.getElementById("characterCount");

const toast = document.getElementById("toast");


// Current generated items
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
// EXTRACT CC NAMES
// ==========================================

function extractCCNames(text) {

    /*
     * We look for anything between [ and ].
     *
     * Example:
     *
     * [VALIA_Cozy_Cabin_Closet_3]
     *
     * becomes:
     *
     * VALIA_Cozy_Cabin_Closet_3
     */

    const matches = text.match(/\[([^\]]+)\]/g) || [];

    const names = matches.map(match => {

        return match
            .replace(/^\[/, "")
            .replace(/\]$/, "")
            .trim();

    });


    // Remove empty names
    const filtered = names.filter(name => name.length > 0);


    // Remove duplicates while preserving order
    return [...new Set(filtered)];
}


// ==========================================
// FORMAT CC NAME
// ==========================================

function formatCCName(name) {

    /*
     * For now we simply make the filename-style
     * name easier to read.
     *
     * Example:
     *
     * VALIA_Cozy_Cabin_Closet_3
     *
     * becomes:
     *
     * VALIA Cozy Cabin Closet 3
     *
     * Later this function can become much smarter
     * once we have our set database.
     */

    return name
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


// ==========================================
// GENERATE RESULT
// ==========================================

function generateList() {

    const text = ccInput.value.trim();

    if (!text) {

        showEmptyState();

        generatedItems = [];

        updateCount(0);
        copyButton.disabled = true;

        return;
    }


    const names = extractCCNames(text);

    generatedItems = names;


    if (names.length === 0) {

        result.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">?</div>

                <h4>Aucun CC trouvé</h4>

                <p>
                    Vérifie que les noms de tes CC sont
                    entourés de crochets [ ].
                </p>
            </div>
        `;

        updateCount(0);
        copyButton.disabled = true;

        return;
    }


    renderResults(names);

    updateCount(names.length);

    copyButton.disabled = false;
}


// ==========================================
// DISPLAY RESULTS
// ==========================================

function renderResults(names) {

    const list = document.createElement("div");

    list.className = "result-list";


    names.forEach((name, index) => {

        const item = document.createElement("div");

        item.className = "cc-item";


        item.innerHTML = `
            <span class="cc-name">
                ${escapeHTML(formatCCName(name))}
            </span>

            <span class="cc-number">
                CC #${index + 1}
            </span>
        `;


        list.appendChild(item);

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
                Colle tes CC à gauche puis clique sur
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


    /*
     * This is the simple text version for now.
     *
     * Later we can make it copy a beautiful
     * formatted list including:
     *
     * Creator
     * Set
     * Set URL
     * CC items
     */

    const text = generatedItems
        .map((name, index) => {
            return `${index + 1}. ${formatCCName(name)}`;
        })
        .join("\n");


    try {

        await navigator.clipboard.writeText(text);

        showToast("Liste copiée !");

    } catch (error) {

        /*
         * Fallback for browsers where the Clipboard API
         * isn't available.
         */

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

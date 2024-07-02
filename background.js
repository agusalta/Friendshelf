chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "review",
        title: "Search Review",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "review" && info.selectionText) {
        chrome.storage.local.set({ "highlightedText": info.selectionText }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error saving highlighted text:", chrome.runtime.lastError.message);
            } else {
                console.log("Highlighted text saved successfully:", info.selectionText);
            }
        });
    }
});

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });
});

// Función para obtener los nombres de productos encontrados desde chrome.storage.local
function getFoundProductNames(callback) {
    chrome.storage.local.get({ foundProductNames: [] }, (result) => {
        callback(result.foundProductNames);
    });
}

// Función para actualizar el badge del icono de la extensión
function updateBadge() {
    getFoundProductNames((foundProductNames) => {
        const count = foundProductNames.length;
        console.log('Updating badge with count:', count);
        chrome.action.setBadgeText({ text: count.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#3a3ec7' });
    });
}

// Listener para detectar cambios en chrome.storage.local
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.foundProductNames) {
        console.log('foundProductNames changed:', changes.foundProductNames.newValue);
        updateBadge();
    }
});

// Actualizar el badge al iniciar
chrome.runtime.onStartup.addListener(updateBadge);
chrome.runtime.onInstalled.addListener(updateBadge);

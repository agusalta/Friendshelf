chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "review",
        title: "Search Review",
        contexts: ["selection"]
    });

    const welcomePage = 'welcome.html';
    chrome.sidePanel.setOptions({ path: welcomePage });
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

    updateBadgeAndTitle();
});

// Listener para cambiar de página de bienvenida a página principal
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const { path } = await chrome.sidePanel.getOptions({ tabId });
    if (path === 'welcome.html') {
        chrome.sidePanel.setOptions({ path: 'popup.html' });
    }
});

// Función para aplicar el modo oscuro cuando se cambia de página
chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.storage.local.get('darkMode', ({ darkMode }) => {
        const isDarkModeOn = darkMode || false; // Por defecto, el modo oscuro está apagado
        chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const body = document.body;
                body.classList.toggle('dark-mode', isDarkModeOn);
            },
        });
    });
});

// Manejo de clic en menú contextual
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

// Listener para clic en acción de la extensión
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });
});

// Obtener nombres de productos encontrados desde storage
function getFoundProductNames(callback) {
    chrome.storage.local.get({ foundProductNames: [] }, (result) => {
        callback(result.foundProductNames);
    });
}

// Actualizar badge y title
function updateBadgeAndTitle() {
    getFoundProductNames((foundProductNames) => {
        const count = foundProductNames.length;
        const title = foundProductNames.join(', ') || 'No products found';
        console.log('Updating badge with count:', count);
        console.log('Updating title with:', title);

        chrome.action.setBadgeText({ text: count.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#3a3ec7' });
        chrome.action.setTitle({ title });
    });
}

// Listener para cambios en storage
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.foundProductNames) {
        console.log('foundProductNames changed:', changes.foundProductNames.newValue);
        updateBadgeAndTitle();
    }
});

// Actualizar badge y title al iniciar
chrome.runtime.onStartup.addListener(updateBadgeAndTitle);
chrome.runtime.onInstalled.addListener(updateBadgeAndTitle);

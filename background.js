chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "review",
        title: "Search Review",
        contexts: ["selection"]
    });

});

function sendCurrentTabUrlToServer() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const currentTab = tabs[0];
            const url = currentTab.url;

            // Enviar la URL al servidor
            fetch('http://localhost:3000/url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            })
                .then(response => {
                    if (response.ok) {
                        console.log('URL successfully sent to server.');
                    } else {
                        console.error('Error sending URL to server:', response.statusText);
                    }
                })
                .catch(error => {
                    console.error('Error sending URL to server:', error);
                });
        } else {
            console.error('No active tab found.');
        }
    });
}

// Función para aplicar el modo oscuro cuando se cambia de página
chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.storage.local.get('darkMode', ({ darkMode }) => {
        const isDarkModeOn = darkMode || false;
        chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const body = document.body;
                body.classList.toggle('dark-mode', isDarkModeOn);
            },
        });
    });

    sendCurrentTabUrlToServer();
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

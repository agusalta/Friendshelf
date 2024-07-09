// Manejo de la extensión apenas se instala
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "review",
        title: "Search Review",
        contexts: ["selection"]
    });

});

const GOOGLE_ORIGIN = 'https://www.google.com';

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (!tab.url) return;
    const url = new URL(tab.url);
    // Enables the side panel on google.com
    if (url.origin === GOOGLE_ORIGIN) {
        await chrome.sidePanel.setOptions({
            tabId,
            path: 'sidebar.html',
            enabled: true
        });
    } else {
        // Disables the side panel on all other sites
        await chrome.sidePanel.setOptions({
            tabId,
            enabled: false
        });
    }
});

// Función para enviar la URL actual del tab activo al servidor
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

// Función para extraer el nombre del producto a partir de la URL
async function extractNameFromUrl(url) {
    try {
        const response = await fetch('http://localhost:3000/title');

        if (!response.ok) {
            throw new Error('Failed to fetch product list');
        }

        const productList = await response.json();
        let bestMatch = null;

        productList.forEach(productName => {
            const match = findBestMatch(productName, url);

            if (match && (!bestMatch || match.length > bestMatch.length)) {
                bestMatch = match;
            }
        });

        console.log("Best coincidence found", bestMatch)
        return bestMatch;

    } catch (error) {
        console.error('Error extracting product name from URL:', error);
        return null;
    }
}

// Función para buscar el producto coincidente en la lista
const findBestMatch = (productName, url) => {
    if (url.includes(productName.toLowerCase())) {
        return productName;
    }
    return null;
};

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

// Listener para el click en acción de la extensión
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

// Función para actualizar badge y title
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

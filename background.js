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
        files: ["content-script.js"]
    });
});

function fetchProductsAndStore() {
    fetch('http://localhost:3000/api/products')
        .then(response => response.json())
        .then(products => {
            let dbRequest = indexedDB.open("productDB", 1);

            dbRequest.onupgradeneeded = event => {
                let db = event.target.result;
                if (!db.objectStoreNames.contains("products")) {
                    db.createObjectStore("products", { keyPath: "name" });
                }
            };

            dbRequest.onsuccess = event => {
                let db = event.target.result;
                let transaction = db.transaction(["products"], "readwrite");
                let store = transaction.objectStore("products");

                store.clear();
                products.forEach(product => {
                    store.add(product);
                });
            };

            dbRequest.onerror = event => {
                console.error("Error opening IndexedDB:", event.target.errorCode);
            };
        })
        .catch(error => {
            console.error("Error fetching products:", error);
        });
}
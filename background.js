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


chrome.contextMenus.onClicked.addListener((e) => {
    if (e.menuItemId === "review" && e.selectionText) {
        chrome.storage.local.set({ "highlightedText": e.selectionText }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error saving highlighted text:", chrome.runtime.lastError.message);
            } else {
                console.log("Highlighted text saved successfully:", e.selectionText);
            }
        });
    }
});


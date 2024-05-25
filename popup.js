document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const currentUrl = document.querySelector("#current-url");
        currentUrl.textContent = tab.url;

        await sendUrlToServer(tab.url);

    } catch (error) {
        console.error('Error retrieving active tab:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const textElement = document.querySelector("#current-text");

    chrome.storage.local.get("highlightedText", (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error getting highlighted text:", chrome.runtime.lastError.message);
        } else {
            const highlightedText = result.highlightedText;
            console.log("Highlighted text retrieved:", highlightedText);
            textElement.textContent = highlightedText || "No se seleccionó nada";
        }
    });
});
async function sendUrlToServer(url) {
    try {
        const response = await fetch('http://localhost:3000/url/guardar-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (response.ok) {
            console.log('URL successfully sent to server.');
        } else {
            console.error('Error sending URL to server:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending URL to server:', error);
    }
}

// async function sendTextToServer(text) {
//     try {
//         const response = await fetch('http://localhost:3000/texto/guardar-texto', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ text })
//         });

//         if (response.ok) {
//             console.log('TEXT successfully sent to server.');
//         } else {
//             console.error('Error sending TEXT to server:', response.statusText);
//         }
//     } catch (err) {
//         console.error('Error sending TEXT to server:', error);
//     }
// }

const logoURL = './assets/logo/light-logo-70.png';

// Función para obtener nombres de productos desde la API
async function fetchProductNamesFromAPI() {
    try {
        const response = await fetch('http://localhost:3000/products/title');

        if (!response.ok) {
            throw new Error('Error al obtener nombres de productos: ' + response.status);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('La respuesta no es JSON');
        }
        const productNames = await response.json();
        return Array.isArray(productNames) ? productNames : [];
    } catch (error) {
        console.error('Error fetching product names:', error);
        return [];
    }
}

// Función para almacenar nombres de productos en almacenamiento local
async function setProductNamesToStorage(productNames) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ 'productNames': productNames }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

// Función para obtener nombres de productos desde almacenamiento local
async function getProductNamesFromStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('productNames', result => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result.productNames || []);
            }
        });
    });
}

// Función para guardar los nombres de productos encontrados en el almacenamiento local
function saveFoundProductNamesToLocalStorage(foundProductNames) {
    chrome.storage.local.get({ foundProductNames: [] }, (result) => {
        let existingFoundNames = result.foundProductNames || []; // Cargar el array existente
        foundProductNames.forEach(name => {
            if (!existingFoundNames.includes(name)) {
                existingFoundNames.push(name); // Agregar solo si no existe ya en el array
            }
        });

        chrome.storage.local.set({ foundProductNames: existingFoundNames }, () => {
            console.log('Updated foundProductNames:', existingFoundNames);
        });
    });
}


function saveHighlightedTextToStorage(productName) {
    chrome.storage.local.set({ 'highlightedText': productName }, () => {
        console.log('Updated highlightedText:', productName);
    });
}


// Función para guardar el texto resaltado en el almacenamiento local al hacer hover
function saveHighlightedTextOnHover(productName) {
    saveHighlightedTextToStorage(productName);
}


// Función para resaltar nombres de productos en la página
function highlightProductNames(productNamesArray) {
    const productNamesSet = new Set(productNamesArray);
    const foundProductNames = [];

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const span = entry.target;
                const productName = span.textContent.trim();

                if (productNamesSet.has(productName)) {
                    if (!span.classList.contains('highlighted')) {
                        span.classList.add('highlighted');
                    }
                    span.addEventListener('mouseenter', () => {
                        saveHighlightedTextToStorage(productName);
                    });
                    
                    foundProductNames.push(productName);
                }

                observer.unobserve(span);
            }
        });

        if (foundProductNames.length > 0) {
            saveFoundProductNamesToLocalStorage(foundProductNames);
        }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const spans = document.querySelectorAll('span.VuuXrf');

    spans.forEach(span => {
        observer.observe(span);
    });
}

// Función principal para obtener y resaltar nombres de productos
async function fetchAndHighlightProductNames() {
    try {
        // Vaciar el array de productos encontrados
        await new Promise((resolve, reject) => {
            chrome.storage.local.set({ 'foundProductNames': [] }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });

        let productNames = await getProductNamesFromStorage();

        if (productNames.length === 0) {
            console.log('No product names fetched from storage, fetching from API...');
            productNames = await fetchProductNamesFromAPI();
            await setProductNamesToStorage(productNames);
        }

        highlightProductNames(productNames, logoURL);

    } catch (error) {
        console.error('Error fetching or highlighting product names:', error);
    }
}

fetchAndHighlightProductNames();
document.addEventListener('DOMContentLoaded', fetchAndHighlightProductNames);

// Detectar cambios en el DOM y actualizar los resaltados
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            fetchAndHighlightProductNames();
        }
    });
});

observer.observe(document.body, { subtree: true, childList: true });

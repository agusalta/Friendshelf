const logoURL = './assets/logo/light-logo-70.png'

// Función para obtener nombres de productos desde la API
async function fetchProductNamesFromAPI() {
    try {
        const response = await fetch('http://localhost:3000/products/title');
        if (!response.ok) {
            throw new Error('Error al obtener nombres de productos: ' + response.status);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('La respuesta no es JSON válido');
        }
        const productNames = await response.json();
        return Array.isArray(productNames) ? productNames : [];
    } catch (error) {
        console.error('Error fetching product names:', error);
        return [];
    }
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

// Función para resaltar nombres de productos en la página
function highlightProductNames(productNames, logoURL) {
    console.log('Ejecutando highlightProductNames');

    const spans = document.querySelectorAll('span.VuuXrf');

    spans.forEach(span => {
        const productName = span.textContent.trim();
        if (productNames.includes(productName) && !span.querySelector('img.product-logo')) {
            console.log(`Insertando logo para producto: ${productName}`);

            span.style.color = 'yellow';

            const logoImg = document.createElement('img');
            logoImg.src = logoURL;
            logoImg.alt = 'Logo del producto'; 
            logoImg.style.width = '50px'; o
            logoImg.style.height = 'auto'; 
            logoImg.className = 'product-logo'; 

            // Añadir el logo directamente al span
            span.appendChild(logoImg);
        } else {
            console.log(`El producto ${productName} ya tiene un logo.`);
        }
    });
}


// Función principal para obtener y resaltar nombres de productos
async function fetchAndHighlightProductNames() {
    try {
        let productNames = await getProductNamesFromStorage();

        if (productNames.length === 0) {
            console.log('No product names fetched from storage, fetching from API...');
        }

        highlightProductNames(productNames);

    } catch (error) {
        console.error('Error fetching or highlighting product names:', error);
    }
}

// Función para agregar el logo al lado de la alerta
function addLogoToAlert() {
    const logoImg = document.createElement('img');
    logoImg.src = logoURL;
    logoImg.style.marginLeft = '10px'; // Ajusta el margen según sea necesario

    const alertDiv = document.createElement('div');
    alertDiv.style.display = 'flex';
    alertDiv.style.alignItems = 'center';
    alertDiv.appendChild(logoImg);

    // Insertar el logo al principio del cuerpo del documento
    document.body.insertBefore(alertDiv, document.body.firstChild);
}

// Ejecutar al cargar la página
addLogoToAlert();
fetchAndHighlightProductNames();
document.addEventListener('DOMContentLoaded', fetchAndHighlightProductNames);

// Utiliza MutationObserver para detectar cambios en el DOM y actualizar los resaltados
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            fetchAndHighlightProductNames();
        }
    });
});

observer.observe(document.body, { subtree: true, childList: true });

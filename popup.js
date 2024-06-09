
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const currentUrl = document.querySelector("#current-url");
        currentUrl.textContent = tab.url;

        // await sendUrlToServer(tab.url);

    } catch (error) {
        console.error('Error retrieving active tab:', error);
    }
});

function setFaceImage(rating) {
    const roundedRating = Math.round(rating);
    let faceSrc;

    switch (roundedRating) {
        case 5:
            faceSrc = 'assets/faces/5.png';
            break;
        case 4:
            faceSrc = 'assets/faces/4.png';
            break;
        case 3:
            faceSrc = 'assets/faces/3.png';
            break;
        case 2:
            faceSrc = 'assets/faces/2.png';
            break;
        case 1:
            faceSrc = 'assets/faces/1.png';
            break;
        default:
            faceSrc = 'assets/faces/3.png';
            break;
    }

    return faceSrc;
}

function setRatingElement(rating) {
    const starFilled = './assets/star-filled.png';
    const starEmpty = './assets/star-empty.png';
    const starHalf = './assets/star-half.png';

    const starContainer = document.querySelector('#reviews');
    starContainer.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
        const img = document.createElement('img');
        if (i <= rating) {
            img.src = starFilled;
        } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
            img.src = starHalf;
        } else {
            img.src = starEmpty;
        }
        starContainer.appendChild(img);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const textElement = document.querySelector("#current-text");
    const ratingElement = document.querySelector('#rating');
    const numReviewsElement = document.querySelector('#numReviews');
    const reviewerNotesElement = document.querySelector('#reviewerNotes');
    const logoReviewElement = document.querySelector('#logo');
    const faceElement = document.querySelector('#face');
    const whatIsElement = document.querySelector('#what-is');

    const starElements = {
        1: document.querySelector('#star-1'),
        2: document.querySelector('#star-2'),
        3: document.querySelector('#star-3'),
        4: document.querySelector('#star-4'),
        5: document.querySelector('#star-5')
    };

    const starCountElements = {
        1: document.querySelector('#star-1-count'),
        2: document.querySelector('#star-2-count'),
        3: document.querySelector('#star-3-count'),
        4: document.querySelector('#star-4-count'),
        5: document.querySelector('#star-5-count')
    };

    chrome.storage.local.get("highlightedText", async (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error getting highlighted text:", chrome.runtime.lastError.message);
        } else {
            const highlightedText = await result.highlightedText;
            textElement.textContent = highlightedText || "No se seleccionó nada";

            if (highlightedText.length > 0) {
                try {
                    const response = await fetch('http://localhost:3000/api/g2', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ query: highlightedText })
                    });

                    const result = await response.json();

                    if (result) {
                        faceElement.src = setFaceImage(result.rating);
                        logoReviewElement.src = result.product_logo;
                        numReviewsElement.textContent = result.rating;
                        setRatingElement(result.rating);
                        reviewerNotesElement.textContent = `${result.reviews || 'No disponible'} reviews`;
                        whatIsElement.textContent = `${result.what_is || ''}`;
                
                        const starDistribution = result.star_distribution || {};
                        const maxReviews = Math.max(...Object.values(starDistribution));

                        for (let i = 1; i <= 5; i++) {
                            const count = starDistribution[i] || 0;
                            starElements[i].value = (count / maxReviews) * 100;
                            starCountElements[i].textContent = count;
                        }

                    } else {
                        ratingElement.textContent = 'No se encontraron reviews de este producto.';
                        numReviewsElement.textContent = '';
                        whatIsElement.textContent = '';
                        reviewerNotesElement.textContent = '';
                        for (let i = 1; i <= 5; i++) {
                            starElements[i].value = 0;
                            starCountElements[i].textContent = '';
                        }
                    }
                } catch (error) {
                    console.error('Error sending TEXT to server:', error);
                }
            }
        }
    });
});


// async function sendUrlToServer(url) {
//     try {
//         const response = await fetch('http://localhost:3000/url/guardar-url', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ url })
//         });

//         if (response.ok) {
//             console.log('URL successfully sent to server.');
//         } else {
//             console.error('Error sending URL to server:', response.statusText);
//         }
//     } catch (error) {
//         console.error('Error sending URL to server:', error);
//     }
// }

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

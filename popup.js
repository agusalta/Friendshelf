let actualFaceStatusCodeSrc;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const currentUrl = document.querySelector("#current-url");

        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const extensionIcon = document.querySelector("#extension-icon");

        if (prefersDarkMode) {
            extensionIcon.src = "/assets/logo/light-logo-70.png"
        } else {
            extensionIcon.src = "/assets/logo/dark-logo-70.png"
        }

        if (currentUrl) {
            currentUrl.textContent = tab.url;
        }

        actualFaceStatusCodeSrc = 0;
        // await sendUrlToServer(tab.url);

    } catch (error) {
        console.error('Error retrieving active tab:', error);
    }
});

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

function setFaceImage(rating) {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const roundedRating = Math.round(rating);
    let faceSrc;

    switch (roundedRating) {
        case 5:
            faceSrc = prefersDarkMode ? 'assets/faces/5w.png' : 'assets/faces/5.png';
            break;
        case 4:
            faceSrc = prefersDarkMode ? 'assets/faces/4w.png' : 'assets/faces/4.png';
            break;
        case 3:
            faceSrc = prefersDarkMode ? 'assets/faces/3w.png' : 'assets/faces/3.png';
            break;
        case 2:
            faceSrc = prefersDarkMode ? 'assets/faces/2w.png' : 'assets/faces/2.png';
            break;
        case 1:
            faceSrc = prefersDarkMode ? 'assets/faces/1w.png' : 'assets/faces/1.png';
            break;
        default:
            faceSrc = prefersDarkMode ? 'assets/faces/3w.png' : 'assets/faces/3.png';
            break;
    }

    actualFaceStatusCodeSrc = roundedRating; // Actualiza la variable global
    return faceSrc;
}

function setReviewRatingElement(rating, containerId) {
    const starFilled = './assets/star-filled.png';
    const starEmpty = './assets/star-empty.png';
    const starHalf = './assets/star-half.png';

    const starContainer = document.querySelector(containerId);
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

async function getProductDeals(title) {
    try {
        const response = await fetch('http://localhost:3000/api/title', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });

        const deal = await response.json();

        if (!deal || !response.ok) {
            throw new Error('No deal found');
        }

        console.log("Deal: " + deal)
        return deal;
    } catch (err) {
        return null;
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
    const results = document.querySelector('#results');

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
                        results.style.display = 'block';

                        setTimeout(() => {
                            results.style.opacity = 1;
                        }, 100);

                        faceElement.src = setFaceImage(result.rating);
                        logoReviewElement.src = result.product_logo;
                        numReviewsElement.textContent = result.rating;
                        setReviewRatingElement(result.rating, "#reviews");
                        reviewerNotesElement.textContent = `${result.reviews || "We couldn't find"} reviews`;
                        whatIsElement.textContent = `${result.what_is || ''}`;

                        // Ofertas
                        const prodDealsTitle = document.querySelector('#product_deals_title');
                        const prodDealsDiscount = document.querySelector('#product_deals_discount');
                        const prodDealsClaimOfferDetails = document.querySelector('#product_deals_claim_details');
                        const prodDealsOfferDetails = document.querySelector('#product_deals_offer_details');

                        if (result.product_name) {
                            const deal = await getProductDeals(result.product_name);

                            if (deal) {
                                prodDealsTitle.textContent = deal.prod_title || '';
                                prodDealsDiscount.textContent = deal.prod_discount || '';
                                prodDealsClaimOfferDetails.textContent = deal.prod_claim_offer_details || '';
                                prodDealsOfferDetails.textContent = deal.prod_offer_details || '';

                                if (result.pricing_plans !== null && result.pricing_plans.length > 0) {
                                    const prodDealsPricingPlans = document.querySelector('#product_pricing_plans');

                                    for (let i = 0; i < result.pricing_plans.length; i++) {
                                        const pricingPlan = document.createElement('div');
                                        pricingPlan.classList.add('plan');

                                        const planName = document.createElement('h3');
                                        planName.textContent = result.pricing_plans[i].plan_name;

                                        const planPrice = document.createElement('p');
                                        planPrice.textContent = result.pricing_plans[i].plan_price;

                                        const planDesc = document.createElement('p');
                                        planDesc.textContent = result.pricing_plans[i].plan_desc;

                                        const planFeatures = document.createElement('ul');
                                        planFeatures.classList.add('features');

                                        for (let j = 0; j < result.pricing_plans[i].plan_features.length; j++) {
                                            const planFeature = document.createElement('li');
                                            planFeature.textContent = result.pricing_plans[i].plan_features[j];
                                            planFeatures.appendChild(planFeature);
                                        }

                                        pricingPlan.appendChild(planName);
                                        pricingPlan.appendChild(planPrice);
                                        pricingPlan.appendChild(planDesc);
                                        pricingPlan.appendChild(planFeatures);

                                        prodDealsPricingPlans.appendChild(pricingPlan);
                                    }
                                }
                            }
                        }


                        if (result.product_logo && result.product_logo.trim() !== "") {
                            const logoReviewElement = document.querySelector('#logo');
                            logoReviewElement.src = result.product_logo;
                        } else {
                            // Ocultar el elemento de la imagen del logo si no se ha asignado una imagen
                            const logosContainer = document.querySelector('#logo');
                            const productsData = document.querySelector('#product-data');
                            logosContainer.style.display = 'none';

                            productsData.style.display = 'flex';
                            productsData.style.justifyContent = 'center';
                            productsData.style.alignItems = 'center';
                        }

                    } else {
                        ratingElement.textContent = 'No reviews available';
                        numReviewsElement.textContent = '';
                        whatIsElement.textContent = '';
                        reviewerNotesElement.textContent = '';

                    }
                } catch (error) {
                    console.error('Error sending TEXT to server:', error);
                }
            }
        }
    });
});
document.addEventListener('DOMContentLoaded', function () {
    let seeReviewsBtn = document.getElementById('see-reviews-btn');

    seeReviewsBtn.addEventListener('click', async function () {
        try {
            const highlightedText = await getHighlightedText();

            const response = await fetch('http://localhost:3000/api/g2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: highlightedText })
            });

            const bestReviewElement = document.querySelector('#best-review');
            const worstReviewElement = document.querySelector('#worst-review');

            const result = await response.json();
            let reviews = result.initial_reviews;

            if (typeof reviews === 'string') {
                try {
                    reviews = JSON.parse(reviews);
                } catch (e) {
                    console.error('Error parsing initial_reviews JSON string:', e);
                    reviews = [];
                }
            }

            if (reviews && reviews.length) {
                let best = {}, worst = {};
                let min = Infinity, max = -Infinity;

                for (let i = 0; i < reviews.length; i++) {
                    if (reviews[i].review_rating > max) {
                        max = reviews[i].review_rating;
                        best = reviews[i];
                    }
                    if (reviews[i].review_rating < min) {
                        min = reviews[i].review_rating;
                        worst = reviews[i];
                    }
                }

                if (best.review_title !== 'NOT GIVEN' || worst.review_title !== 'NOT GIVEN') {
                    bestReviewElement.querySelector('#best-review_title').textContent = best.review_title;
                    worstReviewElement.querySelector('#worst-review_title').textContent = worst.review_title;
                }

                setReviewRatingElement(best.review_rating, '#best-review_rating');
                bestReviewElement.querySelector('#best-review_rating').textContent = best.review_rating;
                bestReviewElement.querySelector('#best-review_content').textContent = best.review_content;
                bestReviewElement.querySelector('#best-review_date').textContent = best.publish_date;
                bestReviewElement.querySelector('#best-reviewer_name').textContent = best.reviewer_name;
                bestReviewElement.querySelector('#best-reviewer_company-size').textContent = best.reviewer_company_size;

                setReviewRatingElement(worst.review_rating, '#worst-review_rating');
                worstReviewElement.querySelector('#worst-review_rating').textContent = worst.review_rating;
                worstReviewElement.querySelector('#worst-review_content').textContent = worst.review_content;
                worstReviewElement.querySelector('#worst-review_date').textContent = worst.publish_date;
                worstReviewElement.querySelector('#worst-reviewer_name').textContent = worst.reviewer_name;
                worstReviewElement.querySelector('#worst-reviewer_company-size').textContent = worst.reviewer_company_size;
            } else {
                bestReviewElement.textContent = "No good reviews available";
                worstReviewElement.textContent = "No bad reviews available";
            }

            if (result.star_distribution) {
                const starDistribution = result.star_distribution || {};
                const maxReviews = Math.max(...Object.values(starDistribution));

                for (let i = 1; i <= 5; i++) {
                    const count = starDistribution[i] || 0;
                    starElements[i].value = (count / maxReviews) * 100;
                    starCountElements[i].textContent = count;
                }
            } else {
                for (let i = 1; i <= 5; i++) {
                    starElements[i].value = 0;
                    starCountElements[i].textContent = '';
                }
            }

        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    });
});

async function getHighlightedText() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("highlightedText", (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                const highlightedText = result.highlightedText;
                resolve(highlightedText || "");
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var seeReviewsBtn = document.getElementById('see-reviews-btn');

    if (seeReviewsBtn) {
        seeReviewsBtn.addEventListener('click', function () {
            fetch(chrome.runtime.getURL('reviews.html'))
                .then(response => response.text())
                .then(data => {
                    document.getElementById('results').innerHTML = data;

                    const productReviews = document.querySelector('#product-reviews');
                    productReviews.style.display = 'block';

                    setTimeout(() => {
                        productReviews.style.opacity = 1;
                    }, 1000);
                })
                .catch(error => console.error('Error fetching reviews.html:', error));
        });
    } else {
        console.error('see-reviews-btn element not found');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    let switchBtn = document.querySelector('#toggle-mode');
    const body = document.body;

    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (prefersDarkMode) {
        body.classList.add('dark-mode');
    }

    switchBtn.addEventListener('click', function () {
        let toggleIcon = document.querySelector('#extension-icon');
        let toggleFace = document.querySelector('#face');
        let isDarkMode = body.classList.toggle("dark-mode");

        if (isDarkMode) {
            toggleIcon.src = '/assets/logo/light-logo-70.png';
            toggleFace.src = `/assets/faces/${actualFaceStatusCodeSrc}w.png`;
        } else {
            toggleIcon.src = '/assets/logo/dark-logo-70.png';
            toggleFace.src = `/assets/faces/${actualFaceStatusCodeSrc}.png`;
        }
    });
});


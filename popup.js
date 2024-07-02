// Módulo para manejar la lógica relacionada con el DOM
const DOMModule = (() => {
    let actualFaceStatusCodeSrc;

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const tab = await getCurrentTab();
            const currentUrlElement = document.querySelector("#current-url");

            updateExtensionIcon();

            if (currentUrlElement) {
                currentUrlElement.textContent = tab.url;
            }

            actualFaceStatusCodeSrc = 0;

        } catch (error) {
            console.error('Error retrieving active tab:', error);
        }
    });

    function getCurrentTab() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                } else {
                    resolve(tabs[0]);
                }
            });
        });
    }

    function updateExtensionIcon() {
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const extensionIcon = document.querySelector("#extension-icon");
        extensionIcon.src = prefersDarkMode ? "/assets/logo/light-logo-70.png" : "/assets/logo/dark-logo-70.png";
    }

    return {
        actualFaceStatusCodeSrc,
        updateExtensionIcon
    };
})();

// Módulo para manejar las operaciones relacionadas con las estrellas y las revisiones
const ReviewModule = (() => {
    const starFilled = './assets/star-filled.png';
    const starEmpty = './assets/star-empty.png';
    const starHalf = './assets/star-half.png';

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

    function setReviewRatingElement(rating, containerId) {
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

        DOMModule.actualFaceStatusCodeSrc = roundedRating; // Actualiza la variable global
        return faceSrc;
    }

    return {
        setReviewRatingElement,
        setFaceImage,
        starElements,
        starCountElements
    };
})();

const PRODUCT_URL = 'http://localhost:3000/products';
const DEALS_URL = 'http://localhost:3000/deals';

// Módulo para manejar la comunicación con el servidor y la lógica de la aplicación
const ServerModule = (() => {
    async function getProductDeals(title) {
        try {
            const response = await fetch(`${DEALS_URL}/api/title`, {
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

            return deal;
        } catch (err) {
            console.error('Error fetching product deals:', err);
            return null;
        }
    }

    async function getHighlightedText() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get("highlightedText", (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                } else {
                    const highlightedText = result.highlightedText || "";
                    resolve(highlightedText);
                }
            });
        });
    }

    return {
        getProductDeals,
        getHighlightedText
    };
})();

// Módulo principal para inicializar la aplicación
const App = (() => {
    document.addEventListener('DOMContentLoaded', async () => {
        const textElement = document.querySelector("#current-text");
        const ratingElement = document.querySelector('#rating');
        const numReviewsElement = document.querySelector('#numReviews');
        const reviewerNotesElement = document.querySelector('#reviewerNotes');
        const logoReviewElement = document.querySelector('#logo');
        const faceElement = document.querySelector('#face');
        const whatIsElement = document.querySelector('#what-is');
        const results = document.querySelector('#results');

        try {
            const highlightedText = await ServerModule.getHighlightedText();

            textElement.textContent = highlightedText || "No se seleccionó nada";

            if (highlightedText.length > 0) {
                const response = await fetch(`${PRODUCT_URL}/g2`, {
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

                    faceElement.src = ReviewModule.setFaceImage(result.rating);
                    logoReviewElement.src = result.product_logo || '';
                    numReviewsElement.textContent = result.rating;
                    ReviewModule.setReviewRatingElement(result.rating, "#reviews");
                    reviewerNotesElement.textContent = `${result.reviews || "We couldn't find"} reviews`;
                    whatIsElement.textContent = result.what_is || '';

                    // Ofertas
                    if (result.product_name) {
                        const deal = await ServerModule.getProductDeals(result.product_name);

                        if (deal) {
                            const prodDealsTitle = document.querySelector('#product_deals_title');
                            const prodDealsDiscount = document.querySelector('#product_deals_discount');
                            const prodDealsClaimOfferDetails = document.querySelector('#product_deals_claim_details');
                            const prodDealsOfferDetails = document.querySelector('#product_deals_offer_details');

                            prodDealsTitle.textContent = deal.prod_title || '';
                            prodDealsDiscount.textContent = deal.prod_discount || '';
                            prodDealsClaimOfferDetails.textContent = deal.prod_claim_offer_details || '';
                            prodDealsOfferDetails.textContent = deal.prod_offer_details || '';

                            if (result.pricing_plans !== null && result.pricing_plans.length > 0) {
                                const prodDealsPricingPlans = document.querySelector('#product_pricing_plans');

                                result.pricing_plans.forEach(plan => {
                                    const pricingPlan = document.createElement('div');
                                    pricingPlan.classList.add('plan');

                                    const planName = document.createElement('h3');
                                    planName.textContent = plan.plan_name;

                                    const planPrice = document.createElement('p');
                                    planPrice.textContent = plan.plan_price;

                                    const planDesc = document.createElement('p');
                                    planDesc.textContent = plan.plan_desc;

                                    const planFeatures = document.createElement('ul');
                                    planFeatures.classList.add('features');

                                    plan.plan_features.forEach(feature => {
                                        const planFeature = document.createElement('li');
                                        planFeature.textContent = feature;
                                        planFeatures.appendChild(planFeature);
                                    });

                                    pricingPlan.appendChild(planName);
                                    pricingPlan.appendChild(planPrice);
                                    pricingPlan.appendChild(planDesc);
                                    pricingPlan.appendChild(planFeatures);

                                    prodDealsPricingPlans.appendChild(pricingPlan);
                                });
                            }
                        }
                    }

                } else {
                    ratingElement.textContent = 'No reviews available';
                    numReviewsElement.textContent = '';
                    whatIsElement.textContent = '';
                    reviewerNotesElement.textContent = '';
                }
            }
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const seeReviewsBtn = document.getElementById('see-reviews-btn');

        // Traer las reseñas del query buscado
        seeReviewsBtn.addEventListener('click', async () => {
            try {
                const highlightedText = await ServerModule.getHighlightedText();

                const response = await fetch(`${PRODUCT_URL}/g2`, {
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
                    reviews = JSON.parse(reviews);
                }

                if (reviews && reviews.length) {
                    let best = {}, worst = {};
                    let min = Infinity, max = -Infinity;

                    reviews.forEach(review => {
                        if (review.review_rating > max) {
                            max = review.review_rating;
                            best = review;
                        }
                        if (review.review_rating < min) {
                            min = review.review_rating;
                            worst = review;
                        }
                    });

                    if (best.review_title !== 'NOT GIVEN' || worst.review_title !== 'NOT GIVEN') {
                        document.querySelector('#best-review_title').textContent = best.review_title;
                        document.querySelector('#worst-review_title').textContent = worst.review_title;
                    }

                    ReviewModule.setReviewRatingElement(best.review_rating, '#best-review_rating');
                    document.querySelector('#best-review_rating').textContent = best.review_rating;
                    document.querySelector('#best-review_content').textContent = best.review_content;
                    document.querySelector('#best-review_date').textContent = best.publish_date;
                    document.querySelector('#best-reviewer_name').textContent = best.reviewer_name;
                    document.querySelector('#best-reviewer_company-size').textContent = best.reviewer_company_size;

                    ReviewModule.setReviewRatingElement(worst.review_rating, '#worst-review_rating');
                    document.querySelector('#worst-review_rating').textContent = worst.review_rating;
                    document.querySelector('#worst-review_content').textContent = worst.review_content;
                    document.querySelector('#worst-review_date').textContent = worst.publish_date;
                    document.querySelector('#worst-reviewer_name').textContent = worst.reviewer_name;
                    document.querySelector('#worst-reviewer_company-size').textContent = worst.reviewer_company_size;
                } else {
                    bestReviewElement.textContent = "No good reviews available";
                    worstReviewElement.textContent = "No bad reviews available";
                }

                if (result.star_distribution) {
                    const starDistribution = result.star_distribution;
                    const maxReviews = Math.max(...Object.values(starDistribution));

                    for (let i = 1; i <= 5; i++) {
                        const count = starDistribution[i] || 0;
                        ReviewModule.starElements[i].value = (count / maxReviews) * 100;
                        ReviewModule.starCountElements[i].textContent = count;
                    }
                } else {
                    for (let i = 1; i <= 5; i++) {
                        ReviewModule.starElements[i].value = 0;
                        ReviewModule.starCountElements[i].textContent = '';
                    }
                }

            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        });
    });

    // Llevar a la vista de las reseñas
    document.addEventListener('DOMContentLoaded', function () {
        var seeReviewsBtn = document.getElementById('see-reviews-btn');

        if (seeReviewsBtn) {
            seeReviewsBtn.addEventListener('click', function () {
                fetch(chrome.runtime.getURL('reviews.html'))
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch reviews.html');
                        }
                        return response.text();
                    })
                    .then(data => {
                        document.getElementById('results').innerHTML = data;

                        const productReviews = document.querySelector('#product-reviews');
                        if (productReviews) {
                            productReviews.style.display = 'block';

                            setTimeout(() => {
                                productReviews.style.opacity = 1;
                            }, 1000);
                        } else {
                            console.error('Element #product-reviews not found in reviews.html');
                        }
                    })
                    .catch(error => console.error('Error fetching reviews.html:', error));
            });
        } else {
            console.error('see-reviews-btn element not found');
        }
    });

    return {};
})();

// Módulo para manejar el cambio de modo claro/oscuro
const DarkModeModule = (() => {
    document.addEventListener('DOMContentLoaded', () => {
        const switchBtn = document.querySelector('#toggle-mode');
        const body = document.body;

        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (prefersDarkMode) {
            body.classList.add('dark-mode');
        }

        switchBtn.addEventListener('click', () => {
            const toggleIcon = document.querySelector('#extension-icon');
            const toggleFace = document.querySelector('#face');
            const isDarkMode = body.classList.toggle("dark-mode");

            toggleIcon.src = isDarkMode ? '/assets/logo/light-logo-70.png' : '/assets/logo/dark-logo-70.png';
            toggleFace.src = `/assets/faces/${DOMModule.actualFaceStatusCodeSrc}${isDarkMode ? 'w' : ''}.png`;
        });
    });

    return {};
})();


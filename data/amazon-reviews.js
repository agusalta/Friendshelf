import { chromium } from 'playwright';

const URL = 'https://www.amazon.com';
const SEARCH = '/s?k=';

export default async function searchAmazonReviews(query) {
    let producto = query.split(" ").join("+");
    console.log('Searching ' + URL + SEARCH + producto);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(URL + SEARCH + producto);
        await page.waitForSelector('a.a-link-normal', { timeout: 60000 });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'A1.png' });

        const enlaces = await page.$$('a.a-link-normal');

        if (enlaces.length > 0) {
            const enlaceHref = await enlaces[0].getAttribute('href');
            console.log('URL del enlace:', URL + enlaceHref);
            await enlaces[0].click();

            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'A2.png' });

            await page.waitForSelector('#cm-cr-dp-review-list', { timeout: 60000 });

            const reviews = await page.$$('#cm-cr-dp-review-list div.a-section');
            const formattedReviews = [];

            for (const review of reviews.slice(0, 5)) {
                const reviewText = await review.$eval('span[data-hook="review-body"] > div[data-hook="review-collapsed"] > span.cr-original-review-content', node => node.innerText.trim());

                const rating = await review.$eval('i.review-rating span.a-icon-alt', node => node.textContent.trim());
                const reviewDate = await review.$eval('span.review-date', node => node.textContent.trim());

                formattedReviews.push({
                    review: rating,
                    text: reviewText,
                    date: reviewDate
                });
            }

            await browser.close();
            return formattedReviews;
        } else {
            console.log("No se encontró el enlace");
        }
    } catch (err) {
        console.log(err);
    } finally {
        await browser.close();
    }

    return 'xd';
}

searchAmazonReviews("Camiseta blanca").then(res => console.log(res));

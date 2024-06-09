import { chromium } from 'playwright';

export default async function searchGoogleReviews(query) {
    let producto = query.split(" ").join("+");
    console.log("Buscando query https://www.google.com/search?q=" + producto);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto('https://www.google.com/search?q=' + producto);
        await page.waitForSelector('a.LatpMc', { timeout: 50000 });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '1.png' });

        await page.click('a.LatpMc');

        await page.waitForSelector('a.xCpuod', { timeout: 50000 });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '2.png' });

        await page.click('a.xCpuod');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '3.png' });
        await page.waitForTimeout(2000);

        const res = await page.evaluate(() => {
            const reviewElement = document.querySelector('div._-pK');

            if (!reviewElement) {
                return "No se encontraron reseñas de este producto.";
            }

            const ratingElement = reviewElement.querySelector('span._-hT');
            const rating = ratingElement ? ratingElement.textContent : '';

            const numReviewsElement = reviewElement.querySelector('span._-bC');
            const numReviews = numReviewsElement ? numReviewsElement.textContent : '';

            const reviewerNotesElement = reviewElement.querySelector('span._-pL');
            const reviewerNotes = reviewerNotesElement ? reviewerNotesElement.textContent : '';

            return {
                logo: '/assets/google-reviews-logo.png',
                rating: rating.trim(),
                numReviews: numReviews.trim(),
                reviewerNotes: reviewerNotes.trim()
            };
        });

        await browser.close();

        return res;
    } catch (error) {
        console.error('Error:', error);
        await browser.close();
    }
}
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.RAPIDAPI_KEY;
const host = process.env.RAPIDAPI_HOST;

const options = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': host,
        'Content-Type': 'application/json'
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function fetchData(query, retries = 3, backoff = 3000) {
    const formattedQuery = encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'));
    const url = `https://${host}/g2-products?product=${formattedQuery}`;

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            if (response.status === 429 && retries > 0) {
                console.log(`Rate limit hit, retrying in ${backoff / 1000} seconds...`);
                await sleep(backoff);
                return fetchData(query, retries - 1, backoff * 2); // exponential backoff
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Received non-JSON response');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('Failed to fetch data: ' + error.message);
    }
}

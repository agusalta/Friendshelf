import fetch from 'node-fetch';

// const url = `https://g2-data-api.p.rapidapi.com/g2-products/?product=${product}`;
const options = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': '59d326df84msh63c5177a29fcfc8p16e4b6jsn6e68d682dc60',
        'x-rapidapi-host': 'g2-data-api.p.rapidapi.com'
    }
};

export default async function fetchData(query) {
    try {
        const response = await fetch(`https://g2-data-api.p.rapidapi.com/g2-products/?product=${query}`, options);
        return await response.json();
    } catch (error) {
        throw new Error('Failed to fetch data: ' + error.message);
    }
}

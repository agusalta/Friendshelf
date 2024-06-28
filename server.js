import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import searchGoogleReviews from './data/google-reviews.js'
import fetchData from './data/g2.js';
import { insertProperties, checkIfProductExists, getAllProducts } from "./mongoDB/products.js";
import { getDeal } from './mongoDB/deals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

app.use(bodyParser.json());

let urlGuardada = '';
let textGuardado = '';

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/api/g2', async (req, res) => {
    const { query } = req.body;
    console.log("Query received:", query);

    try {
        // Chequear si ya tenemos los datos en la base de datos
        const existingData = await checkIfProductExists("extension_reviews", "products", query);

        if (existingData) {
            console.log(`Data for query "${query}" already exists in the database.`);
            res.json(existingData);
        } else {
            // Si no tenemos los datos, se hace la solicitud a la API externa
            const result = await fetchData(query);

            if (result.product_id !== null && result.product_id !== undefined) {
                await insertProperties("extension_reviews", "products", result);
                res.json(result);
            } else {
                console.log(`No valid data found for query "${query}". Skipping database insertion.`);
                res.status(400).json({ error: 'No valid data found' });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

app.post('/api/title', async (req, res) => {
    const { title } = req.body;
    console.log("Deal received:", title);
    try {
        const deal = await getDeal(title);

        if (deal) {
            res.json(deal);
        } else {
            res.status(404).json({ error: 'Deal not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await getAllProducts("extension_reviews", "products");
        res.json(products);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/products/title', async (req, res) => {
    try {
        const products = await getAllProducts('extension_reviews', 'products');
        const productNames = products.map((product) => product.product_name);
        res.json(productNames);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});

app.post('/texto/guardar-texto', (req, res) => {
    try {
        const { text } = req.body

        if (text) {
            textGuardado = text;
            console.log('Text successfully saved:', textGuardado);
        }

    } catch (err) {
        res.status(400).send('Text not received');
        throw err;
    }
})

app.post('/review/buscar-query', async (req, res) => {
    const { query } = req.body;
    console.log("Query received:", query);

    if (!query) {
        return res.status(400).json({ error: 'No query provided' });
    }

    try {
        const result = await searchGoogleReviews(query);
        console.log("Resultado:", result);
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error retrieving reviews' });
    }
});

app.get('/ultima-url', (req, res) => {
    if (urlGuardada.length > 0) {
        lastUrl = urlGuardada;
        res.status(200).json({ url: urlGuardada });
    } else {
        res.status(404).send('No URL saved');
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});


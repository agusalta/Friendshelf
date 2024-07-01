import express from 'express';
import fetchData from '../data/g2.js';
import { insertProperties, checkIfProductExists, getAllProducts, getProductByTitle, updateProduct } from "../database/products.js";

const router = express.Router();

let savedText = '';

router.post('/g2', async (req, res, next) => {
    const { query } = req.body;
    console.log("Query received:", query);

    try {
        // Chequear si ya tenemos los datos en la base de datos
        let existingData = await checkIfProductExists("extension_reviews", "products", query);

        if (existingData) {
            // Verificar si el producto existente en la base de datos tiene initial_reviews
            if (existingData.initial_reviews === undefined || existingData.initial_reviews === null) {
                // Si no tiene initial_reviews, actualizar con el resultado de la API si lo tiene
                const result = await fetchData(query);

                if (result.product_id !== null && result.product_id !== undefined && result.initial_reviews !== undefined && result.initial_reviews !== null) {
                    // Actualizar el campo initial_reviews en el documento existente
                    console.log("- Gasta peticion :(");
                    await updateProduct("extension_reviews", "products", query, { $set: { initial_reviews: result.initial_reviews } });
                    // Actualizar existingData con los nuevos initial_reviews
                    existingData.initial_reviews = result.initial_reviews;
                }
            }

            res.json(existingData);
        } else {
            // Si no tenemos los datos, se hace la solicitud a la API externa
            const result = await fetchData(query);
            console.log("- Gasta peticion :(");
            if (result.product_id !== null && result.product_id !== undefined) {
                await insertProperties("extension_reviews", "products", result);
                res.json(result);
            } else {
                console.log(`No valid data found for query "${query}". Skipping database insertion.`);
                res.status(400).json({ error: 'No valid data found' });
            }
        }
    } catch (error) {
        next(error);
    }
});

// GET ALL PRODUCTS
router.get('/', async (req, res, next) => {
    try {
        const products = await getAllProducts("extension_reviews", "products");
        res.json(products);
    } catch (error) {
        next(error);
    }
});

// GET A LIST OF ALL PRODUCTS NAMES
router.get('/title', async (req, res, next) => {
    try {
        const products = await getAllProducts('extension_reviews', 'products');
        const productNames = products.map((product) => product.product_name);
        res.json(productNames);
    } catch (error) {
        next(error);
    }
});

// GET A PRODUCT BY NAME
router.get('/:name', async (req, res, next) => {
    try {
        const { name } = req.params;
        const product = await getProductByTitle(name);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
});

// POST A TEXT
router.post('/guardar-texto', (req, res, next) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text not received' });
        }

        savedText = text;
        console.log('Text successfully saved:', savedText);
        res.status(200).send('Text successfully saved');
    } catch (err) {
        next(err);
    }
});

export default router;

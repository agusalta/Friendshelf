import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import productsRouter from './src/routes/products.js';
import dealsRouter from './src/routes/deals.js';
import { generateExtensionToken } from './src/middleware/apiKeyAuth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use('/products', productsRouter);
app.use('/deals', dealsRouter);

app.get('/api-key', (req, res) => {
    const token = generateExtensionToken();

    if (token) {
        res.json({ token });
    } else {
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

let URL = '';

app.post('/url', (req, res) => {
    try {
        const { url } = req.body;

        if (url) {
            URL = url;
            console.log('URL successfully saved:', URL);
            res.status(200).send('URL successfully saved');
        } else {
            res.status(400).send('URL not received');
        }
    } catch (err) {
        console.error('Error saving URL:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/url', (req, res) => {
    try {
        if (URL) {
            res.status(200).send(URL);
        } else {
            res.status(404).send('No URL saved');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

export default app;

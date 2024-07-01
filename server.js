import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import productsRouter from './src/routes/products.js';
import dealsRouter from './src/routes/deals.js';
import { apiKeyAuth, generateExtensionToken } from './src/middleware/apiKeyAuth.js';

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

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

export default app;

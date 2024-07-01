import fs from 'fs';
import path from 'path';
import { insertProperties } from './products.js';

const jsonFilePath = path.join(process.cwd(), 'data.json');

fs.readFile(jsonFilePath, 'utf8', async (err, data) => {
    if (err) {
        console.error('Error reading the JSON file:', err);
        return;
    }

    try {
        const jsonData = JSON.parse(data);

        const dbName = 'extension_reviews';
        const collectionName = 'products';

        for (const item of jsonData) {
            await insertProperties(dbName, collectionName, item);
        }

        console.log('Data inserted successfully!');
    } catch (parseError) {
        console.error('Error parsing the JSON file:', parseError);
    }
});

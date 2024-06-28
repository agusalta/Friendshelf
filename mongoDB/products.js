import getConnection from "./connection.js";

// const dbName = "extension_reviews";
// const collectionName = "products";

export async function insertProperties(db, col, jsonData) {
    try {
        const client = await getConnection();
        const database = client.db(db);
        const collection = database.collection(col);

        const { product_id, product_description, pricing_plans, product_name, product_logo, rating, reviews, what_is, star_distribution, initial_reviews } = jsonData;

        // Verificar si el ID ya existe en la base de datos
        const existingDocument = await collection.findOne({ product_id });

        if (existingDocument) {
            console.log(`Document with ID ${product_id} already exists in the database.`);
            return existingDocument;
        }

        const document = { product_id, product_description, pricing_plans, product_name, star_distribution, initial_reviews, product_logo, rating, reviews, what_is };
        const result = await collection.insertOne(document);
        console.log(`Inserted document with ID: ${result.insertedId}`);

        return result;
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
}

export async function checkIfProductExists(db, col, productName) {
    try {
        const client = await getConnection();
        const database = client.db(db);
        const collection = database.collection(col);
        const existingDocument = await collection.findOne({ product_name: productName });
        return existingDocument;
    } catch (error) {
        console.error('Error checking if product exists:', error);
        throw error;
    }
}

export async function getAllProducts(db, col) {
    let client;

    try {
        client = await getConnection();
        const database = client.db(db);
        const collection = database.collection(col);
        const products = await collection.find({}).toArray();
        return products;

    } catch (error) {
        console.error('Error getting all products:', error);
        throw error;
    }
}

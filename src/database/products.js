import getConnection from "./connection.js";

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

        // Buscar con una expresión regular insensible a mayúsculas y minúsculas
        const existingDocument = await collection.findOne({ product_name: { $regex: new RegExp(`^${productName}$`, 'i') } });

        return existingDocument;
    } catch (error) {
        console.error('Error checking if product exists:', error);
        throw error;
    }
}

export async function updateProduct(dbName, collectionName, query, updateData) {
    try {
        const client = await getConnection();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const queryValue = { product_name: query };

        const result = await collection.updateOne(queryValue, updateData);

        if (result.modifiedCount > 0) {
            console.log(`Reviews updated successfully for product: ${JSON.stringify(query)}`);
            return true;
        } else {
            console.log(`No product found for query: ${JSON.stringify(query)}. Nothing updated.`);
            return false;
        }
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

export async function getAllProducts(db, col) {
    try {
        const client = await getConnection();
        const database = client.db(db);
        const collection = database.collection(col);

        const products = await collection.find().toArray();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

export async function getProductByTitle(title) {
    try {
        const client = await getConnection();
        const database = client.db("extension_reviews");
        const collection = database.collection("products");
        const title_cap = title.charAt(0).toUpperCase() + title.slice(1);
        const product = await collection.findOne({ product_name: title_cap });

        if (product) {
            return product;
        } else {
            throw new Error(`No product found with title: ${title}`);
        }

    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
}

export async function updateInitialReviews() {
    try {
        const client = await getConnection();
        const database = client.db("extension_reviews");
        const collection = database.collection("products");

        const productsWithStrings = await collection.find({ initial_reviews: { $type: "string" } }).toArray();

        for (const product of productsWithStrings) {
            try {
                if (typeof product.initial_reviews === "string") {
                    const initialReviewsArray = JSON.parse(product.initial_reviews);

                    await collection.updateOne(
                        { _id: product._id },
                        { $set: { initial_reviews: initialReviewsArray } }
                    );

                    console.log(`Updated initial_reviews for product with _id: ${product._id}`);
                }
            } catch (error) {
                console.error(`Error updating initial_reviews for product with _id ${product._id}:`, error);
                continue;
            }
        }

        console.log("Initial reviews update completed.");
        return true;
    } catch (error) {
        console.error('Error updating initial reviews:', error);
        throw error;
    }
}

import getConnection from "./connection.js";
import { deals } from "../assets/deals/deals-list.js";
export async function getDeal(title) {
    try {
        const client = await getConnection();
        const database = client.db("extension_reviews");
        const collection = database.collection("deals");

        const title_cap = title.charAt(0).toUpperCase() + title.slice(1);
        const deal = await collection.findOne({ prod_title: title_cap });

        if (deal) {
            console.log(JSON.stringify(deal, null, 2))
        } else {
            console.log("Couldn't find the deal for " + title)
        }

        return deal;
    } catch (error) {
        console.error('Error getting deal:', error);
        throw error;
    }
}
export async function insertProperties(db, col, deals) {
    try {
        const client = await getConnection();
        const database = client.db(db);
        const collection = database.collection(col);

        // Asignar un ID a los deals que no lo tengan
        deals.forEach((deal, index) => {
            if (!deal.prod_id) {
                deal.prod_id = index + 1;
            }
        });

        for (const deal of deals) {
            const { prod_id, prod_title, prod_reviews, prod_discount, prod_claim_offer_details, prod_offer_details } = deal;

            // Verificar si el documento ya existe en la base de datos
            const existingDocument = await collection.findOne({ prod_title });

            if (existingDocument) {
                console.log(`Document with the title ${prod_title} already exists in the database.`);
            } else {
                const document = { prod_id, prod_title, prod_reviews, prod_discount, prod_claim_offer_details, prod_offer_details };
                const result = await collection.insertOne(document);
                // console.log(`Inserted document with ID: ${result.insertedId}`);
            }
        }

        console.log('All documents inserted successfully')
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
}

// insertProperties("extension_reviews", "deals", deals).catch(error => console.error('Error inserting properties:', error));
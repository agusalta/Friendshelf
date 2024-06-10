// import 'dotenv/config';
import { MongoClient } from "mongodb";

const uri = "mongodb+srv://agusalta:AkHpObFqInKFJUH7@extensionreviews.8bzy79l.mongodb.net/?retryWrites=true&w=majority&appName=ExtensionReviews"
// const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);
let instance = null;

const getConnection = async () => {
    if (instance == null) {
        try {
            await client.connect();
            instance = client;
        } catch (e) {
            console.log(e.message)
        }
    }

    return instance;
}

export default getConnection;

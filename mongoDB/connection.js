import 'dotenv/config'
import { MongoClient } from "mongodb";
const uri = process.env.MONGO_DB;

const client = new MongoClient(uri);
let instance = null;

const getConnection = async () => {
    if (instance == null) {
        try {
            instance = await new client.connect()
        } catch (e) {
            console.log(e.message)
        }
    }

    return instance;
}

export default getConnection;
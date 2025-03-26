const dotenv = require("dotenv");
dotenv.config({path: '../.env'})
const { MongoClient } = require("mongodb");

const URI = process.env.MONGO_URI

let client = null;
let dbConnection = null;

async function connectToDatabase() {
    try {
        if (client) {
            console.log("Używam istniejącego połączenia z MongoDB");
            return client;
        }

        client = new MongoClient(URI);

        await client.connect();

        await client.db("admin").command({ ping: 1 });
        console.log("Pomyślnie połączono z MongoDB! Baza danych jest dostępna.");

        return client;
    } catch (error) {
        console.error("Błąd podczas łączenia z MongoDB:", error);
        client = null;
        throw error;
    }
}
connectToDatabase()

module.exports = { connectToDatabase };
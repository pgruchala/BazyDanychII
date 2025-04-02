path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const { MongoClient } = require("mongodb");

const URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;

let db = null;

async function connectToDatabase() {
  try {
    const client = new MongoClient(URI);
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db(DB_NAME);
    return db;
  } catch (error) {
    console.error("Could not connect to MongoDB", error);
    process.exit(1);
  }
}
function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}

module.exports = { connectToDatabase, getDb };

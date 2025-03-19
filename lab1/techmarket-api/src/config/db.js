const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: "postgres",
  password: "pgdb",
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const initDb = async () => {
  const initScript = fs
    .readFileSync(path.join(__dirname, "init.sql"))
    .toString();
  try {
    await pool.query(initScript);
    console.log("Baza danych została zainicjalizowana.");
  } catch (err) {
    console.error("Błąd inicjalizacji bazy danych:", err);
  }
};

initDb();

module.exports = pool;

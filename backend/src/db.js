const { Pool } = require("pg");
const { verifiedPostgresUrl } = require("./env");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Import src/env.js before opening the database."
  );
}

const pool = new Pool({
  connectionString: verifiedPostgresUrl(process.env.DATABASE_URL),
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
  console.error("Unexpected database pool error:", error.message);
});

module.exports = pool;

require("./env");

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { required, verifiedPostgresUrl } = require("./env");

async function createTables() {
  const client = new Client({
    connectionString: verifiedPostgresUrl(required("DATABASE_URL_UNPOOLED")),
  });

  try {
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

    await client.connect();
    await client.query(schema);
    console.log("Database tables created successfully.");
  } catch (error) {
    console.error("Failed to create tables:", error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

createTables();

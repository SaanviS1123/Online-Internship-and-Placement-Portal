
const fs = require("fs");
const path = require("path");
const pool = require("./db");

async function createTables() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await pool.query(schema);

    console.log("Users table created successfully.");
  } catch (error) {
    console.error("Failed to create tables:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

createTables();

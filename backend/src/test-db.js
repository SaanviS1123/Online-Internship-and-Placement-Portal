
require("./env");

const pool = require("./db");

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    console.log("Neon database connected successfully!");
    console.log("Database time:", result.rows[0].current_time);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  } finally {
    await pool.end();
  }
}

testConnection();

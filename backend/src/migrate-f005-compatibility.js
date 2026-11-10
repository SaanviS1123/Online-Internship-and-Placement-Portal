
require("./env");

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { required, verifiedPostgresUrl } = require("./env");

async function migrate() {
  const client = new Client({
    connectionString: verifiedPostgresUrl(
      required("DATABASE_URL_UNPOOLED")
    ),
  });

  try {
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "006_preserve_legacy_profile_data.sql"
    );

    const migration = fs.readFileSync(migrationPath, "utf8");

    await client.connect();
    await client.query("BEGIN");
    await client.query(migration);
    await client.query("COMMIT");

    console.log(
      "F-005 legacy profile compatibility migration completed successfully."
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("F-005 compatibility migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

migrate();

const path = require("path");
const dotenv = require("dotenv");

const backendRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(backendRoot, "..");

// Neon env pull writes connection strings to the repo .env.local.
// Application secrets stay in backend/.env. The first file wins.
dotenv.config({
  quiet: true,
  path: [
    path.join(repoRoot, ".env.local"),
    path.join(backendRoot, ".env"),
  ],
});

function required(name) {
  const value = process.env[name];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required environment variable ${name}.`);
  }

  return value;
}

function verifiedPostgresUrl(connectionString) {
  const url = new URL(connectionString);
  url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}

module.exports = { required, verifiedPostgresUrl };

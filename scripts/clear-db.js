#!/usr/bin/env node
// scripts/clear-db.js
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.resolve(".lefthook/cache/links.db");

if (!fs.existsSync(DB_PATH)) {
    console.log("ℹ️  DB does not exist — nothing to clear.");
    process.exit(0);
}

try {
    const db = new Database(DB_PATH);
    db.exec(`
    DELETE FROM files;
    DELETE FROM packages;
    VACUUM;
  `);
    db.close();

    const stats = fs.statSync(DB_PATH);
    console.log(`✅ Database cleared (size now ${(stats.size / 1024).toFixed(1)} KB)`);
} catch (err) {
    console.error("❌ Failed to clear DB:", err.message);
    process.exit(1);
}

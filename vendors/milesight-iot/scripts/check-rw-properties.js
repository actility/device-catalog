#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../../..");
const csvPath = path.join(repoRoot, "mappings", "msight-mapping.csv");
const driversRoot = path.join(repoRoot, "vendors", "milesight-iot", "drivers");

function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];

        if (inQuotes) {
            if (ch === '"') {
                if (text[i + 1] === '"') {
                    cell += '"';
                    i += 1;
                } else {
                    inQuotes = false;
                }
            } else {
                cell += ch;
            }
            continue;
        }

        if (ch === '"') {
            inQuotes = true;
        } else if (ch === ",") {
            row.push(cell);
            cell = "";
        } else if (ch === "\n") {
            row.push(cell);
            rows.push(row);
            row = [];
            cell = "";
        } else if (ch !== "\r") {
            cell += ch;
        }
    }

    if (cell.length > 0 || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }

    return rows;
}

function getRwIds(rows) {
    const sectionIdx = rows.findIndex((r) => (r[0] || "").trim() === "##objects");
    if (sectionIdx < 0 || sectionIdx + 1 >= rows.length) {
        throw new Error("Could not find ##objects section in mappings/msight-mapping.csv");
    }

    const header = rows[sectionIdx + 1].map((h) => h.trim());
    const idIdx = header.indexOf("id");
    const accessModeIdx = header.indexOf("access_mode");

    if (idIdx < 0 || accessModeIdx < 0) {
        throw new Error("Objects header must contain id and access_mode columns");
    }

    const ids = new Set();
    for (let i = sectionIdx + 2; i < rows.length; i += 1) {
        const row = rows[i];
        const firstCell = (row[0] || "").trim();
        if (firstCell.startsWith("##")) {
            break;
        }
        if (!firstCell) {
            continue;
        }

        const accessMode = (row[accessModeIdx] || "").trim();
        const id = (row[idIdx] || "").trim();
        if (accessMode === "RW" && id) {
            ids.add(id);
        }
    }

    return Array.from(ids).sort();
}

function getDriverFiles(root) {
    return fs
        .readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(root, entry.name, "index.js"))
        .filter((file) => fs.existsSync(file));
}

function findMissingIds(ids, files) {
    const fileContents = files.map((file) => ({
        file,
        content: fs.readFileSync(file, "utf8"),
    }));

    const missing = [];
    const foundIn = {};

    for (const id of ids) {
        const matchedFiles = fileContents
            .filter(({ content }) => content.includes(id))
            .map(({ file }) => path.relative(repoRoot, file));

        if (matchedFiles.length === 0) {
            missing.push(id);
        } else {
            foundIn[id] = matchedFiles;
        }
    }

    return { missing, foundIn };
}

function main() {
    const csvText = fs.readFileSync(csvPath, "utf8");
    const rows = parseCsv(csvText);
    const rwIds = getRwIds(rows);
    const driverFiles = getDriverFiles(driversRoot);
    const { missing } = findMissingIds(rwIds, driverFiles);

    console.log(`RW ids in mapping: ${rwIds.length}`);
    console.log(`Milesight drivers scanned: ${driverFiles.length}`);

    if (missing.length === 0) {
        console.log("OK: every RW id is present in at least one driver index.js");
        process.exit(0);
    }

    console.log(`MISSING (${missing.length}):`);
    for (const id of missing) {
        console.log(`- ${id}`);
    }
    process.exit(1);
}

main();

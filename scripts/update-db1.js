#!/usr/bin/env node
// Updates your SQLite mapping using staged files (pre-commit) or a diff (pre-push)

const fs = require("fs");
const path = require("path");
const {execSync} = require("child_process");
const Database = require("better-sqlite3");

const ROOT = process.cwd();
const DB_PATH = path.join(ROOT, ".lefthook", "cache", "links.db");

function ensureDb() {
    fs.mkdirSync(path.dirname(DB_PATH), {recursive: true});
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
        CREATE TABLE IF NOT EXISTS packages (
            id INTEGER PRIMARY KEY,
            path TEXT UNIQUE NOT NULL,
            name TEXT,
            version TEXT,
            last_scan INTEGER
        );
        CREATE TABLE IF NOT EXISTS files (
            path TEXT PRIMARY KEY,
            package_id INTEGER,
            mtime_ms INTEGER NOT NULL,
            FOREIGN KEY (
                package_id
            ) REFERENCES packages (
                id
            )
        );
        CREATE INDEX IF NOT EXISTS idx_files_pkg ON files(package_id);
    `);
    return db;
}

function nearestPackageDir(absFile) {
    let dir = path.dirname(absFile);
    while (dir.startsWith(ROOT)) {
        const pj = path.join(dir, "package.json");
        if (fs.existsSync(pj)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pj, "utf8"));
                if (pkg?.name) return {dir, pkg};
            } catch {
            }
        }
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return null;
}

function getChangedSinceLatestTag() {
    // Example: latest drivers-* or device-profiles-* tag
    let range = "HEAD~1..HEAD";
    try {
        const tag = execSync(
            'git describe --tags --match "drivers-*" --match "device-profiles-*" --abbrev=0',
            {encoding: "utf8"}
        ).trim();
        range = `${tag}..HEAD`;
    } catch {
    }
    const out = execSync(`git diff --name-only --diff-filter=ACM ${range}`, {
        encoding: "utf8",
    }).trim();
    return out ? out.split("\n") : [];
}

function main() {
    const args = process.argv.slice(2);
    let files = [];

    if (args.includes("--from-staged")) {
        // staged files are passed after the flag by Lefthook
        files = args.slice(args.indexOf("--from-staged") + 1).filter((a) => !a.startsWith("-"));
    } else if (args.includes("--since-latest-tag")) {
        files = getChangedSinceLatestTag();
    } else {
        console.log("No mode specified; use --from-staged or --since-latest-tag");
        process.exit(0);
    }
    console.log(files);
    // keep only existing, repo-relative paths
    files = files
        .map((f) => f.trim())
        .filter(Boolean)
        .filter((f) => fs.existsSync(path.join(ROOT, f)));
    console.log(files)
    if (!files.length) {
        console.log("No files to index.");
        return;
    }

    // (optional) narrow scope
    // files = files.filter((f) => f.includes("vendors/"));

    const db = ensureDb();

    const upsertPkg = db.prepare(`
        INSERT INTO packages(path, name, version, last_scan)
        VALUES (@path, @name, @version, @last_scan) ON CONFLICT(path) DO
        UPDATE SET
            name=excluded.name, version=excluded.version, last_scan=excluded.last_scan
            RETURNING id
    `);

    const upsertFile = db.prepare(`
        INSERT INTO files(path, package_id, mtime_ms)
        VALUES (@path, @package_id, @mtime_ms) ON CONFLICT(path) DO
        UPDATE SET
            package_id=excluded.package_id, mtime_ms=excluded.mtime_ms
    `);

    const txn = db.transaction((changed) => {
        for (const rel of changed) {
            const abs = path.join(ROOT, rel);
            if(rel === "") continue;
            const info = nearestPackageDir(abs);
            if (!info) continue;

            const pkgDirRel = path.relative(ROOT, info.dir).replace(/\\/g, "/");
            console.log({pkgDirRel});
            console.log(pkgDirRel.length)
            if (pkgDirRel.length !== 0) {
                const pkgRow = upsertPkg.get({
                    path: pkgDirRel,
                    name: info.pkg.name,
                    version: String(info.pkg.version || ""),
                    last_scan: Date.now(),
                });

                const st = fs.statSync(abs);
                upsertFile.run({
                    path: rel,
                    package_id: pkgRow.id ? pkgRow.id : null,
                    mtime_ms: Math.floor(st.mtimeMs),
                });
            } else {
                const st = fs.statSync(abs);
                upsertFile.run({
                    path: rel,
                    package_id: null,
                    mtime_ms: Math.floor(st.mtimeMs),
                });
            }


        }
    });

    txn(files);
    db.close();
    console.log(`Indexed ${files.length} file(s). DB → ${DB_PATH}`);
}

main();

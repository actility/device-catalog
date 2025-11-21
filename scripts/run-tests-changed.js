#!/usr/bin/env node
/**
 * Runs tests only for changed packages in a JS monorepo (workspaces).
 *
 * Change detection rules:
 *  - Pre-commit:  use staged files (passed by Lefthook).
 *  - Pre-push:    diff since the most recent tag that matches:
 *                  - "drivers-*"
 *                  - "device-profiles-*"
 *                 Fallbacks if no matching tag:
 *                  - diff vs upstream (origin/main or origin/master)
 *                  - last commit range (HEAD~1..HEAD)
 *
 * Works with npm / yarn / pnpm.
 *
 * Usage:
 *   # Pre-commit (lefthook passes {staged_files})
 *   node scripts/run-tests-changed.js --from-staged <files...>
 *
 *   # Pre-push (auto-detects tag)
 *   node scripts/run-tests-changed.js
 */

const { execSync, spawnSync } = require("child_process");
const { existsSync, readFileSync } = require("fs");
const { dirname, join, resolve, sep } = require("path");

const ROOT = resolve(__dirname, "..");

function sh(cmd, opts = {}) {
    return execSync(cmd, {
        stdio: ["ignore", "pipe", "pipe"],
        cwd: ROOT,
        ...opts,
    })
        .toString()
        .trim();
}

function detectPkgManager() {
    if (existsSync(join(ROOT, "pnpm-lock.yaml"))) return "pnpm";
    if (existsSync(join(ROOT, "yarn.lock"))) return "yarn";
    return "npm";
}

/** Return most recent tag matching drivers-* or device-profiles-* (or null) */
function getLastRelevantTag() {
    try {
        const tag = sh(
            'git describe --tags --match "drivers-*" --match "device-profiles-*" --abbrev=0'
        );
        return tag || null;
    } catch {
        return null;
    }
}

/** Compute a good diff range for pre-push */
function getBestDiffRange() {
    // 1) Try tags
    const tag = getLastRelevantTag();
    if (tag) {
        return { range: `${tag}..HEAD`, source: `tag:${tag}` };
    }

    // 2) Try upstream branch base
    try {
        const upstream = sh("git rev-parse --abbrev-ref --symbolic-full-name @{u}");
        const base = sh(`git merge-base HEAD ${upstream}`);
        return { range: `${base}..HEAD`, source: `upstream:${upstream}` };
    } catch {
        // 3) Try common default branches
        for (const remote of ["origin/main", "origin/master"]) {
            try {
                const base = sh(`git merge-base HEAD ${remote}`);
                return { range: `${base}..HEAD`, source: `remote:${remote}` };
            } catch {}
        }
    }

    // 4) Last resort
    return { range: "HEAD~1..HEAD", source: "last-commit" };
}

function listChangedFilesFromRange(range) {
    try {
        const out = sh(`git diff --name-only --diff-filter=ACM ${range}`);
        return out ? out.split("\n").filter(Boolean) : [];
    } catch {
        return [];
    }
}

function findNearestPackageDir(absPath) {
    // Climb up to nearest package.json with "name"
    let dir = dirname(absPath);
    while (dir.length >= ROOT.length) {
        const pkgJsonPath = join(dir, "package.json");
        if (existsSync(pkgJsonPath)) {
            try {
                const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
                if (pkg && pkg.name) return dir;
            } catch {}
        }
        const parent = dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return null;
}

function dedupe(arr) {
    return Array.from(new Set(arr));
}

function runTestsInPackage(pkgDir, pkgManager) {
    const rel = pkgDir.replace(`${ROOT}${sep}`, "");
    console.log(`\n▶️  Running tests in: ${rel}`);

    let cmd, args;
    switch (pkgManager) {
        case "pnpm":
            cmd = "pnpm";
            args = ["--filter", `./${rel}`, "test"];
            break;
        case "yarn": {
            // Yarn: run within the package directory (works for v1 & Berry)
            const shell = process.platform === "win32" ? "cmd" : "bash";
            const runCmd = "yarn test";
            cmd = shell;
            args =
                shell === "cmd"
                    ? ["/c", `cd "${rel}" && ${runCmd}`]
                    : ["-lc", `cd "${rel}" && ${runCmd}`];
            break;
        }
        default: {
            // npm
            const shell = process.platform === "win32" ? "cmd" : "bash";
            const runCmd = "npm test";
            cmd = shell;
            args =
                shell === "cmd"
                    ? ["/c", `cd "${rel}" && ${runCmd}`]
                    : ["-lc", `cd "${rel}" && ${runCmd}`];
        }
    }

    const res = spawnSync(cmd, args, { stdio: "inherit", cwd: ROOT });
    if (res.status !== 0) {
        console.error(`❌ Tests failed in ${rel}`);
        process.exit(res.status ?? 1);
    }
}

function filterExistingFiles(files) {
    return files
        .map((f) => f.trim())
        .filter(Boolean)
        .filter((f) => existsSync(join(ROOT, f)));
}

function main() {
    console.log("test")
    const argv = process.argv.slice(2);
    const fromStaged = argv.includes("--from-staged");

    let changedFiles = [];
    let originInfo = "staged";

    if (fromStaged) {
        // Files come after the flag: --from-staged <file1> <file2> ...
        const idx = argv.indexOf("--from-staged");
        changedFiles = argv.slice(idx + 1).filter((f) => !f.startsWith("-"));
    } else {
        const { range, source } = getBestDiffRange();
        originInfo = source;
        changedFiles = listChangedFilesFromRange(range);
    }

    changedFiles = filterExistingFiles(changedFiles);
    changedFiles = changedFiles.filter((f) => f.includes("vendors/"));

    if (changedFiles.length === 0) {
        console.log(`No changed files detected (source=${originInfo}). Skipping tests.`);
        return;
    }

    const pkgDirs = dedupe(
        changedFiles
            .map((f) => findNearestPackageDir(resolve(ROOT, f)))
            .filter(Boolean)
    );

    if (pkgDirs.length === 0) {
        console.log("No packages detected from changed files. Skipping tests.");
        return;
    }

    const pkgManager = detectPkgManager();
    console.log(`Detected package manager: ${pkgManager}`);
    console.log(`Change source: ${originInfo}`);
    console.log("Packages to test:");
    pkgDirs.forEach((d) =>
        console.log(" - " + d.replace(`${ROOT}${sep}`, ""))
    );

    for (const dir of pkgDirs) {
        runTestsInPackage(dir, pkgManager);
    }

    console.log("\n✅ All changed packages passed tests.");
}

main();

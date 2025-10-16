#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");

/**
 * Recursively find all YAML files with a specific name
 * inside any "vendors" folder, no matter how deep.
 */
async function findYamlFiles(startDir, fileName) {
    const results = [];

    async function searchDirectory(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await searchDirectory(fullPath);
            } else if (
                entry.isFile() &&
                entry.name === fileName &&
                fullPath.split(path.sep).includes("vendors")
            ) {
                results.push(fullPath);
            }
        }
    }

    await searchDirectory(startDir);
    return results;
}

/**
 * Recursively find all .yaml files inside any folder named "profiles"
 * located somewhere under a "vendors" directory.
 */
async function findProfileYamlFiles(startDir) {
    const results = [];

    async function searchDirectory(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await searchDirectory(fullPath);
            } else if (
                entry.isFile() &&
                entry.name.endsWith(".yaml") &&
                fullPath.split(path.sep).includes("vendors") &&
                fullPath.split(path.sep).includes("profiles")
            ) {
                results.push(fullPath);
            }
        }
    }

    await searchDirectory(startDir);
    return results;
}

/**
 * Safely add a key under a YAML section (text-based, minimal change)
 */
async function addKeyUnderSection(filePath, section, key, value = "") {
    let text = await fs.readFile(filePath, "utf8");
    const lines = text.split(/\r?\n/);
    let sectionIndent = null;
    let keyExists = false;
    let inserted = false;

    const newLines = lines.map((line, idx) => {
        // Detect section
        const sectionMatch = line.match(/^(\s*)`?${section}`?\s*:/);
        if (sectionMatch && sectionIndent === null) {
            sectionIndent = sectionMatch[1] + "  "; // two-space indent for new keys
        }

        if (sectionIndent) {
            // Check if key already exists in section
            const keyRegex = new RegExp(`^\\s*${key}\\s*:`);
            if (keyRegex.test(line)) {
                keyExists = true;
            }

            // Insert key right after section header if not yet inserted
            if (!inserted && idx < lines.length - 1) {
                const nextLine = lines[idx + 1];
                const nextLineIndent = nextLine.match(/^(\s*)/)[1];
                if (nextLineIndent.length <= sectionMatch[1].length) {
                    // Next line is outside section
                    if (!keyExists) {
                        inserted = true;
                        return line + "\n" + `${sectionIndent}${key}: ${value}`;
                    }
                }
            }
        }

        return line;
    });

    // If section exists but key not inserted yet, append at end of file
    if (sectionIndent && !keyExists && !inserted) {
        newLines.push(`${sectionIndent}${key}: ${value}`);
    }

    await fs.writeFile(filePath, newLines.join("\n"), "utf8");
    console.log(`✅ Updated ${filePath} — added key '${key}' under section '${section}'`);
}

/**
 * Update model.yaml
 */
/**
 * Update model.yaml
 */
async function updateModelYaml(filePath) {
    let text = await fs.readFile(filePath, "utf8");
    const lines = text.split(/\r?\n/);

    let sectionExists = lines.some((line) => line.match(/^LoRaWANRelay\s*:/));
    if (!sectionExists) {
        // Append the section at the end of the file
        lines.push("");
        lines.push("LoRaWANRelay:");
        lines.push("  canOperateAsARelay: false");
        lines.push("  defaultRelayActivation: false");
        console.log(`🆕 Created new 'LoRaWANRelay' section in ${filePath}`);
    } else {
        // Section exists, just add missing keys
        await addKeyUnderSection(filePath, "LoRaWANRelay", "canOperateAsARelay", "false");
        await addKeyUnderSection(filePath, "LoRaWANRelay", "defaultRelayActivation", "false");
    }

    await fs.writeFile(filePath, lines.join("\n"), "utf8");
}


/**
 * Update profile.yaml
 */
async function updateProfileYaml(filePath) {
    const COMMAND_NAME = "ExtendedNotifyNewEndDeviceReq";
    const COMMAND_VALUE = false;

    let text = await fs.readFile(filePath, "utf8");
    const lines = text.split(/\r?\n/);

    // Find the supportedMACCommands section
    let sectionIndex = lines.findIndex(line => line.match(/^supportedMACCommands\s*:/));
    if (sectionIndex === -1) {
        console.error(`❌ supportedMACCommands not found in ${filePath}`);
        return;
    }

    // Check if the key already exists
    const keyExists = lines.some(line => line.match(new RegExp(`^\\s*${COMMAND_NAME}:`)));
    if (keyExists) {
        console.log(`ℹ️ '${COMMAND_NAME}' already exists in ${filePath}`);
        return;
    }

    // Determine indentation from the next line after section
    let indent = "  "; // default 2 spaces
    if (lines[sectionIndex + 1] && lines[sectionIndex + 1].match(/^(\s+)/)) {
        indent = lines[sectionIndex + 1].match(/^(\s+)/)[1];
    }

    // Find where to insert: after last indented line
    let insertIndex = sectionIndex + 1;
    while (insertIndex < lines.length && lines[insertIndex].match(/^\s+/)) {
        insertIndex++;
    }

    // Insert the new key with proper indentation
    lines.splice(insertIndex, 0, `${indent}${COMMAND_NAME}: ${COMMAND_VALUE}`);
    console.log(`✅ Added '${COMMAND_NAME}' under supportedMACCommands in ${filePath}`);

    await fs.writeFile(filePath, lines.join("\n"), "utf8");
}


const progressLogFile = path.resolve(".yaml_update_progress.json");

/**
 * Load progress log if it exists.
 */
async function loadProgress() {
    try {
        const data = await fs.readFile(progressLogFile, "utf8");
        return JSON.parse(data);
    } catch {
        return { lastModelIndex: 0, lastProfileIndex: 0 };
    }
}

/**
 * Save progress after each file is processed.
 */
async function saveProgress(progress) {
    await fs.writeFile(progressLogFile, JSON.stringify(progress, null, 2), "utf8");
}

/**
 * Main runner
 */

async function main() {
    const startPath = path.resolve(".");
    console.log(`🔍 Scanning vendors/ folders under: ${startPath}`);

    const [modelPaths, profilePaths] = await Promise.all([
        findYamlFiles(startPath, "model.yaml"),
        findProfileYamlFiles(startPath),
    ]);

    console.log(`🧩 Found ${modelPaths.length} model.yaml files`);
    console.log(`🧩 Found ${profilePaths.length} profile.yaml files`);

    // Load previous progress
    const progress = await loadProgress();

    // Process model.yaml files starting from last processed index
    for (let i = progress.lastModelIndex; i < modelPaths.length; i++) {
        await updateModelYaml(modelPaths[i]);
        progress.lastModelIndex = i + 1; // next file to start from
        await saveProgress(progress);
    }

    // Process profile.yaml files starting from last processed index
    for (let i = progress.lastProfileIndex; i < profilePaths.length; i++) {
        await updateProfileYaml(profilePaths[i]);
        progress.lastProfileIndex = i + 1;
        await saveProgress(progress);
    }

    console.log("🎉 All YAML files updated successfully!");
    // Optionally, remove progress log if done
    await fs.remove(progressLogFile);
}

main().catch((err) => console.error("🚨 Fatal error:", err));

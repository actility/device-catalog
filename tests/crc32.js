const fs = require("fs-extra");
const path = require("path");

function makeCrc32Table() {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c >>> 0;
    }
    return table;
}
const CRC32_TABLE = makeCrc32Table();

function crc32Buffer(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
        crc = CRC32_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    crc = (crc ^ 0xFFFFFFFF) >>> 0;
    return crc;
}

function crc32HexFromBuffer(buf) {
    return crc32Buffer(buf).toString(16).padStart(8, "0");
}

function crc32HexFromFile(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const buf = fs.readFileSync(filePath);
    return crc32HexFromBuffer(buf);
}

function sortKeysDeep(value) {
    if (Array.isArray(value)) return value.map(sortKeysDeep);
    if (value && typeof value === "object") {
        const out = {};
        for (const k of Object.keys(value).sort()) out[k] = sortKeysDeep(value[k]);
        return out;
    }
    return value;
}

function crc32HexFromJsonObject(obj, indent = 4) {
    const stable = sortKeysDeep(obj);
    const text = JSON.stringify(stable, null, indent);
    return crc32HexFromBuffer(Buffer.from(text, "utf8"));
}

function resolveMainFile(driverPath) {
    const packageJsonPath = path.join(driverPath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = fs.readJsonSync(packageJsonPath, "utf8");
        if (typeof packageJson.main === "string" && packageJson.main.trim().length > 0) {
            return packageJson.main.replace(/\\/g, "/").replace(/^\.\//, "").trim();
        }
    }

    if (fs.existsSync(path.join(driverPath, "index.js"))) {
        return "index.js";
    }

    if (fs.existsSync(path.join(driverPath, "main.js"))) {
        return "main.js";
    }

    return null;
}

function computeChecksum(driverPath) {
    const mainFile = resolveMainFile(driverPath);
    if (!mainFile) {
        throw new Error(`No driver entry file found in ${driverPath}`);
    }

    const mainPath = path.join(driverPath, mainFile);

    return crc32HexFromFile(mainPath);
}

module.exports = {
    crc32HexFromFile,
    crc32HexFromBuffer,
    crc32HexFromJsonObject,
    computeChecksum,
};
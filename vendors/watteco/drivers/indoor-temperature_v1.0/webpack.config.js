const path = require("path");

module.exports = {
    target: "node",
    mode: "production",
        entry: "./main.js",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "."),
        library: "driver",
    },
};
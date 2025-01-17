const path = require("path");

module.exports = {
    target: "node",
    mode: "production",
    entry: "./clim'o.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "."),
        library: "driver",
    },
};
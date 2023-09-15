const path = require("path");

module.exports = {
    target: "node",
    mode: "production",
    entry: "./indoor_temperature.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "."),
        library: "driver",
    },
};
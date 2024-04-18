const path = require("path");

module.exports = {
    target: "node",
    mode: "production",
    entry: "./remote_temperature_2.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "."),
        library: "driver",
    },
};
const path = require("path");

module.exports = {
    target: "node",
    mode: "production",
    entry: "./pulse_sens'o.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "."),
        library: "driver",
    },
};
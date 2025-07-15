const path = require("path");

module.exports = {
    target: "node",
    mode: "production",
    entry: "./pulse_sens'o_atex.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "."),
        library: "driver",
    },
};
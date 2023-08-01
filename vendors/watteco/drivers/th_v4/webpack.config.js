const path = require("path");

module.exports={
    target: "node",
    mode: "production",
    entry: {
        "bundle":[path.resolve(__dirname,"../standard.js"),
            path.resolve(__dirname,"../decode.js"),
            path.resolve(__dirname,"../batch.js"),
            path.resolve(__dirname,"./th.js"),
        ]
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "."),
        library:{ name:"driver", type:"umd"}



    },
    optimization: {
            minimize: false,

    },
}
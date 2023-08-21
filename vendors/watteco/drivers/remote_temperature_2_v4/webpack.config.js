const path = require("path");

module.exports={
    target: "node",
    mode: "production",
    entry: {
        "bundle.js":[path.resolve(__dirname,'../../codec/standard_minimized.js'),
            path.resolve(__dirname,'../../codec/batch_minimized.js'),
            path.resolve(__dirname,'../../codec/decode_minimized.js'),
            path.resolve(__dirname,"../../captors/remote_temperature_2/remote_temperature_2.js"),
        ]
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "."),
        library:{ name:"driver", type:"umd"}



    },
    optimization: {
        minimizer: [
            (compiler) => {
                const TerserPlugin = require('terser-webpack-plugin');
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            dead_code: true,
                            drop_console: false,
                            drop_debugger: true,
                            keep_classnames: false,
                            keep_fargs: true,
                            keep_fnames: false,
                            keep_infinity: false
                        },
                        mangle: {
                            eval: false,
                            keep_classnames: false,
                            keep_fnames: false,
                            toplevel: false,
                            safari10: false
                        },
                        module: false,
                        sourceMap: false,
                        output: {
                            comments: 'some'
                        }
                    },
                }).apply(compiler);
            },
        ],

    },
}
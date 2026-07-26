var path = require('path');
var webpack = require('webpack');

var commonConfig = {
  mode: 'production',
  optimization: {
    minimize: false,
  },
  output: {
    path: path.resolve(__dirname, './dist'),
  },
};

module.exports = [
  {
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, './'),
      library: 'driver',
      filename: 'main.js',
    },
  },
  {
    ...commonConfig,
    entry: './src/index.js',
    output: {
      ...commonConfig.output,
      library: 'driver',
      filename: 'abeeway-at3-driver.js',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
  },
  {
    ...commonConfig,
    entry: './src/index.esm.js',
    experiments: {
      outputModule: true,
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
    resolve: {
      fallback: {
        buffer: require.resolve('buffer/'),
      },
    },
    output: {
      ...commonConfig.output,
      filename: 'abeeway-at3-driver.mjs',
      module: true,
      library: {
        type: 'module',
      },
    },
  }
];

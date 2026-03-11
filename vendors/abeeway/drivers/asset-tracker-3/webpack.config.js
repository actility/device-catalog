var path = require('path');
var webpack = require('webpack');

var commonConfig = {
  mode: 'production',
  optimization: {
    minimize: false,
  }
};

module.exports = [
  {
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, './'),
      library: 'driver',
      filename: 'main.js',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
  },
  {
    ...commonConfig,
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, './'),
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
      path: path.resolve(__dirname, './'),
      filename: 'abeeway-at3-driver.mjs',
      module: true,
      library: {
        type: 'module',
      },
    },
  }
];

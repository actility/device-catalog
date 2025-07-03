var path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './'),
     library: 'driver',
    filename: 'main.js',
    libraryTarget: 'umd',
    globalObject: 'this'
  }
};



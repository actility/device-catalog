var path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './'),
    filename: 'main.js',
    library: "driver",
  }
};



const path = require('path')

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs'
    }
  }
};

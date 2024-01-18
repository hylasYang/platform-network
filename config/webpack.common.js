const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.js?$/,
        // axios需要降级到es5
        include: [path.resolve(__dirname, './src'), /axios/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-transform-runtime'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'platform-network.js',
    path: path.resolve(__dirname, '../dist'),
    libraryTarget: 'umd',
  },
};

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
   mode: 'development',
   entry: path.resolve(__dirname, 'src/index.js'),
   devtool: 'inline-source-map',
   output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
   },
   devServer: {
      static: './dist',
   },
   module: {
      rules: [
         {
            test: /\.s[ac]ss$/i,
            use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
            ],
         },
         {
            test: /\.html$/i,
            loader: "html-loader",
         },
      ],
   },
   plugins: [
      new HtmlWebpackPlugin({
         filename: 'index.html',
         template: path.resolve(__dirname, 'src/pages/index.html'),
      }),
   ],
};
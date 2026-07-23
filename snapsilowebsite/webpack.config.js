const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/components/Main.jsx',
    output: {
        filename: './src/js/main-bundle.js',
        path: path.resolve(__dirname),
    },
    module: {
        rules: [
            {
                test: /\.(?:js|jsx|mjs|cjs)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "defaults" }]
                        ]
                    }
                }
            }
        ]
    }
};
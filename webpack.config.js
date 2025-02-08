const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        background: './src/background/background.ts',
        desktop: './src/desktop/desktop.tsx',
        in_game: './src/in_game/in_game.tsx'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: '[name].js'
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'public', to: '../' }
            ]
        })
    ]
}; 
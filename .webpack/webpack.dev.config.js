const path = require('path');

module.exports = {
    entry: './src/examples/main.tsx',

    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },

    watch: true,

    devtool: 'eval',

    context: path.resolve(__dirname, './../'),

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                options: {
                    transpileOnly: true
                }
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};
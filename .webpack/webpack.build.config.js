const path = require('path');

module.exports = {
    entry: './src/index.ts',

    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, './../dist')
    },

    context: path.resolve(__dirname, './../'),

    watch: false,

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                options: {
                    configFileName: 'tsconfig.build.json'
                }
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};
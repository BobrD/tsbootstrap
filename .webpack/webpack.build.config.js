const path = require('path');

module.exports = {
    entry: './src/index.ts',

    devtool: 'source-map',

    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, './../dist'),
        libraryTarget: 'umd',
        library: 'bookie-infinity'
    },

    context: path.resolve(__dirname, './../'),

    watch: false,

    externals: {
        react: {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react'
        },
        'react-dom': {
            root: 'ReactDOM',
            commonjs2: 'react-dom',
            commonjs: 'react-dom',
            amd: 'react-dom'
        }
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                options: {
                    configFileName: 'tsconfig.build.json'
                },
                include: [
                    path.resolve(__dirname, "./../src"),
                ],
                exclude: [
                    path.resolve(__dirname, "./../src/examples"),
                ]
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};
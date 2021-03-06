var path = require('path');
var webpack = require('webpack');
var manifest = require('webpack-manifest-plugin');
var fs = require('fs-extra');

//Get the production status
const prod = process.env.NODE_ENV === 'production';

//Get manifest file
var manifest_cache = fs.readJsonSync('manifest.json');
//Generate build ID
manifest_cache.build = Math.floor(Math.random() * 0xffffffffffffffff).toString(32);

var output_path = null;
if (prod === true) {
    //Write build trace
    fs.writeJsonSync('manifest.json', manifest_cache);
    output_path = path.resolve(path.join('../../.build/', manifest_cache.build.toString()));
}
else {
    output_path = path.resolve(path.join('../../.build/', manifest_cache.id.toString()));
}

var manifest_plugin = new manifest({
    fileName: 'plugin.json',
    cache: manifest_cache,
    writeToFileEmit: true
});

var server_config = {
    target: 'node',
    entry: {
        server: './code/server/index.js'
    },
    output: {
        filename: '[name].[chunkhash].js',
        path: output_path
    },
    plugins: [
        manifest_plugin
    ]
};

var client_config = {
    target: 'web',
    entry: {
        client: './code/client/index.js'
    },
    output: {
        filename: '[name].[chunkhash].js',
        path: output_path
    },
    plugins: [
        manifest_plugin
    ],
    resolve: {
        extensions: ['.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    cacheDirectory: false,
                    presets: ['react', 'es2015']
                }
            },
            {
                test: /\.js$/,
                exclude: '/node_modules/',
                enforce: 'pre',
                use: ['eslint-loader']
            },
            {
                test: /\.js$/,
                include: './code/client/',
                query: {
                    presets: ['react','es2015']
                },
                loaders: 'babel-loader'
            },
            {
                test: /\.css$/,
                include: './code/client/',
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[hash:base64:5]'
                        }
                    },
                    {
                        loader: 'postcss-loader'
                    }]
            },
            {
                test: /\.svg$/,
                use: ['svg-inline-loader']
            },
            {
                test: /\.html$/,
                include: './code/client/',
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            minimize: true
                        }
                    }]
            }]
    }
};

module.exports = [ server_config, client_config ];

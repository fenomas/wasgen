
var path = require('path')
var entryPath = path.resolve('.', 'demo.js')
var buildPath = path.resolve('..', 'docs')


module.exports = (env) => ({

    mode: (() => {
        return (env && env.production) ?
            'production' : 'development'
    })(),

    entry: entryPath,
    // resolve: {},
    // performance: {
    //     // default size warnings
    //     maxEntrypointSize: 1.5e6,
    //     maxAssetSize: 1.5e6,
    // },
    output: {
        path: buildPath,
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: buildPath,
        inline: true,
        host: "0.0.0.0",
        stats: "minimal",
    },
})

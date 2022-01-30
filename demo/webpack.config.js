
var path = require('path')
var entryPath = path.resolve('.', 'demo.js')
var buildPath = path.resolve('..', 'docs')


module.exports = (env) => ({

    mode: (() => {
        return (env && env.prod) ?
            'production' : 'development'
    })(),

    entry: entryPath,

    output: {
        path: buildPath,
        filename: 'bundle.js',
    },
    stats: "minimal",
    devServer: {
        static: buildPath,
        host: "0.0.0.0",
    },
})

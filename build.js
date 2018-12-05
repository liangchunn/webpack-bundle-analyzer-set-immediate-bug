const webpack = require('webpack')
const config = require('./webpack.config')

const { argv } = process
const killOnWebpackSuccess = ~argv.indexOf('--kill-on-webpack-success')

const build = () => {
    const compiler = webpack(config)
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                return reject(err)
            }
            console.log("[build] webpack invoked the 'done' hook")
            return resolve(stats)
        })
    })
}

build()
    .then((stats) => {
        console.log('[build] successfully built bundle!')
        console.log('[build] build script done!')
        if (killOnWebpackSuccess) {
            console.log('[build] terminating process due to --kill-on-webpack-success')
            process.exit(0)
        }
    })
    .catch(err => {
        console.log(err)
        process.exit(1)
    })
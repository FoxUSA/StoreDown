process.env.VUE_APP_VERSION = require('./package.json').version// Include package.json version in proccess.env so app can render it. Must be prefixed with `VUE_APP_` per https://cli.vuejs.org/guide/mode-and-env.html#using-env-variables-in-client-side-code

module.exports = {
  publicPath: './',
  configureWebpack: {

  }
}

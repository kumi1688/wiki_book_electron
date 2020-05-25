module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  lintOnSave: false,
  configureWebpack: {
    devServer: {
      watchOptions: {
        ignored: [/node_modules/, /public/],
      }
    }
  },
  chainWebpack: (config) => {
    config.module
      .rule("raw")
      .test(/\.txt$/)
      .use("raw-loader")
      .loader("raw-loader")
      .end();
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {

        "appId": "smart-living-care",
        "productName": "smart-living-care",
        "files": [
          "**/*",
          "public/books/**/*",
          "public/books/**/**/*"

        ]

        // options placed here will be merged with default configuration and passed to electron-builder
      }
    }
  }
}
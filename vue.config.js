module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  lintOnSave: false,
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
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
        ]

        // options placed here will be merged with default configuration and passed to electron-builder
      }
    }
  }
}
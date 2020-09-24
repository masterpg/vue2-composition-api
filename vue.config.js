// ベースURLの設定
const publicPath = process.env.VUE_APP_BASE_URL

// 各エントリーポイントの設定
const pages = {
  index: {
    // entry for the page
    entry: 'src/index.ts',
    // the source template
    template: 'src/index.html',
    // output as dist/index.html
    filename: 'index.html',
    // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
    title: 'vue2-composition-api',
  },
}

// Vue CLI Configuration Reference
// https://cli.vuejs.org/config/
module.exports = {
  pluginOptions: {
    quasar: {
      importStrategy: 'manual',
      rtlSupport: false,
    },
  },
  transpileDependencies: ['quasar'],

  publicPath,

  pages,

  chainWebpack: config => {
    // Vue I18n 単一ファイルコンポーネントの設定
    // http://kazupon.github.io/vue-i18n/guide/sfc.html
    config.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
      .loader('@kazupon/vue-i18n-loader')
      .end()
      .use('yaml')
      .loader('yaml-loader')
      .end()
  },

  devServer: {
    port: 5030,
    host: '0.0.0.0',
    disableHostCheck: true,
  },
}

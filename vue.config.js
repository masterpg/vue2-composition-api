const path = require('path')

// ベースURLの設定
const publicPath = process.env.VUE_APP_BASE_URL ?? ''

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

  // Firebase Hostingでハッシュ付きのファイルを使用すると、
  // Service Workerで不具合が生じ、新しいリソースがキャッシュできなかったり、
  // 画面ロード時にリソースをうまく見つけられずエラーが発生したりする。
  // このためファイル名にハッシュをつけないよう設定している。
  filenameHashing: false,

  pwa: {
    name: 'vue2-composition-api',
    iconPaths: {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/manifest/apple-touch-icon-152x152.png',
      maskIcon: 'img/icons/manifest/safari-pinned-tab.svg',
      msTileImage: 'img/icons/manifest/msapplication-icon-144x144.png',
    },
    // Workbox webpack Plugins
    // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW#GenerateSW
    workboxOptions: {
      // skipWaitingについては以下を参照
      // https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle?hl=ja#updates
      skipWaiting: true,

      // ServiceWorkerインストール時にキャッシュされるファイルを設定
      include: [/\.html$/, /\.js$/, /\.css$/, /^favicon\.ico$/, /^img\/(?:[^/]+\/)*[^/]+\.(?:jpg|jpeg|png|gif|bmp|svg)$/, /^fonts\/(?:[^/]+\/)*[^/]+\.woff2?$/],
      exclude: [/\.map$/],

      // `/`以下のパスで存在しないファイルまたはディレクトリが
      // 指定された場合にindex.htmlへフォールバックするよう設定
      navigateFallback: `${path.join(publicPath, '/index.html')}`,

      // フェッチ時にキャッシュされるパスを設定
      runtimeCaching: [
        {
          urlPattern: /\/api\//,
          handler: 'NetworkFirst',
        },
      ],
    },
  },

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

import '@/styles/app.sass'

import '@/quasar'
import '@/registerServiceWorker'
import AppPage from '@/index.vue'
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
import { createI18n } from '@/i18n'
import router from '@/router'

Vue.config.productionTip = false

Vue.use(VueCompositionApi)

async function init() {
  const i18n = createI18n()
  await i18n.load()

  new Vue({
    router,
    i18n,
    render: h => h(AppPage),
  }).$mount('#app')
}
init()

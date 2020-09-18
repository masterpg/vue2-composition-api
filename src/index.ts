import '@/styles/app.sass'

import '@/quasar'
import '@/registerServiceWorker'
import AppPage from '@/index.vue'
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
import VueI18n from 'vue-i18n'
import { dateTimeFormats } from '@/i18n/date-time-formats'
import router from '@/router'

Vue.config.productionTip = false

Vue.use(VueCompositionApi)
Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'ja',
  dateTimeFormats,
})

new Vue({
  router,
  i18n,
  render: h => h(AppPage),
}).$mount('#app')

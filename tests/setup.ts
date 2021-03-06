import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
import { clearProvidedDependency } from './helper'
import { createI18n } from '@/i18n'
import { quasar } from '@/quasar'
import { setupConfig } from '@/config'
import td from 'testdouble'

//
// Jestの設定
//
jest.setTimeout(25000)

//
// testdoubleの設定
//
// 各テストファイルでtestdoubleをインポートしなくても使用できるようになる
window.td = td

//
// Composition API の設定
//
Vue.use(VueCompositionApi)
require('testdouble-jest')(td, jest)

//
// Quasarの設定
//
quasar.setup()

beforeEach(async () => {
  setupConfig()
  const i18n = createI18n()
  await i18n.load()
})

afterEach(() => {
  clearProvidedDependency()
  td.reset()
})

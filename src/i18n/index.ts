import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'
import { dateTimeFormats } from '@/i18n/date-time-formats'
import { reactive } from '@vue/composition-api'

Vue.use(VueI18n)

//========================================================================
//
//  Interfaces
//
//========================================================================

interface AppI18n {
  /**
   * 対応する言語メッセージファイルをロードします。
   * @param locale ロケール('ja', 'en-US'等)を指定。
   */
  load(locale?: VueI18n.Locale): Promise<void>
  t: VueI18n['t']
  tc: VueI18n['tc']
  te: VueI18n['te']
  d: (value: number | Date, key?: VueI18n.Path, locale?: VueI18n.Locale) => VueI18n.DateTimeFormatResult
  n: VueI18n['n']
  core: VueI18n
}

class LocaleData {
  constructor(locale: VueI18n.Locale)
  constructor(language: string, country: string)
  constructor(locale_or_language: VueI18n.Locale | string, country?: string) {
    if (country) {
      this.language = locale_or_language.toLowerCase()
      this.country = country.toUpperCase()
    } else {
      const array = locale_or_language.split('-')
      this.language = array[0].toLowerCase()
      this.country = array[1].toUpperCase()
    }
    this.locale = `${this.language}-${this.country}`
  }

  language: string

  country: string

  locale: VueI18n.Locale
}

/**
 * アプリケーションでサポートされるロケールです。
 * 配列の並びは重要で、言語(例えば'en')を使用する国('US', 'UK', 'CA', …)が複数ある場合、
 * この言語の配列的に先頭にあるロケールが、言語に対するデフォルトの国となります。
 *
 * @example
 * // この場合、言語'en'に対するデフォルトの国は’US’になります。
 * const SUPPORT_LOCALES = [
 *   new LocaleData('en-US'),
 *   new LocaleData('en-UK'),
 *   new LocaleData('en-CA'),
 * ]
 */
const SUPPORT_LOCALES = [new LocaleData('ja-JP'), new LocaleData('en-US')]

//========================================================================
//
//  Implementation
//
//========================================================================

let appI18n: AppI18n

function createI18n(): AppI18n {
  if (appI18n) return appI18n

  const state = reactive({
    localeData: SUPPORT_LOCALES[0],
    loadedLanguages: [] as string[],
  })

  const vueI18n = new VueI18n({
    silentFallbackWarn: true,
    dateTimeFormats,
  })

  //----------------------------------------------------------------------
  //
  //  Methods
  //
  //----------------------------------------------------------------------

  const load: AppI18n['load'] = async (locale?: VueI18n.Locale) => {
    let localeData: LocaleData
    if (locale && typeof locale === 'string') {
      // 指定されたロケールからロケールデータを作成
      localeData = toLocaleData(locale)
    } else {
      // ロケールデータを取得(ブラウザから)
      localeData = getLocaleDataFromBrowser()
    }

    // 対応する言語メッセージファイルがロードされていない場合、ロードを行う
    const language = localeData.language
    if (state.loadedLanguages.indexOf(language) === -1) {
      vueI18n.setLocaleMessage(language, await loadLanguageFile(language))
    }

    // ロケールデータの設定
    setLocaleData(localeData)
  }

  const t: AppI18n['t'] = (key: VueI18n.Path, ...values: any) => {
    return vueI18n.t(key, values)
  }

  const tc: AppI18n['tc'] = (key: VueI18n.Path, choice?: number, ...values: any) => {
    return vueI18n.tc(key, choice, values)
  }

  const te: AppI18n['te'] = (key: VueI18n.Path, locale?: VueI18n.Locale) => {
    return vueI18n.te(key, locale)
  }

  const d: AppI18n['d'] = (value, key, locale) => {
    // 引数にロケールが指定された場合
    if (locale) {
      // 指定されたロケールからロケールデータを作成
      const localeData = toLocaleData(locale)
      // 'en-US'や'ja-JP'などを設定
      locale = localeData.locale
    }
    // 上記以外の場合
    else {
      // 現在のロケールを設定
      locale = state.localeData.locale
    }

    return vueI18n.d(value, key, locale)
  }

  const n: AppI18n['n'] = (value: number, ...args: any) => {
    return vueI18n.n(value, args)
  }

  //----------------------------------------------------------------------
  //
  //  Internal methods
  //
  //----------------------------------------------------------------------

  /**
   * デフォルトのロケールを設定します。
   */
  function setupDefaultLocale() {
    const localeData = getLocaleDataFromBrowser()
    setLocaleData(localeData)
  }

  /**
   *  アプリケーションにロケールデータの設定を行います。
   * @param localeData
   */
  function setLocaleData(localeData: LocaleData): void {
    vueI18n.locale = localeData.language
    axios.defaults.headers.common['Accept-Language'] = localeData.language
    document.querySelector('html')!.setAttribute('lang', localeData.language)
    state.localeData = localeData
  }

  /**
   * 指定された言語に対応する言語メッセージファイルをロードします。
   * @param language ロードする言語('en', 'ja', …)を指定します。
   */
  async function loadLanguageFile(language: string): Promise<VueI18n.LocaleMessageObject> {
    return (await import(/* webpackChunkName: "lang-[request]" */ `@/i18n/lang/${language}`)).default
  }

  /**
   * ロケールデータを取得します。
   */
  function getLocaleDataFromBrowser(): LocaleData {
    // ブラウザから言語+国を取得('en'や'en-US'などを取得)
    const locale =
      (window.navigator.languages && window.navigator.languages[0]) ||
      window.navigator.language ||
      (window.navigator as any).userLanguage ||
      (window.navigator as any).browserLanguage
    // 取得した言語+国からロケールデータを作成
    return toLocaleData(locale)
  }

  /**
   * ロケール文字列('ja'や'en-US')をロケールデータ`LocaleData`に変換します。
   * @param locale
   */
  function toLocaleData(locale: VueI18n.Locale): LocaleData {
    // 言語+国('en-US'など)を分割
    const { language, country } = splitLocale(locale)

    let result: LocaleData

    // 指定された言語がサポートされている場合
    if (isLanguageSupported(language)) {
      // 国が指定されていた場合
      if (country) {
        result = new LocaleData(language, country)
      }
      // 国が指定されていなかった場合
      else {
        result = new LocaleData(language, getDefaultLanguageCountry(language)!)
      }
    }
    // 指定された言語がサポートされていない場合
    else {
      result = getLocaleDataFromBrowser()
    }

    return result
  }

  /**
   * ロケール(言語+国)を言語と国に分割します。
   * @param locale
   */
  function splitLocale(locale: string): { language: string; country?: string } {
    const array = locale.split('-')
    const language = array[0].toLowerCase()
    const country = array.length >= 2 ? array[1].toUpperCase() : undefined
    return { language, country }
  }

  /**
   * 指定された言語がサポートされるのかを取得します。
   * @param language
   */
  function isLanguageSupported(language: string): boolean {
    for (const localeData of SUPPORT_LOCALES) {
      if (localeData.language === language.toLowerCase()) {
        return true
      }
    }
    return false
  }

  /**
   * 指定された言語に対するデフォルトの国を取得します。
   * @param language
   */
  function getDefaultLanguageCountry(language: string): string | undefined {
    for (const localeData of SUPPORT_LOCALES) {
      if (localeData.language === language) {
        return localeData.country
      }
    }
    return undefined
  }

  //----------------------------------------------------------------------
  //
  //  Result
  //
  //----------------------------------------------------------------------

  // デフォルトのロケールを設定
  setupDefaultLocale()

  // AppI18nインスタンスの生成
  appI18n = {
    load,
    t,
    tc,
    te,
    d,
    n,
    core: vueI18n,
  }

  return appI18n
}

function useI18n(): AppI18n {
  if (!appI18n) {
    throw new Error(`An instance of VueI18n has not been created.`)
  }
  return appI18n
}

//========================================================================
//
//  Export
//
//========================================================================

export { createI18n, useI18n }

import { DeepPartial, removeEndSlash } from 'web-base-lib'
import URI from 'urijs'
import merge from 'lodash/merge'
import { reactive } from '@vue/composition-api'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface Config {
  api: APIConfig
}

interface APIConfig {
  protocol: string
  host: string
  port: number
  basePath: string
  baseURL: string
}

interface CreateConfigParams {
  api?: DeepPartial<Omit<APIConfig, 'baseURL'>>
}

//========================================================================
//
//  Implementation
//
//========================================================================

let config: Config

function getAPIConfig(apiConfig: Omit<APIConfig, 'baseURL'>): APIConfig {
  const baseURL = new URI()
  if (apiConfig.protocol) baseURL.protocol(apiConfig.protocol)
  if (apiConfig.host) baseURL.hostname(apiConfig.host)
  if (apiConfig.port) baseURL.port(apiConfig.port.toString(10))
  if (apiConfig.basePath) baseURL.path(apiConfig.basePath)
  baseURL.query('')

  return {
    protocol: baseURL.protocol(),
    host: baseURL.hostname(),
    port: parseInt(baseURL.port()),
    basePath: baseURL.path(),
    baseURL: removeEndSlash(baseURL.toString()),
  }
}

function createConfig(params: CreateConfigParams = {}): Config {
  //----------------------------------------------------------------------
  //
  //  Variables
  //
  //----------------------------------------------------------------------

  const state = reactive({
    api: getAPIConfig(
      merge(
        {
          protocol: String(process.env.VUE_APP_API_PROTOCOL),
          host: String(process.env.VUE_APP_API_HOST),
          port: Number(process.env.VUE_APP_API_PORT),
          basePath: String(process.env.VUE_APP_API_BASE_PATH),
        },
        params.api
      )
    ),
  })

  //----------------------------------------------------------------------
  //
  //  Result
  //
  //----------------------------------------------------------------------

  return {
    api: state.api,
  }
}

function setupConfig(): Config {
  config = createConfig()
  return config
}

function useConfig(): Config {
  if (!config) {
    throw new Error('Config is not set up.')
  }
  return config
}

//========================================================================
//
//  Exports
//
//========================================================================

export { Config, APIConfig, setupConfig, useConfig }

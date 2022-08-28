import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'

interface CoreConfig {
    i18n: {
        defaultLocale: string
    }
}

const FETCH_CORE_CONFIG_QUERY = gql`
    query {
        config {
            i18n {
                defaultLocale
            }
        }
    }
`

export default class CoreConfigService {
    private static instance: CoreConfigService | null = null

    static getInstance() {
        if (!CoreConfigService.instance)
            CoreConfigService.instance = new CoreConfigService()

        return CoreConfigService.instance
    }

    private _coreConfig: CoreConfig | null = null

    get coreConfig(): CoreConfig {
        if (!this._coreConfig)
            throw new Error('Core configuration not initialized')

        return this._coreConfig
    }

    async initialize() {
        this._coreConfig = await this.fetchCoreConfig()
    }

    reset() {
        this._coreConfig = null
    }

    private async fetchCoreConfig(): Promise<CoreConfig> {
        const res = await apolloClient.query({query: FETCH_CORE_CONFIG_QUERY})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.config
    }
}

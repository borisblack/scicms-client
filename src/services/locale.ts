import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {Locale} from '../types'

const FIND_ALL_QUERY = gql`
    query {
        locales {
            data {
                id
                name
                displayName
                permission {
                    data {
                        id
                    }
                }
            }
        }
    }
`

export default class LocaleService {
    private static instance: LocaleService | null = null

    static getInstance() {
        if (!LocaleService.instance)
            LocaleService.instance = new LocaleService()

        return LocaleService.instance
    }

    private _locales: Locale[] | null = null

    get locales(): Locale[] {
        if (!this._locales)
            throw new Error('Locales not initialized')

        return this._locales
    }

    async initialize() {
        this._locales = await this.findAll()
    }

    reset() {
        this._locales = null
    }

    private async findAll(): Promise<Locale[]> {
        const res = await apolloClient.query({query: FIND_ALL_QUERY})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data.locales.data
    }
}

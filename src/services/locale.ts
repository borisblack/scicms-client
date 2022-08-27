import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {Locale} from '../types'

interface LocaleCache {
    [name: string]: Locale
}

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

    private locales: LocaleCache = {}

    async initialize() {
        const localeList = await this.findAll()
        const locales: LocaleCache = {}
        localeList.forEach(it => {
            locales[it.name] = it
        })
        this.locales = locales
    }

    reset() {
        this.locales = {}
    }

    private findAll = (): Promise<Locale[]> =>
        apolloClient.query({query: FIND_ALL_QUERY})
            .then(res => {
                if (res.errors) {
                    console.error(extractGraphQLErrorMessages(res.errors))
                    throw new Error(i18n.t('An error occurred while executing the request'))
                }

                return res.data.locales.data
            })

    findByName = (name: string): Locale | null => this.locales[name] ?? null

    getByName(name: string): Locale {
        const locale = this.findByName(name)
        if (!locale)
            throw new Error(`Locale [${name}] not found`)

        return locale
    }

    list = (): Locale[] => Object.keys(this.locales).map(key => this.locales[key])
}

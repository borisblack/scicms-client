import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {ItemTemplate} from '../types'

interface ItemTemplateCache {
    [name: string]: ItemTemplate
}

const DEFAULT_ITEM_TEMPLATE_NAME = 'defaultItemTemplate'

const FIND_ALL_QUERY = gql`
    query {
        itemTemplates {
            data {
                id
                name
                spec
                majorRev
                minorRev
                locale
                state
                createdAt
                updatedAt
                permission {
                    data {
                        id
                    }
                }
            }
        }
    }
`

export default class ItemTemplateService {
    private static instance: ItemTemplateService | null = null

    static getInstance() {
        if (!ItemTemplateService.instance)
            ItemTemplateService.instance = new ItemTemplateService()

        return ItemTemplateService.instance
    }

    private itemTemplates: ItemTemplateCache = {}

    async initialize() {
        const itemTemplateList = await this.findAll()
        const itemTemplates: ItemTemplateCache = {}
        itemTemplateList.forEach(it => {
            itemTemplates[it.name] = it
        })
        this.itemTemplates = itemTemplates
    }

    reset() {
        this.itemTemplates = {}
    }

    private findAll = (): Promise<ItemTemplate[]> =>
        apolloClient.query({query: FIND_ALL_QUERY})
            .then(res => {
                if (res.errors) {
                    console.error(extractGraphQLErrorMessages(res.errors))
                    throw new Error(i18n.t('An error occurred while executing the request'))
                }

                return res.data.itemTemplates.data
            })

    findByName = (name: string): ItemTemplate | null => this.itemTemplates[name] ?? null

    getByName(name: string): ItemTemplate {
        const itemTemplate = this.findByName(name)
        if (!itemTemplate)
            throw new Error(`Item template [${name}] not found`)

        return itemTemplate
    }

    getDefault = () => this.getByName(DEFAULT_ITEM_TEMPLATE_NAME)
}

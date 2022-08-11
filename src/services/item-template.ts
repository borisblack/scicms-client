import {gql} from '@apollo/client'

import {apolloClient} from '.'
import {ItemTemplate} from '../types'

interface ItemTemplateCache {
    [name: string]: ItemTemplate
}

const DEFAULT_ITEM_TEMPLATE_NAME = 'defaultItemTemplate'

const FIND_ALL_QUERY = gql`
    query {
        itemTemplates {
            coreVersion
            metadata {
                name
            }
            spec
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

    itemTemplates: ItemTemplateCache = {}

    async initialize() {
        const itemTemplateList = await this.findAll()
        const itemTemplates: ItemTemplateCache = {}
        itemTemplateList.forEach(it => {
            itemTemplates[it.metadata.name] = it
        })
        this.itemTemplates = itemTemplates
    }

    reset() {
        this.itemTemplates = {}
    }

    private findAll = (): Promise<ItemTemplate[]> =>
        apolloClient.query({query: FIND_ALL_QUERY}).then(res => res.data.itemTemplates)

    findByName = (name: string): ItemTemplate | null => this.itemTemplates[name] ?? null

    getByName(name: string): ItemTemplate {
        const itemTemplate = this.findByName(name)
        if (!itemTemplate)
            throw new Error(`Item template [${name}] not found`)

        return itemTemplate
    }

    getDefault = () => this.getByName(DEFAULT_ITEM_TEMPLATE_NAME)
}

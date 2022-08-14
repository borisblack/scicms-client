import {gql} from '@apollo/client'

import {apolloClient} from '.'
import {Item} from '../types'

interface ItemCache {
    [name: string]: Item
}

const MEDIA_ITEM_NAME = 'media'

const FIND_ALL_QUERY = gql`
    query {
        items {
            data {
                id
                name
                displayName
                pluralName
                displayPluralName
                dataSource
                tableName
                titleAttribute
                description
                icon
                core
                performDdl
                versioned
                manualVersioning
                notLockable
                localized
                implementation
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

export default class ItemService {
    private static instance: ItemService | null = null

    static getInstance() {
        if (!ItemService.instance)
            ItemService.instance = new ItemService()

        return ItemService.instance
    }

    items: ItemCache = {}

    async initialize() {
        const data = await this.findAll()
        const items: ItemCache = {}
        data.forEach(it => {
            items[it.name] = it
        })
        this.items = items
    }

    reset() {
        this.items = {}
    }

    private findAll = (): Promise<Item[]> =>
        apolloClient.query({query: FIND_ALL_QUERY}).then(res => res.data.items.data)

    findByName = (name: string): Item | null => this.items[name] ?? null

    getByName(name: string): Item {
        const itemTemplate = this.findByName(name)
        if (!itemTemplate)
            throw new Error(`Item [${name}] not found`)

        return itemTemplate
    }

    getMedia = (): Item => this.getByName(MEDIA_ITEM_NAME)
}

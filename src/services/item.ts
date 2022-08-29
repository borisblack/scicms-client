import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {AttrType, Item, RelType} from '../types'

interface ItemCache {
    [name: string]: Item
}

const MEDIA_ITEM_NAME = 'media'
const LOCATION_ITEM_NAME = 'location'

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
                allowedLifecycles {
                    data {
                        id
                    }
                }
                allowedPermissions {
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

    private items: ItemCache = {}

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
        apolloClient.query({query: FIND_ALL_QUERY})
            .then(res => {
                if (res.errors) {
                    console.error(extractGraphQLErrorMessages(res.errors))
                    throw new Error(i18n.t('An error occurred while executing the request'))
                }
                return res.data.items.data
            })

    findByName = (name: string): Item | null => this.items[name] ?? null

    getByName(name: string): Item {
        const itemTemplate = this.findByName(name)
        if (!itemTemplate)
            throw new Error(`Item [${name}] not found`)

        return itemTemplate
    }

    getMedia = (): Item => this.getByName(MEDIA_ITEM_NAME)

    getLocation = (): Item => this.getByName(LOCATION_ITEM_NAME)

    listNonCollectionAttributes = (item: Item): string[] => {
        const result: string[] = []
        const {attributes} = item.spec
        for (const attrName in attributes) {
            if (!attributes.hasOwnProperty(attrName))
                continue

            const attr = attributes[attrName]
            if (attr.private || (attr.type === AttrType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)))
                continue

            switch (attr.type) {
                case AttrType.string:
                case AttrType.text:
                case AttrType.uuid:
                case AttrType.email:
                case AttrType.password:
                case AttrType.sequence:
                case AttrType.enum:
                case AttrType.int:
                case AttrType.long:
                case AttrType.float:
                case AttrType.double:
                case AttrType.decimal:
                case AttrType.bool:
                case AttrType.date:
                case AttrType.time:
                case AttrType.datetime:
                case AttrType.timestamp:
                case AttrType.json:
                case AttrType.array:
                    result.push(attrName)
                    break
                case AttrType.media:
                    const media = this.getMedia()
                    result.push(`${attrName} { data { id ${media.titleAttribute} ${media.titleAttribute === 'filename' ? '' : 'filename'} } }`)
                    break
                case AttrType.location:
                    result.push(`${attrName} { data { id latitude longitude label } }`)
                    break
                case AttrType.relation:
                    if (!attr.target)
                        throw new Error('Illegal attribute')

                    const subItem = this.getByName(attr.target)
                    result.push(`${attrName} { data { id ${subItem.titleAttribute} } }`)
                    break
                default:
                    throw Error('Illegal attribute')
            }
        }

        return result
    }
}

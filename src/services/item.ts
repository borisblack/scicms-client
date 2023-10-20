import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {FieldType, Item, RelType} from '../types'
import {
    DASHBOARD_ITEM_NAME,
    DATASET_ITEM_NAME,
    FILENAME_ATTR_NAME,
    ID_ATTR_NAME,
    MEDIA_ITEM_NAME
} from '../config/constants'

interface ItemCache {
    [name: string]: Item
}

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
                query
                titleAttribute
                includeTemplates
                description
                icon
                readOnly
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
                        target {
                            data {
                                id
                                name
                            }
                        }
                    }
                }
                allowedPermissions {
                    data {
                        id
                        target {
                            data {
                                id
                                name
                            }
                        }
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
        const item = this.findByName(name)
        if (!item)
            throw new Error(`Item [${name}] not found`)

        return item
    }

    getMedia = (): Item => this.getByName(MEDIA_ITEM_NAME)

    getDataset = (): Item => this.getByName(DATASET_ITEM_NAME)

    getDashboard = (): Item => this.getByName(DASHBOARD_ITEM_NAME)

    getNames = (): string[] => Object.keys(this.items)

    listNonCollectionAttributes = (item: Item, attributesOverride: {[name: string]: string} = {}): string[] => {
        const result: string[] = []
        const {attributes} = item.spec
        for (const attrName in attributes) {
            if (!attributes.hasOwnProperty(attrName))
                continue

            if (attrName in attributesOverride) {
                result.push(attributesOverride[attrName])
                continue
            }

            const attr = attributes[attrName]
            if (attr.private || (attr.type === FieldType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)))
                continue

            switch (attr.type) {
                case FieldType.string:
                case FieldType.text:
                case FieldType.uuid:
                case FieldType.email:
                case FieldType.password:
                case FieldType.sequence:
                case FieldType.enum:
                case FieldType.int:
                case FieldType.long:
                case FieldType.float:
                case FieldType.double:
                case FieldType.decimal:
                case FieldType.bool:
                case FieldType.date:
                case FieldType.time:
                case FieldType.datetime:
                case FieldType.timestamp:
                case FieldType.json:
                case FieldType.array:
                    result.push(attrName)
                    break
                case FieldType.media:
                    const media = this.getMedia()
                    result.push(`${attrName} { data { id ${media.titleAttribute === ID_ATTR_NAME ? '' : media.titleAttribute} ${media.titleAttribute === FILENAME_ATTR_NAME ? '' : FILENAME_ATTR_NAME} } }`)
                    break
                case FieldType.relation:
                    if (!attr.target)
                        throw new Error('Illegal attribute')

                    const subItem = this.getByName(attr.target)
                    result.push(`${attrName} { data { id ${subItem.titleAttribute === ID_ATTR_NAME ? '' : subItem.titleAttribute} } }`)
                    break
                default:
                    throw Error('Illegal attribute')
            }
        }

        return result
    }
}

import _ from 'lodash'
import {gql} from '@apollo/client'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from '.'
import {FieldType, Item, RelType} from '../types'
import {FILENAME_ATTR_NAME, ID_ATTR_NAME, MEDIA_ITEM_NAME} from '../config/constants'

export type ItemMap = Record<string, Item>

const FIND_ALL_QUERY = gql`
    query {
        items {
            data {
                id
                name
                displayName
                pluralName
                displayPluralName
                datasource {
                    data {
                        id
                        name
                    }
                }
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

export const fetchItems = (): Promise<ItemMap> =>
    apolloClient.query({query: FIND_ALL_QUERY})
        .then(res => {
            if (res.errors) {
                console.error(extractGraphQLErrorMessages(res.errors))
                throw new Error(i18n.t('An error occurred while executing the request'))
            }
            return _.mapKeys(res.data.items.data, item => item.name)
        })

export default class ItemManager {
    constructor(private items: ItemMap) {}

    listNonCollectionAttributes = (item: Item, attributesOverride: Record<string, string> = {}): string[] => {
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
                    const media = this.items[MEDIA_ITEM_NAME]
                    result.push(`${attrName} { data { id ${media.titleAttribute === ID_ATTR_NAME ? '' : media.titleAttribute} ${media.titleAttribute === FILENAME_ATTR_NAME ? '' : FILENAME_ATTR_NAME} } }`)
                    break
                case FieldType.relation:
                    if (!attr.target)
                        throw new Error('Illegal attribute')

                    const subItem = this.items[attr.target]
                    result.push(`${attrName} { data { id ${subItem.titleAttribute === ID_ATTR_NAME ? '' : subItem.titleAttribute} } }`)
                    break
                default:
                    throw Error('Illegal attribute')
            }
        }

        return result
    }
}

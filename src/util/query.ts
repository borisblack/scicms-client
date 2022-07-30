import {AttrType, Item} from '../types'
import {gql} from '@apollo/client'
import {apolloClient} from '../services'
import {RequestParams} from '../components/datagrid/DataGrid'

export interface ResponseCollection {
    data: any[]
    meta: ResponseCollectionMeta
}

interface ResponseCollectionMeta {
    pagination?: Pagination
}

interface Pagination {
    limit?: number
    page?: number
    pageCount?: number
    pageSize?: number
    start?: number
    total: number
}

export function findAll(item: Item, params: RequestParams): Promise<ResponseCollection> {
    const query = gql(buildFindAllQuery(item, params))

    return apolloClient.query({query}).then(result => result.data[item.pluralName])
}

const buildFindAllQuery = (item: Item, {sorting, filters}: RequestParams) => `
    query {
        ${item.pluralName} {
            data {
                ${listPrimitiveAttributes(item).join('\n')}
            }
        }
    }
`

function listPrimitiveAttributes(item: Item): string[] {
    const result: string[] = []
    const {attributes} = item.spec
    for (const attrName in attributes) {
        if (!attributes.hasOwnProperty(attrName))
            continue

        const attribute = attributes[attrName]
        if (attribute.private || attribute.type === AttrType.relation)
            continue

        result.push(attrName)
    }

    return result
}

import {AttrType, Item} from '../types'
import {gql} from '@apollo/client'
import {apolloClient} from '../services'

export function findAll(item: Item): Promise<any[]> {
    const query = gql(buildFindAllQuery(item))

    return apolloClient.query({query}).then(result => result.data[item.pluralName])
}

const buildFindAllQuery = (item: Item) => `
    query {
        ${item.pluralName} {
            ${listPrimitiveAttributes(item).join('\n')}
        }
    }
`

export function listPrimitiveAttributes(item: Item): string[] {
    const result: string[] = []
    const {attributes} = item.spec
    for (const key in attributes) {
        const attribute = attributes[key]
        if (attribute.private || attribute.type === AttrType.relation)
            continue

        result.push(key)
    }

    return result
}
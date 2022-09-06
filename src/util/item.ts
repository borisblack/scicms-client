import _ from 'lodash'
import {Item, ItemData} from '../types'

export function extractTitleAttrValue(item: Item, data: ItemData): string | null {
    const titleAttrValue = item.titleAttribute.split('.').reduce((obj, key) => obj ? obj[key] : null, data)
    if (titleAttrValue == null)
        return null

    if (!_.isString(titleAttrValue))
        throw new Error('Illegal attribute')

    return titleAttrValue
}

export function copyTitleAttrValue(item: Item, sourceData: ItemData, targetData: ItemData) {
    const keys = item.titleAttribute.split('.')
    const firstKey = keys[0]
    targetData[firstKey] = sourceData[firstKey]
}

export function toQueryPath(titleAttribute: string): string {
    const keys = titleAttribute.split('.')
    let queryPath = keys[0]
    for (let i = 1; i < keys.length; i++) {
        queryPath += ` { ${keys[i]}`
    }

    for (let i = 1; i < keys.length; i++) {
        queryPath += ' }'
    }

    return queryPath
}
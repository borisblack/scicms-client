import _ from 'lodash'
import {ReactElement} from 'react'
import {ColumnDef, ColumnFiltersState, createColumnHelper, SortingState} from '@tanstack/react-table'
import {Button, Checkbox, Tag} from 'antd'
import {DateTime} from 'luxon'

import {Attribute, FieldType, Item, ItemData, Media, RelType} from '../types'
import appConfig from '../config'
import {DataWithPagination, RequestParams} from '../components/datagrid/DataGrid'
import QueryManager, {ExtRequestParams, ItemFiltersInput} from '../services/query'
import {ACCESS_ITEM_NAME, FILENAME_ATTR_NAME, MASK_ATTR_NAME, MEDIA_ITEM_NAME, UTC} from '../config/constants'
import i18n from '../i18n'
import {getBit} from './index'
import {download} from '../services/media'
import {ItemMap} from '../services/item'

const {luxonDisplayDateFormatString, luxonDisplayTimeFormatString, luxonDisplayDateTimeFormatString} = appConfig.dateTime
const columnHelper = createColumnHelper<any>()

export const getInitialData = (): DataWithPagination<any> => ({
    data: [],
    pagination: {
        page: 1,
        pageSize: appConfig.query.defaultPageSize,
        total: 0
    }
})

export function getColumns(items: ItemMap, item: Item, onOpenItem: (item: Item, id: string) => void): ColumnDef<any, any>[] {
    const columns: ColumnDef<any, any>[] = []
    const {attributes} = item.spec
    for (const attrName in attributes) {
        if (!attributes.hasOwnProperty(attrName))
            continue

        const attr = attributes[attrName]
        if (attr.private || (attr.type === FieldType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)))
            continue

        const column = columnHelper.accessor(attrName, {
            header: i18n.t(attr.displayName) as string,
            cell: info => renderCell(items, item, info.row.original, attrName, attr, info.getValue(), onOpenItem),
            size: attr.colWidth ?? appConfig.ui.dataGrid.colWidth,
            enableSorting: attr.type !== FieldType.text && attr.type !== FieldType.json && attr.type !== FieldType.array,
            enableColumnFilter: item.name !== ACCESS_ITEM_NAME || attrName !== MASK_ATTR_NAME
        })

        columns.push(column)
    }

    return columns
}

const renderCell = (
    items: ItemMap,
    item: Item,
    data: ItemData,
    attrName: string,
    attribute: Attribute,
    value: any,
    onOpenItem: (item: Item, id: string) => void
): ReactElement | string | null => {
    switch (attribute.type) {
        case FieldType.string:
            if (item.name === MEDIA_ITEM_NAME && attrName === FILENAME_ATTR_NAME && value != null) {
                return (
                    <Button type="link" size="small" style={{margin: 0, padding: 0}} onClick={() => download(data.id, value)}>
                        {value}
                    </Button>
                )
            }
            return value
        case FieldType.text:
        case FieldType.uuid:
        case FieldType.email:
        case FieldType.password:
        case FieldType.sequence:
        case FieldType.enum:
            return value
        case FieldType.int:
            if (item.name === ACCESS_ITEM_NAME && attrName === MASK_ATTR_NAME && value != null) {
                const r = getBit(value, 0) ? 'R' : '-'
                const w = getBit(value, 1) ? 'W' : '-'
                const c = getBit(value, 2) ? 'C' : '-'
                const d = getBit(value, 3) ? 'D' : '-'
                const a = getBit(value, 4) ? 'A' : '-'

                return <Tag style={{fontFamily: 'monospace', fontWeight: 600}}>{`${a} ${d} ${c} ${w} ${r}`}</Tag>
            }
            return value
        case FieldType.long:
        case FieldType.float:
        case FieldType.double:
        case FieldType.decimal:
            return value
        case FieldType.json:
        case FieldType.array:
            return value ? JSON.stringify(value) : null
        case FieldType.bool:
            return <Checkbox checked={value}/>
        case FieldType.date:
            return value ? DateTime.fromISO(value, {zone: UTC}).toFormat(luxonDisplayDateFormatString) : null
        case FieldType.time:
            return value ? DateTime.fromISO(value, {zone: UTC}).toFormat(luxonDisplayTimeFormatString) : null
        case FieldType.datetime:
        case FieldType.timestamp:
            return value ? DateTime.fromISO(value, {zone: UTC}).toFormat(luxonDisplayDateTimeFormatString) : null
        case FieldType.media:
            const media = items[MEDIA_ITEM_NAME]
            const mediaData: Media | null = value?.data
            if (!mediaData)
                return null

            return (
                <Button type="link" size="small" style={{margin: 0, padding: 0}} onClick={() => download(mediaData.id, mediaData.filename)}>
                    {(mediaData as any)[media.titleAttribute] ?? mediaData.filename}
                </Button>
            )
        case FieldType.relation:
            if (attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany)
                throw new Error('Cannot render oneToMany or manyToMany relation')

            if (!attribute.target)
                throw new Error('Illegal state')

            const subItem = items[attribute.target]
            const title = (value && value.data) ? (value.data[subItem.titleAttribute] ?? value.data.id) : null
            if (title == null)
                return null

            return (
                <Button type="link" size="small" style={{margin: 0, padding: 0}} onClick={() => onOpenItem(subItem, value.data.id)}>
                    {title}
                </Button>
            )
        default:
            throw new Error('Illegal attribute')
    }
}

export function getHiddenColumns(item: Item): string[] {
    const {attributes} = item.spec
    const hiddenColumns = []
    for (const attrName in attributes) {
        if (!attributes.hasOwnProperty(attrName))
            continue

        const attribute = attributes[attrName]
        if (attribute.colHidden)
            hiddenColumns.push(attrName)
    }

    return hiddenColumns
}

export async function findAll(
    items: ItemMap,
    item: Item,
    params: ExtRequestParams,
    extraFiltersInput?: ItemFiltersInput<ItemData>
): Promise<DataWithPagination<any>> {
    const queryManager = new QueryManager(items)
    const responseCollection = await queryManager.findAll(item, params, extraFiltersInput)
    const {page, pageSize, total} = responseCollection.meta.pagination
    return {
        data: responseCollection.data,
        pagination: {page: page as number, pageSize, total}
    }
}

export async function findAllRelated(
    items: ItemMap,
    itemName: string,
    itemId: string,
    relAttrName: string,
    target: Item,
    params: ExtRequestParams,
    extraFiltersInput?: ItemFiltersInput<ItemData>
): Promise<DataWithPagination<any>> {
    const queryManager = new QueryManager(items)
    const responseCollection = await queryManager.findAllRelated(itemName, itemId, relAttrName, target, params, extraFiltersInput)
    const {page, pageSize, total} = responseCollection.meta.pagination
    return {
        data: responseCollection.data,
        pagination: {page: page as number, pageSize, total}
    }
}

export function processLocal(data: any[], params: RequestParams): DataWithPagination<any> {
    const {sorting, filters, pagination} = params
    const {page, pageSize} = pagination
    const filtered = filterLocal(data, filters)
    const sorted = sortLocal(filtered, sorting)

    return paginateLocal(sorted, page, pageSize)
}

function filterLocal(data: any[], filters: ColumnFiltersState): any[] {
    if (filters.length === 0) {
        return data
    } else {
        const filterMap = filters.reduce((obj,f) => {
            obj[f.id] = f.value
            return obj
        }, {} as any)

        return data.filter(it => {
            let matched = 0
            for (const key in it) {
                const filterVal = filterMap[key]
                if (filterVal == null)
                    continue

                let dataVal = it[key]
                if (dataVal == null)
                    return false

                if (_.isBoolean(dataVal)) {
                    const lowerFilterVal = filterVal.toLowerCase()
                    if (!((dataVal && (lowerFilterVal === '1' || lowerFilterVal === 'true' || lowerFilterVal === 'yes' || lowerFilterVal === 'y'))
                        || (!dataVal && (lowerFilterVal === '0' || lowerFilterVal === 'false' || lowerFilterVal === 'no' || lowerFilterVal === 'n')))) {
                        return false
                    }
                } else {
                    if (_.isArray(dataVal))
                        dataVal = dataVal.join(', ')

                    if (!_.isString(dataVal))
                        dataVal = _.toString(dataVal)

                    if (dataVal.match(new RegExp(filterVal, 'i')) == null)
                        return false
                }
                matched++
            }

            return matched === filters.length
        })
    }
}

function sortLocal(data: any[], sorting: SortingState): any[] {
    if (sorting.length === 0) {
        return data
    } else {
        const sortingState = sorting[0]
        return [...data].sort((a, b) => {
            const {id, desc} = sortingState
            let aVal = a[id] ?? ''
            if (Array.isArray(aVal))
                aVal = aVal.join(', ')

            let bVal = b[id] ?? ''
            if (Array.isArray(bVal))
                bVal = bVal.join(', ')

            if (desc) {
                if (aVal < bVal)
                    return 1
                else if (aVal > bVal)
                    return -1
                else
                    return 0
            } else {
                if (aVal < bVal)
                    return -1
                else if (aVal > bVal)
                    return 1
                else
                    return 0
            }
        })
    }
}

function paginateLocal(data: any[], page: number = 1, pageSize: number = appConfig.query.defaultPageSize): DataWithPagination<any> {
    if (page < 1 && (pageSize < appConfig.query.minPageSize || pageSize > appConfig.query.maxPageSize))
        throw new Error('Illegal argument')

    const total = data.length
    let pageNumber = page
    let offset = (page - 1) * pageSize
    if (offset >= total) {
        pageNumber = 1
        offset = 0
    }

    const paginated = data.slice(offset, offset + pageSize)

    return {
        data: paginated,
        pagination: {page: pageNumber, pageSize, total}
    }
}
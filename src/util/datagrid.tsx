import _ from 'lodash'
import {ReactElement} from 'react'
import {ColumnDef, ColumnFiltersState, createColumnHelper, SortingState} from '@tanstack/react-table'
import {Button, Checkbox, Tag} from 'antd'
import {DateTime} from 'luxon'

import {Attribute, AttrType, Item, ItemData, Location, Media, NamedAttribute, NamedIndex, RelType} from '../types'
import appConfig from '../config'
import ItemService from '../services/item'
import {DataWithPagination, RequestParams} from '../components/datagrid/DataGrid'
import QueryService, {ExtRequestParams, FiltersInput} from '../services/query'
import MediaService from '../services/media'
import {ACCESS_ITEM_NAME, MASK_ATTR_NAME, UTC} from '../config/constants'
import i18n from '../i18n'
import {getBit} from './index'

const {luxonDisplayDateFormatString, luxonDisplayTimeFormatString, luxonDisplayDateTimeFormatString} = appConfig.dateTime
const columnHelper = createColumnHelper<any>()
const itemService = ItemService.getInstance()
const mediaService = MediaService.getInstance()
const queryService = QueryService.getInstance()

export const getInitialData = (): DataWithPagination<any> => ({
    data: [],
    pagination: {
        page: 1,
        pageSize: appConfig.query.defaultPageSize,
        total: 0
    }
})

export function getColumns(item: Item): ColumnDef<any, any>[] {
    const columns: ColumnDef<any, any>[] = []
    const {attributes} = item.spec
    for (const attrName in attributes) {
        if (!attributes.hasOwnProperty(attrName))
            continue

        const attr = attributes[attrName]
        if (attr.private || (attr.type === AttrType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)))
            continue

        const column = columnHelper.accessor(attrName, {
            header: i18n.t(attr.displayName) as string,
            cell: info => renderCell(item, attrName, attr, info.getValue()),
            size: attr.colWidth ?? appConfig.ui.dataGrid.colWidth,
            enableSorting: attr.type !== AttrType.text && attr.type !== AttrType.json && attr.type !== AttrType.array
                && attr.type !== AttrType.media && attr.type !== AttrType.location && attr.type !== AttrType.relation,
            enableColumnFilter: item.name !== ACCESS_ITEM_NAME || attrName !== MASK_ATTR_NAME
        })

        columns.push(column)
    }

    return columns
}

const renderCell = (item: Item, attrName: string, attribute: Attribute, value: any): ReactElement | string | null => {
    switch (attribute.type) {
        case AttrType.string:
        case AttrType.text:
        case AttrType.uuid:
        case AttrType.email:
        case AttrType.password:
        case AttrType.sequence:
        case AttrType.enum:
        case AttrType.int:
            if (item.name === ACCESS_ITEM_NAME && attrName === MASK_ATTR_NAME && value != null) {
                const r = getBit(value, 0) ? 'R' : '-'
                const w = getBit(value, 1) ? 'W' : '-'
                const c = getBit(value, 2) ? 'C' : '-'
                const d = getBit(value, 3) ? 'D' : '-'
                const a = getBit(value, 4) ? 'A' : '-'

                return <Tag style={{fontFamily: 'monospace', fontWeight: 600}}>{`${a} ${d} ${c} ${w} ${r}`}</Tag>
            }
            return value
        case AttrType.long:
        case AttrType.float:
        case AttrType.double:
        case AttrType.decimal:
            return value
        case AttrType.json:
        case AttrType.array:
            return value ? JSON.stringify(value) : null
        case AttrType.bool:
            return <Checkbox checked={value}/>
        case AttrType.date:
            return value ? DateTime.fromISO(value, {zone: UTC}).toFormat(luxonDisplayDateFormatString) : null
        case AttrType.time:
            return value ? DateTime.fromISO(value, {zone: UTC}).toFormat(luxonDisplayTimeFormatString) : null
        case AttrType.datetime:
        case AttrType.timestamp:
            return value ? DateTime.fromISO(value, {zone: UTC}).toFormat(luxonDisplayDateTimeFormatString) : null
        case AttrType.media:
            const media = itemService.getMedia()
            const mediaData: Media | null = value?.data
            if (!mediaData)
                return null

            return (
                <Button type="link" size="small" style={{margin: 0, padding: 0}} onClick={() => mediaService.download(mediaData.id, mediaData.filename)}>
                    {(mediaData as any)[media.titleAttribute] ?? mediaData.filename}
                </Button>
            )
        case AttrType.location:
            const locationData: Location | null = (value && value.data) ? value.data as Location : null
            return locationData ? locationData.label : null
        case AttrType.relation:
            if (attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany)
                throw new Error('Cannot render oneToMany or manyToMany relation')

            if (!attribute.target)
                throw new Error('Illegal state')

            const subItem = itemService.getByName(attribute.target)
            return (value && value.data) ? (value.data[subItem.titleAttribute] ?? value.data.id) : null
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
    item: Item,
    params: ExtRequestParams,
    extraFiltersInput?: FiltersInput<ItemData>
): Promise<DataWithPagination<any>> {
    const responseCollection = await queryService.findAll(item, params, extraFiltersInput)
    const {page, pageSize, total} = responseCollection.meta.pagination
    return {
        data: responseCollection.data,
        pagination: {page, pageSize, total}
    }
}

export async function findAllRelated(
    itemName: string,
    itemId: string,
    relAttrName: string,
    target: Item,
    params: ExtRequestParams,
    extraFiltersInput?: FiltersInput<ItemData>
): Promise<DataWithPagination<any>> {
    const responseCollection = await queryService.findAllRelated(itemName, itemId, relAttrName, target, params, extraFiltersInput)
    const {page, pageSize, total} = responseCollection.meta.pagination
    return {
        data: responseCollection.data,
        pagination: {page, pageSize, total}
    }
}

export const getAttributeColumns = (): ColumnDef<NamedAttribute, any>[] =>
    [
        columnHelper.accessor('name', {
            header: i18n.t('Name'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('type', {
            header: i18n.t('Type'),
            cell: info => <Tag color="processing">{info.getValue()}</Tag>,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, AttrType>,
        columnHelper.accessor('columnName', {
            header: i18n.t('Column Name'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('displayName', {
            header: i18n.t('Display Name'),
            cell: info => info.getValue(),
            size: 200,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('description', {
            header: i18n.t('Description'),
            cell: info => info.getValue(),
            size: 200,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('enumSet', {
            header: i18n.t('Enum Set'),
            cell: info => info.getValue() ? info.getValue().join(', ') : null,
            size: 200,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string[]>,
        columnHelper.accessor('seqName', {
            header: i18n.t('Sequence Name'),
            cell: info => info.getValue(),
            size: 210,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('confirm', {
            header: i18n.t('Confirm'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: 150,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('relType', {
            header: i18n.t('Relation Type'),
            cell: info => info.getValue() ? <Tag>{info.getValue()}</Tag> : null,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, RelType>,
        columnHelper.accessor('target', {
            header: i18n.t('Target Item'),
            cell: info => info.getValue(),
            size: 160,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('intermediate', {
            header: i18n.t('Intermediate Item'),
            cell: info => info.getValue(),
            size: 210,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('mappedBy', {
            header: i18n.t('Mapped By'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('inversedBy', {
            header: i18n.t('Inversed By'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('required', {
            header: i18n.t('Required'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('defaultValue', {
            header: i18n.t('Default Value'),
            cell: info => info.getValue(),
            size: 180,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('keyed', {
            header: i18n.t('Keyed'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('unique', {
            header: i18n.t('Unique'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('indexed', {
            header: i18n.t('Indexed'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: 160,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('private', {
            header: i18n.t('Private'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('readOnly', {
            header: i18n.t('Read Only'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: 160,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('pattern', {
            header: i18n.t('Pattern'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, string>,
        columnHelper.accessor('length', {
            header: i18n.t('Length'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>,
        columnHelper.accessor('precision', {
            header: i18n.t('Precision'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>,
        columnHelper.accessor('scale', {
            header: i18n.t('Scale'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>,
        columnHelper.accessor('minRange', {
            header: i18n.t('Min Range'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>,
        columnHelper.accessor('maxRange', {
            header: i18n.t('Max Range'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>,
        columnHelper.accessor('colHidden', {
            header: i18n.t('Column Hidden'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: 150,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('colWidth', {
            header: i18n.t('Column Width'),
            cell: info => info.getValue(),
            size: 150,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>,
        columnHelper.accessor('fieldHidden', {
            header: i18n.t('Field Hidden'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: 140,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, boolean>,
        columnHelper.accessor('fieldWidth', {
            header: i18n.t('Field Width'),
            cell: info => info.getValue(),
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedAttribute, number>
    ]

export const getHiddenAttributeColumns = () => ['enumSet', 'seqName', 'confirm', 'relType', 'target', 'intermediate', 'mappedBy', 'inversedBy', 'keyed']

export const getIndexColumns = (): ColumnDef<NamedIndex, any>[] =>
    [
        columnHelper.accessor('name', {
            header: i18n.t('Name'),
            cell: info => info.getValue(),
            size: 250,
            enableSorting: true
        }) as ColumnDef<NamedIndex, string>,
        columnHelper.accessor('columns', {
            header: i18n.t('Columns'),
            cell: info => info.getValue() ? info.getValue().join(', ') : null,
            size: 250,
            enableSorting: true
        }) as ColumnDef<NamedIndex, string[]>,
        columnHelper.accessor('unique', {
            header: i18n.t('Unique'),
            cell: info => <Checkbox checked={info.getValue()}/>,
            size: appConfig.ui.dataGrid.colWidth,
            enableSorting: true
        }) as ColumnDef<NamedIndex, boolean>
    ]

export const getHiddenIndexColumns = () => []

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

function paginateLocal(data: any[], page: number, pageSize: number): DataWithPagination<any> {
    if (page < 1 && (pageSize < appConfig.query.minPageSize || pageSize > appConfig.query.maxPageSize))
        throw new Error('Illegal attribute')

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
import {ReactElement} from 'react'
import {ColumnDef, createColumnHelper} from '@tanstack/react-table'
import {Button, Checkbox} from 'antd'
import {DateTime} from 'luxon'

import {Attribute, AttrType, Item, Location, Media, RelType} from '../types'
import appConfig from '../config'
import ItemService from '../services/item'
import {DataWithPagination} from '../components/datagrid/DataGrid'
import QueryService, {ExtRequestParams, FiltersInput} from '../services/query'
import MediaService from '../services/media'
import {UTC} from '../config/constants'
import i18n from '../i18n'

const {luxonDisplayDateFormatString, luxonDisplayTimeFormatString, luxonDisplayDateTimeFormatString} = appConfig.dateTime
const columnHelper = createColumnHelper<any>()
const itemService = ItemService.getInstance()
const mediaService = MediaService.getInstance()
const queryService = QueryService.getInstance()

export const getInitialData = (): DataWithPagination<any> => ({
    data: [],
    pagination: {
        page: 1,
        pageSize: appConfig.query.findAll.defaultPageSize,
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
            cell: info => renderCell(attr, info.getValue()),
            size: attr.colWidth ?? appConfig.ui.dataGrid.colWidth,
            enableSorting: attr.type !== AttrType.text && attr.type !== AttrType.json && attr.type !== AttrType.array
                && attr.type !== AttrType.media && attr.type !== AttrType.location && attr.type !== AttrType.relation
        })

        columns.push(column)
    }

    return columns
}

const renderCell = (attribute: Attribute, value: any): ReactElement | string | null => {
    switch (attribute.type) {
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
                    {(mediaData as any)[media.titleAttribute]}
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
            return (value && value.data) ? value.data[subItem.titleAttribute] : null
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
    extraFiltersInput?: FiltersInput<unknown>
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
    extraFiltersInput?: FiltersInput<unknown>
): Promise<DataWithPagination<any>> {
    const responseCollection = await queryService.findAllRelated(itemName, itemId, relAttrName, target, params, extraFiltersInput)
    const {page, pageSize, total} = responseCollection.meta.pagination
    return {
        data: responseCollection.data,
        pagination: {page, pageSize, total}
    }
}
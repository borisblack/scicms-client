import {ReactElement} from 'react'
import {ColumnDef, createColumnHelper} from '@tanstack/react-table'
import {Checkbox} from 'antd'
import {DateTime} from 'luxon'

import i18n from '../i18n'
import {Attribute, AttrType, Item, RelType} from '../types'
import appConfig from '../config'
import ItemService from '../services/item'
import {DataWithPagination, RequestParams} from '../components/datagrid/DataGrid'
import QueryService from '../services/query'

const columnHelper = createColumnHelper<any>()
const itemService = ItemService.getInstance()
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
            header: attr.displayName,
            cell: info => renderCell(attr, info.getValue()),
            size: attr.colWidth ?? appConfig.ui.dataGrid.defaultColWidth,
            enableSorting: attr.type !== AttrType.text && attr.type !== AttrType.json && attr.type !== AttrType.array && attr.type !== AttrType.relation
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
            return value ? DateTime.fromISO(value).toFormat(appConfig.dateTime.dateFormatString) : null
        case AttrType.time:
            return value ? DateTime.fromISO(value).toFormat(appConfig.dateTime.timeFormatString) : null
        case AttrType.datetime:
        case AttrType.timestamp:
            return value ? DateTime.fromISO(value,).toFormat(appConfig.dateTime.dateTimeFormatString) : null
        case AttrType.media:
            return (value && value.data) ? value.data['filename'] : null
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

export async function findAll(item: Item, params: RequestParams): Promise<DataWithPagination<any>> {
    try {
        const responseCollection = await queryService.findAll(item, params)
        const {page, pageSize, total} = responseCollection.meta.pagination
        return {
            data: responseCollection.data,
            pagination: {page, pageSize, total}
        }
    } catch (e: any) {
        console.error(e.message)
        throw new Error(i18n.t('An error occurred while executing the request'))
    }
}
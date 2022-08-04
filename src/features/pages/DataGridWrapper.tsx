import {DateTime} from 'luxon'
import {ReactElement, useCallback, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {createColumnHelper, Row} from '@tanstack/react-table'
import {Checkbox, Menu, message} from 'antd'

import appConfig from '../../config'
import {Attribute, AttrType, Item, Permission, RelType, UserInfo} from '../../types'
import QueryService from '../../services/query'
import DataGrid, {DataWithPagination, RequestParams} from '../../components/datagrid/DataGrid'
import ItemService from '../../services/item'
import {useAppDispatch} from '../../util/hooks'
import {openPage, ViewType} from './pagesSlice'
import PermissionService from '../../services/permission'
import * as ACL from '../../util/acl'

interface Props {
    me: UserInfo
    item: Item
}

const columnHelper = createColumnHelper<any>()

const initialData: DataWithPagination<any> = {
    data: [],
    pagination: {
        page: 1,
        pageSize: appConfig.query.findAll.defaultPageSize,
        total: 0
    }
}

function DataGridWrapper({me, item}: Props) {
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(initialData)

    const itemService = useMemo(() => ItemService.getInstance(), [])
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const queryService = useMemo(() => QueryService.getInstance(), [])

    const renderCell = useCallback((attribute: Attribute, value: any): ReactElement | string | null => {
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
                return value ? DateTime.fromISO(value,).toFormat(appConfig.dateTime.dateTimeFormatString) : null
            case AttrType.relation:
                if (attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany)
                    throw new Error('Cannot render oneToMany or manyToMany relation')

                if (!attribute.target)
                    throw new Error('Illegal state')

                const subItem = itemService.findByName(attribute.target)
                return (value && value.data) ? value.data[subItem?.displayAttrName ?? 'id'] : null
            default:
                throw new Error('Illegal attribute')
        }
    }, [itemService])

    const columnsMemoized = useMemo(() => {
        const columns = []
        const {attributes} = item.spec
        for (const attrName in attributes) {
            if (!attributes.hasOwnProperty(attrName))
                continue

            const attr = attributes[attrName]
            if (attr.private || attr.type === AttrType.media || (attr.type === AttrType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)))
                continue

            const column = columnHelper.accessor(attrName, {
                header: attr.displayName,
                cell: info => renderCell(attr, info.getValue()),
                size: attr.width ?? appConfig.ui.dataGrid.defaultColumnWidth,
                enableSorting: attr.type !== AttrType.relation
            })

            columns.push(column)
        }

        return columns
    }, [item, renderCell])

    const handleRequest = useCallback(async (params: RequestParams) => {
        try {
            setLoading(true)
            const responseCollection = await queryService.findAll(item, params)
            const {page, pageSize, total} = responseCollection.meta.pagination
            setData({
                data: responseCollection.data,
                pagination: {page, pageSize, total}
            })
        } catch (e: any) {
            console.error(e.message)
            message.error(t('An error occurred while executing the request'))
        } finally {
            setLoading(false)
        }
    }, [item, queryService, t])

    const openRow = useCallback((row: Row<any>) => {
        const itemData = row.original
        const permission = permissionService.findById(itemData.permission.data.id as string) as Permission
        const canEdit = ACL.canWrite(me, permission)

        dispatch(openPage({
            item,
            viewType: canEdit ? ViewType.edit : ViewType.view,
            data: row.original,
        }))
    }, [me, item, permissionService, dispatch])

    const handleRowDoubleClick = useCallback((row: any) => {
        openRow(row)
    }, [openRow])

    const getRowContextMenu = useCallback((row: any) => (
        <Menu items={[{
            key: 'open',
            label: 'Открыть',
            onClick: () => openRow(row)
        }]}/>
    ), [openRow])

    const hiddenColumnsMemoized = useMemo((): string[] => {
        const {attributes} = item.spec
        const hiddenColumns = []
        for (const attrName in attributes) {
            if (!attributes.hasOwnProperty(attrName))
                continue

            const attribute = attributes[attrName]
            if (attribute.hidden)
                hiddenColumns.push(attrName)
        }

        return hiddenColumns
    }, [item])

    const dataMemoized = useMemo(() => data, [data])

    return (
        <DataGrid
            loading={loading}
            columns={columnsMemoized}
            data={dataMemoized}
            initialState={{
                hiddenColumns: hiddenColumnsMemoized,
                pageSize: appConfig.query.findAll.defaultPageSize
            }}
            getRowContextMenu={getRowContextMenu}
            onRequest={handleRequest}
            onRowDoubleClick={handleRowDoubleClick}
        />
    )
}

export default DataGridWrapper
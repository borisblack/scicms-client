import {DateTime} from 'luxon'
import {MouseEvent, ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {createColumnHelper, Row} from '@tanstack/react-table'
import {Button, Checkbox, Menu, message, PageHeader} from 'antd'

import appConfig from '../../config'
import {Attribute, AttrType, ItemData, RelType, UserInfo} from '../../types'
import QueryService from '../../services/query'
import DataGrid, {DataWithPagination, RequestParams} from '../../components/datagrid/DataGrid'
import ItemService from '../../services/item'
import {getLabel, IPage, ViewType} from './pagesSlice'
import {hasPlugins, renderPlugins} from '../../plugins'
import {hasComponents, renderComponents} from '../../custom-components'
import * as icons from '@ant-design/icons'
import {PlusCircleOutlined} from '@ant-design/icons'
import PermissionService from '../../services/permission'
import * as ACL from '../../util/acl'
import styles from './Page.module.css'

interface Props {
    me: UserInfo
    page: IPage
    onCreate: () => void
    onView: (data: ItemData) => void
    onDelete: () => void
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

function DefaultPage({me, page, onCreate, onView}: Props) {
    const {t} = useTranslation()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(initialData)
    const headerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const {item} = page

    const itemService = useMemo(() => ItemService.getInstance(), [])
    const queryService = useMemo(() => QueryService.getInstance(), [])
    const permissionService = useMemo(() => PermissionService.getInstance(), [])

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
    }, [itemService])

    const columnsMemoized = useMemo(() => {
        const columns = []
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
                enableSorting: attr.type !== AttrType.relation
            })

            columns.push(column)
        }

        return columns
    }, [item, renderCell])

    useEffect(() => {
        const headerNode = headerRef.current
        if (headerNode) {
            renderPlugins('default.header', headerNode, {me, item})
            renderPlugins(`${item.name}.default.header`, headerNode, {me, item})
        }

        const contentNode = contentRef.current
        if (contentNode) {
            renderPlugins('default.content', contentNode, {me, item})
            renderPlugins(`${item.name}.default.content`, contentNode, {me, item})
        }

        const footerNode = footerRef.current
        if (footerNode) {
            renderPlugins('default.footer', footerNode, {me, item})
            renderPlugins(`${item.name}.default.footer`, footerNode, {me, item})
        }
    }, [me, item])

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

    const handleView = useCallback(async (itemData: ItemData) => {
        setLoading(true)
        await onView(itemData)
        setLoading(false)
    }, [onView])

    const handleRowDoubleClick = useCallback((row: Row<ItemData>) => handleView(row.original), [handleView])

    const getRowContextMenu = useCallback((row: Row<ItemData>) => (
        <Menu items={[{
            key: 'open',
            label: t('Open'),
            onClick: () => handleView(row.original)
        }]}/>
    ), [t, handleView])

    const hiddenColumnsMemoized = useMemo((): string[] => {
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
    }, [item])

    const handleCreate = (evt: MouseEvent) => { onCreate() }

    function renderPageHeader(): ReactNode {
        const Icon = item.icon ? (icons as any)[item.icon] : null
        const permissionId = item.permission.data?.id
        const permission = permissionId ? permissionService.findById(permissionId) : null
        const canCreate = permission && ACL.canCreate(me, permission)

        return (
            <PageHeader
                className={styles.pageHeader}
                title={<span>{Icon ? <Icon/> : null}&nbsp;&nbsp;{getLabel(item, ViewType.default)}</span>}
                extra={canCreate && <Button type="primary" onClick={handleCreate}><PlusCircleOutlined /> {t('Create')}</Button>}
            />
        )
    }

    const dataMemoized = useMemo(() => data, [data])

    return (
        <>
            {hasComponents('default.header') && renderComponents('default.header', {me, item})}
            {hasComponents(`${item.name}.default.header`) && renderComponents(`${item.name}.default.header`, {me, item})}
            {hasPlugins('default.header', `${item.name}.default.header`) && <div ref={headerRef}/>}
            {(!hasComponents('default.header', `${item.name}.default.header`) && !hasPlugins('default.header', `${item.name}.default.header`)) && renderPageHeader()}

            {hasComponents('default.content') && renderComponents('default.content', {me, item})}
            {hasComponents(`${item.name}.default.content`) && renderComponents(`${item.name}.default.content`, {me, item})}
            {hasPlugins('default.content', `${item.name}.default.content`) && <div ref={contentRef}/>}
            {(!hasComponents('default.content', `${item.name}.default.content`) && !hasPlugins('default.content', `${item.name}.default.content`)) &&
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
            }

            {hasComponents('default.footer') && renderComponents('default.footer', {me, item})}
            {hasComponents(`${item.name}.default.footer`) && renderComponents(`${item.name}.default.footer`, {me, item})}
            {hasPlugins('default.footer', `${item.name}.default.footer`) && <div ref={footerRef}/>}
        </>
    )
}

export default DefaultPage
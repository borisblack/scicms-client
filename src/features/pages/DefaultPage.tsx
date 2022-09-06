import {MouseEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Row} from '@tanstack/react-table'
import {Button, Checkbox, Menu, message, PageHeader} from 'antd'

import appConfig from '../../config'
import {Item, ItemData, UserInfo} from '../../types'
import DataGrid, {RequestParams} from '../../components/datagrid/DataGrid'
import {getLabel, IPage} from './pagesSlice'
import {hasPlugins, renderPlugins} from '../../plugins'
import {hasComponents, renderComponents} from '../../custom-components'
import * as icons from '@ant-design/icons'
import {DeleteTwoTone, FolderOpenOutlined, PlusCircleOutlined} from '@ant-design/icons'
import PermissionService from '../../services/permission'
import * as ACL from '../../util/acl'
import styles from './Page.module.css'
import {findAll, getColumns, getHiddenColumns, getInitialData} from '../../util/datagrid'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import {ExtRequestParams} from '../../services/query'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import MutationService from '../../services/mutation'

interface Props {
    me: UserInfo
    page: IPage
    onItemCreate: (item: Item, initialData?: ItemData | null, cb?: () => void, observerKey?: string) => void
    onItemView: (item: Item, id: string, cb?: () => void, observerKey?: string) => void
    onItemDelete: (itemName: string, id: string) => void
}

function DefaultPage({me, page, onItemCreate, onItemView, onItemDelete}: Props) {
    const {t} = useTranslation()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(getInitialData())
    const [version, setVersion] = useState<number>(0)
    const showAllLocalesRef = useRef<boolean>(false)
    const headerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const {item} = page

    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const mutationService = useMemo(() => MutationService.getInstance(), [])
    const columnsMemoized = useMemo(() => getColumns(item), [item])
    const hiddenColumnsMemoized = useMemo(() => getHiddenColumns(item), [item])

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

    const refresh = () => setVersion(prevVersion => prevVersion + 1)

    const handleRequest = useCallback(async (params: RequestParams) => {
        const allParams: ExtRequestParams = {...params, locale: showAllLocalesRef.current ? 'all' : null}

        try {
            setLoading(true)
            const dataWithPagination = await findAll(item, allParams)
            setData(dataWithPagination)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [item])

    const handleView = useCallback(async (id: string) => {
        setLoading(true)
        await onItemView(item, id, refresh, page.key)
        setLoading(false)
    }, [item, page.key, onItemView])

    const handleRowDoubleClick = useCallback((row: Row<ItemData>) => handleView(row.original.id), [handleView])

    const handleDelete = useCallback(async (id: string, purge: boolean = false) => {
        setLoading(true)
        try {
            if (purge)
                await mutationService.purge(item, id, appConfig.mutation.deletingStrategy)
            else
                await mutationService.delete(item, id, appConfig.mutation.deletingStrategy)
            await onItemDelete(item.name, id)
            await refresh()
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [mutationService, item, onItemDelete])

    const getRowContextMenu = useCallback((row: Row<ItemData>) => {
        const items: ItemType[] = [{
            key: 'open',
            label: t('Open'),
            icon: <FolderOpenOutlined/>,
            onClick: () => handleView(row.original.id)
        }]

        const rowPermissionId = row.original.permission?.data?.id
        const rowPermission = rowPermissionId ? permissionService.findById(rowPermissionId) : null
        const canDelete = !!rowPermission && ACL.canDelete(me, rowPermission)
        if (canDelete) {
            if (item.versioned) {
                items.push({
                    key: 'delete',
                    label: t('Delete'),
                    icon: <DeleteTwoTone twoToneColor="#eb2f96"/>,
                    children: [{
                        key: 'delete',
                        label: t('Current Version'),
                        onClick: () => handleDelete(row.original.id)
                    }, {
                        key: 'purge',
                        label: t('All Versions'),
                        onClick: () => handleDelete(row.original.id, true)
                    }]
                })
            } else {
                items.push({
                    key: 'delete',
                    label: t('Delete'),
                    icon: <DeleteTwoTone twoToneColor="#eb2f96"/>,
                    onClick: () => handleDelete(row.original.id)
                })
            }
        }

        return <Menu items={items}/>
    }, [t, permissionService, me, handleView, item.versioned, handleDelete])

    const handleCreate = (evt: MouseEvent) => { onItemCreate(item, null,refresh, page.key) }

    function renderPageHeader(): ReactNode {
        const Icon = item.icon ? (icons as any)[item.icon] : null
        const permissionId = item.permission.data?.id
        const permission = permissionId ? permissionService.findById(permissionId) : null
        const canCreate = !!permission && ACL.canCreate(me, permission)

        return (
            <PageHeader
                className={styles.pageHeader}
                title={<span>{Icon ? <Icon/> : null}&nbsp;&nbsp;{getLabel(page)}</span>}
                extra={canCreate && <Button type="primary" onClick={handleCreate}><PlusCircleOutlined /> {t('Create')}</Button>}
            />
        )
    }

    function handleLocalizationsCheckBoxChange(e: CheckboxChangeEvent) {
        showAllLocalesRef.current = e.target.checked
        setVersion(prevVersion => prevVersion + 1)
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
                    hasFilters={true}
                    version={version}
                    toolbar={item.localized && <Checkbox onChange={handleLocalizationsCheckBoxChange}>{t('All Locales')}</Checkbox>}
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
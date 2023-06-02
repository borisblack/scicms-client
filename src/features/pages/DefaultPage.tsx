import {ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Row} from '@tanstack/react-table'
import {Button, Checkbox, message, Modal} from 'antd'
import {PageHeader} from '@ant-design/pro-layout'

import appConfig from '../../config'
import {IBuffer, Item, ItemData, UserInfo} from '../../types'
import DataGrid, {RequestParams} from '../../components/datagrid/DataGrid'
import {getLabel, IPage} from './pagesSlice'
import {CustomPluginRenderContext, hasPlugins, renderPlugins} from '../../extensions/plugins'
import {CustomComponentRenderContext, hasComponents, renderComponents} from '../../extensions/custom-components'
import * as icons from '@ant-design/icons'
import {DeleteTwoTone, FolderOpenOutlined, PlusCircleOutlined} from '@ant-design/icons'
import PermissionService from '../../services/permission'
import * as ACL from '../../util/acl'
import styles from './Pages.module.css'
import {findAll, getColumns, getHiddenColumns, getInitialData} from '../../util/datagrid'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import {ExtRequestParams} from '../../services/query'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import MutationService from '../../services/mutation'
import {ApiMiddlewareContext, ApiOperation, handleApiMiddleware, hasApiMiddleware} from '../../extensions/api-middleware'
import {ITEM_ITEM_NAME, ITEM_TEMPLATE_ITEM_NAME, MEDIA_ITEM_NAME} from '../../config/constants'
import {Callback} from '../../services/mediator'

interface Props {
    me: UserInfo
    page: IPage
    onItemCreate: (item: Item, initialData?: ItemData | null, cb?: Callback, observerKey?: string) => void
    onItemView: (item: Item, id: string, extra?: Record<string, any>, cb?: Callback, observerKey?: string) => void
    onItemDelete: (itemName: string, id: string) => void
    onLogout: () => void
}

const {info} = Modal

function DefaultPage({me, page, onItemCreate, onItemView, onItemDelete, onLogout}: Props) {
    const {t} = useTranslation()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(getInitialData())
    const [version, setVersion] = useState<number>(0)
    const showAllLocalesRef = useRef<boolean>(false)
    const headerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const [buffer, setBuffer] = useState<IBuffer>({})
    const {item} = page
    const isSystemItem = item.name === ITEM_TEMPLATE_ITEM_NAME || item.name === ITEM_ITEM_NAME

    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const mutationService = useMemo(() => MutationService.getInstance(), [])
    const columnsMemoized = useMemo(() => getColumns(item), [item])
    const hiddenColumnsMemoized = useMemo(() => getHiddenColumns(item), [item])
    const handleBufferChange = useCallback((bufferChanges: IBuffer) => setBuffer({...buffer, ...bufferChanges}), [buffer])
    const pluginContext: CustomPluginRenderContext = useMemo(() => ({
        me,
        item,
        buffer,
        onBufferChange: handleBufferChange,
    }), [buffer, handleBufferChange, item, me])

    const customComponentContext: CustomComponentRenderContext = useMemo(() => ({
        me,
        pageKey: page.key,
        item,
        extra: page.extra,
        buffer,
        onBufferChange: handleBufferChange,
        onItemCreate,
        onItemView,
        onItemDelete
    }), [buffer, handleBufferChange, item, me, onItemCreate, onItemDelete, onItemView, page.extra, page.key])

    useEffect(() => {
        const headerNode = headerRef.current
        if (headerNode) {
            renderPlugins('default.header', headerNode, pluginContext)
            renderPlugins(`${item.name}.default.header`, headerNode, pluginContext)
        }

        const contentNode = contentRef.current
        if (contentNode) {
            renderPlugins('default.content', contentNode, pluginContext)
            renderPlugins(`${item.name}.default.content`, contentNode, pluginContext)
        }

        const footerNode = footerRef.current
        if (footerNode) {
            renderPlugins('default.footer', footerNode, pluginContext)
            renderPlugins(`${item.name}.default.footer`, footerNode, pluginContext)
        }
    }, [item.name, pluginContext])

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
        await onItemView(item, id, undefined, refresh, page.key)
        setLoading(false)
    }, [item, page.key, onItemView])

    const handleRowDoubleClick = useCallback((row: Row<ItemData>) => handleView(row.original.id), [handleView])

    const logoutIfNeed = useCallback(() => {
        if (!isSystemItem)
            return

        info({
            title: `${t('You must sign in again to apply the changes')}`,
            onOk: onLogout
        })
    }, [isSystemItem, onLogout, t])

    const handleDelete = useCallback(async (id: string, purge: boolean = false) => {
        setLoading(true)
        try {
            if (purge) {
                await mutationService.purge(item, id, appConfig.mutation.deletingStrategy)
            } else {
                const doDelete = async () => await mutationService.delete(item, id, appConfig.mutation.deletingStrategy)
                if (hasApiMiddleware(item.name)) {
                    const apiMiddlewareContext: ApiMiddlewareContext = {me, item, buffer, values: {id}}
                    await handleApiMiddleware(item.name, ApiOperation.DELETE, apiMiddlewareContext, doDelete)
                } else {
                    await doDelete()
                }
            }
            await onItemDelete(item.name, id)
            await refresh()
            logoutIfNeed()
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [onItemDelete, item, logoutIfNeed, mutationService, me])

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

        return items
    }, [t, permissionService, me, handleView, item.versioned, handleDelete])

    const handleCreate = useCallback(() => {
        onItemCreate(item, null,refresh, page.key)
    }, [item, onItemCreate, page.key])

    const renderPageHeader = useCallback((): ReactNode => {
        const Icon = item.icon ? (icons as any)[item.icon] : null
        const permissionId = item.permission.data?.id
        const permission = permissionId ? permissionService.findById(permissionId) : null
        const canCreate = !!permission && item.name !== MEDIA_ITEM_NAME && ACL.canCreate(me, permission)

        return (
            <PageHeader
                className={styles.pageHeader}
                title={<span>{Icon ? <Icon/> : null}&nbsp;&nbsp;{getLabel(page)}</span>}
                extra={canCreate && <Button type="primary" onClick={handleCreate}><PlusCircleOutlined /> {t('Create')}</Button>}
            />
        )
    }, [handleCreate, item, me, page, permissionService, t])

    const handleLocalizationsCheckBoxChange = useCallback((e: CheckboxChangeEvent) => {
        showAllLocalesRef.current = e.target.checked
        setVersion(prevVersion => prevVersion + 1)
    }, [])

    const dataMemoized = useMemo(() => data, [data])

    return (
        <>
            {hasComponents('default.header') && renderComponents('default.header', customComponentContext)}
            {hasComponents(`${item.name}.default.header`) && renderComponents(`${item.name}.default.header`, customComponentContext)}
            {hasPlugins('default.header', `${item.name}.default.header`) && <div ref={headerRef}/>}

            {(!hasComponents('default.header', `${item.name}.default.header`) && !hasPlugins('default.header', `${item.name}.default.header`)) && renderPageHeader()}

            {hasComponents('default.content') && renderComponents('default.content', customComponentContext)}
            {hasComponents(`${item.name}.default.content`) && renderComponents(`${item.name}.default.content`, customComponentContext)}
            {hasPlugins('default.content', `${item.name}.default.content`) && <div ref={contentRef}/>}

            {(!hasComponents('default.content', `${item.name}.default.content`) && !hasPlugins('default.content', `${item.name}.default.content`)) &&
                <DataGrid
                    loading={loading}
                    columns={columnsMemoized}
                    data={dataMemoized}
                    initialState={{
                        hiddenColumns: hiddenColumnsMemoized,
                        pageSize: appConfig.query.defaultPageSize
                    }}
                    hasFilters={true}
                    version={version}
                    toolbar={item.localized && <Checkbox onChange={handleLocalizationsCheckBoxChange}>{t('All Locales')}</Checkbox>}
                    title={t(item.displayPluralName)}
                    getRowContextMenu={getRowContextMenu}
                    onRequest={handleRequest}
                    onRowDoubleClick={handleRowDoubleClick}
                />
            }

            {hasComponents('default.footer') && renderComponents('default.footer', customComponentContext)}
            {hasComponents(`${item.name}.default.footer`) && renderComponents(`${item.name}.default.footer`, customComponentContext)}
            {hasPlugins('default.footer', `${item.name}.default.footer`) && <div ref={footerRef}/>}
        </>
    )
}

export default DefaultPage
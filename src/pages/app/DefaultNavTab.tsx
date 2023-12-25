import {memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Row} from '@tanstack/react-table'
import {Button, Checkbox, message, Modal} from 'antd'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import {DeleteTwoTone, FolderOpenOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {PageHeader} from '@ant-design/pro-layout'

import appConfig from 'src/config'
import {IBuffer, ItemData, ItemDataWrapper} from 'src/types'
import DataGrid, {RequestParams} from '../../components/datagrid/DataGrid'
import {CustomPluginRenderContext, hasPlugins, renderPlugins} from 'src/extensions/plugins'
import {CustomComponentRenderContext, hasComponents, renderComponents} from 'src/extensions/custom-components'
import * as ACL from 'src/util/acl'
import {findAll, getColumns, getHiddenColumns, getInitialData} from 'src/util/datagrid'
import {ExtRequestParams} from 'src/services/query'
import {ApiMiddlewareContext, ApiOperation, handleApiMiddleware, hasApiMiddleware} from 'src/extensions/api-middleware'
import {ITEM_ITEM_NAME, ITEM_TEMPLATE_ITEM_NAME, MEDIA_ITEM_NAME} from 'src/config/constants'
import {useAuth, useItemOperations, useMutationManager, useRegistry} from 'src/util/hooks'
import {getTitle} from 'src/util/mdi'
import Icon from 'src/components/icon/Icon'
import styles from './NavTab.module.css'

interface Props {
    data: ItemDataWrapper
}

const {info} = Modal

function DefaultNavTab({data: dataWrapper}: Props) {
    const {me, logout} = useAuth()
    const {items: itemMap, permissions: permissionMap, reset: resetRegistry} = useRegistry()
    const {create: createItem, open: openItem, close: closeItem} = useItemOperations()
    const mutationManager = useMutationManager()
    const {t} = useTranslation()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(getInitialData())
    const [version, setVersion] = useState<number>(0)
    const showAllLocalesRef = useRef<boolean>(false)
    const headerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const [buffer, setBuffer] = useState<IBuffer>({})
    const {item} = dataWrapper
    const isSystemItem = item.name === ITEM_TEMPLATE_ITEM_NAME || item.name === ITEM_ITEM_NAME
    const columnsMemoized = useMemo(() => getColumns(itemMap, item, openItem), [item, itemMap])
    const hiddenColumnsMemoized = useMemo(() => getHiddenColumns(item), [item])
    const handleBufferChange = useCallback((bufferChanges: IBuffer) => setBuffer({...buffer, ...bufferChanges}), [buffer])
    const pluginContext: CustomPluginRenderContext = useMemo(() => ({
        item,
        buffer,
        onBufferChange: handleBufferChange,
    }), [buffer, handleBufferChange, item])

    const customComponentContext: CustomComponentRenderContext = useMemo(() => ({
        data: dataWrapper,
        buffer,
        onBufferChange: handleBufferChange,
    }), [dataWrapper, buffer, handleBufferChange])

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

    const handleLogout = useCallback(async () => {
        await logout()
        resetRegistry()
    }, [logout, resetRegistry])

    const refresh = () => setVersion(prevVersion => prevVersion + 1)

    const handleRequest = useCallback(async (params: RequestParams) => {
        const allParams: ExtRequestParams = {...params, locale: showAllLocalesRef.current ? 'all' : null}

        try {
            setLoading(true)
            const dataWithPagination = await findAll(itemMap, item, allParams)
            setData(dataWithPagination)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [item, itemMap])

    const handleView = useCallback(async (id: string) => {
        setLoading(true)
        await openItem(
            item,
            id,
            undefined,
            refresh,
            (closedData, remove) => {
                if (remove)
                    refresh()
            }
        )
        setLoading(false)
    }, [item, openItem])

    const handleRowDoubleClick = useCallback((row: Row<ItemData>) => handleView(row.original.id), [handleView])

    const logoutIfNeed = useCallback(() => {
        if (!isSystemItem)
            return

        info({
            title: `${t('You must sign in again to apply the changes')}`,
            onOk: handleLogout
        })
    }, [isSystemItem, handleLogout, t])

    const handleDelete = useCallback(async (id: string, purge: boolean = false) => {
        setLoading(true)
        try {
            if (purge) {
                await mutationManager.purge(item, id, appConfig.mutation.deletingStrategy)
            } else {
                const doDelete = async () => await mutationManager.remove(item, id, appConfig.mutation.deletingStrategy)
                if (hasApiMiddleware(item.name)) {
                    const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values: {id}}
                    await handleApiMiddleware(item.name, ApiOperation.DELETE, apiMiddlewareContext, doDelete)
                } else {
                    await doDelete()
                }
            }
            closeItem(item.name, id)
            refresh()
            logoutIfNeed()
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [closeItem, item, logoutIfNeed, mutationManager, me, itemMap, buffer])

    const getRowContextMenu = useCallback((row: Row<ItemData>) => {
        const items: ItemType[] = [{
            key: 'open',
            label: t('Open'),
            icon: <FolderOpenOutlined/>,
            onClick: () => handleView(row.original.id)
        }]

        const rowPermissionId = row.original.permission?.data?.id
        const rowPermission = rowPermissionId ? permissionMap[rowPermissionId] : null
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
    }, [t, me, permissionMap, handleView, item.versioned, handleDelete])

    const handleCreate = useCallback(() => {
        createItem(item, undefined, undefined, refresh, refresh)
    }, [createItem, item])

    const renderPageHeader = useCallback((): ReactNode => {
        const permissionId = item.permission.data?.id
        const permission = permissionId ? permissionMap[permissionId] : null
        const canCreate = !!permission && item.name !== MEDIA_ITEM_NAME && ACL.canCreate(me, permission)

        return (
            <PageHeader
                className={styles.pageHeader}
                title={<span><Icon iconName={item.icon}/>&nbsp;&nbsp;{getTitle(dataWrapper)}</span>}
                extra={canCreate && <Button type="primary" onClick={handleCreate}><PlusCircleOutlined /> {t('Create')}</Button>}
            />
        )
    }, [handleCreate, item, me, permissionMap, t, dataWrapper])

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

export default memo(DefaultNavTab)
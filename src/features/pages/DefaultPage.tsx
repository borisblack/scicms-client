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
import {PlusCircleOutlined} from '@ant-design/icons'
import PermissionService from '../../services/permission'
import * as ACL from '../../util/acl'
import styles from './Page.module.css'
import {findAll, getColumns, getHiddenColumns, getInitialData} from '../../util/datagrid'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import {ExtRequestParams} from '../../services/query'

interface Props {
    me: UserInfo
    page: IPage
    onItemView: (item: Item, id: string) => void
    onCreate: () => void
    onDelete: () => void
}

function DefaultPage({me, page, onCreate, onItemView}: Props) {
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
        await onItemView(item, id)
        setLoading(false)
    }, [item, onItemView])

    const handleRowDoubleClick = useCallback((row: Row<ItemData>) => handleView(row.original.id), [handleView])

    const getRowContextMenu = useCallback((row: Row<ItemData>) => (
        <Menu items={[{
            key: 'open',
            label: t('Open'),
            onClick: () => handleView(row.original.id)
        }]}/>
    ), [t, handleView])

    const handleCreate = (evt: MouseEvent) => { onCreate() }

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
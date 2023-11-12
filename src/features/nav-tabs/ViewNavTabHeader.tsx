import React, {MouseEvent, ReactNode, useMemo, useState} from 'react'
import {Alert, Button, Dropdown, FormInstance, message, Modal, Popconfirm, Space} from 'antd'
import {PageHeader} from '@ant-design/pro-layout'
import * as icons from '@ant-design/icons'
import {
    CloseCircleOutlined,
    DeleteOutlined,
    DiffOutlined,
    DownOutlined,
    ExclamationCircleOutlined,
    ExportOutlined,
    Html5Outlined,
    LockOutlined,
    SaveOutlined,
    SubnodeOutlined,
    UnlockOutlined
} from '@ant-design/icons'

import {FlaggedResponse, IBuffer, Item, ItemData, ResponseCollection, UserInfo, ViewState} from '../../types'
import {getLabel, INavTab} from './navTabsSlice'
import appConfig from '../../config'
import {useTranslation} from 'react-i18next'
import SearchDataGridWrapper from './SearchDataGridWrapper'
import {ItemFiltersInput} from '../../services/query'
import MutationManager from '../../services/mutation'
import Promote from './Promote'
import {
    ITEM_ITEM_NAME,
    ITEM_TEMPLATE_ITEM_NAME,
    LOCALE_ATTR_NAME,
    MAJOR_REV_ATTR_NAME,
    MINOR_REV_ATTR_NAME
} from '../../config/constants'
import {
    ApiMiddlewareContext,
    ApiOperation,
    handleApiMiddleware,
    hasApiMiddleware
} from '../../extensions/api-middleware'
import {ItemMap} from '../../services/item'
import styles from './NavTabs.module.css'

interface Props {
    me: UserInfo
    items: ItemMap
    navTab: INavTab
    form: FormInstance
    buffer: IBuffer
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    viewState: ViewState
    setViewState: (viewState: ViewState) => void
    isLockedByMe: boolean
    setLockedByMe: (isLockedByMe: boolean) => void
    setLoading: (loading: boolean) => void
    closePage: () => void
    onItemView: (item: Item, id: string, extra?: Record<string, any>, cb?: () => void, observerKey?: string) => void
    onUpdate: (data: ItemData) => void
    onItemDelete: (itemName: string, id: string) => void
    onHtmlExport: () => void
    logoutIfNeed: () => void
}

const VERSIONS_MODAL_WIDTH = 800

const {confirm} = Modal

export default function ViewNavTabHeader({
    me, items: itemMap, navTab, form, buffer, canCreate, canEdit, canDelete, viewState, setViewState, isLockedByMe,
    setLockedByMe, setLoading, closePage, onItemView, onUpdate, onItemDelete, onHtmlExport, logoutIfNeed
}: Props) {
    const {item, data} = navTab
    const isNew = !data?.id
    const Icon = item.icon ? (icons as any)[item.icon] : null
    const {t} = useTranslation()
    const [isVersionsModalVisible, setVersionsModalVisible] = useState(false)
    const [isPromoteModalVisible, setPromoteModalVisible] = useState(false)
    const mutationManager = useMemo(() => new MutationManager(itemMap), [itemMap])

    function handleSave(evt: MouseEvent) {
        form.submit()
    }

    async function handleLock(evt: MouseEvent) {
        if (isNew)
            throw new Error('New item cannot be locked')

        setLoading(true)
        try {
            const id = data?.id as string
            const doLock = async () => await mutationManager.lock(item, id)
            let locked: FlaggedResponse
            if (hasApiMiddleware(item.name)) {
                const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values: {id}}
                locked = await handleApiMiddleware(item.name, ApiOperation.LOCK, apiMiddlewareContext, doLock)
            } else {
                locked = await doLock()
            }
            if (locked.success)
                await onUpdate(locked.data)
            else
                message.warning(t('New item cannot be locked'))

            setLockedByMe(locked.success)
            setViewState(item.versioned ? ViewState.CREATE_VERSION : ViewState.UPDATE)
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleCancel(evt: MouseEvent) {
        if (isNew)
            throw new Error('New item cannot be unlocked')

        setLoading(true)
        try {
            const id = data?.id as string
            const doUnlock = async () => await mutationManager.unlock(item, id)
            let unlocked
            if (hasApiMiddleware(item.name)) {
                const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values: {id}}
                unlocked = await handleApiMiddleware(item.name, ApiOperation.UNLOCK, apiMiddlewareContext, doUnlock)
            } else {
                unlocked = await doUnlock()
            }
            if (unlocked.success)
                await onUpdate(unlocked.data)
            else
                message.warning(t('New item cannot be unlocked'))

            setLockedByMe(!unlocked)
            setViewState(ViewState.VIEW)
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!canDelete)
            throw new Error('Cannot delete this item')

        if (isNew)
            throw new Error('New item cannot be deleted')

        setLoading(true)
        try {
            const id = data?.id as string
            const doDelete = async () => await mutationManager.remove(item, id, appConfig.mutation.deletingStrategy)
            let deleted: ItemData
            if (hasApiMiddleware(item.name)) {
                const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values: {id}}
                deleted = await handleApiMiddleware(item.name, ApiOperation.DELETE, apiMiddlewareContext, doDelete)
            } else {
                deleted = await doDelete()
            }
            await onUpdate(deleted)
            await setLockedByMe(false)
            onItemDelete(item.name, data?.id as string)
            logoutIfNeed()
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function handlePurge() {
        if (!canDelete)
            throw new Error('Cannot purge this item')

        if (isNew)
            throw new Error('New item cannot be purged')

        setLoading(true)
        try {
            const id = data?.id as string
            const doPurge = async () => await mutationManager.purge(item, id, appConfig.mutation.deletingStrategy)
            let purged: ResponseCollection<ItemData>
            if (hasApiMiddleware(item.name)) {
                const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values: {id}}
                purged = await handleApiMiddleware(item.name, ApiOperation.PURGE, apiMiddlewareContext, doPurge)
            } else {
                purged = await doPurge()
            }
            const deleted = purged.data.find(it => it.id === id) as ItemData
            await onUpdate(deleted)
            await setLockedByMe(false)
            onItemDelete(item.name, data?.id as string)
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function handlePromote(state: string) {
        if (!canEdit)
            throw new Error('Cannot promote this item')

        if (isNew)
            throw new Error('New item cannot be promoted')

        setLoading(true)
        try {
            const id = data?.id as string
            const doPromote = async () => await mutationManager.promote(item, id, state)
            let promoted: ItemData
            if (hasApiMiddleware(item.name)) {
                const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values: {id}}
                promoted = await handleApiMiddleware(item.name, ApiOperation.PROMOTE, apiMiddlewareContext, doPromote)
            } else {
                promoted = await doPromote()
            }
            await onUpdate(promoted)
            setPromoteModalVisible(false)
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const showDeleteConfirm = () => {
        confirm({
            title: `${t('Delete Current Version')}?`,
            icon: <ExclamationCircleOutlined />,
            onOk: handleDelete
        })
    }

    const showPurgeConfirm = () => {
        confirm({
            title: `${t('Delete All Versions')}?`,
            icon: <ExclamationCircleOutlined />,
            onOk: handlePurge
        })
    }

    const getPurgeMenu = () => [{
        key: 'delete',
        label: t('Current Version'),
        onClick: showDeleteConfirm
    }, {
        key: 'purge',
        label: t('All Versions'),
        onClick: showPurgeConfirm
    }]

    const getExportMenu = () => [{
        key: 'html',
        label: (
            <Space>
                <Html5Outlined className="blue"/>
                HTML
            </Space>
        ),
        onClick: onHtmlExport
    }]

    const getVersionsExtraFiltersInput = (): ItemFiltersInput<ItemData> => {
        if (isNew)
            return {} as ItemFiltersInput<ItemData>

        return {
            id: {
                ne: data?.id as string
            },
            configId: {
                eq: data?.configId as string
            }
        }
    }

    function getExtra(): ReactNode[] {
        const extra: ReactNode[] = []

        if (isNew) {
            if (canCreate) {
                extra.push(<Button key="save" type="primary" onClick={handleSave}><SaveOutlined/> {t('Save')}</Button>)
                extra.push(<Button key="cancel" icon={<CloseCircleOutlined/>} onClick={closePage}>{t('Cancel')}</Button>)
            }
        } else {
            if (canEdit) {
                if (isLockedByMe /*&& viewState !== ViewState.VIEW*/) {
                    extra.push(<Button key="save" type="primary" onClick={handleSave}><SaveOutlined/> {t('Save')}</Button>)
                    extra.push(<Button key="cancel" icon={<LockOutlined/>} onClick={handleCancel}>{t('Cancel')}</Button>)
                } else {
                    extra.push(<Button key="lock" type="primary" icon={<UnlockOutlined/>} onClick={handleLock}>{t('Edit')}</Button>)
                }
            }

            if (item.versioned) {
                extra.push(
                    <Button key="versions" icon={<DiffOutlined/>} onClick={() => setVersionsModalVisible(true)}>{t('Versions')}</Button>
                )
            }

            if (canEdit && isLockedByMe /*&& viewState !== ViewState.VIEW*/ && data?.lifecycle.data && item.name !== ITEM_ITEM_NAME && item.name !== ITEM_TEMPLATE_ITEM_NAME) {
                extra.push(
                    <Button key="promote" type="primary" icon={<SubnodeOutlined/>} onClick={() => setPromoteModalVisible(true)}>{t('Promote')}</Button>
                )
            }

            if (canDelete) {
                if (item.versioned) {
                    extra.push(
                        <Dropdown key="purge" placement="bottomRight" menu={{items: getPurgeMenu()}}>
                            <Button type="primary" danger icon={<DownOutlined/>}>{t('Delete')}</Button>
                        </Dropdown>
                    )
                } else {
                    extra.push(
                        <Popconfirm
                            key="delete"
                            placement="bottomRight"
                            title={`${t('Delete Item')}?`}
                            onConfirm={handleDelete}
                        >
                            <Button type="primary" danger icon={<DeleteOutlined/>}>{t('Delete')}</Button>
                        </Popconfirm>
                    )
                }
            }

            extra.push(
                <Dropdown key="export" placement="bottomLeft" trigger={['click']} menu={{items: getExportMenu()}}>
                    <Button icon={<ExportOutlined/>}>{t('Export')}</Button>
                </Dropdown>
            )
        }

        return extra
    }

    function handleVersionSelect(selectedItemData: ItemData) {
        onItemView(item, selectedItemData.id)
        setVersionsModalVisible(false)
    }

    const title = getLabel(navTab)
    return (
        <>
            {viewState === ViewState.CREATE_VERSION && <Alert type="warning" closable message={t('A new version will be created')}/>}
            <PageHeader
                className={styles.pageHeader}
                title={Icon ? <span><Icon/>&nbsp;&nbsp;{title}</span> : title}
                extra={getExtra()}
            />
            <Modal
                title={t('Versions')}
                open={isVersionsModalVisible}
                destroyOnClose
                width={VERSIONS_MODAL_WIDTH}
                footer={null}
                onCancel={() => setVersionsModalVisible(false)}
            >
                <SearchDataGridWrapper
                    items={itemMap}
                    item={item}
                    notHiddenColumns={[MAJOR_REV_ATTR_NAME, MINOR_REV_ATTR_NAME, LOCALE_ATTR_NAME]}
                    extraFiltersInput={getVersionsExtraFiltersInput()}
                    majorRev="all"
                    locale={data?.locale}
                    onSelect={handleVersionSelect}
                />
            </Modal>
            {data?.lifecycle?.data && (
                <Modal
                    title={t('Promotion')}
                    open={isPromoteModalVisible}
                    destroyOnClose
                    footer={null}
                    onCancel={() => setPromoteModalVisible(false)}
                >
                    <Promote lifecycleId={data.lifecycle.data.id} currentState={data.state} onSelect={handlePromote}/>
                </Modal>
            )}
        </>
    )
}
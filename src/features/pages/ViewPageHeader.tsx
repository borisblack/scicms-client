import React, {MouseEvent, ReactNode, useMemo, useState} from 'react'
import {Alert, Button, Dropdown, FormInstance, Menu, message, Modal, PageHeader, Popconfirm, Space} from 'antd'
import * as icons from '@ant-design/icons'
import {
    DeleteOutlined,
    DiffOutlined,
    DownOutlined,
    ExclamationCircleOutlined,
    LockOutlined,
    NodeExpandOutlined,
    SaveOutlined,
    UnlockOutlined
} from '@ant-design/icons'

import {Item, ItemData, Operation} from '../../types'
import {getLabel, IPage} from './pagesSlice'
import appConfig from '../../config'
import {useTranslation} from 'react-i18next'
import MutationService from '../../services/mutation'
import SearchDataGridWrapper from './SearchDataGridWrapper'
import styles from './Page.module.css'
import {FiltersInput} from '../../services/query'
import Promote from './Promote'
import {LOCALE_ATTR_NAME, MAJOR_REV_ATTR_NAME, MINOR_REV_ATTR_NAME} from '../../config/constants'

interface Props {
    page: IPage
    form: FormInstance
    isNew: boolean
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    operation: Operation
    setOperation: (operation: Operation) => void
    isLockedByMe: boolean
    setLockedByMe: (isLockedByMe: boolean) => void
    setLoading: (loading: boolean) => void
    onItemView: (item: Item, id: string) => void
    onUpdate: (data: ItemData) => void
    onDelete: () => void
}

const VERSIONS_MODAL_WIDTH = 800

const {confirm} = Modal

export default function ViewPageHeader({page, form, isNew, canCreate, canEdit, canDelete, operation, setOperation, isLockedByMe, setLockedByMe, setLoading, onItemView, onUpdate, onDelete}: Props) {
    const {item, data} = page
    const Icon = item.icon ? (icons as any)[item.icon] : null
    const {t} = useTranslation()
    const [isVersionsModalVisible, setVersionsModalVisible] = useState(false)
    const [isPromoteModalVisible, setPromoteModalVisible] = useState(false)
    const mutationService = useMemo(() => MutationService.getInstance(), [])

    function handleSave(evt: MouseEvent) {
        form.submit()
    }

    async function handleLock(evt: MouseEvent) {
        if (!data)
            throw new Error('Illegal state. Data is undefined')

        setLoading(true)
        try {
            const locked = await mutationService.lock(item, data.id)
            if (locked.success)
                await onUpdate(locked.data)
            else
                message.warning(t('Cannot lock item'))

            setLockedByMe(locked.success)
            setOperation(item.versioned ? Operation.CREATE_VERSION : Operation.UPDATE)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleCancel(evt: MouseEvent) {
        if (!data)
            throw new Error('Illegal state. Data is undefined')

        setLoading(true)
        try {
            const unlocked = await mutationService.unlock(item, data.id)
            if (unlocked.success)
                await onUpdate(unlocked.data)
            else
                message.warning(t('Cannot unlock item'))

            setLockedByMe(!unlocked)
            setOperation(Operation.VIEW)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!canDelete)
            throw new Error('Cannot delete this item')

        if (!data)
            throw new Error('Illegal state. Data is undefined')

        setLoading(true)
        try {
            const deleted = await mutationService.delete(item, data.id, appConfig.mutation.deletingStrategy)
            await onUpdate(deleted)
            await setLockedByMe(false)
            onDelete()
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function handlePurge() {
        if (!canDelete)
            throw new Error('Cannot purge this item')

        if (!data)
            throw new Error('Illegal state. Data is undefined')

        setLoading(true)
        try {
            const purged = await mutationService.purge(item, data.id, appConfig.mutation.deletingStrategy)
            const deleted = purged.data.find(it => it.id === data.id) as ItemData
            await onUpdate(deleted)
            await setLockedByMe(false)
            onDelete()
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function handlePromote(state: string) {
        if (!canEdit)
            throw new Error('Cannot promote this item')

        if (!data)
            throw new Error('Illegal state. Data is undefined')

        setLoading(true)
        try {
            const promoted = await mutationService.promote(item, data.id, state)
            await onUpdate(promoted)
            setPromoteModalVisible(false)
        } catch (e: any) {
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

    const renderPurgeMenu = () => (
        <Menu
            items={[{
                key: 'delete',
                label: t('Current Version'),
                onClick: showDeleteConfirm
            }, {
                key: 'purge',
                label: t('All Versions'),
                onClick: showPurgeConfirm
            }]}
        />
    )

    const getVersionsExtraFiltersInput = (): FiltersInput<unknown> => {
        if (!data)
            return {} as FiltersInput<unknown>

        return {
            id: {
                ne: data.id
            },
            configId: {
                eq: data.configId
            }
        }
    }

    function getExtra(): ReactNode[] {
        const extra: ReactNode[] = []

        if (isNew) {
            if (canCreate) {
                extra.push(<Button key="save" type="primary" onClick={handleSave}><SaveOutlined/> {t('Save')}</Button>)
            }
        } else {
            if (canEdit) {
                if (isLockedByMe /*&& operation !== Operation.VIEW*/) {
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

            if (canEdit && isLockedByMe && operation !== Operation.VIEW && data?.lifecycle.data) {
                extra.push(
                    <Button key="promote" type="primary" icon={<NodeExpandOutlined/>} onClick={() => setPromoteModalVisible(true)}>{t('Promote')}</Button>
                )
            }

            if (canDelete) {
                if (item.versioned) {
                    extra.push(
                        <Dropdown key="purge" placement="bottomRight" overlay={renderPurgeMenu()}>
                            <Button type="primary" danger>
                                <Space>
                                    {t('Delete')}
                                    <DownOutlined />
                                </Space>
                            </Button>
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
        }

        return extra
    }

    function handleVersionSelect(selectedItemData: ItemData) {
        onItemView(item, selectedItemData.id)
        setVersionsModalVisible(false)
    }

    return (
        <>
            {operation === Operation.CREATE_VERSION && <Alert type="warning" closable message={t('A new version will be created')}/>}
            <PageHeader
                className={styles.pageHeader}
                title={<span>{Icon ? <Icon/> : null}&nbsp;&nbsp;{getLabel(page)}</span>}
                extra={getExtra()}
            />
            <Modal
                title={t('Versions')}
                visible={isVersionsModalVisible}
                destroyOnClose
                width={VERSIONS_MODAL_WIDTH}
                footer={null}
                onCancel={() => setVersionsModalVisible(false)}
            >
                <SearchDataGridWrapper
                    item={item}
                    notHiddenColumns={[MAJOR_REV_ATTR_NAME, MINOR_REV_ATTR_NAME, LOCALE_ATTR_NAME]}
                    extraFiltersInput={getVersionsExtraFiltersInput()}
                    majorRev="all"
                    locale={data?.locale}
                    onSelect={handleVersionSelect}
                />
            </Modal>
            {data?.lifecycle.data && (
                <Modal
                    title={t('Promotion')}
                    visible={isPromoteModalVisible}
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
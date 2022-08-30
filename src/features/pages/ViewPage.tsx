import React, {MouseEvent, ReactNode, useEffect, useMemo, useRef, useState} from 'react'
import {
    Alert,
    Button,
    Col,
    Dropdown,
    Form,
    Menu,
    message,
    Modal,
    PageHeader,
    Popconfirm,
    Row,
    Space,
    Spin,
    Tabs
} from 'antd'

import {Attribute, AttrType, Item, ItemData, RelType, UserInfo} from '../../types'
import PermissionService from '../../services/permission'
import * as icons from '@ant-design/icons'
import {
    DeleteOutlined,
    DownOutlined,
    ExclamationCircleOutlined,
    LockOutlined,
    SaveOutlined,
    UnlockOutlined
} from '@ant-design/icons'
import {useTranslation} from 'react-i18next'
import * as ACL from '../../util/acl'
import {getLabel, IPage} from './pagesSlice'
import {hasPlugins, renderPlugins} from '../../plugins'
import {hasComponents, renderComponents} from '../../custom-components'
import styles from './Page.module.css'
import ItemTemplateService from '../../services/item-template'
import AttributeFieldWrapper from './AttributeFieldWrapper'
import QueryService from '../../services/query'
import CoreConfigService from '../../services/core-config'
import {filterValues, parseValues} from '../../util/form'
import {usePrevious} from '../../util/hooks'
import MutationService from '../../services/mutation'
import appConfig from '../../config'

interface Props {
    me: UserInfo
    page: IPage
    onItemView: (item: Item, id: string) => void
    onUpdate: (data: ItemData) => void
    onDelete: () => void
}

enum Operation {
    CREATE = 'CREATE',
    CREATE_VERSION = 'CREATE_VERSION',
    CREATE_LOCALIZATION = 'CREATE_LOCALIZATION',
    UPDATE = 'UPDATE',
    VIEW = 'VIEW'
}

const MAJOR_REV_ATTR_NAME = 'majorRev'
const MINOR_REV_ATTR_NAME = 'minorRev'
const LOCALE_ATTR_NAME = 'locale'

const TabPane = Tabs.TabPane
const {confirm} = Modal

function ViewPage({me, page, onItemView, onUpdate}: Props) {
    const {item, data} = page
    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [isLockedByMe, setLockedByMe] = useState<boolean>(data?.lockedBy?.data?.id === me.id)
    const [operation, setOperation] = useState<Operation>(Operation.VIEW)
    const headerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const [form] = Form.useForm()
    const prevId = usePrevious(data?.id)

    const coreConfigService = useMemo(() => CoreConfigService.getInstance(), [])
    const itemTemplateService = useMemo(() => ItemTemplateService.getInstance(), [])
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const queryService = useMemo(() => QueryService.getInstance(), [])
    const mutationService = useMemo(() => MutationService.getInstance(), [])

    const itemPermissionId = item.permission.data?.id
    const itemPermission = itemPermissionId ? permissionService.findById(itemPermissionId) : null
    const canCreate = !!itemPermission && ACL.canCreate(me, itemPermission)
    const isNew = !data
    const dataPermissionId = data?.permission.data?.id
    const dataPermission = dataPermissionId ? permissionService.findById(dataPermissionId) : null
    const canEdit = !!dataPermission && ACL.canWrite(me, dataPermission)
    const canDelete = !!dataPermission && ACL.canDelete(me, dataPermission)

    useEffect(() => {
        if (prevId !== data?.id) {
            console.log('Reset fields')
            form.resetFields()
        }
    }, [form, prevId, data?.id])

    useEffect(() => {
        const headerNode = headerRef.current
        if (headerNode) {
            renderPlugins('view.header', headerNode, {me, item, data})
            renderPlugins(`${item.name}.view.header`, headerNode, {me, item, data})
        }

        const contentNode = contentRef.current
        if (contentNode) {
            renderPlugins('view.content', contentNode, {me, item, data})
            renderPlugins(`${item.name}.view.content`, contentNode, {me, item, data})
        }

        const footerNode = footerRef.current
        if (footerNode) {
            renderPlugins('view.footer', footerNode, {me, item, data})
            renderPlugins(`${item.name}.view.footer`, footerNode, {me, item, data})
        }
    }, [me, item, data])

    async function handleLock(evt: MouseEvent) {
        if (!data)
            throw new Error('Illegal state. Data is undefined')

        setLoading(true)
        try {
            const locked = await mutationService.lock(item, data.id)
            if (!locked)
                message.warning(t('Cannot lock item'))

            setLockedByMe(locked)
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
            if (unlocked)
                form.resetFields()
            else
                message.warning(t('Cannot unlock item'))

            setLockedByMe(!unlocked)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    function handleSave(evt: MouseEvent) {
       form.submit()
    }

    async function handleFormFinish(values: any) {
        const parsedValues = await parseValues(item, data, values)
        console.log(`Values: ${values}`)
        console.log(`Parsed values: ${parsedValues}`)
        filterValues(values)
        switch (operation) {
            case Operation.CREATE:
                await create(parsedValues)
                break
            case Operation.CREATE_VERSION:
                await createVersion(parsedValues)
                break
            case Operation.CREATE_LOCALIZATION:
                await createLocalization(parsedValues)
                break
            case Operation.UPDATE:
                await update(parsedValues)
                break
            case Operation.VIEW:
            default:
                break
        }
    }

    async function create(values: ItemData) {
        if (!canCreate)
            throw new Error('Cannot create such item')

        setLoading(true)
        try {
            const created = await mutationService.create(item, values)
            await onUpdate(created)
            setLockedByMe(false)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function createVersion(values: ItemData) {
        if (!canCreate)
            throw new Error('Cannot edit this item')

        if (!item.versioned)
            throw new Error('Item is not versioned')

        if (!data)
            throw new Error('Illegal state. Data is undefined')

        setLoading(true)
        try {
            const createdVersion = await mutationService.createVersion(item, data.id, values, values.majorRev, values.locale, appConfig.mutation.defaultCopyCollectionRelations)
            await onUpdate(createdVersion)
            setLockedByMe(false)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function createLocalization(values: ItemData) {
        if (!canCreate)
            throw new Error('Cannot edit this item')

        if (!item.localized)
            throw new Error('Item is not localized')

        if (!data)
            throw new Error('Illegal state. Data is undefined')

        if (!values.locale)
            throw new Error('Illegal state. Locale is null or undefined')

        setLoading(true)
        try {
            const createdLocalization = await mutationService.createLocalization(item, data.id, values, values.locale, appConfig.mutation.defaultCopyCollectionRelations)
            await onUpdate(createdLocalization)
            setLockedByMe(false)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function update(values: ItemData) {
        if (!canCreate)
            throw new Error('Cannot edit this item')

        if (!data)
            throw new Error('Illegal state. Data is undefined')

        setLoading(true)
        try {
            const updated = await mutationService.update(item, data.id, values)
            await onUpdate(updated)
            setLockedByMe(false)
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
            const deleted = await mutationService.delete(item, data.id, appConfig.mutation.defaultDeletingStrategy)
            await onUpdate(deleted)
            setLockedByMe(false)
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
            const purged = await mutationService.purge(item, data.id, appConfig.mutation.defaultDeletingStrategy)
            const deleted = purged.data.find(it => it.id === data.id) as ItemData
            await onUpdate(deleted)
            setLockedByMe(false)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function promote(state: string) {
        if (!canEdit)
            throw new Error('Cannot promote this item')

        if (!data)
            throw new Error('Illegal state. Data is undefined')

        setLoading(true)
        try {
            const promoted = await mutationService.promote(item, data.id, state)
            await onUpdate(promoted)
            setLockedByMe(false)
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

    function renderPageHeader(): ReactNode {
        const Icon = item.icon ? (icons as any)[item.icon] : null
        const extra: ReactNode[] = []
        if (isNew) {
            if (canCreate) {
                extra.push(<Button key="save" type="primary" onClick={handleSave}><SaveOutlined/> {t('Save')}</Button>)
            }
        } else {
            if (canEdit) {
                if (isLockedByMe) {
                    extra.push(<Button key="save" type="primary" onClick={handleSave}><SaveOutlined/> {t('Save')}</Button>)
                    extra.push(<Button key="cancel" icon={<LockOutlined/>} onClick={handleCancel}>{t('Cancel')}</Button>)
                } else {
                    extra.push(<Button key="lock" type="primary" icon={<UnlockOutlined/>} onClick={handleLock}>{t('Edit')}</Button>)
                }
            }
            if (canDelete) {
                if (item.versioned) {
                    extra.push(
                        <Dropdown
                            key="purge"
                            placement="bottomRight"
                            overlay={
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
                            }
                        >
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

        return (
            <>
                {operation === Operation.CREATE_VERSION && <Alert type="warning" message={t('A new version will be created')}/>}
                <PageHeader
                    className={styles.pageHeader}
                    title={<span>{Icon ? <Icon/> : null}&nbsp;&nbsp;{getLabel(page)}</span>}
                    extra={extra}
                />
            </>
        )
    }

    const renderAttributes = (attributes: {[name: string]: Attribute}) => Object.keys(attributes)
        .filter(attrName => {
            const attr = attributes[attrName]
            return !attr.private && !attr.fieldHidden
                && (attr.type !== AttrType.relation || (attr.relType !== RelType.oneToMany && attr.relType !== RelType.manyToMany))
                && (item.versioned || (attrName !== MAJOR_REV_ATTR_NAME && attrName !== MINOR_REV_ATTR_NAME))
                && (item.localized || attrName !== LOCALE_ATTR_NAME)
        })
        .map(attrName => {
            const attr = attributes[attrName]
            return (
                <AttributeFieldWrapper
                    key={attrName}
                    form={form}
                    item={item}
                    attrName={attrName}
                    attribute={attr}
                    value={data ? data[attrName] : null}
                    setLoading={setLoading}
                    onChange={(value: any) => handleFieldChange(attrName, value)}
                    onItemView={onItemView}
                />
            )
        })

    async function handleFieldChange(attrName: string, value: any) {
        if (attrName === LOCALE_ATTR_NAME) {
            if (!item.localized)
                throw new Error('Illegal state. Cannot change locale on non localized item')

            if (!value)
                return

            if (operation !== Operation.UPDATE)
                return

            if (!data || (data.locale ?? coreConfigService.coreConfig.i18n.defaultLocale) === value)
                return

            setLoading(true)
            try {
                const existingLocalization = await queryService.findLocalization(item, data.configId, data.majorRev, value)
                if (!existingLocalization)
                    return

                setOperation(Operation.CREATE_LOCALIZATION)
                onUpdate(existingLocalization)
            } catch (e: any) {
                message.error(e.message)
            } finally {
                setLoading(false)
            }
        }
    }

    const getDefaultTemplateAttributes = () => itemTemplateService.getDefault().spec.attributes

    function getOwnAttributes() {
        const allAttributes = item.spec.attributes
        const defaultTemplateAttributes = getDefaultTemplateAttributes()
        const ownAttributes: {[name: string]: Attribute} = {}
        for (const attrName in allAttributes) {
            if (!(attrName in defaultTemplateAttributes))
                ownAttributes[attrName] = allAttributes[attrName]
        }
        return ownAttributes
    }

    function renderRelationships() {
        return (
            <Tabs>
                {Object.keys(item.spec.attributes)
                    .filter(key => {
                        const attr = item.spec.attributes[key]
                        return attr.type === AttrType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)
                    })
                    .map(key => {
                        const attr = item.spec.attributes[key]
                        // TODO: Get item and build query
                        return (
                            <TabPane key={key} tab={attr.displayName}>
                                {/*<DataGrid initialQueryItem={initialQueryItem} isRelationship />*/}
                            </TabPane>
                        )
                    })}
            </Tabs>
        )
    }

    return (
        <Spin spinning={loading}>
            {hasComponents('view.header') && renderComponents('view.header', {me, item})}
            {hasComponents(`${item.name}.view.header`) && renderComponents(`${item.name}.view.header`, {me, item})}
            {hasPlugins('view.header', `${item.name}.view.header`) && <div ref={headerRef}/>}
            {(!hasComponents('view.header', `${item.name}.view.header`) && !hasPlugins('view.header', `${item.name}.view.header`)) && renderPageHeader()}

            {hasComponents('view.content') && renderComponents('view.content', {me, item})}
            {hasComponents(`${item.name}.view.content`) && renderComponents(`${item.name}.view.content`, {me, item})}
            {hasPlugins('view.content', `${item.name}.view.content`) && <div ref={contentRef}/>}
            {(!hasComponents('view.content', `${item.name}.view.content`) && !hasPlugins('view.content', `${item.name}.view.content`)) &&
                <Form
                    form={form}
                    size="small"
                    layout="vertical"
                    disabled={(!canEdit || !isLockedByMe) && (!canCreate || !isNew)}
                    onFinish={handleFormFinish}
                >
                    <Row gutter={16}>
                        <Col span={12}>{renderAttributes(getOwnAttributes())}</Col>
                        <Col span={12}>{renderAttributes(getDefaultTemplateAttributes())}</Col>
                    </Row>
                </Form>
            }

            {hasComponents('view.footer') && renderComponents('view.footer', {me, item})}
            {hasComponents(`${item.name}.view.footer`) && renderComponents(`${item.name}.view.footer`, {me, item})}
            {hasPlugins('view.footer', `${item.name}.view.footer`) && <div ref={footerRef}/>}
        </Spin>
    )
}

export default ViewPage
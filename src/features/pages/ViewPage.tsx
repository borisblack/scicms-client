import React, {ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Col, Form, message, Row, Spin, Tabs} from 'antd'
import * as icons from '@ant-design/icons'

import {Attribute, AttrType, Item, ItemData, Operation, RelType, UserInfo} from '../../types'
import PermissionService from '../../services/permission'
import {useTranslation} from 'react-i18next'
import {IPage} from './pagesSlice'
import {hasPlugins, renderPlugins} from '../../plugins'
import {getComponents, hasComponents, renderComponents} from '../../custom-components'
import ItemTemplateService from '../../services/item-template'
import AttributeFieldWrapper from './AttributeFieldWrapper'
import QueryService from '../../services/query'
import CoreConfigService from '../../services/core-config'
import {filterValues, parseValues} from '../../util/form'
import MutationService from '../../services/mutation'
import appConfig from '../../config'
import ViewPageHeader from './ViewPageHeader'
import {
    DEBUG,
    ITEM_ITEM_NAME,
    ITEM_TEMPLATE_ITEM_NAME,
    LOCALE_ATTR_NAME,
    MAJOR_REV_ATTR_NAME,
    MINOR_REV_ATTR_NAME
} from '../../config/constants'
import ItemService from '../../services/item'
import RelationsDataGridWrapper from './RelationsDataGridWrapper'
import {Callback} from '../../services/mediator'

interface Props {
    me: UserInfo
    page: IPage
    closePage: () => void
    onItemCreate: (item: Item, initialData?: ItemData | null, cb?: Callback, observerKey?: string) => void
    onItemView: (item: Item, id: string, cb?: Callback, observerKey?: string) => void
    onItemDelete: (itemName: string, id: string) => void
    onUpdate: (data: ItemData) => void
}

const TabPane = Tabs.TabPane

function ViewPage({me, page, closePage, onItemView, onItemCreate, onItemDelete, onUpdate}: Props) {
    const {item, data} = page
    const isNew = !data?.id
    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [isLockedByMe, setLockedByMe] = useState<boolean>(data?.lockedBy?.data?.id === me.id)
    const [operation, setOperation] = useState<Operation>(isNew ? Operation.CREATE : (isLockedByMe ? (item.versioned ? Operation.CREATE_VERSION : Operation.UPDATE) : Operation.VIEW))
    const headerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const contentFormRef = useRef<HTMLDivElement>(null)
    const tabsContentRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const [form] = Form.useForm()

    const coreConfigService = useMemo(() => CoreConfigService.getInstance(), [])
    const itemTemplateService = useMemo(() => ItemTemplateService.getInstance(), [])
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const queryService = useMemo(() => QueryService.getInstance(), [])
    const mutationService = useMemo(() => MutationService.getInstance(), [])
    
    const permissions = useMemo(() => {
        const acl = permissionService.getAcl(me, item, data)
        const canEdit = ((item.name !== ITEM_TEMPLATE_ITEM_NAME && item.name !== ITEM_ITEM_NAME) || !data?.core) && acl.canWrite
        const canDelete = ((item.name !== ITEM_TEMPLATE_ITEM_NAME && item.name !== ITEM_ITEM_NAME) || !data?.core) && acl.canDelete
        return [acl.canCreate, canEdit, canDelete]
    }, [data, item, me, permissionService])
    const [canCreate, canEdit, canDelete] = permissions
    
    const pluginContext = useMemo(() => ({me, item, data}), [data, item, me])
    const customComponentContext = useMemo(() => ({me, item, data}), [data, item, me])

    useEffect(() => {
        if (DEBUG)
            console.log('Fields reset')

        form.resetFields()
    }, [form, data])

    useEffect(() => {
        const headerNode = headerRef.current
        if (headerNode) {
            renderPlugins('view.header', headerNode, pluginContext)
            renderPlugins(`${item.name}.view.header`, headerNode, pluginContext)
        }

        const contentNode = contentRef.current
        if (contentNode) {
            renderPlugins('view.content', contentNode, pluginContext)
            renderPlugins(`${item.name}.view.content`, contentNode, pluginContext)
        }

        const contentFormNode = contentFormRef.current
        if (contentFormNode) {
            renderPlugins('view.content.form', contentFormNode, pluginContext)
            renderPlugins(`${item.name}.view.content,form`, contentFormNode, pluginContext)
        }

        const footerNode = footerRef.current
        if (footerNode) {
            renderPlugins('view.footer', footerNode, pluginContext)
            renderPlugins(`${item.name}.view.footer`, footerNode, pluginContext)
        }

        const tabsContentNode = tabsContentRef.current
        if (tabsContentNode) {
            renderPlugins('tabs.content', tabsContentNode, pluginContext)
            renderPlugins(`${item.name}.tabs.content`, tabsContentNode, pluginContext)
        }
    }, [item.name, pluginContext])

    async function handleFormFinish(values: any) {
        if (DEBUG)
            console.log('Values', values)

        let parsedValues
        try {
            parsedValues = await parseValues(item, data, values)
            if (DEBUG)
                console.log('Parsed values', parsedValues)
        } catch (e: any) {
            message.error(e)
            return
        }

        if (DEBUG)
            console.log('Operation', operation)

        switch (operation) {
            case Operation.CREATE:
                await create(filterValues(parsedValues), item.manualVersioning ? parsedValues.majorRev : null, item.localized ? parsedValues.locale : null)
                break
            case Operation.CREATE_VERSION:
                await createVersion(filterValues(parsedValues), item.manualVersioning ? parsedValues.majorRev : null, item.localized ? parsedValues.locale : null)
                break
            case Operation.CREATE_LOCALIZATION:
                if (!parsedValues.locale)
                    throw new Error('Locale is required')

                await createLocalization(filterValues(parsedValues), parsedValues.locale)
                break
            case Operation.UPDATE:
                await update(filterValues(parsedValues))
                break
            case Operation.VIEW:
            default:
                break
        }
    }

    async function create(values: ItemData, majorRev?: string | null, locale?: string | null) {
        if (!canCreate)
            throw new Error('Cannot create such item')

        setLoading(true)
        try {
            const created = await mutationService.create(item, values, majorRev, locale)
            await onUpdate(created)
            setLockedByMe(false)
            setOperation(Operation.VIEW)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function createVersion(values: ItemData, majorRev?: string | null, locale?: string | null) {
        if (!canCreate)
            throw new Error('Cannot edit this item')

        if (!item.versioned)
            throw new Error('Item is not versioned')

        if (isNew)
            throw new Error('Cannot create version for new item')

        setLoading(true)
        try {
            const createdVersion = await mutationService.createVersion(item, data.id, values, majorRev, locale, appConfig.mutation.copyCollectionRelations)
            await onUpdate(createdVersion)
            setLockedByMe(false)
            setOperation(Operation.VIEW)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function createLocalization(values: ItemData, locale: string) {
        if (!canCreate)
            throw new Error('Cannot edit this item')

        if (!item.localized)
            throw new Error('Item is not localized')

        if (isNew)
            throw new Error('Cannot create localization for new item')

        setLoading(true)
        try {
            const createdLocalization = await mutationService.createLocalization(item, data.id, values, locale, appConfig.mutation.copyCollectionRelations)
            await onUpdate(createdLocalization)
            setLockedByMe(false)
            setOperation(Operation.VIEW)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function update(values: ItemData) {
        if (!canCreate)
            throw new Error('Cannot edit this item')

        if (isNew)
            throw new Error('New item cannot be updated')

        setLoading(true)
        try {
            const updated = await mutationService.update(item, data.id, values)
            await onUpdate(updated)
            setLockedByMe(false)
            setOperation(Operation.VIEW)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
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

            if (operation !== Operation.UPDATE && operation !== Operation.CREATE_VERSION)
                return

            if (isNew || (data.locale ?? coreConfigService.coreConfig.i18n.defaultLocale) === value)
                return

            setLoading(true)
            try {
                const existingLocalization = await queryService.findLocalization(item, data.configId, data.majorRev, value)
                if (existingLocalization) {
                    if (operation === Operation.UPDATE)
                        setOperation(Operation.CREATE_LOCALIZATION)

                    onUpdate(existingLocalization)
                } else {
                    setOperation(Operation.CREATE_LOCALIZATION)
                }
            } catch (e: any) {
                message.error(e.message)
            } finally {
                setLoading(false)
            }
        }
    }

    const templateAttributes = useMemo(() => {
        let templateAttributes: {[name: string]: Attribute} = {}
        for (const itemTemplateName of item.includeTemplates) {
            const itemTemplate = itemTemplateService.getByName(itemTemplateName)
            templateAttributes = {...templateAttributes, ...itemTemplate.spec.attributes}
        }
        return templateAttributes
    }, [item.includeTemplates, itemTemplateService])

    const ownAttributes = useMemo(() => {
        const allAttributes = item.spec.attributes
        const ownAttributes: {[name: string]: Attribute} = {}
        for (const attrName in allAttributes) {
            if (!(attrName in templateAttributes))
                ownAttributes[attrName] = allAttributes[attrName]
        }
        return ownAttributes
    }, [item.spec.attributes, templateAttributes])
    
    const renderTabComponents = useCallback((mountPoint: string): ReactNode[] =>
        getComponents(mountPoint).map(it => {
            const Icon = it.icon ? (icons as any)[it.icon] : null
            const title = t(it.title ?? 'Untitled')
            return (
                <TabPane key={it.id} tab={Icon ? <span><Icon/>&nbsp;{title}</span> : title}>
                    {it.render({context: customComponentContext})}
                </TabPane>
            )
        }), [customComponentContext, t])

    const renderCollectionRelations = useCallback(() => {
        const hasTabContentPluginsOrComponents =
            hasPlugins('tabs.content', `${item.name}.tabs.content`) || hasComponents('tabs.content', `${item.name}.tabs.content`)

        const hasTabsPluginsOrComponents =
            hasTabContentPluginsOrComponents || hasComponents('tabs.begin', `${item.name}.tabs.begin`, 'tabs.end', `${item.name}.tabs.end`)

        if (isNew && !hasTabsPluginsOrComponents)
            return null

        const collectionAttrNames =
            Object.keys(item.spec.attributes).filter(key => {
                const attribute = item.spec.attributes[key]
                return attribute.type === AttrType.relation
                    && (attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany)
                    && !attribute.fieldHidden
            })

        return (
            <>
                {hasComponents('tabs.content') && renderComponents('tabs.content', customComponentContext)}
                {hasComponents(`${item.name}.tabs.content`) && renderComponents(`${item.name}.tabs.content`, customComponentContext)}
                {hasPlugins('tabs.content', `${item.name}.tabs.content`) && <div ref={tabsContentRef}/>}

                {!hasTabContentPluginsOrComponents && (
                    <Tabs>
                        {hasComponents('tabs.begin') && renderTabComponents('tabs.begin')}
                        {hasComponents(`${item.name}.tabs.begin`) && renderTabComponents(`${item.name}.tabs.begin`)}

                        {!isNew && collectionAttrNames.map(key => {
                            const attribute = item.spec.attributes[key]
                            if (!attribute.target)
                                throw new Error('Illegal attribute target')

                            const target = itemService.getByName(attribute.target)
                            const TargetIcon = target.icon && (icons as any)[target.icon]
                            const title = t(attribute.displayName)
                            return (
                                <TabPane key={key} tab={TargetIcon ? <span><TargetIcon/>&nbsp;{title}</span> : title}>
                                    <RelationsDataGridWrapper
                                        me={me}
                                        item={item}
                                        itemData={data}
                                        relAttrName={key}
                                        relAttribute={attribute}
                                        pageKey={page.key}
                                        onItemCreate={onItemCreate}
                                        onItemView={onItemView}
                                        onItemDelete={onItemDelete}
                                    />
                                </TabPane>
                            )
                        })}

                        {hasComponents('tabs.end') && renderTabComponents('tabs.end')}
                        {hasComponents(`${item.name}.tabs.end`) && renderTabComponents(`${item.name}.tabs.end`)}
                    </Tabs>
                )}
            </>
        )
    }, [customComponentContext, data, isNew, item, itemService, me, onItemCreate, onItemDelete, onItemView, page.key, renderTabComponents, t])

    return (
        <Spin spinning={loading}>
            {hasComponents('view.header') && renderComponents('view.header', customComponentContext)}
            {hasComponents(`${item.name}.view.header`) && renderComponents(`${item.name}.view.header`, customComponentContext)}
            {hasPlugins('view.header', `${item.name}.view.header`) && <div ref={headerRef}/>}

            {(!hasComponents('view.header', `${item.name}.view.header`) && !hasPlugins('view.header', `${item.name}.view.header`)) && (
                <ViewPageHeader
                    page={page}
                    form={form}
                    isNew={isNew}
                    canCreate={canCreate}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    operation={operation}
                    setOperation={setOperation}
                    isLockedByMe={isLockedByMe}
                    setLockedByMe={setLockedByMe}
                    setLoading={setLoading}
                    closePage={closePage}
                    onItemView={onItemView}
                    onItemDelete={onItemDelete}
                    onUpdate={onUpdate}
                />
            )}

            {hasComponents('view.content') && renderComponents('view.content', customComponentContext)}
            {hasComponents(`${item.name}.view.content`) && renderComponents(`${item.name}.view.content`, customComponentContext)}
            {hasPlugins('view.content', `${item.name}.view.content`) && <div ref={contentRef}/>}

            {(!hasComponents('view.content', `${item.name}.view.content`) && !hasPlugins('view.content', `${item.name}.view.content`)) &&
                <Form
                    form={form}
                    size="small"
                    layout="vertical"
                    disabled={(!canEdit || !isLockedByMe /*|| operation === Operation.VIEW*/) && (!canCreate || !isNew)}
                    onFinish={handleFormFinish}
                >
                    <Row gutter={16}>
                        <Col span={12}>{renderAttributes(ownAttributes)}</Col>
                        <Col span={12}>{renderAttributes(templateAttributes)}</Col>
                    </Row>
                    {hasPlugins('view.content.form', `${item.name}.view.content.form`) && <div ref={contentFormRef}/>}
                    {hasComponents('view.content.form') && renderComponents('view.content.form', customComponentContext)}
                    {hasComponents(`${item.name}.view.content.form`) && renderComponents(`${item.name}.view.content.form`, customComponentContext)}
                </Form>
            }

            {hasComponents('view.footer') && renderComponents('view.footer', customComponentContext)}
            {hasComponents(`${item.name}.view.footer`) && renderComponents(`${item.name}.view.footer`, customComponentContext)}
            {hasPlugins('view.footer', `${item.name}.view.footer`) && <div ref={footerRef}/>}

            {renderCollectionRelations()}
        </Spin>
    )
}

export default ViewPage
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Col, Collapse, Form, Modal, notification, Row, Spin, Tabs} from 'antd'
import {Tab} from 'rc-tabs/lib/interface'
import {Attribute, FieldType, IBuffer, Item, ItemData, Locale, RelType, UserInfo, ViewState} from '../../types'
import {useTranslation} from 'react-i18next'
import {INavTab} from './navTabsSlice'
import {CustomPluginRenderContext, hasPlugins, renderPlugins} from '../../extensions/plugins'
import {
    CustomComponentRenderContext,
    getComponents,
    hasComponents,
    renderComponents
} from '../../extensions/custom-components'
import AttributeFieldWrapper from './AttributeFieldWrapper'
import {filterValues, parseValues} from '../../util/form'
import appConfig from '../../config'
import ViewNavTabHeader from './ViewNavTabHeader'
import {
    ANTD_GRID_COLS,
    CONFIG_ID_ATTR_NAME,
    CURRENT_ATTR_NAME,
    DEBUG,
    ITEM_ITEM_NAME,
    ITEM_TEMPLATE_ITEM_NAME,
    LOCALE_ATTR_NAME,
    MAJOR_REV_ATTR_NAME,
    MINOR_REV_ATTR_NAME
} from '../../config/constants'
import RelationsDataGridWrapper from './RelationsDataGridWrapper'
import {Callback} from '../../services/mediator'
import {
    ApiMiddlewareContext,
    ApiOperation,
    handleApiMiddleware,
    hasApiMiddleware
} from '../../extensions/api-middleware'
import {allIcons} from '../../util/icons'
import {exportWinFeatures, exportWinStyle, renderValue} from '../../util/export'
import PermissionManager, {PermissionMap} from '../../services/permission'
import {ItemMap} from '../../services/item'
import MutationManager from '../../services/mutation'
import QueryManager from '../../services/query'
import {ItemTemplateMap} from '../../services/item-template'
import {CoreConfig} from '../../services/core-config'

interface Props {
    me: UserInfo
    coreConfig: CoreConfig
    itemTemplates: ItemTemplateMap,
    items: ItemMap
    permissions: PermissionMap
    locales: Locale[]
    navTab: INavTab
    closeNavTab: () => void
    onItemCreate: (item: Item, initialData?: ItemData | null, cb?: Callback, observerKey?: string) => void
    onItemView: (item: Item, id: string, extra?: Record<string, any>, cb?: Callback, observerKey?: string) => void
    onItemDelete: (itemName: string, id: string) => void
    onUpdate: (data: ItemData) => void
    onLogout: () => void
}

const {info} = Modal

function ViewNavTab({
    me, coreConfig, itemTemplates, items: itemMap, permissions: permissionMap, locales, navTab, closeNavTab, onItemView, onItemCreate, onItemDelete, onUpdate, onLogout
}: Props) {
    const {item, data} = navTab
    const isNew = !data?.id
    const isSystemItem = item.name === ITEM_TEMPLATE_ITEM_NAME || item.name === ITEM_ITEM_NAME
    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [isLockedByMe, setLockedByMe] = useState<boolean>(data?.lockedBy?.data?.id === me.id)
    const [viewState, setViewState] = useState<ViewState>(isNew ? ViewState.CREATE : (isLockedByMe ? (item.versioned ? ViewState.CREATE_VERSION : ViewState.UPDATE) : ViewState.VIEW))
    const [buffer, setBuffer] = useState<IBuffer>({})
    const headerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const contentFormRef = useRef<HTMLDivElement>(null)
    const tabsContentRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const [form] = Form.useForm()
    const queryManager = useMemo(() => new QueryManager(itemMap), [itemMap])
    const mutationManager = useMemo(() => new MutationManager(itemMap), [itemMap])
    const permissionManager = useMemo(() => new PermissionManager(permissionMap), [permissionMap])
    const permissions = useMemo(() => {
        const acl = permissionManager.getAcl(me, item, data)
        const canEdit = (!isSystemItem || !data?.core) && !item.readOnly && (!item.versioned || !!data?.current) && acl.canWrite
        const canDelete = (!isSystemItem || !data?.core) && !item.readOnly && acl.canDelete
        return [acl.canCreate, canEdit, canDelete, acl.canAdmin]
    }, [data, isSystemItem, item, me, permissionManager])
    const [canCreate, canEdit, canDelete, canAdmin] = permissions
    const handleBufferChange = useCallback((bufferChanges: IBuffer) => setBuffer({...buffer, ...bufferChanges}), [buffer])
    const pluginContext: CustomPluginRenderContext = useMemo(() => ({
        me,
        item,
        buffer,
        data,
        onBufferChange: handleBufferChange,
    }), [buffer, data, handleBufferChange, item, me])

    const customComponentContext: CustomComponentRenderContext = useMemo(() => ({
        me,
        uniqueKey: navTab.key,
        itemTemplates: itemTemplates,
        items: itemMap,
        permissions: permissionMap,
        item,
        buffer,
        data,
        extra: navTab.extra,
        form,
        onBufferChange: handleBufferChange,
        onItemCreate,
        onItemView,
        onItemDelete
    }), [me, navTab.key, navTab.extra, itemTemplates, itemMap, permissionMap, item, buffer, data, form, handleBufferChange, onItemCreate, onItemView, onItemDelete])

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

    const logoutIfNeed = useCallback(() => {
        if (!isSystemItem)
            return

        info({
            title: `${t('You must sign in again to apply the changes')}`,
            onOk: onLogout
        })
    }, [isSystemItem, onLogout, t])

    async function handleFormFinish(values: any) {
        if (DEBUG) {
            console.log('Values', values)
            console.log('Buffer', buffer)
        }

        let parsedValues: ItemData
        try {
            parsedValues = await parseValues(item, data, {...values, ...buffer})
            if (DEBUG)
                console.log('Parsed values', parsedValues)
        } catch (e: any) {
            console.error(e.message)
            notification.error({
                message: t('Parsing error'),
                description: e.message
            })
            return
        }

        if (DEBUG)
            console.log('ViewState', viewState)

        const filteredValues = filterValues(parsedValues)
        switch (viewState) {
            case ViewState.CREATE:
                await create(filteredValues, item.manualVersioning ? parsedValues.majorRev : null, item.localized ? parsedValues.locale : null)
                break
            case ViewState.CREATE_VERSION:
                await createVersion(filteredValues, item.manualVersioning ? parsedValues.majorRev : null, item.localized ? parsedValues.locale : null)
                break
            case ViewState.CREATE_LOCALIZATION:
                if (!parsedValues.locale)
                    throw new Error('Locale is required')

                await createLocalization(filterValues(parsedValues), parsedValues.locale)
                break
            case ViewState.UPDATE:
                await update(filterValues(parsedValues))
                break
            case ViewState.VIEW:
            default:
                break
        }
    }

    async function create(values: ItemData, majorRev?: string | null, locale?: string | null) {
        if (!canCreate)
            throw new Error('Cannot create such item')

        setLoading(true)
        try {
            const doCreate = async () => await mutationManager.create(item, values, majorRev, locale)
            let created: ItemData
            if (hasApiMiddleware(item.name)) {
                const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values}
                created = await handleApiMiddleware(item.name, ApiOperation.CREATE, apiMiddlewareContext, doCreate)
            } else {
                created = await doCreate()
            }
            await onUpdate(created)
            setLockedByMe(false)
            setViewState(ViewState.VIEW)
            logoutIfNeed()
        } catch (e: any) {
            console.error(e.message)
            notification.error({
                message: t('Creation error'),
                description: e.message
            })
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
            const doCreateVersion = async () => await mutationManager.createVersion(item, data.id, values, majorRev, locale, appConfig.mutation.copyCollectionRelations)
            let createdVersion: ItemData
            if (hasApiMiddleware(item.name)) {
                const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values}
                createdVersion = await handleApiMiddleware(item.name, ApiOperation.CREATE_VERSION, apiMiddlewareContext, doCreateVersion)
            } else {
                createdVersion = await doCreateVersion()
            }
            await onUpdate(createdVersion)
            setLockedByMe(false)
            setViewState(ViewState.VIEW)
        } catch (e: any) {
            console.error(e.message)
            notification.error({
                message: t('Version creation error'),
                description: e.message
            })
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
            const doCreateLocalization = async () => await mutationManager.createLocalization(item, data.id, values, locale, appConfig.mutation.copyCollectionRelations)
            let createdLocalization: ItemData
            if (hasApiMiddleware(item.name)) {
                const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values}
                createdLocalization = await handleApiMiddleware(item.name, ApiOperation.CREATE_LOCALIZATION, apiMiddlewareContext, doCreateLocalization)
            } else {
                createdLocalization = await doCreateLocalization()
            }
            await onUpdate(createdLocalization)
            setLockedByMe(false)
            setViewState(ViewState.VIEW)
        } catch (e: any) {
            console.error(e.message)
            notification.error({
                message: t('Localization creation error'),
                description: e.message
            })
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
            const doUpdate = async () => await mutationManager.update(item, data.id, values)
            let updated: ItemData
            if (hasApiMiddleware(item.name)) {
                const apiMiddlewareContext: ApiMiddlewareContext = {me, items: itemMap, item, buffer, values}
                updated = await handleApiMiddleware(item.name, ApiOperation.UPDATE, apiMiddlewareContext, doUpdate)
            } else {
                updated = await doUpdate()
            }
            await onUpdate(updated)
            setLockedByMe(false)
            setViewState(ViewState.VIEW)
            logoutIfNeed()
        } catch (e: any) {
            console.error(e.message)
            notification.error({
                message: t('Update error'),
                description: e.message
            })
        } finally {
            setLoading(false)
        }
    }

    const filterVisibleAttributeNames = useCallback((attributes: {[name: string]: Attribute}): string[] => Object.keys(attributes).filter(attrName => {
        const attr = attributes[attrName]
        return !attr.private && !attr.fieldHidden
            && (attr.type !== FieldType.relation || (attr.relType !== RelType.oneToMany && attr.relType !== RelType.manyToMany))
            && (item.versioned || (attrName !== CONFIG_ID_ATTR_NAME && attrName !== MAJOR_REV_ATTR_NAME && attrName !== MINOR_REV_ATTR_NAME && attrName !== CURRENT_ATTR_NAME))
            && (item.localized || attrName !== LOCALE_ATTR_NAME)
    }), [item.localized, item.versioned])

    const renderAttributes = (attributes: {[name: string]: Attribute}) => (
        <Row gutter={16}>
            {filterVisibleAttributeNames(attributes)
                .map(attrName => {
                    const attr = attributes[attrName]
                    const {fieldWidth} = attr
                    const span = (fieldWidth == null || fieldWidth <= 0 || fieldWidth > ANTD_GRID_COLS) ? appConfig.ui.form.fieldWidth : fieldWidth
                    return (
                        <Col span={span} key={attrName}>
                            <AttributeFieldWrapper
                                me={me}
                                uniqueKey={navTab.key}
                                coreConfig={coreConfig}
                                items={itemMap}
                                locales={locales}
                                form={form}
                                item={item}
                                data={data}
                                attrName={attrName}
                                attribute={attr}
                                value={data ? data[attrName] : null}
                                canAdmin={canAdmin}
                                setLoading={setLoading}
                                onChange={(value: any) => handleFieldChange(attrName, value)}
                                onItemCreate={onItemCreate}
                                onItemView={onItemView}
                                onItemDelete={onItemDelete}
                            />
                        </Col>
                    )
                })}
        </Row>
    )

    async function handleFieldChange(attrName: string, value: any) {
        if (attrName === LOCALE_ATTR_NAME) {
            if (!item.localized)
                throw new Error('Illegal state. Cannot change locale on non localized item')

            if (!value)
                return

            if (viewState !== ViewState.UPDATE && viewState !== ViewState.CREATE_VERSION)
                return

            if (isNew || (data.locale ?? coreConfig.i18n.defaultLocale) === value)
                return

            setLoading(true)
            try {
                const existingLocalization = await queryManager.findLocalization(item, data.configId, data.majorRev, value)
                if (existingLocalization) {
                    if (viewState === ViewState.UPDATE)
                        setViewState(ViewState.CREATE_LOCALIZATION)

                    onUpdate(existingLocalization)
                } else {
                    setViewState(ViewState.CREATE_LOCALIZATION)
                }
            } catch (e: any) {
                console.error(e.message)
                notification.error({
                    message: t('Localization search error'),
                    description: e.message,
                    duration: appConfig.ui.notificationDuration,
                    placement: appConfig.ui.notificationPlacement
                })
            } finally {
                setLoading(false)
            }
        }
    }

    const templateAttributes = useMemo(() => {
        let templateAttributes: {[name: string]: Attribute} = {}
        for (const itemTemplateName of item.includeTemplates) {
            const itemTemplate = itemTemplates[itemTemplateName]
            templateAttributes = {...templateAttributes, ...itemTemplate.spec.attributes}
        }
        return templateAttributes
    }, [item.includeTemplates, itemTemplates])

    const ownAttributes = useMemo(() => {
        const allAttributes = item.spec.attributes
        const ownAttributes: {[name: string]: Attribute} = {}
        for (const attrName in allAttributes) {
            if (!(attrName in templateAttributes))
                ownAttributes[attrName] = allAttributes[attrName]
        }
        return ownAttributes
    }, [item.spec.attributes, templateAttributes])

    const handleHtmlExport = useCallback(() => {
        if (!data)
            return

        const {attributes} = item.spec
        const visibleAttributeNames = filterVisibleAttributeNames(attributes)

        const exportWinHtml = `<!DOCTYPE html>
            <html>
                <head>
                    <title>${t(item.displayName)}</title>
                    <style>
                        ${exportWinStyle}
                    </style>
                </head>
                <body>
                    <h2>${t(item.displayName)}</h2>
                    <table>
                        <tbody>
                            ${visibleAttributeNames.map(attrName => {
                                const attribute = attributes[attrName]
                                return `<tr><td style="font-weight: 600">${t(attribute.displayName)}</td><td>${renderValue(data[attrName])}</td></tr>`
                            }).join('')}
                        </tbody>
                    </table>
                </body>
            </html>`

        // const exportWinUrl = URL.createObjectURL(new Blob([exportWinHtml], { type: "text/html" }))
        const exportWin = window.open('', 'Export HTML', exportWinFeatures) as Window
        exportWin.document.body.innerHTML = exportWinHtml
    }, [data, filterVisibleAttributeNames, item.displayName, item.spec, t])

    const getComponentTabs = useCallback((mountPoint: string): Tab[] =>
        getComponents(mountPoint).map(component => {
            const Icon = component.icon ? allIcons[component.icon] : null
            const title = t(component.title ?? 'Untitled')
            return {
                key: component.id,
                label: Icon ? <span><Icon/>&nbsp;{title}</span> : title,
                children: component.render({context: customComponentContext})
            }

        }), [customComponentContext, t])

    const getTabs = useCallback((collectionAttrNames: string[]): Tab[] => {
        const tabs: Tab[] = []
        if (hasComponents('tabs.begin'))
            tabs.push(...getComponentTabs('tabs.begin'))

        if (hasComponents(`${item.name}.tabs.begin`))
            tabs.push(...getComponentTabs(`${item.name}.tabs.begin`))

        if (!isNew) {
            tabs.push(...collectionAttrNames.map(key => {
                const attribute = item.spec.attributes[key]
                if (!attribute.target)
                    throw new Error('Illegal attribute target')

                const target = itemMap[attribute.target]
                const TargetIcon = target.icon && allIcons[target.icon]
                const title = t(attribute.displayName)
                return {
                    key: key,
                    label: TargetIcon ? <span><TargetIcon/>{title}</span> : title,
                    children: (
                        <RelationsDataGridWrapper
                            me={me}
                            uniqueKey={navTab.key}
                            items={itemMap}
                            permissions={permissionMap}
                            item={item}
                            itemData={data}
                            relAttrName={key}
                            relAttribute={attribute}
                            onItemCreate={onItemCreate}
                            onItemView={onItemView}
                            onItemDelete={onItemDelete}
                        />
                    )
                }
            }))
        }

        if (hasComponents('tabs.end'))
            tabs.push(...getComponentTabs('tabs.end'))

        if (hasComponents(`${item.name}.tabs.end`))
            tabs.push(...getComponentTabs(`${item.name}.tabs.end`))

        return tabs
    }, [getComponentTabs, item, isNew, itemMap, t, me, navTab.key, permissionMap, data, onItemCreate, onItemView, onItemDelete])

    const renderTabs = useCallback(() => {
        const hasTabsContentPlugins = hasPlugins('tabs.content', `${item.name}.tabs.content`)
        const hasTabsContentPluginsOrComponents =
            hasTabsContentPlugins || hasComponents('tabs.content', `${item.name}.tabs.content`)

        const hasTabsPluginsOrComponents =
            hasTabsContentPluginsOrComponents || hasComponents('tabs.begin', `${item.name}.tabs.begin`, 'tabs.end', `${item.name}.tabs.end`)

        if (isNew && !hasTabsPluginsOrComponents)
            return null

        const collectionAttrNames =
            Object.keys(item.spec.attributes).filter(key => {
                const attribute = item.spec.attributes[key]
                return attribute.type === FieldType.relation
                    && (attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany)
                    && !attribute.private && !attribute.fieldHidden
            })

        const hasTabs =
            !hasTabsContentPluginsOrComponents && (collectionAttrNames.length > 0 || hasComponents('tabs.begin', `${item.name}.tabs.begin`, 'tabs.end', `${item.name}.tabs.end`))

        return (
            <>
                {hasComponents('tabs.content') && renderComponents('tabs.content', customComponentContext)}
                {hasComponents(`${item.name}.tabs.content`) && renderComponents(`${item.name}.tabs.content`, customComponentContext)}
                {hasTabsContentPlugins && <div ref={tabsContentRef}/>}
                {hasTabs && <Tabs items={getTabs(collectionAttrNames)}/>}
            </>
        )
    }, [item.name, item.spec.attributes, isNew, customComponentContext, getTabs])

    const hasHeaderPlugins = hasPlugins('view.header', `${item.name}.view.header`)
    const hasContentPlugins = hasPlugins('view.content', `${item.name}.view.content`)
    return (
        <Spin spinning={loading}>
            {hasComponents('view.header') && renderComponents('view.header', customComponentContext)}
            {hasComponents(`${item.name}.view.header`) && renderComponents(`${item.name}.view.header`, customComponentContext)}
            {hasHeaderPlugins && <div ref={headerRef}/>}

            {(!hasComponents('view.header', `${item.name}.view.header`) && !hasHeaderPlugins) && (
                <ViewNavTabHeader
                    me={me}
                    items={itemMap}
                    navTab={navTab}
                    form={form}
                    buffer={buffer}
                    canCreate={canCreate}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    viewState={viewState}
                    setViewState={setViewState}
                    isLockedByMe={isLockedByMe}
                    setLockedByMe={setLockedByMe}
                    setLoading={setLoading}
                    closePage={closeNavTab}
                    onItemView={onItemView}
                    onItemDelete={onItemDelete}
                    onUpdate={onUpdate}
                    onHtmlExport={handleHtmlExport}
                    logoutIfNeed={logoutIfNeed}
                />
            )}

            {hasComponents('view.content') && renderComponents('view.content', customComponentContext)}
            {hasComponents(`${item.name}.view.content`) && renderComponents(`${item.name}.view.content`, customComponentContext)}
            {hasContentPlugins && <div ref={contentRef}/>}

            {(!hasComponents('view.content', `${item.name}.view.content`) && !hasContentPlugins) &&
                <Form
                    form={form}
                    size="small"
                    layout="vertical"
                    disabled={(!canEdit || !isLockedByMe /*|| viewState === ViewState.VIEW*/) && (!canCreate || !isNew)}
                    onFinish={handleFormFinish}
                >
                    {hasComponents('view.content.form.begin') && renderComponents('view.content.form.begin', customComponentContext)}
                    {hasComponents(`${item.name}.view.content.form.begin`) && renderComponents(`${item.name}.view.content.form.begin`, customComponentContext)}
                    <Collapse
                        defaultActiveKey={['mainAttributes']}
                        items={[{
                            key: 'mainAttributes',
                            label: t('Main attributes'),
                            children: renderAttributes(ownAttributes)
                        }, {
                            key: 'additionalAttributes',
                            label: t('Additional attributes'),
                            children: renderAttributes(templateAttributes)
                        }]}
                    />
                    {hasComponents('view.content.form.end') && renderComponents('view.content.form.end', customComponentContext)}
                    {hasComponents('view.content.form.end') && renderComponents('view.content.form.end', customComponentContext)}
                </Form>
            }

            {hasComponents('view.footer') && renderComponents('view.footer', customComponentContext)}
            {hasComponents(`${item.name}.view.footer`) && renderComponents(`${item.name}.view.footer`, customComponentContext)}
            {hasPlugins('view.footer', `${item.name}.view.footer`) && <div ref={footerRef}/>}

            {renderTabs()}
        </Spin>
    )
}

export default ViewNavTab
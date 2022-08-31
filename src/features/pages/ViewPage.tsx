import React, {useEffect, useMemo, useRef, useState} from 'react'
import {Col, Form, message, Row, Spin, Tabs} from 'antd'

import {Attribute, AttrType, Item, ItemData, Operation, RelType, UserInfo} from '../../types'
import PermissionService from '../../services/permission'
import {useTranslation} from 'react-i18next'
import * as ACL from '../../util/acl'
import {IPage} from './pagesSlice'
import {hasPlugins, renderPlugins} from '../../plugins'
import {hasComponents, renderComponents} from '../../custom-components'
import ItemTemplateService from '../../services/item-template'
import AttributeFieldWrapper from './AttributeFieldWrapper'
import QueryService from '../../services/query'
import CoreConfigService from '../../services/core-config'
import {filterValues, parseValues} from '../../util/form'
import MutationService from '../../services/mutation'
import appConfig from '../../config'
import ViewPageHeader from './ViewPageHeader'

interface Props {
    me: UserInfo
    page: IPage
    onItemView: (item: Item, id: string) => void
    onUpdate: (data: ItemData) => void
    onDelete: () => void
}

const ITEM_ITEM_NAME = 'item'
const MAJOR_REV_ATTR_NAME = 'majorRev'
const MINOR_REV_ATTR_NAME = 'minorRev'
const LOCALE_ATTR_NAME = 'locale'

const TabPane = Tabs.TabPane

function ViewPage({me, page, onItemView, onUpdate, onDelete}: Props) {
    const {item, data} = page
    const isNew = !data
    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [isLockedByMe, setLockedByMe] = useState<boolean>(data?.lockedBy?.data?.id === me.id)
    const [operation, setOperation] = useState<Operation>(isNew ? Operation.CREATE : Operation.VIEW)
    const headerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const [form] = Form.useForm()

    const coreConfigService = useMemo(() => CoreConfigService.getInstance(), [])
    const itemTemplateService = useMemo(() => ItemTemplateService.getInstance(), [])
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const queryService = useMemo(() => QueryService.getInstance(), [])
    const mutationService = useMemo(() => MutationService.getInstance(), [])

    const itemPermissionId = item.permission.data?.id
    const itemPermission = itemPermissionId ? permissionService.findById(itemPermissionId) : null
    const canCreate = !!itemPermission && ACL.canCreate(me, itemPermission)
    const dataPermissionId = data?.permission.data?.id
    const dataPermission = dataPermissionId ? permissionService.findById(dataPermissionId) : null
    const canEdit = !!dataPermission && (item.name !== ITEM_ITEM_NAME || !data?.core) && !!data?.current && ACL.canWrite(me, dataPermission)
    const canDelete = !!dataPermission && ACL.canDelete(me, dataPermission)

    useEffect(() => {
        console.log('Reset fields')
        form.resetFields()
    }, [form, data])

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

    async function handleFormFinish(values: any) {
        const parsedValues = await parseValues(item, data, values)
        console.log(`Values: ${JSON.stringify(values)}`)
        filterValues(parsedValues)
        console.log(`Parsed values: ${JSON.stringify(parsedValues)}`)
        console.log(operation)
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
                    onItemView={onItemView}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            )}

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
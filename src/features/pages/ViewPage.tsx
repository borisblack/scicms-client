import React, {MouseEvent, ReactNode, useEffect, useMemo, useRef, useState} from 'react'
import {Button, Col, Form, message, PageHeader, Row, Spin, Tabs} from 'antd'

import {Attribute, AttrType, Item, ItemData, RelType, UserInfo} from '../../types'
import PermissionService from '../../services/permission'
import * as icons from '@ant-design/icons'
import {DeleteOutlined, SaveOutlined, UnlockOutlined} from '@ant-design/icons'
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
import {parseValues} from '../../util/form'
import {usePrevious} from '../../util/hooks'

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

const TabPane = Tabs.TabPane
const MAJOR_REV_ATTR_NAME = 'majorRev'
const MINOR_REV_ATTR_NAME = 'minorRev'
const LOCALE_ATTR_NAME = 'locale'

function ViewPage({me, page, onItemView, onUpdate}: Props) {
    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [operation, setOperation] = useState<Operation>(Operation.VIEW)
    const headerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const [form] = Form.useForm()
    const {item, data} = page
    const prevId = usePrevious(data?.id)

    const coreConfigService = useMemo(() => CoreConfigService.getInstance(), [])
    const itemTemplateService = useMemo(() => ItemTemplateService.getInstance(), [])
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const queryService = useMemo(() => QueryService.getInstance(), [])

    const itemPermissionId = item.permission.data?.id
    const itemPermission = itemPermissionId ? permissionService.findById(itemPermissionId) : null
    const canCreate = !!itemPermission && ACL.canCreate(me, itemPermission)
    const isNew = !data
    const dataPermissionId = data?.permission.data?.id
    const dataPermission = dataPermissionId ? permissionService.findById(dataPermissionId) : null
    const canEdit = !!dataPermission && ACL.canWrite(me, dataPermission)
    const isLocked = data?.lockedBy?.data?.id === me.id
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

    function handleUnlock(evt: MouseEvent) {
        //
    }

    function handleSave(evt: MouseEvent) {
        // dispatch(updateActivePage({}))
    }

    function handleDelete(evt: MouseEvent) {
        //
    }

    function renderPageHeader(): ReactNode {
        const Icon = item.icon ? (icons as any)[item.icon] : null
        const extra: ReactNode[] = []
        if (data) {
            if (canEdit) {
                if (isLocked) {
                    extra.push(<Button key="save" type="primary" onClick={handleSave}><SaveOutlined/> {t('Save')}</Button>)
                } else {
                    extra.push(<Button key="edit" type="primary" onClick={handleUnlock}><UnlockOutlined/> {t('Edit')}</Button>)
                }
            }
            if (canDelete) {
                extra.push(<Button key="delete" type="primary" danger onClick={handleDelete}><DeleteOutlined/> {t('Delete')}</Button>)
            }
        } else if (canCreate && isNew) {
            extra.push(<Button key="save" type="primary" onClick={handleSave}><SaveOutlined/> {t('Save')}</Button>)
        }

        return (
            <PageHeader
                className={styles.pageHeader}
                title={<span>{Icon ? <Icon/> : null}&nbsp;&nbsp;{getLabel(page)}</span>}
                extra={extra}
            />
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

    function handleFormFinish(values: any) {
        const parsedValues = parseValues(item, data, values)
        console.log(`Values: ${values}`)
        console.log(`Parsed values: ${parsedValues}`)
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
                    disabled={!((canCreate && isNew) || (canEdit && isLocked))}
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
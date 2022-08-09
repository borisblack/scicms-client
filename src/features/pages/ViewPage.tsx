import React, {MouseEvent, ReactNode, useEffect, useMemo, useRef, useState} from 'react'
import {Button, Col, PageHeader, Row, Spin, Tabs} from 'antd'

import {AttrType, RelType, UserInfo} from '../../types'
import PermissionService from '../../services/permission'
import * as icons from '@ant-design/icons'
import {DeleteOutlined, SaveOutlined, UnlockOutlined} from '@ant-design/icons'
import {useTranslation} from 'react-i18next'
import * as ACL from '../../util/acl'
import {getLabel, IPage, ViewType} from './pagesSlice'
import {hasPlugins, renderPlugins} from '../../plugins'
import {hasComponents, renderComponents} from '../../custom-components'
import styles from './Page.module.css'

interface Props {
    me: UserInfo
    page: IPage
    onUpdate: () => void
    onDelete: () => void
}

const TabPane = Tabs.TabPane

function ViewPage({me, page}: Props) {
    const {t} = useTranslation()
    const [loading, setLoading] = useState(false)
    const headerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const {item, data} = page

    const permissionService = useMemo(() => PermissionService.getInstance(), [])

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
        const itemPermissionId = item.permission.data?.id
        const itemPermission = itemPermissionId ? permissionService.findById(itemPermissionId) : null
        const canCreate = !itemPermission || ACL.canCreate(me, itemPermission)
        if (data) {
            const dataPermissionId = data.permission.data?.id
            const dataPermission = dataPermissionId ? permissionService.findById(dataPermissionId) : null
            const canEdit = !dataPermission || ACL.canWrite(me, dataPermission)
            const canDelete = !dataPermission || ACL.canDelete(me, dataPermission)
            if (canEdit) {
                if (!data.lockedBy.data) {
                    extra.push(<Button key="edit" type="primary" onClick={handleUnlock}><UnlockOutlined/> {t('Edit')}</Button>)
                } else if (data.lockedBy.data.id === me.id) {
                    extra.push(<Button key="save" type="primary" onClick={handleSave}><SaveOutlined/> {t('Save')}</Button>)
                }
            }

            if (canDelete) {
                extra.push(<Button key="delete" type="primary" danger onClick={handleDelete}><DeleteOutlined/> {t('Delete')}</Button>)
            }
        } else if (canCreate) {
            extra.push(<Button key="save" type="primary" onClick={handleSave}><SaveOutlined/> {t('Save')}</Button>)
        }

        return (
            <PageHeader
                className={styles.pageHeader}
                title={<span>{Icon ? <Icon/> : null}&nbsp;&nbsp;{getLabel(item, ViewType.view, data)}</span>}
                extra={extra}
            />
        )
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
        <>
            {hasComponents('view.header') && renderComponents('view.header', {me, item})}
            {hasComponents(`${item.name}.view.header`) && renderComponents(`${item.name}.view.header`, {me, item})}
            {hasPlugins('view.header', `${item.name}.view.header`) && <div ref={headerRef}/>}
            {(!hasComponents('view.header', `${item.name}.view.header`) && !hasPlugins('view.header', `${item.name}.view.header`)) && renderPageHeader()}

            {hasComponents('view.content') && renderComponents('view.content', {me, item})}
            {hasComponents(`${item.name}.view.content`) && renderComponents(`${item.name}.view.content`, {me, item})}
            {hasPlugins('view.content', `${item.name}.view.content`) && <div ref={contentRef}/>}
            {(!hasComponents('view.content', `${item.name}.view.content`) && !hasPlugins('view.content', `${item.name}.view.content`)) &&
                <Spin spinning={loading}>
                    <Row>
                        <Col span={12}>Left</Col>
                        <Col span={12}>Right</Col>
                    </Row>
                </Spin>
            }

            {hasComponents('view.footer') && renderComponents('view.footer', {me, item})}
            {hasComponents(`${item.name}.view.footer`) && renderComponents(`${item.name}.view.footer`, {me, item})}
            {hasPlugins('view.footer', `${item.name}.view.footer`) && <div ref={footerRef}/>}
        </>
    )
}

export default ViewPage
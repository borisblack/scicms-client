import {useEffect, useMemo, useState} from 'react'
import RGL, {Layout, WidthProvider} from 'react-grid-layout'
import {Button, Form, Modal} from 'antd'
import {useTranslation} from 'react-i18next'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import {CustomComponentRenderContext} from '../../index'
import {DASHBOARD_ITEM_NAME} from '../../../config/constants'
import PermissionService from '../../../services/permission'
import {IDash, IDashboardSpec} from '../../../types'
import DashForm, {DashValues} from './DashForm'
import {DeleteOutlined} from '@ant-design/icons'
import {getDashIcon} from '../../../util/icons'
import appConfig from '../../../config'
import './DashboardSpec.css'
import styles from './DashboardSpec.module.css'

const ReactGridLayout = WidthProvider(RGL)

const initialSpec: IDashboardSpec = {
    dashes: []
}

let tempId = 0

export default function DashboardSpec({me, item, buffer, data}: CustomComponentRenderContext) {
    if (item.name !== DASHBOARD_ITEM_NAME)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isNew = !data?.id
    const isLockedByMe = data?.lockedBy?.data?.id === me.id
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const permissions = useMemo(() => {
        const acl = permissionService.getAcl(me, item, data)
        const canEdit = (isNew && acl.canCreate) || (isLockedByMe && acl.canWrite)
        return [canEdit]
    }, [data, isLockedByMe, isNew, item, me, permissionService])
    const [canEdit] = permissions
    const [spec, setSpec] = useState<IDashboardSpec>(buffer.form.spec ?? {...(data?.spec ?? initialSpec)})
    const [activeDash, setActiveDash] = useState<IDash | null>(null)
    const [isDashModalVisible, setDashModalVisible] = useState(false)
    const [dashForm] = Form.useForm()

    useEffect(() => {
        buffer.form.spec = spec
    }, [buffer.form, spec])

    function handleDashAdd() {
        setSpec(prevSpec => {
            const {dashes} = prevSpec
            const id = (++tempId).toString()
            return {
                dashes: [
                    {
                        name: id,
                        displayName: id,
                        type: appConfig.dashboard.defaultDashType,
                        x: 0,
                        y: 0,
                        w: appConfig.dashboard.cols / 2,
                        h: 1,
                        dataset: '',
                        labelField: '',
                        isAggregate: false,
                        refreshIntervalSeconds: appConfig.dashboard.defaultRefreshIntervalSeconds
                    },
                    ...dashes
                ]
            }
        })
    }

    function handleLayoutChange(layouts: Layout[]) {
        setSpec(prevSpec => ({
            dashes: layouts.map((it, i) => {
                const curDash = prevSpec.dashes[i]
                return {
                    name: curDash.name,
                    type: curDash.type,
                    x: it.x,
                    y: it.y,
                    w: it.w,
                    h: it.h,
                    dataset: curDash.dataset,
                    labelField: curDash.labelField,
                    isAggregate: curDash.isAggregate,
                    aggregateType: curDash.aggregateType,
                    refreshIntervalSeconds: curDash.refreshIntervalSeconds
                }
            })
        }))
    }

    function selectDash(dash: IDash) {
        setActiveDash(dash)
    }

    async function openDash(dash: IDash) {
        await setActiveDash(dash)
        await setDashModalVisible(true)
        dashForm.resetFields()
    }

    function removeDash(name: string) {
        if (name === activeDash?.name) {
            setDashModalVisible(false)
            setActiveDash(null)
        }

        setSpec(prevSpec => ({
            dashes: prevSpec.dashes.filter(it => it.name !== name)
        }))
    }

    function handleActiveDashChange(newActiveDash: DashValues) {
        if (!canEdit || !activeDash)
            return

        const {name, type, dataset, labelField, isAggregate, aggregateType, refreshIntervalSeconds} = newActiveDash
        const dashToUpdate: IDash = {
            ...activeDash,
            name,
            type,
            dataset,
            labelField,
            isAggregate,
            aggregateType,
            refreshIntervalSeconds
        }

        setSpec(prevSpec => ({
            dashes: prevSpec.dashes.map(it => it.name === activeDash.name ? dashToUpdate : it)
        }))

        setActiveDash(dashToUpdate)
    }

    function handleDashFormFinish(newDash: DashValues) {
        handleActiveDashChange(newDash)
        setDashModalVisible(false)
    }

    function renderDash(dash: IDash) {
        const Icon = getDashIcon(dash.type)
        return (
            <div
                key={dash.name}
                className={`${styles.dashWrapper} ${activeDash?.name === dash.name ? styles.activeDash : ''}`}
                onClick={() => selectDash(dash)}
                onDoubleClick={() => openDash(dash)}
            >
                <Icon/>&nbsp;{dash.name}&nbsp;({dash.type})
            </div>
        )
    }

    const layout = spec.dashes.map(it => ({i: it.name, x: it.x, y: it.y, w: it.w, h: it.h}))

    return (
        <>
            <Button type="dashed" disabled={!canEdit} onClick={handleDashAdd}>{t('Add Dash')}</Button>
            {spec.dashes.length > 0 && (
                <ReactGridLayout
                    className={styles.layout}
                    layout={layout}
                    cols={appConfig.dashboard.cols}
                    rowHeight={appConfig.dashboard.rowHeight}
                    isDraggable={canEdit}
                    isDroppable={canEdit}
                    isResizable={canEdit}
                    onLayoutChange={handleLayoutChange}
                >
                    {spec.dashes.map(it => renderDash(it))}
                </ReactGridLayout>
            )}

            <Modal
                style={{top: 20}}
                title={activeDash?.name}
                visible={isDashModalVisible}
                onOk={() => dashForm.submit()}
                onCancel={() => setDashModalVisible(false)}
            >
                {activeDash && (
                    <>
                        <DashForm
                            form={dashForm}
                            dash={activeDash}
                            canEdit={canEdit}
                            onFormFinish={handleDashFormFinish}
                        />
                        <div className={styles.dashModalFooter}>
                            <Button type="primary" danger icon={<DeleteOutlined/>} disabled={!canEdit} onClick={() => removeDash(activeDash.name)}>
                                {t('Remove Dash')}
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
        </>
    )
}
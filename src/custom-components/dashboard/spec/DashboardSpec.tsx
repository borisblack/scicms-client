import {useEffect, useMemo, useState} from 'react'
import RGL, {Layout, WidthProvider} from 'react-grid-layout'
import {Button, Form, Modal} from 'antd'
import {useTranslation} from 'react-i18next'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import {CustomComponentRenderContext} from '../../index'
import {DASHBOARD_ITEM_NAME} from '../../../config/constants'
import PermissionService from '../../../services/permission'
import {IDash, IDashboardSpec, TemporalPeriod} from '../../../types'
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

export default function DashboardSpec({me, item, data, buffer, onBufferChange}: CustomComponentRenderContext) {
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
    const spec = useMemo<IDashboardSpec>(() => buffer.spec ?? data?.spec ?? initialSpec, [buffer.spec, data?.spec])
    const [activeDash, setActiveDash] = useState<IDash | null>(null)
    const [isDashModalVisible, setDashModalVisible] = useState(false)
    const [dashForm] = Form.useForm()

    useEffect(() => {
        onBufferChange({spec})
    }, [spec])

    function handleDashAdd() {
        const id = (++tempId).toString()
        const newSpec: IDashboardSpec = {
            dashes: [
                {
                    name: id,
                    x: 0,
                    y: 0,
                    w: appConfig.dashboard.cols / 2,
                    h: 1,
                    type: appConfig.dashboard.defaultDashType,
                    optValues: {},
                    defaultPeriod: TemporalPeriod.ARBITRARY,
                    isAggregate: false,
                    refreshIntervalSeconds: appConfig.dashboard.defaultRefreshIntervalSeconds
                },
                ...spec.dashes
            ]
        }

        onBufferChange({spec: newSpec})
    }

    function handleLayoutChange(layouts: Layout[]) {
        const newSpec: IDashboardSpec = {
            dashes: layouts.map((it, i) => {
                const curDash = spec.dashes[i]
                const {
                    name, dataset, type, isAggregate, aggregateType, aggregateField, groupField,
                    sortField, sortDirection, optValues,
                    metricType, metricField, unit, labelField,
                    temporalType, temporalField, defaultPeriod, defaultStartTemporal, defaultEndTemporal,
                    refreshIntervalSeconds
                } = curDash

                return {
                    x: it.x,
                    y: it.y,
                    w: it.w,
                    h: it.h,
                    name,
                    dataset,
                    type,
                    isAggregate,
                    aggregateType,
                    aggregateField,
                    groupField,
                    sortField,
                    sortDirection,
                    optValues,
                    metricType,
                    metricField,
                    unit,
                    labelField,
                    temporalField,
                    temporalType,
                    defaultPeriod,
                    defaultStartTemporal,
                    defaultEndTemporal,
                    refreshIntervalSeconds
                }
            })
        }

        onBufferChange({spec: newSpec})
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

        const newSpec = {
            dashes: spec.dashes.filter(it => it.name !== name)
        }

        onBufferChange({spec: newSpec})
    }

    function handleActiveDashChange(newActiveDash: DashValues) {
        if (!canEdit || !activeDash)
            return

        const {
            name, dataset, type, isAggregate, aggregateType, aggregateField, groupField,
            sortField, sortDirection, optValues,
            metricType, metricField, unit, labelField,
            temporalType, temporalField, defaultPeriod, defaultStartTemporal, defaultEndTemporal,
            refreshIntervalSeconds
        } = newActiveDash

        const dashToUpdate: IDash = {
            ...activeDash,
            name,
            dataset,
            type,
            isAggregate,
            aggregateType,
            aggregateField,
            groupField,
            sortField,
            sortDirection,
            optValues,
            metricType,
            metricField,
            unit,
            labelField,
            temporalType,
            temporalField,
            defaultPeriod,
            defaultStartTemporal: defaultStartTemporal?.toISOString(),
            defaultEndTemporal: defaultEndTemporal?.toISOString(),
            refreshIntervalSeconds
        }

        const newSpec = {
            dashes: spec.dashes.map(it => it.name === activeDash.name ? dashToUpdate : it)
        }

        onBufferChange({spec: newSpec})
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
                    rowHeight={appConfig.dashboard.specRowHeight}
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
                open={isDashModalVisible}
                destroyOnClose
                width={1024}
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
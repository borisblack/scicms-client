import {useMemo, useState} from 'react'
import RGL, {Layout, WidthProvider} from 'react-grid-layout'
import {Button, Form, Modal} from 'antd'
import {useTranslation} from 'react-i18next'
import {v4 as uuidv4} from 'uuid'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import {CustomComponentRenderContext} from '../extensions/custom-components'
import {DASHBOARD_ITEM_NAME, DEBUG} from '../config/constants'
import PermissionService from '../services/permission'
import {IDash, IDashboardSpec} from '../types'
import DashForm, {DashValues} from './DashForm'
import {DeleteOutlined} from '@ant-design/icons'
import {generateQueryBlock} from '../util/bi'
import styles from './DashboardSpec.module.css'
import {getDash} from '../extensions/dashes'
import {allIcons} from '../util/icons'
import biConfig from '../config/bi'

const ReactGridLayout = WidthProvider(RGL)

const initialSpec: IDashboardSpec = {
    dashes: []
}

let seqNum = 0

export default function DashboardSpec({me, item, data, buffer, onBufferChange}: CustomComponentRenderContext) {
    if (item.name !== DASHBOARD_ITEM_NAME)
        throw new Error('Illegal argument')

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
    const spec: IDashboardSpec = buffer.spec ?? data?.spec ?? initialSpec
    const allDashes = spec.dashes ?? []
    const [activeDash, setActiveDash] = useState<IDash | null>(null)
    const [isDashModalVisible, setDashModalVisible] = useState(false)
    const [dashForm] = Form.useForm()

    function handleDashAdd() {
        const newSpec: IDashboardSpec = {
            dashes: [
                {
                    id: uuidv4(),
                    name: (++seqNum).toString(),
                    x: 0,
                    y: 0,
                    w: biConfig.cols / 2,
                    h: 1,
                    type: biConfig.defaultDashType,
                    optValues: {},
                    defaultFilters: generateQueryBlock(),
                    isAggregate: false,
                    refreshIntervalSeconds: biConfig.defaultRefreshIntervalSeconds
                },
                ...allDashes
            ]
        }

        onBufferChange({spec: newSpec})
    }

    function handleLayoutChange(layouts: Layout[]) {
        const newSpec: IDashboardSpec = {
            dashes: layouts.map((layout, i) => {
                const curDash = allDashes[i]
                const {
                    id, name, dataset, type, unit,
                    isAggregate, aggregateType, aggregateField, groupField, sortField, sortDirection,
                    optValues, defaultFilters, refreshIntervalSeconds
                } = curDash

                return {
                    id: id ?? uuidv4(),
                    x: layout.x,
                    y: layout.y,
                    w: layout.w,
                    h: layout.h,
                    name,
                    dataset,
                    type,
                    unit,
                    isAggregate,
                    aggregateType,
                    aggregateField,
                    groupField,
                    sortField,
                    sortDirection,
                    optValues,
                    defaultFilters,
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
            dashes: allDashes.filter(it => it.name !== name)
        }

        onBufferChange({spec: newSpec})
    }

    function handleActiveDashChange(newActiveDash: DashValues) {
        if (!canEdit || !activeDash)
            return

        const {
            name, dataset, type, unit,
            isAggregate, aggregateType, aggregateField, groupField, sortField, sortDirection,
            optValues, defaultFilters, refreshIntervalSeconds
        } = newActiveDash

        const dashToUpdate: IDash = {
            ...activeDash,
            id: activeDash.id ?? uuidv4(),
            name,
            dataset,
            type,
            unit,
            isAggregate,
            aggregateType,
            aggregateField,
            groupField,
            sortField,
            sortDirection,
            optValues,
            defaultFilters,
            refreshIntervalSeconds
        }

        const newSpec = {
            dashes: allDashes.map(it => it.name === activeDash.name ? dashToUpdate : it)
        }

        onBufferChange({spec: newSpec})
        setActiveDash(dashToUpdate)
    }

    function handleDashFormFinish(newDash: DashValues) {
        if (DEBUG)
            console.log(newDash)

        handleActiveDashChange(newDash)
        setDashModalVisible(false)
    }

    function renderDash(dash: IDash) {
        const dashHandler = getDash(dash.type)
        const icon = dashHandler?.icon
        const Icon = icon ? allIcons[icon] : null
        return (
            <div
                key={dash.name}
                className={`${styles.dashWrapper} ${activeDash?.name === dash.name ? styles.activeDash : ''}`}
                onClick={() => selectDash(dash)}
                onDoubleClick={() => openDash(dash)}
            >
                {Icon && <Icon/>}&nbsp;{dash.name}&nbsp;({dash.type})
            </div>
        )
    }

    const layout = allDashes.map(it => ({i: it.name, x: it.x, y: it.y, w: it.w, h: it.h}))

    return (
        <>
            <Button type="dashed" disabled={!canEdit} onClick={handleDashAdd}>{t('Add Dash')}</Button>
            {allDashes.length > 0 && (
                <ReactGridLayout
                    className={styles.layout}
                    layout={layout}
                    cols={biConfig.cols}
                    rowHeight={biConfig.specRowHeight}
                    isDraggable={canEdit}
                    isDroppable={canEdit}
                    isResizable={canEdit}
                    onLayoutChange={handleLayoutChange}
                >
                    {allDashes.map(it => renderDash(it))}
                </ReactGridLayout>
            )}

            <Modal
                style={{top: 20}}
                title={activeDash?.name}
                open={isDashModalVisible}
                destroyOnClose
                width={1280}
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
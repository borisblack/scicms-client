import {useEffect, useMemo, useState} from 'react'
import RGL, {Layout, WidthProvider} from 'react-grid-layout'
import {Alert, Button, Form, Modal} from 'antd'
import {useTranslation} from 'react-i18next'
import {v4 as uuidv4} from 'uuid'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import {CustomComponentRenderContext} from '../extensions/custom-components'
import {DASHBOARD_ITEM_NAME, DATASET_ITEM_NAME} from '../config/constants'
import * as PermissionService from '../services/permission'
import {Dashboard, DashboardExtra, Dataset, IDash, IDashboardSpec, QueryFilter} from '../types'
import DashForm, {DashValues} from './DashForm'
import {generateQueryBlock, printSingleQueryFilter} from '../util/bi'
import biConfig from '../config/bi'
import _ from 'lodash'
import * as DatasetService from '../services/dataset'
import DashWrapper from './DashWrapper'
import styles from './DashboardSpec.module.css'
import './DashboardSpec.css'
import * as DashboardService from '../services/dashboard'

interface DashboardSpecProps extends CustomComponentRenderContext {
    extra?: DashboardExtra
    readOnly?: boolean
}

const ReactGridLayout = WidthProvider(RGL)
const initialSpec: IDashboardSpec = {
    dashes: []
}
let seqNum = 0

export default function DashboardSpec({
    me, uniqueKey, items: itemMap, permissions: permissionMap, item, data, extra, buffer, readOnly, onBufferChange, onItemView
}: DashboardSpecProps) {
    if (item.name !== DASHBOARD_ITEM_NAME)
        throw new Error('Illegal argument')

    const {t} = useTranslation()
    const isNew = !data?.id
    const isLockedByMe = data?.lockedBy?.data?.id === me.id
    const datasetItem = useMemo(() => itemMap[DATASET_ITEM_NAME], [itemMap])
    const dashboardItem = useMemo(() => itemMap[DASHBOARD_ITEM_NAME], [itemMap])
    const permissions = useMemo(() => {
        const acl = PermissionService.getAcl(permissionMap, me, item, data)
        const canEdit = (isNew && acl.canCreate) || (isLockedByMe && acl.canWrite)
        return [canEdit]
    }, [data, isLockedByMe, isNew, item, me, permissionMap])
    const [canEdit] = permissions
    const spec: IDashboardSpec = buffer.spec ?? data?.spec ?? initialSpec
    const [datasets, setDatasets] = useState<{[name: string]: Dataset}>({})
    const [dashboards, setDashboards] = useState<Dashboard[]>([])
    const currentDashboard = {...data, spec} as Dashboard
    const allDashes = spec.dashes ?? []
    const [activeDash, setActiveDash] = useState<IDash | null>(null)
    const [isFullScreen, setFullScreen] = useState<boolean>(false)
    const [isDashModalVisible, setDashModalVisible] = useState(false)
    const [dashForm] = Form.useForm()

    useEffect(() => {
        DatasetService.fetchDatasets()
            .then(datasetList => {
                setDatasets(_.mapKeys(datasetList, ds => ds.name))
            })

        DashboardService.fetchDashboards()
            .then(dashboards => {
                setDashboards(_.sortBy(dashboards, db => db.name))
            })
    }, [])

    function handleDashAdd() {
        const newSpec: IDashboardSpec = {
            dashes: [
                {
                    id: uuidv4(),
                    name: (++seqNum).toString(),
                    x: 0,
                    y: 0,
                    w: biConfig.cols / 2,
                    h: biConfig.defaultDashHeight,
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
                    optValues, defaultFilters, relatedDashboardId, refreshIntervalSeconds
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
                    relatedDashboardId,
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

    function removeDash(id: string) {
        if (id === activeDash?.id) {
            setDashModalVisible(false)
            setActiveDash(null)
        }

        const newSpec = {
            dashes: allDashes.filter(it => it.id !== id)
        }

        onBufferChange({spec: newSpec})
    }

    function handleActiveDashChange(newActiveDash: DashValues) {
        if (!canEdit || !activeDash)
            return

        const {
            name, dataset, type, unit,
            isAggregate, aggregateType, aggregateField, groupField, sortField, sortDirection,
            optValues, defaultFilters, relatedDashboardId, refreshIntervalSeconds
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
            relatedDashboardId,
            refreshIntervalSeconds
        }

        const newSpec = {
            dashes: allDashes.map(it => it.name === activeDash.name ? dashToUpdate : it)
        }

        onBufferChange({spec: newSpec})
        setActiveDash(dashToUpdate)
    }

    function handleDashFormFinish(newDash: DashValues) {
        handleActiveDashChange(newDash)
        setDashModalVisible(false)
    }

    function handleRelatedDashboardOpen(dashboardId: string, queryFilter: QueryFilter) {
        onItemView(dashboardItem, dashboardId, {queryFilter})
    }

    function renderDash(dash: IDash) {
        if (datasets == null)
            throw new Error('Illegal state')

        return (
            <div
                key={dash.name}
                className={`${styles.dashWrapper} ${activeDash?.name === dash.name ? styles.activeDash : ''} ${canEdit ? styles.editable : ''}`}
                onClick={() => selectDash(dash)}
            >
                <DashWrapper
                    pageKey={uniqueKey}
                    dataset={datasets[dash.dataset ?? '']}
                    dashboard={currentDashboard}
                    extra={extra}
                    dash={dash}
                    readOnly={readOnly ?? false}
                    canEdit={canEdit}
                    onFullScreenChange={setFullScreen}
                    onRelatedDashboardOpen={handleRelatedDashboardOpen}
                    onEdit={() => openDash(dash)}
                    onDelete={() => removeDash(dash.id)}
                />
            </div>
        )
    }

    async function handleDatasetView(id: string) {
        await onItemView(datasetItem, id)
        setDashModalVisible(false)
    }

    const layout: Layout[] = allDashes.map(it => {
        const isItemEditable = activeDash && it.id === activeDash.id && isFullScreen
        return {
            i: it.name,
            x: it.x,
            y: it.y,
            w: it.w,
            h: it.h,
            isDraggable: isItemEditable ? false : undefined,
            isResizable: isItemEditable ? false : undefined,
        }
    })

    const isGridEditable = !readOnly && canEdit
    return (
        <>
            {extra && extra.queryFilter && (
                <Alert style={{marginBottom: 16}} message={t('Filtered')} description={printSingleQueryFilter(extra.queryFilter)} type="warning"/>
            )}

            {!readOnly && <Button type="dashed" style={{marginBottom: 12}} disabled={!isGridEditable} onClick={handleDashAdd}>{t('Add Dash')}</Button>}

            {datasets && allDashes.length > 0 && (
                <ReactGridLayout
                    className={styles.layout}
                    layout={layout}
                    cols={biConfig.cols}
                    rowHeight={biConfig.rowHeight}
                    isDraggable={isGridEditable}
                    isDroppable={isGridEditable}
                    isResizable={isGridEditable}
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
                            datasets={datasets}
                            dashboards={dashboards}
                            onFormFinish={handleDashFormFinish}
                            onDatasetView={handleDatasetView}
                        />
                    </>
                )}
            </Modal>
        </>
    )
}
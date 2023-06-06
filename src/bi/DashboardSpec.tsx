import {useEffect, useMemo, useState} from 'react'
import RGL, {Layout, WidthProvider} from 'react-grid-layout'
import {Alert, Button, Form, Modal} from 'antd'
import {useTranslation} from 'react-i18next'
import {v4 as uuidv4} from 'uuid'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import {CustomComponentRenderContext} from '../extensions/custom-components'
import {DASHBOARD_ITEM_NAME, DEBUG} from '../config/constants'
import PermissionService from '../services/permission'
import {Dashboard, DashboardExtra, Dataset, IDash, IDashboardSpec, QueryFilter} from '../types'
import DashForm, {DashValues} from './DashForm'
import {DeleteOutlined} from '@ant-design/icons'
import {generateQueryBlock, printSingleQueryFilter, queryOpTitles} from '../util/bi'
import biConfig from '../config/bi'
import _ from 'lodash'
import DatasetService from '../services/dataset'
import DashWrapper from './DashWrapper'
import styles from './DashboardSpec.module.css'
import './DashboardSpec.css'
import ItemService from '../services/item'

const ReactGridLayout = WidthProvider(RGL)
const datasetService = DatasetService.getInstance()
const initialSpec: IDashboardSpec = {
    dashes: []
}

interface DashboardSpecProps extends CustomComponentRenderContext {
    extra?: DashboardExtra
    readOnly?: boolean
}

let seqNum = 0

export default function DashboardSpec({me, pageKey, item, data, extra, buffer, readOnly, onBufferChange, onItemView}: DashboardSpecProps) {
    if (item.name !== DASHBOARD_ITEM_NAME)
        throw new Error('Illegal argument')

    const {t} = useTranslation()
    const isNew = !data?.id
    const isLockedByMe = data?.lockedBy?.data?.id === me.id
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const dashboardItem = useMemo(() => itemService.getDashboard(), [])
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const permissions = useMemo(() => {
        const acl = permissionService.getAcl(me, item, data)
        const canEdit = (isNew && acl.canCreate) || (isLockedByMe && acl.canWrite)
        return [canEdit]
    }, [data, isLockedByMe, isNew, item, me, permissionService])
    const [canEdit] = permissions
    const spec: IDashboardSpec = buffer.spec ?? data?.spec ?? initialSpec
    const [datasets, setDatasets] = useState<{[name: string]: Dataset} | null>(null)
    const dashboard = {...data, spec} as Dashboard
    const allDashes = spec.dashes ?? []
    const [activeDash, setActiveDash] = useState<IDash | null>(null)
    const [isFullScreen, setFullScreen] = useState<boolean>(false)
    const [isDashModalVisible, setDashModalVisible] = useState(false)
    const [dashForm] = Form.useForm()

    useEffect(() => {
        datasetService.findAll().then(datasetList => {
            setDatasets(_.mapKeys(datasetList, ds => ds.name))
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
        if (DEBUG)
            console.log(newDash)

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
                    pageKey={pageKey}
                    dataset={datasets[dash.dataset ?? '']}
                    dashboard={dashboard}
                    extra={extra}
                    dash={dash}
                    onFullScreenChange={setFullScreen}
                    onRelatedDashboardOpen={handleRelatedDashboardOpen}
                    onEdit={readOnly ? undefined : () => openDash(dash)}
                />
            </div>
        )
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
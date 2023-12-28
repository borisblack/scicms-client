import _ from 'lodash'
import {memo, useEffect, useMemo, useState} from 'react'
import RGL, {Layout, WidthProvider} from 'react-grid-layout'
import {Alert, Button} from 'antd'
import {useTranslation} from 'react-i18next'
import {v4 as uuidv4} from 'uuid'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import {CustomComponentRenderContext} from '../extensions/custom-components'
import {DASHBOARD_ITEM_NAME} from '../config/constants'
import {Dashboard, DashboardExtra, Dataset, IDash, IDashboardSpec} from '../types/bi'
import {generateQueryBlock, printSingleQueryFilter} from '../util/bi'
import biConfig from '../config/bi'
import * as DatasetService from '../services/dataset'
import DashWrapper from './DashWrapper'
import styles from './DashboardSpec.module.css'
import './DashboardSpec.css'
import * as DashboardService from '../services/dashboard'
import {useAcl} from '../util/hooks'
import {generateKey} from '../util/mdi'

interface DashboardSpecProps extends CustomComponentRenderContext {
    extra?: DashboardExtra
    readOnly?: boolean
}

const ReactGridLayout = WidthProvider(RGL)
const initialSpec: IDashboardSpec = {
    dashes: []
}
let seqNum = 0

function DashboardSpec({data: dataWrapper, buffer, readOnly, onBufferChange}: DashboardSpecProps) {
    const {item, data, extra} = dataWrapper
    if (item.name !== DASHBOARD_ITEM_NAME)
        throw new Error('Illegal argument')

    const uniqueKey = generateKey(dataWrapper)
    const {t} = useTranslation()
    const acl = useAcl(item, data)
    const spec: IDashboardSpec = buffer.spec ?? data?.spec ?? initialSpec
    const [datasets, setDatasets] = useState<Record<string, Dataset>>({})
    const [dashboards, setDashboards] = useState<Dashboard[]>([])
    const currentDashboard = {...data, spec} as Dashboard
    const allDashes = spec.dashes?.map(dash => ({...dash, id: dash.id ?? uuidv4()})) ?? []
    const [activeDash, setActiveDash] = useState<IDash | null>(null)
    const [isFullScreen, setFullScreen] = useState<boolean>(false)

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
        const newDash = {
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
        }

        const newSpec: IDashboardSpec = {
            dashes: [
                newDash,
                ...allDashes
            ]
        }

        onBufferChange({spec: newSpec})
    }

    function handleLayoutChange(layouts: Layout[]) {
        const newSpec: IDashboardSpec = {
            dashes: layouts.map((layout, i) => {
                const curDash = allDashes[i]

                return {
                    id: curDash.id,
                    x: layout.x,
                    y: layout.y,
                    w: layout.w,
                    h: layout.h,
                    name: curDash.name,
                    dataset: curDash.dataset,
                    type: curDash.type,
                    unit: curDash.unit,
                    isAggregate: curDash.isAggregate,
                    aggregateType: curDash.aggregateType,
                    aggregateField: curDash.aggregateField,
                    groupField: curDash.groupField,
                    sortField: curDash.sortField,
                    optValues: curDash.optValues,
                    defaultFilters: curDash.defaultFilters,
                    relatedDashboardId: curDash.relatedDashboardId,
                    refreshIntervalSeconds: curDash.refreshIntervalSeconds
                }
            })
        }

        onBufferChange({spec: newSpec})
    }

    function selectDash(dash: IDash) {
        setActiveDash(dash)
    }

    function removeDash(id: string) {
        if (id === activeDash?.id) {
            setActiveDash(null)
        }

        const newSpec = {
            dashes: allDashes.filter(it => it.id !== id)
        }

        onBufferChange({spec: newSpec})
    }

    function handleDashChange(updatedDash: IDash) {
        if (!acl.canWrite)
            return

        const newSpec = {
            dashes: allDashes.map(dash => dash.id === updatedDash.id ? updatedDash : dash)
        }

        onBufferChange({spec: newSpec})
    }

    function renderDash(dash: IDash) {
        const dataset = datasets[dash.dataset ?? '']

        return (
            <div
                key={dash.name}
                className={`${styles.dashWrapper} ${activeDash?.name === dash.name ? styles.activeDash : ''} ${acl.canWrite ? styles.editable : ''}`}
                onClick={() => selectDash(dash)}
            >
                <DashWrapper
                    pageKey={uniqueKey}
                    datasetMap={datasets}
                    dashboards={dashboards}
                    dataset={dataset}
                    dashboard={currentDashboard}
                    extra={extra}
                    dash={dash}
                    readOnly={readOnly ?? false}
                    canEdit={acl.canWrite}
                    onFullScreenChange={setFullScreen}
                    onChange={handleDashChange}
                    onDelete={() => removeDash(dash.id)}
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

    const isGridEditable = !readOnly && acl.canWrite
    return (
        <>
            {extra && extra.queryFilter && (
                <Alert style={{marginBottom: 16}} message={t('Filtered')} description={printSingleQueryFilter(extra.queryFilter)} type="warning"/>
            )}

            {!readOnly && <Button type="dashed" style={{marginBottom: 12}} disabled={!isGridEditable} onClick={handleDashAdd}>{t('Add Dash')}</Button>}

            {!_.isEmpty(datasets) && allDashes.length > 0 && (
                <ReactGridLayout
                    className={styles.layout}
                    layout={layout}
                    cols={biConfig.cols}
                    rowHeight={biConfig.rowHeight}
                    draggableCancel=".no-drag"
                    isDraggable={isGridEditable}
                    isDroppable={isGridEditable}
                    isResizable={isGridEditable}
                    onLayoutChange={handleLayoutChange}
                >
                    {allDashes
                        // .filter(dash => dash.dataset != null && datasets[dash.dataset] != null) // new dash doesn't have dataset yet
                        .map(dash => renderDash(dash))
                    }
                </ReactGridLayout>
            )}
        </>
    )
}

export default memo(DashboardSpec)
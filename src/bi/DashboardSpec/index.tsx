import _ from 'lodash'
import {memo, useEffect, useMemo, useRef, useState} from 'react'
import RGL, {Layout, WidthProvider} from 'react-grid-layout'
import {Alert, Button} from 'antd'
import {useTranslation} from 'react-i18next'
import {v4 as uuidv4} from 'uuid'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import {CustomComponentRenderContext} from 'src/extensions/custom-components'
import {DASHBOARD_ITEM_NAME} from 'src/config/constants'
import {Dashboard, DashboardExtra, IDash, IDashboardSpec} from 'src/types/bi'
import {generateQueryBlock, printSingleQueryFilter} from '../util'
import biConfig from 'src/config/bi'
import DashWrapper from '../DashWrapper'
import {useAcl} from 'src/util/hooks'
import {generateKey} from 'src/util/mdi'
import {useBI} from '../util/hooks'
import styles from './DashboardSpec.module.css'
import './DashboardSpec.css'

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
    const {datasets, dashboards} = useBI({withDatasets: true, withDashboards: true})
    const datasetMap = useMemo(() => _.mapKeys(datasets, ds => ds.name), [datasets])
    const spec: IDashboardSpec = buffer.spec ?? data?.spec ?? initialSpec
    const thisDashboard = {...data, spec} as Dashboard
    const allDashes = spec.dashes?.map(dash => ({...dash, id: dash.id ?? uuidv4(), fields: dash.fields ?? {}})) ?? []
    const activeDash = useRef<IDash>()
    const [isLocked, setLocked] = useState<boolean>(false)
    const isNew = !thisDashboard.id

    useEffect(() => {
        onBufferChange({
            spec: data?.spec ?? {}
        })
    }, [data])

    if (isNew)
        return null

    function handleDashAdd() {
        const newDash: IDash = {
            id: uuidv4(),
            name: (++seqNum).toString(),
            x: 0,
            y: 0,
            w: biConfig.cols / 2,
            h: biConfig.defaultDashHeight,
            type: biConfig.defaultDashType,
            fields: {},
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
        if (layouts.length !== _.size(allDashes))
            throw new Error('Illegal layout state.')

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
                    fields: curDash.fields,
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

        onBufferChange({
            spec: newSpec
        })
    }

    function selectDash(dash: IDash) {
        if (dash.id !== activeDash.current?.id)
            activeDash.current = dash
    }

    function removeDash(id: string) {
        if (id === activeDash.current?.id)
            activeDash.current =undefined

        const newSpec = {
            dashes: allDashes.filter(it => it.id !== id)
        }

        onBufferChange({
            spec: newSpec
        })
    }

    function handleDashChange(updatedDash: IDash) {
        if (!acl.canWrite)
            return

        activeDash.current = updatedDash
        const newSpec = {
            dashes: allDashes.map(dash => dash.id === updatedDash.id ? updatedDash : dash)
        }
        onBufferChange({
            spec: newSpec
        })
    }

    function renderDash(dash: IDash) {
        const dataset = datasetMap[dash.dataset ?? '']

        return (
            <div
                key={dash.name}
                className={`${styles.dashWrapper} ${activeDash.current?.name === dash.name ? styles.activeDash : ''} ${acl.canWrite ? styles.editable : ''}`}
                onClick={() => selectDash(dash)}
            >
                <DashWrapper
                    pageKey={uniqueKey}
                    datasetMap={datasetMap}
                    dashboards={dashboards}
                    dataset={dataset}
                    dashboard={thisDashboard}
                    dash={dash}
                    extra={extra}
                    readOnly={readOnly ?? false}
                    canEdit={acl.canWrite}
                    onLockChange={setLocked}
                    onDashChange={handleDashChange}
                    onDelete={() => removeDash(dash.id)}
                />
            </div>
        )
    }

    const layout: Layout[] = allDashes.map(it => {
        return {
            i: it.name,
            x: it.x,
            y: it.y,
            w: it.w,
            h: it.h
        }
    })

    const isGridEditable = !readOnly && acl.canWrite && !isLocked
    return (
        <>
            {extra && extra.queryFilter && (
                <Alert style={{marginBottom: 16}} message={t('Filtered')} description={printSingleQueryFilter(extra.queryFilter)} type="warning"/>
            )}

            {!readOnly && <Button type="dashed" style={{marginBottom: 12}} disabled={!isGridEditable} onClick={handleDashAdd}>{t('Add Dash')}</Button>}

            {datasets.length >= 0 && allDashes.length > 0 && (
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
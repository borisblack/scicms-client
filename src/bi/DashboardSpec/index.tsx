import _ from 'lodash'
import React, {memo, useEffect, useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import RGL, {Layout, WidthProvider} from 'react-grid-layout'
import {Alert, Button, Dropdown, Space} from 'antd'
import {FundOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {v4 as uuidv4} from 'uuid'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import {CustomComponentRenderContext} from 'src/extensions/custom-components'
import {DASHBOARD_ITEM_NAME} from 'src/config/constants'
import {Dashboard, DashboardExtra, DashboardItemType, DashboardLayoutItem, IDash, IDashboardSpec} from 'src/types/bi'
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

const DEFAULT_LAYOUT_ITEM_HEIGHT = 1

const initialSpec: IDashboardSpec = {
    layout: [],
    dashes: [],
    selectors: [],
    texts: []
}
let seqNum = 0

const createLayoutItem = (type: DashboardItemType): DashboardLayoutItem => ({
    id: uuidv4(),
    type,
    x: 0,
    y: 0,
    w: biConfig.cols / 2,
    h: getDefaultLayoutItemHeight(type)
})

function getDefaultLayoutItemHeight(type: DashboardItemType) {
    switch (type) {
        case DashboardItemType.DASH:
            return biConfig.defaultDashHeight
        case DashboardItemType.SELECTOR:
            return biConfig.defaultSelectorHeight
        case DashboardItemType.TEXT:
            return biConfig.defaultTextHeight
        default:
            return DEFAULT_LAYOUT_ITEM_HEIGHT
    }
}

function DashboardSpec({data: dataWrapper, buffer, readOnly, onBufferChange}: DashboardSpecProps) {
    const {item, data, extra} = dataWrapper
    if (item.name !== DASHBOARD_ITEM_NAME)
        throw new Error('Illegal argument')

    const uniqueKey = generateKey(dataWrapper)
    const {t} = useTranslation()
    const acl = useAcl(item, data)
    const {datasets, dashboards} = useBI({withDatasets: true, withDashboards: true})
    const datasetMap = useMemo(() => _.mapKeys(datasets, ds => ds.name), [datasets])
    const spec: IDashboardSpec = useMemo(() => buffer.spec ?? data?.spec ?? initialSpec, [buffer.spec, data?.spec])
    const dashboardLayout: DashboardLayoutItem[] = useMemo(() => spec.layout ?? spec.dashes.map(dash => ({
        id: dash.id,
        type: DashboardItemType.DASH,
        x: dash.x as number,
        y: dash.y as number,
        w: dash.w as number,
        h: dash.h as number
    })), [spec.dashes, spec.layout])
    const dashboardDashes: IDash[] = useMemo(() => spec.dashes?.map(dash => ({...dash, id: dash.id ?? uuidv4(), fields: dash.fields ?? {}})) ?? [], [spec.dashes])
    const [isLocked, setLocked] = useState<boolean>(false)
    const isGridEditable = useMemo(() => !readOnly && acl.canWrite && !isLocked, [acl.canWrite, isLocked, readOnly])
    const thisDashboard = {...data, spec} as Dashboard
    const isNew = !thisDashboard.id

    useEffect(() => {
        onBufferChange({
            spec: data?.spec ?? {}
        })
    }, [data])

    if (isNew)
        return null

    function handleDashAdd() {
        const newLayoutItem = createLayoutItem(DashboardItemType.DASH)
        const newDash: IDash = {
            id: newLayoutItem.id,
            name: `${t('Dash')} ${(++seqNum).toString()}`,
            type: biConfig.defaultDashType,
            fields: {},
            optValues: {},
            defaultFilters: generateQueryBlock(),
            isAggregate: false,
            refreshIntervalSeconds: biConfig.defaultRefreshIntervalSeconds
        }

        const newSpec: IDashboardSpec = {
            layout: [
                newLayoutItem,
                ...dashboardLayout
            ],
            dashes: [
                ...dashboardDashes,
                newDash
            ]
        }

        onBufferChange({spec: newSpec})
    }

    function handleLayoutChange(layouts: Layout[]) {
        if (layouts.length !== _.size(dashboardDashes))
            throw new Error('Illegal layout state.')

        const newSpec: IDashboardSpec = {
            layout: layouts.map(layout => {
                const curLayout = dashboardLayout.find(layoutItem => layoutItem.id === layout.i) as DashboardLayoutItem
                return {
                    ...curLayout,
                    x: layout.x,
                    y: layout.y,
                    w: layout.w,
                    h: layout.h,
                }
            }),
            dashes: dashboardDashes
        }

        onBufferChange({
            spec: newSpec
        })
    }

    function selectDash(dash: IDash) {
        // TODO: Maybe remove this method
    }

    function removeDash(id: string) {
        const newSpec = {
            layout: dashboardLayout.filter(layoutItem => layoutItem.id !== id),
            dashes: dashboardDashes.filter(it => it.id !== id)
        }

        onBufferChange({
            spec: newSpec
        })
    }

    function handleDashChange(updatedDash: IDash) {
        if (!acl.canWrite)
            return

        const newSpec = {
            layout: dashboardLayout,
            dashes: dashboardDashes.map(dash => dash.id === updatedDash.id ? updatedDash : dash)
        }
        onBufferChange({
            spec: newSpec
        })
    }

    function renderLayoutItem(layoutItem: DashboardLayoutItem) {
        switch (layoutItem.type) {
            case DashboardItemType.DASH:
                return renderDash(dashboardDashes.find(dash => dash.id === layoutItem.id) as IDash, layoutItem.h)
            case DashboardItemType.SELECTOR:
            case DashboardItemType.TEXT:
            default:
                return null
        }
    }

    function renderDash(dash: IDash, height: number) {
        const dataset = datasetMap[dash.dataset ?? '']

        return (
            <div
                key={dash.id}
                className={`${styles.dashWrapper} ${acl.canWrite ? styles.editable : ''}`}
                onClick={() => selectDash(dash)}
            >
                <DashWrapper
                    pageKey={uniqueKey}
                    datasetMap={datasetMap}
                    dashboards={dashboards}
                    dataset={dataset}
                    dashboard={thisDashboard}
                    dash={dash}
                    height={height}
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

    return (
        <>
            {extra && extra.queryFilter && (
                <Alert style={{marginBottom: 16}} message={t('Filtered')} description={printSingleQueryFilter(extra.queryFilter)} type="warning"/>
            )}

            {!readOnly && (
                <div style={{marginBottom: 12}}>
                    <Dropdown
                        disabled={!isGridEditable}
                        placement="bottomLeft"
                        trigger={['hover']}
                        menu={{
                            items: [{
                                key: 'dash',
                                label: <Space><FundOutlined/>{t('Dash')}</Space>,
                                onClick: handleDashAdd
                            }, {
                                key: 'selector',
                                label: <Space><i className="fa-solid fa-sliders"></i>{t('Selector')}</Space>,
                                onClick: () => {}
                            }, {
                                key: 'text',
                                label: <Space><i className="fa-solid fa-font"></i>{t('Text')}</Space>,
                                onClick: () => {}
                            }]
                        }}
                    >
                        <Button type="dashed" icon={<PlusCircleOutlined/>}>{t('Add')}</Button>
                    </Dropdown>
                </div>
            )}

            {datasets.length >= 0 && dashboardLayout.length > 0 && (
                <ReactGridLayout
                    className={styles.layout}
                    layout={dashboardLayout.map(layoutItem => ({...layoutItem, i: layoutItem.id}))}
                    cols={biConfig.cols}
                    rowHeight={biConfig.rowHeight}
                    draggableCancel=".no-drag"
                    isDraggable={isGridEditable}
                    isDroppable={isGridEditable}
                    isResizable={isGridEditable}
                    onLayoutChange={handleLayoutChange}
                >
                    {dashboardLayout.map(renderLayoutItem)}
                </ReactGridLayout>
            )}
        </>
    )
}

export default memo(DashboardSpec)
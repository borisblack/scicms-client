import _ from 'lodash'
import {useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import RGL, {Layout, WidthProvider} from 'react-grid-layout'
import {Alert, Button, Dropdown, Space} from 'antd'
import {FundOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {v4 as uuidv4} from 'uuid'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import {CustomComponentRenderContext} from 'src/extensions/custom-components'
import {DASHBOARD_ITEM_NAME, EMPTY_ARRAY} from 'src/config/constants'
import {Dashboard, DashboardExtra, DashboardItemType, DashboardLayoutItem, IDash, IDashboardSpec, ISelector, IText, QueryOp} from 'src/types/bi'
import {generateQueryBlock, printSingleQueryFilter} from '../util'
import biConfig from 'src/config/bi'
import DashWrapper from '../DashWrapper'
import {useAcl} from 'src/util/hooks'
import {generateKey} from 'src/util/mdi'
import {useBI, useSelectors} from '../util/hooks'
import Text from '../Text'
import Selector from '../Selector'
import './DashboardSpec.css'
import styles from './DashboardSpec.module.css'

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
    const dashboardTexts: IText[] = useMemo(() => spec.texts ?? [], [spec.texts])
    const dashboardSelectors: ISelector[] = useMemo(() => spec.selectors ?? [], [spec.selectors])
    const {selectedDashFilters, selectDashValue} = useSelectors({
        selectors: dashboardSelectors,
        onSelectorChange: handleSelectorChange
    })
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
            ],
            texts: dashboardTexts,
            selectors: dashboardSelectors
        }

        onBufferChange({spec: newSpec})
    }

    function handleTextAdd() {
        const newLayoutItem = createLayoutItem(DashboardItemType.TEXT)
        const newText: IText = {
            id: newLayoutItem.id,
            content: ''
        }

        const newSpec: IDashboardSpec = {
            layout: [
                newLayoutItem,
                ...dashboardLayout
            ],
            dashes: dashboardDashes,
            texts: [
                ...dashboardTexts,
                newText
            ],
            selectors: dashboardSelectors
        }

        onBufferChange({spec: newSpec})
    }

    function handleSelectorAdd() {
        const newLayoutItem = createLayoutItem(DashboardItemType.SELECTOR)
        const newSelector: ISelector = {
            id: newLayoutItem.id,
            name: `${t('Selector')} ${(++seqNum).toString()}`,
            type: biConfig.defaultSelectorType,
            field: '',
            op: QueryOp.$eq,
            links: []
        }

        const newSpec: IDashboardSpec = {
            layout: [
                newLayoutItem,
                ...dashboardLayout
            ],
            dashes: dashboardDashes,
            texts: dashboardTexts,
            selectors: [
                ...dashboardSelectors,
                newSelector
            ]
        }

        onBufferChange({spec: newSpec})
    }

    function handleLayoutChange(layouts: Layout[]) {
        if (layouts.length !== dashboardLayout.length)
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
            dashes: dashboardDashes,
            texts: dashboardTexts,
            selectors: dashboardSelectors
        }

        onBufferChange({
            spec: newSpec
        })
    }

    function selectDash(dash: IDash) {
        // TODO: Maybe remove this method
    }

    function removeLayoutItem(type: DashboardItemType, id: string) {
        const newSpec: IDashboardSpec = {
            layout: dashboardLayout.filter(layoutItem => layoutItem.id !== id),
            dashes: type === DashboardItemType.DASH ? dashboardDashes.filter(dash => dash.id !== id) : dashboardDashes,
            texts: type === DashboardItemType.TEXT ? dashboardTexts.filter(text => text.id !== id) : dashboardTexts,
            selectors: type === DashboardItemType.SELECTOR ? dashboardSelectors.filter(selector => selector.id !== id) : dashboardSelectors
        }

        if (type === DashboardItemType.DASH) {
            newSpec.selectors = newSpec.selectors?.map(selector => ({
                ...selector,
                links: selector.links.filter(link => link.dashId !== id)
            }))
        }

        onBufferChange({
            spec: newSpec
        })
    }

    function handleDashChange(updatedDash: IDash) {
        if (!acl.canWrite)
            return

        const newSpec: IDashboardSpec = {
            layout: dashboardLayout,
            dashes: dashboardDashes.map(dash => dash.id === updatedDash.id ? updatedDash : dash),
            texts: dashboardTexts,
            selectors: dashboardSelectors
        }
        onBufferChange({
            spec: newSpec
        })
    }

    function handleTextChange(updatedText: IText) {
        if (!acl.canWrite)
            return

        const newSpec: IDashboardSpec = {
            layout: dashboardLayout,
            dashes: dashboardDashes,
            texts: dashboardTexts.map(text => text.id === updatedText.id ? updatedText : text),
            selectors: dashboardSelectors
        }
        onBufferChange({
            spec: newSpec
        })
    }

    function handleSelectorChange(updatedSelector: ISelector) {
        // if (!acl.canWrite)
        //     return

        const newSpec: IDashboardSpec = {
            layout: dashboardLayout,
            dashes: dashboardDashes,
            texts: dashboardTexts,
            selectors: dashboardSelectors.map(selector => selector.id === updatedSelector.id ? updatedSelector : selector)

        }
        onBufferChange({
            spec: newSpec
        })
    }

    function renderLayoutItem(layoutItem: DashboardLayoutItem) {
        switch (layoutItem.type) {
            case DashboardItemType.DASH:
                return renderDash(dashboardDashes.find(dash => dash.id === layoutItem.id) as IDash, layoutItem.h)
            case DashboardItemType.TEXT:
                return renderText(dashboardTexts.find(text => text.id === layoutItem.id) as IText, layoutItem.h)
            case DashboardItemType.SELECTOR:
                return renderSelector(dashboardSelectors.find(selector => selector.id === layoutItem.id) as ISelector, layoutItem.h)
            default:
                return <Alert description={t('Unsupported layout item.')} type="error"/>
        }
    }

    function renderDash(dash: IDash, height: number) {
        const dataset = datasetMap[dash.dataset ?? '']

        return (
            <div
                key={dash.id}
                className={`${styles.layoutItem} ${styles.dashWrapper} ${acl.canWrite ? styles.editable : ''}`}
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
                    selectedFilters={selectedDashFilters[dash.id] ?? EMPTY_ARRAY}
                    readOnly={readOnly ?? false}
                    canEdit={acl.canWrite}
                    onLockChange={setLocked}
                    onDashClick={value => selectDashValue(dash.id, value)}
                    onDashChange={handleDashChange}
                    onDelete={() => removeLayoutItem(DashboardItemType.DASH, dash.id)}
                />
            </div>
        )
    }

    function renderText(text: IText, height: number) {
        return (
            <div
                key={text.id}
                className={styles.layoutItem}
            >
                <Text
                    text={text}
                    height={height}
                    canEdit={acl.canWrite}
                    readOnly={readOnly ?? false}
                    onLockChange={setLocked}
                    onChange={handleTextChange}
                    onDelete={() => removeLayoutItem(DashboardItemType.TEXT, text.id)}
                />
            </div>
        )
    }

    function renderSelector(selector: ISelector, height: number) {
        return (
            <div
                key={selector.id}
                className={styles.layoutItem}
            >
                <Selector
                    selector={selector}
                    height={height}
                    datasetMap={datasetMap}
                    dashes={dashboardDashes}
                    canEdit={acl.canWrite}
                    readOnly={readOnly ?? false}
                    onLockChange={setLocked}
                    onChange={handleSelectorChange}
                    onDelete={() => removeLayoutItem(DashboardItemType.SELECTOR, selector.id)}
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
                                onClick: handleSelectorAdd
                            }, {
                                key: 'text',
                                label: <Space><i className="fa-solid fa-font"></i>{t('Text')}</Space>,
                                onClick: handleTextAdd
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

export default DashboardSpec
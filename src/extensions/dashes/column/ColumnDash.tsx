import _ from 'lodash'
import {lazy, memo, Suspense, useMemo} from 'react'
import {Alert} from 'antd'
import {ColumnConfig} from '@ant-design/charts'
import {DashEventHandler, DashRenderContext} from 'src/extensions/dashes'
import {defaultDashColor, defaultDashColors, formatValue, handleDashClick} from 'src/util/bi'
import {LegendPosition} from '../util'
import biConfig from 'src/config/bi'
import * as RulesService from 'src/services/rules'

const Column = lazy(() => import('./Column'))

interface ColumnDashOptions {
    xField?: string
    yField?: string
    seriesField?: string
    legendPosition?: LegendPosition
    hideLegend?: boolean
    xAxisLabelAutoRotate?: boolean
    isStack?: boolean
    isGroup?: boolean
    rules?: string
}

const {dash: dashConfig, locale} = biConfig
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

function ColumnDash({dataset, dash, data, onRelatedDashboardOpen}: DashRenderContext) {
    const {optValues, relatedDashboardId} = dash
    const {
        xField,
        yField,
        seriesField,
        hideLegend,
        legendPosition,
        xAxisLabelAutoRotate,
        isStack,
        isGroup,
        rules
    } = optValues as ColumnDashOptions
    const fieldRules = useMemo(() => RulesService.parseRules(rules), [rules])
    const seriesData = seriesField ? _.uniqBy(data, seriesField) : []
    const seriesColors = seriesField ? RulesService.getSeriesColors(fieldRules, seriesField, seriesData, defaultDashColors(seriesData.length)) : []
    const defaultColor = defaultDashColor()

    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    const columns = dataset.spec.columns ?? {}
    const xColumn = columns[xField]
    const yColumn = columns[yField]
    if (xColumn == null || yColumn == null)
        return <Alert message="Invalid columns specification" type="error"/>

    const handleEvent: DashEventHandler | undefined =
        relatedDashboardId ?
            (chart, event) => handleDashClick(chart, event, xField, queryFilter => onRelatedDashboardOpen(relatedDashboardId, queryFilter)) :
            undefined

    const config: ColumnConfig = {
        data,
        xField,
        yField,
        seriesField,
        legend: hideLegend ? false : {
            position: legendPosition ?? 'top-left',
            label: {
                style: legendConfig?.label?.style
            },
            itemName: {
                style: legendConfig?.itemName?.style
            }
        },
        autoFit: true,
        isStack,
        isGroup,
        xAxis: {
            label: {
                autoRotate: xAxisLabelAutoRotate,
                style: axisLabelStyle
            },
            // type: isTemporal(xColumn.type) ? 'time' : undefined
        },
        yAxis: {
            label: {
                style: axisLabelStyle
            },
            // type: isTemporal(yColumn.type) ? 'time' : undefined
        },
        meta: {
            [xField]: {
                alias: xColumn.alias,
                formatter: (value: any) => formatValue(value, xColumn.type)
            },
            [yField]: {
                alias: yColumn.alias,
                formatter: (value: any) => formatValue(value, yColumn.type)
            }
        },
        color: seriesField ? seriesColors : (record => (RulesService.getFieldColor(fieldRules, record) ?? (defaultColor as string))),
        locale,
        onEvent: handleEvent
    }

    return (
        <Suspense fallback={null}>
            <Column {...config} key={relatedDashboardId}/>
        </Suspense>
    )
}

export default memo(ColumnDash)
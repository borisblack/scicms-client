import _ from 'lodash'
import {lazy, memo, Suspense, useMemo} from 'react'
import {Alert} from 'antd'
import {ScatterConfig} from '@ant-design/charts'
import {defaultDashColor, defaultDashColors, formatValue, handleDashClick, isTemporal} from 'src/util/bi'
import {DashEventHandler, DashRenderContext} from '../index'
import biConfig from 'src/config/bi'
import {LegendPosition} from '../util'
import * as RulesService from 'src/services/rules'

const Scatter = lazy(() => import('./Scatter'))

interface BubbleDashOptions {
    xField?: string
    yField?: string
    sizeField?: string
    colorField?: string
    legendPosition?: LegendPosition
    hideLegend?: boolean
    xAxisLabelAutoRotate?: boolean
    rules?: string
}

const {dash: dashConfig, locale} = biConfig
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

function BubbleDash({dataset, dash, data, onRelatedDashboardOpen}: DashRenderContext) {
    const {optValues, relatedDashboardId} = dash
    const {
        xField,
        yField,
        sizeField,
        colorField,
        hideLegend,
        legendPosition,
        xAxisLabelAutoRotate,
        rules
    } = optValues as BubbleDashOptions
    const fieldRules = useMemo(() => RulesService.parseRules(rules), [rules])
    const seriesData = colorField ? _.uniqBy(data, colorField) : []
    const seriesColors = colorField ? RulesService.getSeriesColors(fieldRules, colorField, seriesData, defaultDashColors(seriesData.length)) : []
    const defaultColor = defaultDashColor()

    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    if (!sizeField)
        return <Alert message="sizeField attribute not specified" type="error"/>

    const columns = dataset.spec.columns ?? {}
    const xColumn = columns[xField]
    const yColumn = columns[yField]
    const sizeColumn = columns[sizeField]
    if (xColumn == null || yColumn == null || sizeColumn == null)
        return <Alert message="Invalid columns specification" type="error"/>

    const handleEvent: DashEventHandler | undefined =
        relatedDashboardId ?
            (chart, event) => handleDashClick(chart, event, colorField ?? xField, queryFilter => onRelatedDashboardOpen(relatedDashboardId, queryFilter)) :
            undefined

    const config: ScatterConfig = {
        appendPadding: 10,
        data,
        xField,
        yField,
        sizeField,
        colorField,
        size: [4, 30], // min and max
        shape: 'circle',
        autoFit: true,
        pointStyle: {
            fillOpacity: 0.8,
            stroke: '#bbb',
        },
        legend: hideLegend ? false : {
            position: legendPosition ?? 'top-left',
            label: {
                style: legendConfig?.label?.style
            },
            itemName: {
                style: legendConfig?.itemName?.style
            }
        },
        xAxis: {
            label: {
                autoRotate: xAxisLabelAutoRotate,
                style: axisLabelStyle
            },
            type: isTemporal(xColumn.type) ? 'time' : undefined,
            grid: {
                line: {
                    style: {stroke: '#eee'}
                },
            },
            line: {
                style: {stroke: '#aaa',}
            },
        },
        yAxis: {
            label: {
                style: axisLabelStyle
            },
            type: isTemporal(yColumn.type) ? 'time' : undefined
        },
        meta: {
            [xField]: {
                alias: xColumn.alias || xField,
                formatter: (value: any) => formatValue(value, xColumn.type)
            },
            [yField]: {
                alias: yColumn.alias || yField,
                formatter: (value: any) => formatValue(value, yColumn.type)
            },
            [sizeField]: {
                alias: sizeColumn.alias || sizeField,
                formatter: (value: any) => formatValue(value, sizeColumn.type)
            }
        },
        color: colorField ? seriesColors : (record => (RulesService.getFieldColor(fieldRules, record) ?? (defaultColor as string))),
        locale,
        onEvent: handleEvent
    }

    return (
        <Suspense fallback={null}>
            <Scatter {...config} key={relatedDashboardId}/>
        </Suspense>
    )
}

export default memo(BubbleDash)
import _ from 'lodash'
import {useMemo} from 'react'
import {Alert} from 'antd'
import {Rose, RoseConfig} from '@ant-design/charts'

import {DashEventHandler, DashRenderContext} from '..'
import {defaultDashColor, defaultDashColors, formatValue, isTemporal} from 'src/bi/util'
import {LegendPosition} from '../util'
import biConfig from 'src/config/bi'
import * as RulesService from 'src/services/rules'
import {useBI} from 'src/bi/hooks'
import {handleDashClick} from '../util/antdPlot'

interface PolarAreaDashOptions {
    xField?: string
    yField?: string
    seriesField?: string
    legendPosition?: LegendPosition
    hideLegend?: boolean
    xAxisLabelAutoRotate?: boolean
    rules?: string
}

const {dash: dashConfig, locale} = biConfig
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

export default function PolarAreaDash({dataset, dash, data}: DashRenderContext) {
    const {openDashboard} = useBI()
    const optValues = dash.optValues as PolarAreaDashOptions
    const {relatedDashboardId} = dash
    const {
        hideLegend,
        legendPosition,
        xAxisLabelAutoRotate,
        rules
    } = optValues
    const xField = Array.isArray(optValues.xField) ? optValues.xField[0] : optValues.xField
    const yField = Array.isArray(optValues.yField) ? optValues.yField[0] : optValues.yField
    const seriesField = Array.isArray(optValues.seriesField) ? optValues.seriesField[0] : optValues.seriesField
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
            (chart, event) => handleDashClick(chart, event, seriesField ?? xField, queryFilter => openDashboard(relatedDashboardId, queryFilter)) :
            undefined

    const config: RoseConfig = {
        data,
        xField,
        yField,
        seriesField,
        radius: 1,
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
        xAxis: {
            type: isTemporal(xColumn.type) ? 'time' : undefined,
            label: {
                autoRotate: xAxisLabelAutoRotate,
                style: axisLabelStyle
            }
        },
        yAxis: {
            type: isTemporal(yColumn.type) ? 'time' : undefined,
            label: {
                style: axisLabelStyle
            }
        },
        meta: {
            [xField]: {
                alias: xColumn.alias || xField,
                formatter: (value: any) => formatValue(value, xColumn.type)
            },
            [yField]: {
                alias: yColumn.alias || yField,
                formatter: (value: any) => formatValue(value, yColumn.type)
            }
        },
        color: seriesField ? seriesColors : (record => (RulesService.getFieldColor(fieldRules, record) ?? (defaultColor as string))),
        locale,
        onEvent: handleEvent
    }

    return <Rose {...config} key={relatedDashboardId}/>
}

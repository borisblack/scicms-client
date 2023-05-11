import {DashRenderContext} from '../index'
import {Alert} from 'antd'
import {Radar, RadarConfig} from '@ant-design/charts'
import {defaultDashColor, defaultDashColors, formatValue, isTemporal} from '../../../util/bi'
import {LegendPosition} from '../util'
import biConfig from '../../../config/bi'
import RulesService from '../../../services/rules'
import {useMemo} from 'react'
import _ from 'lodash'

interface RadarDashOptions {
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
const rulesService = RulesService.getInstance()

export default function RadarDash({dataset, dash, data}: DashRenderContext) {
    const {
        xField,
        yField,
        seriesField,
        hideLegend,
        legendPosition,
        xAxisLabelAutoRotate,
        rules
    } = dash.optValues as RadarDashOptions
    const fieldRules = useMemo(() => rulesService.parseRules(rules), [rules])
    const seriesData = seriesField ? _.uniqBy(data, seriesField) : []
    const seriesColors = seriesField ? rulesService.getSeriesColors(fieldRules, seriesField, seriesData, defaultDashColors()) : []
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

    const config: RadarConfig = {
        appendPadding: [0, 10, 0, 10],
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
            tickLine: null,
            label: {
                autoRotate: xAxisLabelAutoRotate,
                style: axisLabelStyle
            }
        },
        yAxis: {
            type: isTemporal(yColumn.type) ? 'time' : undefined,
            label: false,
            grid: { alternateColor: 'rgba(0, 0, 0, 0.04)' }
        },
        point: {size: 2},
        area: {},
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
        color: seriesField ? seriesColors : (record => (rulesService.getFieldColor(fieldRules, xField, record) ?? (defaultColor as string))),
        locale
    }

    return <Radar {...config} />
}
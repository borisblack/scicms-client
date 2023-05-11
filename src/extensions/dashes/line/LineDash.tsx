import {DashRenderContext} from '../index'
import {Alert} from 'antd'
import {Line, LineConfig} from '@ant-design/charts'
import {defaultDashColor, defaultDashColors, formatValue, isTemporal, parseDashColor} from '../../../util/bi'
import {LegendPosition} from '../util'
import biConfig from '../../../config/bi'
import RulesService from '../../../services/rules'
import {useMemo} from 'react'
import _ from 'lodash'

interface LineDashOptions {
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

export default function LineDash({dataset, dash, data}: DashRenderContext) {
    const {
        xField,
        yField,
        seriesField,
        hideLegend,
        legendPosition,
        xAxisLabelAutoRotate,
        rules
    } = dash.optValues as LineDashOptions
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

    const config: LineConfig = {
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
        xAxis: {
            label: {
                autoRotate: xAxisLabelAutoRotate,
                style: axisLabelStyle
            },
            type: isTemporal(xColumn.type) ? 'time' : undefined
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
        color: seriesField ? seriesColors : (record => (rulesService.getFieldColor(fieldRules, yField, record) ?? (defaultColor as string))),
        locale
    }

    return <Line {...config} />
}
import {Alert} from 'antd'
import {Bar, BarConfig} from '@ant-design/charts'
import {isTemporal} from '../../util/dataset'
import {formatValue, parseDashColor} from '../../util/dashboard'
import {DashRenderContext} from '../index'
import {XYDashOptions} from '../util'
import biConfig from '../../config/bi'

interface BarDashOpts extends XYDashOptions {
    xAxisLabelAutoRotate?: boolean
}

const {dash: dashConfig, locale} = biConfig
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

export default function BarDash({dataset, dash, data}: DashRenderContext) {
    const {xField, yField, seriesField, hideLegend, legendPosition, xAxisLabelAutoRotate} = dash.optValues as BarDashOpts
    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    const columns = dataset.spec.columns ?? {}
    const xColumn = columns[xField]
    const yColumn = columns[yField]
    if (xColumn == null || yColumn == null)
        return <Alert message="Invalid columns specification" type="error"/>

    const config: BarConfig = {
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
            }
        },
        color: parseDashColor(seriesField == null),
        locale
    }

    return <Bar {...config} />
}
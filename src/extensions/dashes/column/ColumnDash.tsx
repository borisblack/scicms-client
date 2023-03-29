import {DashRenderContext} from '../index'
import {Alert} from 'antd'
import {Column, ColumnConfig} from '@ant-design/charts'
import {isTemporal} from '../../../util/bi'
import {formatValue, parseDashColor} from '../../../util/bi'
import {XYDashOptions} from '../util'
import biConfig from '../../../config/bi'

interface ColumnDashOptions extends XYDashOptions {
    xAxisLabelAutoRotate?: boolean
}

const {dash: dashConfig, locale} = biConfig
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

export default function ColumnDash({dataset, dash, data}: DashRenderContext) {
    const {xField, yField, seriesField, hideLegend, legendPosition, xAxisLabelAutoRotate} = dash.optValues as ColumnDashOptions
    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    const columns = dataset.spec.columns ?? {}
    const xColumn = columns[xField]
    const yColumn = columns[yField]
    if (xColumn == null || yColumn == null)
        return <Alert message="Invalid columns specification" type="error"/>

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
                alias: xColumn.alias,
                formatter: (value: any) => formatValue(value, xColumn.type)
            },
            [yField]: {
                alias: yColumn.alias,
                formatter: (value: any) => formatValue(value, yColumn.type)
            }
        },
        color: parseDashColor(seriesField == null),
        locale
    }

    return <Column {...config} />
}
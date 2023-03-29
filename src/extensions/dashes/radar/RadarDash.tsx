import {DashRenderContext} from '../index'
import {Alert} from 'antd'
import {Radar, RadarConfig} from '@ant-design/charts'
import {isTemporal} from '../../../util/bi'
import {formatValue, parseDashColor} from '../../../util/bi'
import {XYDashOptions} from '../util'
import biConfig from '../../../config/bi'

interface RadarDashOptions extends XYDashOptions {}

const {dash: dashConfig, locale} = biConfig
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

export default function RadarDash({dataset, dash, data}: DashRenderContext) {
    const {xField, yField, seriesField, hideLegend, legendPosition} = dash.optValues as RadarDashOptions
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
        color: parseDashColor(seriesField == null),
        locale
    }

    return <Radar {...config} />
}
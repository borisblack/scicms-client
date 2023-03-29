import {DashRenderContext} from '../index'
import {Alert} from 'antd'
import {Rose, RoseConfig} from '@ant-design/charts'
import {isTemporal} from '../../../util/bi'
import {formatValue, parseDashColor} from '../../../util/bi'
import {XYDashOptions} from '../util'
import biConfig from '../../../config/bi'

interface PolarAreaDashOptions extends XYDashOptions {}

const {dash: dashConfig, locale} = biConfig
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

export default function PolarAreaDash({dataset, dash, data}: DashRenderContext) {
    const {xField, yField, seriesField, hideLegend, legendPosition} = dash.optValues as PolarAreaDashOptions
    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    const columns = dataset.spec.columns ?? {}
    const xColumn = columns[xField]
    const yColumn = columns[yField]
    if (xColumn == null || yColumn == null)
        return <Alert message="Invalid columns specification" type="error"/>

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
        color: parseDashColor(seriesField == null),
        locale
    }

    return <Rose {...config} />
}
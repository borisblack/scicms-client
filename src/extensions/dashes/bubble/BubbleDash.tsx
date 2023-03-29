import {Alert} from 'antd'
import {Scatter, ScatterConfig} from '@ant-design/charts'
import {isTemporal} from '../../../util/bi'
import {formatValue, parseDashColor} from '../../../util/bi'
import {DashRenderContext} from '../index'
import {BubbleDashOptions} from '../util'
import biConfig from '../../../config/bi'

const {dash: dashConfig, locale} = biConfig
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

export default function BubbleDash({dataset, dash, data}: DashRenderContext) {
    const {xField, yField, sizeField, colorField, hideLegend, legendPosition, xAxisLabelAutoRotate} = dash.optValues as BubbleDashOptions
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
        color: parseDashColor(),
        locale
    }

    return <Scatter {...config} />
}
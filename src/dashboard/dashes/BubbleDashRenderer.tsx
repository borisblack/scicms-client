import {Scatter, ScatterConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {bubbleDashOpts, BubbleDashOpts, DashOpt, DashRenderer, InnerDashRenderProps} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {formatValue, isTemporal, parseDashColor} from '../../util/dashboard'

const {dash: dashConfig, locale} = appConfig.dashboard
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

export default class BubbleDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.bubble

    listOpts = (): DashOpt[] => [...bubbleDashOpts]

    getLabelField = () => ({
        name: 'xField',
        alias: 'xFieldAlias',
    })

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <BubbleDash {...props}/>
    }
}

function BubbleDash({dataset, dash, data}: InnerDashRenderProps) {
    const {xField, yField, sizeField, colorField, xFieldAlias, yFieldAlias, sizeFieldAlias, hideLegend, legendPosition, xAxisLabelAutoRotate} = dash.optValues as BubbleDashOpts
    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    if (!sizeField)
        return <Alert message="sizeField attribute not specified" type="error"/>

    const {columns} = dataset.spec
    if (!columns || !columns[xField] || !columns[yField] || !columns[sizeField])
        return <Alert message="Invalid columns specification" type="error"/>

    const xFieldType = columns[xField].type
    const yFieldType = columns[yField].type
    const sizeFieldType = columns[sizeField].type
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
                style: legendConfig?.itemName?.style
            }
        },
        xAxis: {
            label: {
                autoRotate: xAxisLabelAutoRotate,
                style: axisLabelStyle
            },
            type: isTemporal(xFieldType) ? 'time' : undefined,
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
            type: isTemporal(yFieldType) ? 'time' : undefined
        },
        meta: {
            [xField]: {
                alias: xFieldAlias,
                formatter: (value: any) => formatValue(value, xFieldType)
            },
            [yField]: {
                alias: yFieldAlias,
                formatter: (value: any) => formatValue(value, yFieldType)
            },
            [sizeField]: {
                alias: sizeFieldAlias,
                formatter: (value: any) => formatValue(value, sizeFieldType)
            }
        },
        color: parseDashColor(),
        locale
    }

    return <Scatter {...config} />
}

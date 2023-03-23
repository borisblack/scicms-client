import {Scatter, ScatterConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {bubbleDashOpts, BubbleDashOpts, DashOpt, DashRenderer, InnerDashRenderProps} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {formatValue, isTemporal, parseDashColor} from '../../util/dashboard'

type ScatterDashOpts = Omit<BubbleDashOpts, 'sizeField'>

const {dash: dashConfig, locale} = appConfig.dashboard
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

export default class ScatterDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.scatter

    listOpts = (): DashOpt[] => bubbleDashOpts.filter(o => o.name !== 'sizeField')

    getLabelField = () => ({
        name: 'xField'
    })

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <ScatterDash {...props}/>
    }
}

function ScatterDash({dataset, dash, data}: InnerDashRenderProps) {
    const {xField, yField, colorField, hideLegend, legendPosition, xAxisLabelAutoRotate} = dash.optValues as ScatterDashOpts
    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    const columns = dataset.spec.columns ?? {}
    const xColumn = columns[xField]
    const yColumn = columns[yField]
    if (xColumn == null || yColumn == null)
        return <Alert message="Invalid columns specification" type="error"/>

    const config: ScatterConfig = {
        appendPadding: 10,
        data,
        xField,
        yField,
        colorField,
        size: 4,
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
                    style: {stroke: '#eee',}
                },
            },
            line: {
                style: {stroke: '#aaa',}
            }
        },
        yAxis: {
            nice: true,
            type: isTemporal(yColumn.type) ? 'time' : undefined,
            line: {
                style: {stroke: '#aaa'}
            },
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
        color: parseDashColor(),
        locale
    }

    return <Scatter {...config} />
}

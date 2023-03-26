import {Line, LineConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashOpt, DashOptType, DashRenderer, InnerDashRenderProps, XYDashOpts, xyDashOpts} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {formatValue, parseDashColor} from '../../util/dashboard'
import {isTemporal} from '../../util/dataset'

interface LineDashOpts extends XYDashOpts {
    xAxisLabelAutoRotate?: boolean
}

const {dash: dashConfig, locale} = appConfig.dashboard
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

export default class LineDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.line

    listOpts = (): DashOpt[] => [
        ...xyDashOpts,
        {name: 'xAxisLabelAutoRotate', type: DashOptType.boolean, label: 'Auto rotate x-axis label'}
    ]

    getLabelField = () => ({
        name: 'xField'
    })

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <LineDash {...props}/>
    }
}

function LineDash({dataset, dash, data}: InnerDashRenderProps) {
    const {xField, yField, seriesField, hideLegend, legendPosition, xAxisLabelAutoRotate} = dash.optValues as LineDashOpts
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
        color: parseDashColor(seriesField == null),
        locale
    }

    return <Line {...config} />
}

import {Line, LineConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashOpt, DashOptType, DashRenderer, InnerDashRenderProps, XYDashOpts, xyDashOpts} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {isTemporal} from '../../util/dashboard'

interface LineDashOpts extends XYDashOpts {
    xAxisLabelAutoRotate?: boolean
}

export default class LineDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.line

    listOpts = (): DashOpt[] => [
        ...xyDashOpts,
        {name: 'xAxisLabelAutoRotate', type: DashOptType.boolean, label: 'Auto rotate x-axis label'}
    ]

    getMetricField = () => 'xField'

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <LineDash {...props}/>
    }
}

function LineDash({dataset, dash, data}: InnerDashRenderProps) {
    const {xField, yField, xFieldAlias, yFieldAlias, seriesField, hideLegend, legendPosition, xAxisLabelAutoRotate} = dash.optValues as LineDashOpts
    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    const {columns} = dataset.spec
    const xFieldType = columns[xField].type
    const yFieldType = columns[yField].type
    const config: LineConfig = {
        data,
        xField,
        yField,
        seriesField,
        legend: hideLegend ? false : {
            position: legendPosition ?? 'top-left'
        },
        autoFit: true,
        xAxis: {
            label: {
                autoRotate: xAxisLabelAutoRotate
            },
            type: isTemporal(xFieldType) ? 'time' : undefined
        },
        yAxis: {
            type: isTemporal(yFieldType) ? 'time' : undefined
        },
        meta: {
            [xField]: {
                alias: xFieldAlias
            },
            [yField]: {
                alias: yFieldAlias
            }
        },
        locale: appConfig.dashboard.locale
    }

    return <Line {...config} />
}

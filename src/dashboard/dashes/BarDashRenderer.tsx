import {Bar, BarConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashOpt, DashOptType, DashRenderer, InnerDashRenderProps, XYDashOpts, xyDashOpts} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {isTemporal} from '../../util/dashboard'

interface BarDashOpts extends XYDashOpts {
    xAxisLabelAutoRotate?: boolean
}

export default class BarDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.bar

    listOpts = (): DashOpt[] => [
        ...xyDashOpts,
        {name: 'xAxisLabelAutoRotate', type: DashOptType.boolean, label: 'Auto rotate x-axis label'}
    ]

    getLabelField = () => ({
        name: 'yField',
        alias: 'yFieldAlias',
    })

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <BarDash {...props}/>
    }
}

function BarDash({dataset, dash, data}: InnerDashRenderProps) {
    const {xField, yField, xFieldAlias, yFieldAlias, seriesField, hideLegend, legendPosition, xAxisLabelAutoRotate} = dash.optValues as BarDashOpts
    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    const {columns} = dataset.spec
    if (!columns || !columns[xField] || !columns[yField])
        return <Alert message="The dataset does not contain a columns specification" type="error"/>

    const xFieldType = columns[xField].type
    const yFieldType = columns[yField].type
    const config: BarConfig = {
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

    return <Bar {...config} />
}

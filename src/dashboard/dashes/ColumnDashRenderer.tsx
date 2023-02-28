import {Column, ColumnConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashOpt, DashOptType, DashRenderer, InnerDashRenderProps, XYDashOpts, xyDashOpts} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {isTemporal} from '../../util/dashboard'

interface ColumnDashOpts extends XYDashOpts {
    xAxisLabelAutoRotate?: boolean
}

export default class ColumnDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.column

    listOpts = (): DashOpt[] => [
        ...xyDashOpts,
        {name: 'xAxisLabelAutoRotate', type: DashOptType.boolean, label: 'Auto rotate x-axis label'}
    ]

    getLabelField = () => ({
        name: 'xField',
        alias: 'xFieldAlias',
    })

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <ColumnDash {...props}/>
    }
}

function ColumnDash({dataset, dash, data}: InnerDashRenderProps) {
    const {xField, yField, xFieldAlias, yFieldAlias, seriesField, hideLegend, legendPosition, xAxisLabelAutoRotate} = dash.optValues as ColumnDashOpts
    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    const {columns} = dataset.spec
    if (!columns)
        return <Alert message="Dataset has no columns" type="error"/>

    const xFieldType = columns[xField].type
    const yFieldType = columns[yField].type
    const config: ColumnConfig = {
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

    return <Column {...config} />
}

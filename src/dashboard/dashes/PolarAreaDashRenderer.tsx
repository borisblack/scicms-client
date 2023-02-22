import {Rose, RoseConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashOpt, DashRenderer, InnerDashRenderProps, XYDashOpts, xyDashOpts} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {formatValue, isTemporal} from '../../util/dashboard'

interface PolarAreaDashOpts extends XYDashOpts {}

export default class PolarAreaDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.polarArea

    listOpts = (): DashOpt[] => [...xyDashOpts]

    getLabelField = () => ({
        name: 'xField',
        alias: 'xFieldAlias',
    })

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <PolarAreaDash {...props}/>
    }
}

function PolarAreaDash({dataset, dash, data}: InnerDashRenderProps) {
    const {xField, yField, xFieldAlias, yFieldAlias, seriesField, hideLegend, legendPosition} = dash.optValues as PolarAreaDashOpts
    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    const {columns} = dataset.spec
    const xFieldType = columns[xField].type
    const yFieldType = columns[yField].type
    const config: RoseConfig = {
        data,
        xField,
        yField,
        seriesField,
        radius: 1,
        legend: hideLegend ? false : {
            position: legendPosition ?? 'top-left'
        },
        autoFit: true,
        xAxis: {
            type: isTemporal(xFieldType) ? 'time' : undefined
        },
        yAxis: {
            type: isTemporal(yFieldType) ? 'time' : undefined
        },
        meta: {
            [xField]: {
                alias: xFieldAlias,
                formatter: (value: any) => formatValue(value, xFieldType)
            },
            [yField]: {
                alias: yFieldAlias
            }
        },
        locale: appConfig.dashboard.locale
    }

    return <Rose {...config} />
}

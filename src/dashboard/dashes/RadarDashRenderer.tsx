import {Radar, RadarConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashOpt, DashRenderer, InnerDashRenderProps, XYDashOpts, xyDashOpts} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {formatValue, isTemporal, parseDashColor} from '../../util/dashboard'

interface PolarAreaDashOpts extends XYDashOpts {}

export default class RadarDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.radar

    listOpts = (): DashOpt[] => [...xyDashOpts]

    getLabelField = () => ({
        name: 'xField',
        alias: 'xFieldAlias',
    })

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <RadarDash {...props}/>
    }
}

function RadarDash({dataset, dash, data}: InnerDashRenderProps) {
    const {xField, yField, xFieldAlias, yFieldAlias, seriesField, hideLegend, legendPosition} = dash.optValues as PolarAreaDashOpts
    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    const {columns} = dataset.spec
    if (!columns || !columns[xField] || !columns[yField])
        return <Alert message="The dataset does not contain a columns specification" type="error"/>
    
    const xFieldType = columns[xField].type
    const yFieldType = columns[yField].type
    const config: RadarConfig = {
        appendPadding: [0, 10, 0, 10],
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
            type: isTemporal(xFieldType) ? 'time' : undefined,
            tickLine: null
        },
        yAxis: {
            type: isTemporal(yFieldType) ? 'time' : undefined,
            label: false,
            grid: { alternateColor: 'rgba(0, 0, 0, 0.04)' }
        },
        point: {size: 2},
        area: {},
        meta: {
            [xField]: {
                alias: xFieldAlias,
                formatter: (value: any) => formatValue(value, xFieldType)
            },
            [yField]: {
                alias: yFieldAlias
            }
        },
        color: parseDashColor(seriesField == null),
        locale: appConfig.dashboard.locale
    }

    return <Radar {...config} />
}

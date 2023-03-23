import {Area, AreaConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashOpt, DashRenderer, InnerDashRenderProps, XYDashOpts, xyDashOpts} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {formatValue, isTemporal, parseDashColor} from '../../util/dashboard'

interface AreaDashOpts extends XYDashOpts {}

const {dash: dashConfig, locale} = appConfig.dashboard
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

export default class AreaDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.area

    listOpts = (): DashOpt[] => [...xyDashOpts]

    getLabelField = () => ({
        name: 'xField'
    })

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <AreaDash {...props}/>
    }
}

function AreaDash({dataset, dash, data}: InnerDashRenderProps) {
    const {xField, yField, seriesField, hideLegend, legendPosition} = dash.optValues as AreaDashOpts
    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    const columns = dataset.spec.columns ?? {}
    const xColumn = columns[xField]
    const yColumn = columns[yField]
    if (xColumn == null || yColumn == null)
        return <Alert message="Invalid columns specification" type="error"/>

    const config: AreaConfig = {
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

    return <Area {...config} />
}

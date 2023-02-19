import {Scatter, ScatterConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {bubbleDashOpts, BubbleDashOpts, DashOpt, DashRenderer, InnerDashRenderProps} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {isTemporal} from '../../util/dashboard'

type ScatterDashOpts = Omit<BubbleDashOpts, 'sizeField'>

export default class ScatterDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.scatter

    listOpts = (): DashOpt[] => bubbleDashOpts.filter(o => o.name !== 'sizeField')

    getMetricField = () => 'sizeField'

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <ScatterDash {...props}/>
    }
}

function ScatterDash({dataset, dash, data}: InnerDashRenderProps) {
    const {xField, yField, colorField, xFieldAlias, yFieldAlias, hideLegend, legendPosition, xAxisLabelAutoRotate} = dash.optValues as ScatterDashOpts
    if (!xField)
        return <Alert message="xField attribute not specified" type="error"/>

    if (!yField)
        return <Alert message="yField attribute not specified" type="error"/>

    const {columns} = dataset.spec
    const xFieldType = columns[xField].type
    const yFieldType = columns[yField].type
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
            position: legendPosition ?? 'top-left'
        },
        xAxis: {
            label: {
                autoRotate: xAxisLabelAutoRotate
            },
            type: isTemporal(xFieldType) ? 'time' : undefined,
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
            type: isTemporal(yFieldType) ? 'time' : undefined,
            line: {
                style: {stroke: '#aaa'}
            },
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

    return <Scatter {...config} />
}

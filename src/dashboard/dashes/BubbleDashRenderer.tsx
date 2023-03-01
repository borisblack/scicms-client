import {Scatter, ScatterConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {bubbleDashOpts, BubbleDashOpts, DashOpt, DashRenderer, InnerDashRenderProps} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {formatValue, isTemporal} from '../../util/dashboard'

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
    if (!columns || !columns.xField || !columns.yField || !columns.sizeField)
        return <Alert message="The dataset does not contain a columns specification" type="error"/>

    const xFieldType = columns[xField].type
    const yFieldType = columns[yField].type
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
            position: legendPosition ?? 'top-left'
        },
        xAxis: {
            label: {
                autoRotate: xAxisLabelAutoRotate
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
            type: isTemporal(yFieldType) ? 'time' : undefined
        },
        meta: {
            [xField]: {
                alias: xFieldAlias,
                formatter: (value: any) => formatValue(value, xFieldType)
            },
            [yField]: {
                alias: yFieldAlias
            },
            [sizeField]: {
                alias: sizeFieldAlias
            }
        },
        locale: appConfig.dashboard.locale
    }

    return <Scatter {...config} />
}

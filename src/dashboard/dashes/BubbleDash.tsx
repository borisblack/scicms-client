import {FC} from 'react'
import {Scatter, ScatterConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {InnerDashProps} from '.'
import appConfig from '../../config'

const BubbleDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, data}) => {
    if (dash.type !== DashType.bubble)
        throw new Error('Illegal dash type')

    const {metricField, temporalField, labelField} = dash
    if (metricField == null || temporalField == null || labelField == null)
        throw new Error('Illegal argument')

    const config: ScatterConfig = {
        appendPadding: 30,
        data: data.map(it => ({...it, [labelField]: it[labelField]?.toString()?.trim()})),
        xField: temporalField,
        yField: metricField,
        sizeField: metricField,
        colorField: labelField,
        size: [4, 30],
        shape: 'circle',
        pointStyle: {
            fillOpacity: 0.8,
            stroke: '#bbb',
        },
        xAxis: {
            grid: {
                line: {
                    style: {
                        stroke: '#eee',
                    },
                },
            },
            line: {
                style: {
                    stroke: '#aaa',
                },
            },
            type: 'time'
        },
        yAxis: {
            line: {
                style: {
                    stroke: '#aaa',
                },
            },
        },
        locale: appConfig.dashboard.locale
    }

    return <Scatter {...config} />
}

export default BubbleDash
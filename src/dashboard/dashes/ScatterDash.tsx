import {FC} from 'react'
import {Scatter, ScatterConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {InnerDashRenderProps} from '.'
import appConfig from '../../config'

const ScatterDash: FC<InnerDashRenderProps> = ({pageKey, dash, fullScreen, data}) => {
    if (dash.type !== DashType.scatter)
        throw new Error('Illegal dash type')

    const {metricField, temporalField, labelField} = dash
    if (metricField == null || temporalField == null || labelField == null)
        throw new Error('Illegal argument')

    const config: ScatterConfig = {
        appendPadding: 10,
        data: data.map(it => ({...it, [labelField]: it[labelField]?.toString()?.trim()})),
        xField: temporalField,
        yField: metricField,
        shape: 'circle',
        colorField: labelField,
        size: 4,
        yAxis: {
            nice: true,
            line: {
                style: {
                    stroke: '#aaa',
                },
            },
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
        locale: appConfig.dashboard.locale
    }

    return <Scatter {...config} />
}

export default ScatterDash
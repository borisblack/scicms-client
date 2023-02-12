import {FC} from 'react'
import {Radar, RadarConfig} from '@ant-design/charts'

import {DashType} from '../../types'
import {InnerDashProps} from '.'
import appConfig from '../../config'

const RadarDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, data}) => {
    if (dash.type !== DashType.radar)
        throw new Error('Illegal dash type')

    const {metricField, labelField} = dash
    if (metricField == null || labelField == null)
        throw new Error('Illegal argument')

    const config: RadarConfig = {
        data: data.map(it => ({...it, [labelField]: it[labelField]?.toString()?.trim()})),
        xField: labelField,
        yField: metricField,
        appendPadding: [0, 10, 0, 10],
        xAxis: {
            tickLine: null,
        },
        yAxis: {
            label: false,
            grid: {
                alternateColor: 'rgba(0, 0, 0, 0.04)',
            },
        },
        point: {
            size: 2,
        },
        area: {},
        locale: appConfig.dashboard.locale
    }

    return <Radar {...config} />
}

export default RadarDash
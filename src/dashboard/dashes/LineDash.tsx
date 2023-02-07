import {FC} from 'react'
import {Line, LineConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {InnerDashProps} from '.'
import appConfig from '../../config'

const LineDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, data}) => {
    if (dash.type !== DashType.line)
        throw new Error('Illegal dash type')

    const {metricField, temporalField} = dash
    if (metricField == null || temporalField == null)
        throw new Error('Illegal argument')

    const config: LineConfig = {
        data,
        xField: temporalField,
        yField: metricField,
        // seriesField: 'category',
        xAxis: {
            type: 'time',
        },
        locale: appConfig.dashboard.locale
    }

    return <Line {...config} />
}

export default LineDash
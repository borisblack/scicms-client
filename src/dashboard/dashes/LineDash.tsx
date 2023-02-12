import {FC} from 'react'
import {Line, LineConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {InnerDashRenderProps} from '.'
import appConfig from '../../config'

const LineDash: FC<InnerDashRenderProps> = ({pageKey, dash, fullScreen, data}) => {
    if (dash.type !== DashType.line)
        throw new Error('Illegal dash type')

    const {metricField, temporalField, labelField} = dash
    if (metricField == null || temporalField == null)
        throw new Error('Illegal argument')

    const config: LineConfig = {
        data,
        xField: temporalField,
        yField: metricField,
        seriesField: labelField === temporalField ? undefined : labelField,
        xAxis: {
            type: 'time',
        },
        locale: appConfig.dashboard.locale
    }

    return <Line {...config} />
}

export default LineDash
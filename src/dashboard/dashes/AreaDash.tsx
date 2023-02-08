import {FC} from 'react'
import {Area, AreaConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {InnerDashProps} from '.'
import appConfig from '../../config'

const AreaDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, data}) => {
    if (dash.type !== DashType.area)
        throw new Error('Illegal dash type')

    const {metricField, temporalField, labelField} = dash
    if (metricField == null || temporalField == null)
        throw new Error('Illegal argument')

    const config: AreaConfig = {
        data,
        xField: temporalField,
        yField: metricField,
        seriesField: labelField === temporalField ? undefined : labelField,
        xAxis: {
            type: 'time',
        },
        locale: appConfig.dashboard.locale
    }

    return <Area {...config} />
}

export default AreaDash
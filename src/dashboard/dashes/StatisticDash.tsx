import {FC} from 'react'
import {Statistic} from 'antd'
import {DashType} from '../../types'
import {InnerDashProps} from '.'

const StatisticDash: FC<InnerDashProps> = ({dash, data}) => {
    if (dash.type !== DashType.statistic)
        throw new Error('Illegal dash type')

    const {metricField} = dash
    if (metricField == null)
        throw new Error('Illegal argument')

    return (
        <div>
            {data.length > 0 && <Statistic value={data[0][metricField]}/>}
        </div>
    )
}

export default StatisticDash
import {FC} from 'react'
import {Statistic} from 'antd'
import {DashType} from '../../types'
import {InnerDashProps} from '.'

const StatisticDash: FC<InnerDashProps> = ({dash, dataset, data}) => {
    if (dash.type !== DashType.statistic)
        throw new Error('Illegal dash type')

    return (
        <div>
            {data.length > 0 && <Statistic value={data[0][dataset.metricField]}/>}
        </div>
    )
}

export default StatisticDash
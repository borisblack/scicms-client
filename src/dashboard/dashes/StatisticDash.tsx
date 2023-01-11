import {FC, useMemo} from 'react'
import {Statistic} from 'antd'
import {DashType} from '../../types'
import {InnerDashProps} from '.'
import {map2dMetrics, mapLabels} from '../../util/dashboard'

const StatisticDash: FC<InnerDashProps> = ({dash, fullScreen, data}) => {
    if (dash.type !== DashType.statistic)
        throw new Error('Illegal dash type')

    const labels = useMemo(() => mapLabels(dash, data), [dash, data])
    const preparedData = useMemo(() => map2dMetrics(dash, data), [dash, data])

    return (
        <Statistic title={labels ? labels[0] : ''} value={preparedData ? preparedData[0].y : 0}/>
    )
}

export default StatisticDash
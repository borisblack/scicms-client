import {FC} from 'react'
import {Statistic} from 'antd'
import {DashType} from '../../types'
import {InnerDashRenderProps} from '.'

const StatisticDash: FC<InnerDashRenderProps> = ({dash, data}) => {
    if (dash.type !== DashType.statistic)
        throw new Error('Illegal dash type')

    const {metricField} = dash
    if (metricField == null)
        throw new Error('Illegal argument')

    return (
        <div>
            {data.length > 0 && (
                <Statistic
                    style={{padding: '0 12px'}}
                    valueStyle={{fontSize: 48, fontWeight: 600, color: '#333366'}}
                    value={data[0][metricField]}
                    groupSeparator=" "
                />
            )}
        </div>
    )
}

export default StatisticDash
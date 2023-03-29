import {DashRenderContext} from '../index'
import {Alert, Statistic} from 'antd'
import biConfig from '../../../config/bi'

interface StatisticDashOptions {
    statisticField?: string
}

export default function StatisticDash({dataset, dash, data}: DashRenderContext) {
    const {statisticField} = dash.optValues as StatisticDashOptions
    if (!statisticField)
        return <Alert message="statisticField attribute not specified" type="error"/>

    return (
        <div>
            {data.length > 0 && (
                <Statistic
                    style={{padding: '0 12px'}}
                    valueStyle={{fontSize: 48, fontWeight: 600, color: biConfig.dash?.statistic?.color}}
                    value={data[0][statisticField]}
                    groupSeparator=" "
                />
            )}
        </div>
    )
}
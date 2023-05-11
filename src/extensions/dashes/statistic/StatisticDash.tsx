import {DashRenderContext} from '../index'
import {Alert, Statistic} from 'antd'
import biConfig from '../../../config/bi'
import {useMemo} from 'react'
import RulesService from '../../../services/rules'

interface StatisticDashOptions {
    statisticField?: string
    rules?: string
}

const rulesService = RulesService.getInstance()

export default function StatisticDash({dataset, dash, data}: DashRenderContext) {
    const {statisticField, rules} = dash.optValues as StatisticDashOptions
    const fieldRules = useMemo(() => rulesService.parseRules(rules), [rules])
    const fieldStyle = statisticField ? rulesService.getFieldStyle(fieldRules, statisticField, data[0]) : {}

    if (!statisticField)
        return <Alert message="statisticField attribute not specified" type="error"/>

    return (
        <div>
            {data.length > 0 && (
                <Statistic
                    style={{padding: '0 12px'}}
                    valueStyle={{fontSize: 48, fontWeight: 600, color: biConfig.dash?.statistic?.color, ...fieldStyle}}
                    value={data[0][statisticField]}
                    groupSeparator=" "
                />
            )}
        </div>
    )
}
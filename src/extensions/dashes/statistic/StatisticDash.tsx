import {memo, useMemo} from 'react'
import {Alert, Statistic} from 'antd'

import {DashRenderContext} from '..'
import biConfig from 'src/config/bi'
import * as RulesService from 'src/services/rules'

interface StatisticDashOptions {
    statisticField?: string
    rules?: string
}

function StatisticDash({dataset, dash, data}: DashRenderContext) {
    const optValues = dash.optValues as StatisticDashOptions
    const {rules} = optValues
    const statisticField = Array.isArray(optValues.statisticField) ? optValues.statisticField[0] : optValues.statisticField
    const fieldRules = useMemo(() => RulesService.parseRules(rules), [rules])
    const fieldStyle = statisticField ? RulesService.getFieldStyle(fieldRules, statisticField, data[0]) : {}

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

export default memo(StatisticDash)
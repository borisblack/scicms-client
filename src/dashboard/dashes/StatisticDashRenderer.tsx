import {DashType} from '../../types'
import {DashOpt, DashOptType, DashRenderer, InnerDashRenderProps} from '.'
import {Alert, Statistic} from 'antd'

interface StatisticDashOpts {
    statisticField?: string
}

export default class StatisticDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.statistic

    listOpts = (): DashOpt[] => [
        {name: 'statisticField', type: DashOptType.string, label: 'Statistic field', required: true, fromDataset: true}
    ]

    getMetricField = () => 'statisticField'

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <StatisticDash {...props}/>
    }
}

function StatisticDash({dataset, dash, data}: InnerDashRenderProps) {
    const {statisticField} = dash.optValues as StatisticDashOpts
    if (!statisticField)
        return <Alert message="statisticField attribute not specified" type="error"/>

    return (
        <div>
            {data.length > 0 && (
                <Statistic
                    style={{padding: '0 12px'}}
                    valueStyle={{fontSize: 48, fontWeight: 600, color: '#333366'}}
                    value={data[0][statisticField]}
                    groupSeparator=" "
                />
            )}
        </div>
    )
}

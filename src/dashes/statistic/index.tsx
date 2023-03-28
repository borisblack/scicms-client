import {Dash} from '..'
import StatisticDash from './StatisticDash'
import {DashOptionType} from '../../bi'

const DASH_ID = 'statistic'

export const statistic: Dash = {
    id: DASH_ID,
    priority: 10,
    options: [{name: 'statisticField', type: DashOptionType.string, label: 'Statistic field', required: true, fromDataset: true}],
    labelFieldName: 'statisticField',
    icon: 'BarChartOutlined',
    render: ({context}) => <StatisticDash {...context}/>
}

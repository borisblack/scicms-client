import {Dash} from '../index'
import StatisticDash from './StatisticDash'
import StatisticDashOptionsForm from './StatisticDashOptionsForm'

const DASH_ID = 'statistic'

export const statistic: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <StatisticDashOptionsForm {...props}/>,
    icon: 'BarChartOutlined',
    render: ({context}) => <StatisticDash {...context}/>
}

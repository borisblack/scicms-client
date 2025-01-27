import {Dash} from '../index'
import StatisticDash from './StatisticDash'
import StatisticDashOptionsForm from './StatisticDashOptionsForm'

const DASH_ID = 'statistic'

export const statistic: Dash = {
  id: DASH_ID,
  icon: 'BoxPlotOutlined',
  axes: [{name: 'statisticField', label: 'Statistic field', cardinality: 1, required: true}],
  renderOptionsForm: props => <StatisticDashOptionsForm {...props} />,
  render: ({context}) => <StatisticDash {...context} />
}

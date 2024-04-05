import {Dash} from '..'
import DoughnutDashSuspense from './DoughnutDashSuspense'
import DoughnutDashOptionsForm from './DoughnutDashOptionsForm'

const DASH_ID = 'doughnut'

export const doughnut: Dash = {
  id: DASH_ID,
  icon: 'PieChartOutlined',
  axes: [
    {name: 'angleField', label: 'Angle field', cardinality: 1, required: true},
    {name: 'colorField', label: 'Color field', cardinality: 1, required: true}
  ],
  renderOptionsForm: (props) => <DoughnutDashOptionsForm {...props}/>,
  render: ({context}) => <DoughnutDashSuspense {...context}/>
}

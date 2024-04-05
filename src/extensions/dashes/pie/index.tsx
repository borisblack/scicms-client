import {Dash} from '../index'
import PieDashSuspense from './PieDashSuspense'
import PieDashOptionsForm from './PieDashOptionsForm'

const DASH_ID = 'pie'

export const pie: Dash = {
  id: DASH_ID,
  icon: 'PieChartOutlined',
  axes: [
    {name: 'angleField', label: 'Angle field', cardinality: 1, required: true},
    {name: 'colorField', label: 'Color field', cardinality: 1, required: true}
  ],
  renderOptionsForm: (props) => <PieDashOptionsForm {...props}/>,
  render: ({context}) => <PieDashSuspense {...context}/>
}

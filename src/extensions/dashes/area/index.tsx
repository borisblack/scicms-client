import {Dash} from '../index'
import AreaDashSuspense from './AreaDashSuspense'
import AreaDashOptionsForm from './AreaDashOptionsForm'

const DASH_ID = 'area'

export const area: Dash = {
  id: DASH_ID,
  icon: 'AreaChartOutlined',
  axes: [
    {name: 'xField', label: 'x-axis field', cardinality: 1, required: true},
    {name: 'yField', label: 'y-axis field', cardinality: 1, required: true},
    {name: 'seriesField', label: 'Series field', cardinality: 1, required: false}
  ],
  renderOptionsForm: (props) => <AreaDashOptionsForm {...props}/>,
  render: ({context}) => <AreaDashSuspense {...context}/>
}

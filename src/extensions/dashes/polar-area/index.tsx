import {Dash} from '../index'
import PolarAreaDashSuspense from './PolarAreaDashSuspense'
import PolarAreaDashOptionsForm from './PolarAreaDashOptionsForm'

const DASH_ID = 'polarArea'

export const polarArea: Dash = {
  id: DASH_ID,
  icon: 'HeatMapOutlined',
  axes: [
    {name: 'xField', label: 'x-axis field', cardinality: 1, required: true},
    {name: 'yField', label: 'y-axis field', cardinality: 1, required: true},
    {name: 'seriesField', label: 'Series field', cardinality: 1, required: false}
  ],
  renderOptionsForm: (props) => <PolarAreaDashOptionsForm {...props}/>,
  render: ({context}) => <PolarAreaDashSuspense {...context}/>
}

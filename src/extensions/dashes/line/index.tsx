import {Dash} from '../index'
import LineDashSuspense from './LineDashSuspense'
import LineDashOptionsForm from './LineDashOptionsForm'

const DASH_ID = 'line'

export const line: Dash = {
  id: DASH_ID,
  icon: 'LineChartOutlined',
  axes: [
    {name: 'xField', label: 'x-axis field', cardinality: 1, required: true},
    {name: 'yField', label: 'y-axis field', cardinality: 1, required: true},
    {name: 'seriesField', label: 'Series field', cardinality: 1, required: false}
  ],
  renderOptionsForm: (props) => <LineDashOptionsForm {...props}/>,
  render: ({context}) => <LineDashSuspense {...context}/>
}

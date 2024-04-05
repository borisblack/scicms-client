import {Dash} from '../index'
import ColumnDashSuspense from './ColumnDashSuspense'
import ColumnDashOptionsForm from './ColumnDashOptionsForm'

const DASH_ID = 'column'

export const column: Dash = {
  id: DASH_ID,
  icon: 'BarChartOutlined',
  axes: [
    {name: 'xField', label: 'x-axis field', cardinality: 1, required: true},
    {name: 'yField', label: 'y-axis field', cardinality: 1, required: true},
    {name: 'seriesField', label: 'Series field', cardinality: 1, required: false}
  ],
  renderOptionsForm: (props) => <ColumnDashOptionsForm {...props}/>,
  render: ({context}) => <ColumnDashSuspense {...context}/>
}

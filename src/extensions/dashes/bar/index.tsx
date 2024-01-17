import {Dash} from '../index'
import BarDashSuspense from './BarDashSuspense'
import BarDashOptionsForm from './BarDashOptionsForm'

const DASH_ID = 'bar'

export const bar: Dash = {
    id: DASH_ID,
    icon: 'FaChartBar',
    axes: [
        {name: 'xField', label: 'x-axis field', cardinality: 1, required: true},
        {name: 'yField', label: 'y-axis field', cardinality: 1, required: true},
        {name: 'seriesField', label: 'Series field', cardinality: 1, required: false}
    ],
    renderOptionsForm: (props) => <BarDashOptionsForm {...props}/>,
    render: ({context}) => <BarDashSuspense {...context}/>
}

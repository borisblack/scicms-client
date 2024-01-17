import {Dash} from '../index'
import ScatterDashSuspense from './ScatterDashSuspense'
import ScatterDashOptionsForm from './ScatterDashOptionsForm'

const DASH_ID = 'scatter'

export const scatter: Dash = {
    id: DASH_ID,
    icon: 'DotChartOutlined',
    axes: [
        {name: 'xField', label: 'x-axis field', cardinality: 1, required: true},
        {name: 'yField', label: 'y-axis field', cardinality: 1, required: true},
        {name: 'colorField', label: 'Color field', cardinality: 1, required: false},
    ],
    renderOptionsForm: (props) => <ScatterDashOptionsForm {...props}/>,
    render: ({context}) => <ScatterDashSuspense {...context}/>
}

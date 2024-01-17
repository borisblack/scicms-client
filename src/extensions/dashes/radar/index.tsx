import {Dash} from '../index'
import RadarDashSuspense from './RadarDashSuspense'
import RadarDashOptionsForm from './RadarDashOptionsForm'

const DASH_ID = 'radar'

export const radar: Dash = {
    id: DASH_ID,
    icon: 'RadarChartOutlined',
    axes: [
        {name: 'xField', label: 'x-axis field', cardinality: 1, required: true},
        {name: 'yField', label: 'y-axis field', cardinality: 1, required: true},
        {name: 'seriesField', label: 'Series field', cardinality: 1, required: false}
    ],
    renderOptionsForm: (props) => <RadarDashOptionsForm {...props}/>,
    render: ({context}) => <RadarDashSuspense {...context}/>
}

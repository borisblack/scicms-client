import {Dash} from '../index'
import BubbleDashSuspense from './BubbleDashSuspense'
import BubbleDashOptionsForm from './BubbleDashOptionsForm'

const DASH_ID = 'bubble'

export const bubble: Dash = {
    id: DASH_ID,
    icon: 'DotChartOutlined',
    axes: [
        {name: 'xField', label: 'x-axis field', cardinality: 1, required: true},
        {name: 'yField', label: 'y-axis field', cardinality: 1, required: true},
        {name: 'sizeField', label: 'Size field', cardinality: 1, required: true},
        {name: 'colorField', label: 'Color field', cardinality: 1, required: false}
    ],
    renderOptionsForm: (props) => <BubbleDashOptionsForm {...props}/>,
    render: ({context}) => <BubbleDashSuspense {...context}/>
}

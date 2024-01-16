import {Dash} from '../index'
import BubbleDashSuspense from './BubbleDashSuspense'
import BubbleDashOptionsForm from './BubbleDashOptionsForm'

const DASH_ID = 'bubble'

export const bubble: Dash = {
    id: DASH_ID,
    icon: 'DotChartOutlined',
    axes: [],
    renderOptionsForm: (props) => <BubbleDashOptionsForm {...props}/>,
    render: ({context}) => <BubbleDashSuspense {...context}/>
}

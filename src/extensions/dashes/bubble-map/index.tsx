import {Dash} from '../index'
import BubbleMapDash from './BubbleMapDash'
import BubbleMapDashOptionsForm from './BubbleMapDashOptionsForm'

const DASH_ID = 'bubbleMap'

export const bubbleMap: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <BubbleMapDashOptionsForm {...props}/>,
    icon: 'DotChartOutlined',
    render: ({context}) => <BubbleMapDash {...context}/>
}

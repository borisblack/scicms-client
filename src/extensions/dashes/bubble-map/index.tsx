import {Dash} from '../index'
import BubbleMapDash from './BubbleMapDash'
import {bubbleMapDashOptions} from '../util'

const DASH_ID = 'bubbleMap'

export const bubbleMap: Dash = {
    id: DASH_ID,
    options: [...bubbleMapDashOptions],
    labelFieldName: 'locationField',
    icon: 'DotChartOutlined',
    render: ({context}) => <BubbleMapDash {...context}/>
}

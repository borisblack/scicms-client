import {Dash} from '../index'
import BubbleDash from './BubbleDash'
import {bubbleDashOptions} from '../util'

const DASH_ID = 'bubble'

export const bubble: Dash = {
    id: DASH_ID,
    priority: 10,
    options: [...bubbleDashOptions],
    labelFieldName: 'xField',
    icon: 'DotChartOutlined',
    render: ({context}) => <BubbleDash {...context}/>
}

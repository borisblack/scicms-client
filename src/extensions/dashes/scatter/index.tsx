import {Dash} from '../index'
import ScatterDash from './ScatterDash'
import {bubbleDashOptions} from '../util'

const DASH_ID = 'scatter'

export const scatter: Dash = {
    id: DASH_ID,
    options: bubbleDashOptions.filter(opt => opt.name !== 'sizeField'),
    icon: 'DotChartOutlined',
    render: ({context}) => <ScatterDash {...context}/>
}

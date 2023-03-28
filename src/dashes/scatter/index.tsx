import {Dash} from '..'
import ScatterDash from './ScatterDash'
import {bubbleDashOptions} from '../util'

const DASH_ID = 'scatter'

export const scatter: Dash = {
    id: DASH_ID,
    priority: 10,
    options: bubbleDashOptions.filter(opt => opt.name !== 'sizeField'),
    labelFieldName: 'xField',
    icon: 'DotChartOutlined',
    render: ({context}) => <ScatterDash {...context}/>
}

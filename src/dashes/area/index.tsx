import {Dash} from '..'
import AreaDash from './AreaDash'
import {xyDashOptions} from '../util'

const DASH_ID = 'area'

export const area: Dash = {
    id: DASH_ID,
    priority: 10,
    options: [...xyDashOptions],
    labelFieldName: 'xField',
    icon: 'AreaChartOutlined',
    render: ({context}) => <AreaDash {...context}/>
}

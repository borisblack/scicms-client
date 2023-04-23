import {Dash} from '../index'
import AreaDash from './AreaDash'
import {xyDashOptions} from '../util'

const DASH_ID = 'area'

export const area: Dash = {
    id: DASH_ID,
    options: [...xyDashOptions],
    icon: 'AreaChartOutlined',
    render: ({context}) => <AreaDash {...context}/>
}

import {Dash} from '../index'
import PolarAreaDash from './PolarAreaDash'
import {xyDashOptions} from '../util'

const DASH_ID = 'polarArea'

export const polarArea: Dash = {
    id: DASH_ID,
    options: [...xyDashOptions],
    labelFieldName: 'xField',
    icon: 'FaChartPie',
    render: ({context}) => <PolarAreaDash {...context}/>
}

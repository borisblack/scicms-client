import {Dash} from '../index'
import PolarAreaDashSuspense from './PolarAreaDashSuspense'
import PolarAreaDashOptionsForm from './PolarAreaDashOptionsForm'

const DASH_ID = 'polarArea'

export const polarArea: Dash = {
    id: DASH_ID,
    icon: 'HeatMapOutlined',
    axes: [],
    renderOptionsForm: (props) => <PolarAreaDashOptionsForm {...props}/>,
    render: ({context}) => <PolarAreaDashSuspense {...context}/>
}

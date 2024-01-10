import {Dash} from '../index'
import AreaDashSuspense from './AreaDashSuspense'
import AreaDashOptionsForm from './AreaDashOptionsForm'

const DASH_ID = 'area'

export const area: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <AreaDashOptionsForm {...props}/>,
    render: ({context}) => <AreaDashSuspense {...context}/>
}

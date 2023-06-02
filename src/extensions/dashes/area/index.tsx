import {Dash} from '../index'
import AreaDash from './AreaDash'
import AreaDashOptionsForm from './AreaDashOptionsForm'

const DASH_ID = 'area'

export const area: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <AreaDashOptionsForm {...props}/>,
    render: ({context}) => <AreaDash {...context}/>
}

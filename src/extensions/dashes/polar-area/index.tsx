import {Dash} from '../index'
import PolarAreaDash from './PolarAreaDash'
import PolarAreaDashOptionsForm from './PolarAreaDashOptionsForm'

const DASH_ID = 'polarArea'

export const polarArea: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <PolarAreaDashOptionsForm {...props}/>,
    render: ({context}) => <PolarAreaDash {...context}/>
}

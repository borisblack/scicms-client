import {Dash} from '../index'
import BubbleMapDash from './BubbleMapDash'
import BubbleMapDashOptionsForm from './BubbleMapDashOptionsForm'

const DASH_ID = 'bubbleMap'
export const MIN_LAT = -90
export const MAX_LAT = 90
export const MIN_LNG = -180
export const MAX_LNG = 180

export const bubbleMap: Dash = {
    id: DASH_ID,
    icon: 'FaMapMarkerAlt',
    axes: [],
    renderOptionsForm: (props) => <BubbleMapDashOptionsForm {...props}/>,
    render: ({context}) => <BubbleMapDash {...context}/>
}

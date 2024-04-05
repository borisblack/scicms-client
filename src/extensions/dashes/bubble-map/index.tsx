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
  axes: [
    {name: 'latitudeField', label: 'Latitude field', cardinality: 1, required: true},
    {name: 'longitudeField', label: 'Longitude field', cardinality: 1, required: true},
    {name: 'sizeField', label: 'Size field', cardinality: 1, required: true},
    {name: 'colorField', label: 'Color field', cardinality: 1, required: false},
    {name: 'labelField', label: 'Label field', cardinality: 1, required: false}
  ],
  renderOptionsForm: (props) => <BubbleMapDashOptionsForm {...props}/>,
  render: ({context}) => <BubbleMapDash {...context}/>
}

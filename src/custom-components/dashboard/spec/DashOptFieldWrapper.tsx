import {FC} from 'react'
import {DashOptFieldProps} from './dash-opt-fields'
import {DashOptType} from '../../../dashboard/dashes'
import StringDashOptField from './dash-opt-fields/StringDashOptField'
import BooleanDashOptField from './dash-opt-fields/BooleanDashOptField'
import NumberDashOptField from './dash-opt-fields/NumberDashOptField'

const dashPropFields: {[type: string]: FC<DashOptFieldProps>} = {
    [DashOptType.string]: StringDashOptField,
    [DashOptType.number]: NumberDashOptField,
    [DashOptType.boolean]: BooleanDashOptField
}

export default function DashOptFieldWrapper(props: DashOptFieldProps) {
    const {dashOpt} = props

    const DashPropFieldComponent = dashPropFields[dashOpt.type]
    if (!DashPropFieldComponent)
        return <span className="red">Unsupported property type</span>

    return <DashPropFieldComponent {...props}/>
}
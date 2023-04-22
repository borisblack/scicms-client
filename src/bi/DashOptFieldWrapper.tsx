import {FC} from 'react'
import {DashOptFieldProps} from './dash-opt-fields'
import {DashOptionType} from './index'
import StringDashOptField from './dash-opt-fields/StringDashOptField'
import BooleanDashOptField from './dash-opt-fields/BooleanDashOptField'
import NumberDashOptField from './dash-opt-fields/NumberDashOptField'

const dashPropFields: {[type: string]: FC<DashOptFieldProps>} = {
    [DashOptionType.string]: StringDashOptField,
    [DashOptionType.number]: NumberDashOptField,
    [DashOptionType.boolean]: BooleanDashOptField
}

export default function DashOptFieldWrapper(props: DashOptFieldProps) {
    const {dashOpt} = props

    const DashPropFieldComponent = dashPropFields[dashOpt.type]
    if (!DashPropFieldComponent)
        return <span className="red">Unsupported property type</span>

    return <DashPropFieldComponent {...props}/>
}
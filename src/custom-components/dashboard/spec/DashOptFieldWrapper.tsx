import {DashOptFieldProps} from './dash-opt-fields'
import {FC} from 'react'
import StringDashOptField from './dash-opt-fields/StringDashOptField'
import {DashOptType} from '../../../dashboard/dashes'

const dashPropFields: {[type: string]: FC<DashOptFieldProps>} = {
    [DashOptType.string]: StringDashOptField
}

export default function DashOptFieldWrapper(props: DashOptFieldProps) {
    const {dashOpt} = props

    const DashPropFieldComponent = dashPropFields[dashOpt.type]
    if (!DashPropFieldComponent)
        return <span className="red">Unsupported property type</span>

    return <DashPropFieldComponent {...props}/>
}
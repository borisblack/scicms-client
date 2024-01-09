import _ from 'lodash'

import {Dataset} from '../types/bi'
import FieldItem from './FieldItem'

interface DatasetFieldsProps {
    dataset: Dataset
    canEdit: boolean
}

export default function DatasetFields({dataset, canEdit}: DatasetFieldsProps) {
    return (
        <>
            {_.map(dataset.spec.columns, (field, fieldName) => (
                <FieldItem
                    key={fieldName}
                    field={{...field, name: fieldName}}
                    canEdit={canEdit}
                />
            ))}
        </>
    )
}
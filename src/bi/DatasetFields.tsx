import {Dataset} from '../types/bi'
import FieldItem from './FieldItem'
import styles from './DatasetFields.module.css'

interface DatasetFieldsProps {
    dataset: Dataset
    canEdit: boolean
}

export default function DatasetFields({dataset, canEdit}: DatasetFieldsProps) {
    return (
        <div className={styles.datasetFields}>
            {Object.keys(dataset.spec.columns).sort()
                .map(fieldName => {
                    const field = dataset.spec.columns[fieldName]
                    return (
                        <FieldItem
                            key={fieldName}
                            field={{...field, name: fieldName}}
                            canEdit={canEdit}
                        />
                    )
                })
            }
        </div>
    )
}
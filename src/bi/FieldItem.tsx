import {useDrag} from 'react-dnd'

import {NamedColumn} from 'src/types/bi'
import {DndItemType} from '../config/constants'
import FieldTypeIcon from '../components/app/FieldTypeIcon'
import FieldName from '../components/app/FieldName'
import styles from './FieldItem.module.css'

interface FieldItemProps {
    field: NamedColumn
    canEdit: boolean
}

export default function FieldItem({field, canEdit}: FieldItemProps) {
    const [{isDragging}, drag] = useDrag(
        () => ({
            type: DndItemType.DATASET_FIELD,
            item: field,
            // canDrag: canEdit,
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            })
        }),
        [canEdit]
    )

    return (
        <div
            className={styles.fieldItem}
            ref={drag}
            style={{opacity: isDragging ? 0.5 : 1}}
        >
            <span className="text-ellipsis" title={field.name}>
                <FieldTypeIcon fieldType={field.type}/>
                &nbsp;&nbsp;
                <FieldName name={field.name} locked={!field.custom}/>
            </span>
        </div>
    )
}
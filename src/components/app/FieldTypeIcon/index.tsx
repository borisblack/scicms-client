import {CSSProperties} from 'react'

import {FieldType} from 'src/types'
import styles from './FieldTypeIcon.module.css'

interface FieldTypeIconProps {
    fieldType: FieldType
    color?: string
    className?: string
    style?: CSSProperties
}

export default function FieldTypeIcon({fieldType, color, className, style}: FieldTypeIconProps) {
    function iconClassName() {
        switch (fieldType) {
            case FieldType.int:
            case FieldType.long:
            case FieldType.float:
            case FieldType.double:
            case FieldType.decimal:
                return 'fa-solid fa-hashtag'
            case FieldType.string:
            case FieldType.text:
                return 'fa-solid fa-t'
            case FieldType.bool:
                return 'fa-solid fa-check'
            case FieldType.date:
            case FieldType.datetime:
            case FieldType.timestamp:
                return 'fa-solid fa-calendar-days'
            case FieldType.time:
                return 'fa-solid fa-clock'
            case FieldType.uuid:
                return 'fa-solid fa-u'
            case FieldType.sequence:
                return 'fa-solid fa-arrow-up-1-9'
            case FieldType.email:
                return 'fa-solid fa-at'
            case FieldType.enum:
                return 'fa-solid fa-e'
            case FieldType.password:
                return 'fa-solid fa-asterisk'
            case FieldType.array:
                return 'fa-solid fa-list'
            case FieldType.json:
                return 'fa-solid fa-j'
            case FieldType.media:
                return 'fa-solid fa-photo-film'
            case FieldType.relation:
                return 'fa-solid fa-link'
            default:
                return 'fa-solid fa-question'
        }
    }

    return (
        <i
            className={`${iconClassName()} fa-border ${styles.fieldTypeIcon} ${className ?? ''}`}
            style={{color, ...(style ?? {})}}
            title={fieldType}
        >
        </i>
    )
}
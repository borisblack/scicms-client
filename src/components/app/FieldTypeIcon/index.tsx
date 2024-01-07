import {
    FaAsterisk,
    FaCalendarDays,
    FaCheck,
    FaE,
    FaEnvelope,
    FaHashtag,
    FaJ,
    FaLink,
    FaList,
    FaPhotoFilm,
    FaQuestion,
    FaT,
    FaU
} from 'react-icons/fa6'
import {FaCalendarTimes, FaSortNumericUp} from 'react-icons/fa'
import {FieldType} from 'src/types'
import styles from './FieldTypeIcon.module.css'

interface FieldTypeIconProps {
    fieldType: FieldType
}

const ICON_SIZE = 8

export default function FieldTypeIcon({fieldType}: FieldTypeIconProps) {
    function renderIcon() {
        switch (fieldType) {
            case FieldType.int:
            case FieldType.long:
            case FieldType.float:
            case FieldType.double:
            case FieldType.decimal:
                return <FaHashtag size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.string:
            case FieldType.text:
                return <FaT size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.bool:
                return <FaCheck size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.date:
            case FieldType.datetime:
            case FieldType.timestamp:
                return <FaCalendarDays size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.time:
                return <FaCalendarTimes size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.uuid:
                return <FaU size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.sequence:
                return <FaSortNumericUp size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.email:
                return <FaEnvelope size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.enum:
                return <FaE size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.password:
                return <FaAsterisk size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.array:
                return <FaList size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.json:
                return <FaJ size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.media:
                return <FaPhotoFilm size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.relation:
                return <FaLink size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            default:
                return <FaQuestion size={ICON_SIZE} className={styles.fieldTypeIcon}/>
        }
    }

    return (
        <div className={styles.fieldTypeIconWrapper} title={fieldType}>
            {renderIcon()}
        </div>
    )
}
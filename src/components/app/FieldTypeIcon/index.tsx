import {FieldType} from 'src/types'
import styles from './FieldTypeIcon.module.css'
import Icon from 'src/components/icons/Icon'

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
                return <Icon iconName="FaHashtag" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.string:
            case FieldType.text:
                return <Icon iconName="FaT" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.bool:
                return <Icon iconName="FaCheck" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.date:
            case FieldType.datetime:
            case FieldType.timestamp:
                return <Icon iconName="FaCalendarDays" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.time:
                return <Icon iconName="FaCalendarTimes" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.uuid:
                return <Icon iconName="FaU" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.sequence:
                return <Icon iconName="FaSortNumericUp" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.email:
                return <Icon iconName="FaEnvelope" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.enum:
                return <Icon iconName="FaE" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.password:
                return <Icon iconName="FaAsterisk" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.array:
                return <Icon iconName="FaList" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.json:
                return <Icon iconName="FaJ" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.media:
                return <Icon iconName="FaPhotoFilm" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            case FieldType.relation:
                return <Icon iconName="FaLink" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
            default:
                return <Icon iconName="FaQuestion" size={ICON_SIZE} className={styles.fieldTypeIcon}/>
        }
    }

    return (
        <div className={styles.fieldTypeIconWrapper} title={fieldType}>
            {renderIcon()}
        </div>
    )
}
import {FieldType} from 'src/types'
import styles from './FieldTypeIcon.module.css'
import Icon from 'src/components/icons/Icon'
import {CSSProperties} from 'react'

interface FieldTypeIconProps {
    fieldType: FieldType
    color?: string
    className?: string
    style?: CSSProperties
}

const ICON_SIZE = 8

export default function FieldTypeIcon({fieldType, color, className, style}: FieldTypeIconProps) {
    function renderIcon() {
        const iconStyle: CSSProperties = {
            color
        }

        switch (fieldType) {
            case FieldType.int:
            case FieldType.long:
            case FieldType.float:
            case FieldType.double:
            case FieldType.decimal:
                return (
                    <Icon
                        iconName="FaHashtag"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.string:
            case FieldType.text:
                return (
                    <Icon
                        iconName="FaFont"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.bool:
                return (
                    <Icon
                        iconName="FaCheck"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.date:
            case FieldType.datetime:
            case FieldType.timestamp:
                return (
                    <Icon
                        iconName="FaCalendarDays"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.time:
                return (
                    <Icon
                        iconName="FaCalendarTimes"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.uuid:
                return (
                    <Icon
                        iconName="FaU"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.sequence:
                return (
                    <Icon
                        iconName="FaSortNumericUp"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.email:
                return (
                    <Icon
                        iconName="FaEnvelope"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.enum:
                return (
                    <Icon
                        iconName="FaE"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.password:
                return (
                    <Icon
                        iconName="FaAsterisk"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.array:
                return (
                    <Icon
                        iconName="FaList"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.json:
                return (
                    <Icon
                        iconName="FaJ"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.media:
                return (
                    <Icon
                        iconName="FaPhotoFilm"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.relation:
                return (
                    <Icon
                        iconName="FaLink"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            default:
                return (
                    <Icon
                        iconName="FaQuestion"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
        }
    }

    return (
        <div
            className={`${styles.fieldTypeIconWrapper} ${className ?? ''}`}
            style={{...style, borderColor: color}}
            title={fieldType}
        >
            {renderIcon()}
        </div>
    )
}
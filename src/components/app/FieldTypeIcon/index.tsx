import {FieldType} from 'src/types'
import styles from './FieldTypeIcon.module.css'
import IconSuspense from 'src/components/icons/IconSuspense'
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
                    <IconSuspense
                        iconName="FaHashtag"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.string:
            case FieldType.text:
                return (
                    <IconSuspense
                        iconName="FaFont"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.bool:
                return (
                    <IconSuspense
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
                    <IconSuspense
                        iconName="FaCalendarDays"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.time:
                return (
                    <IconSuspense
                        iconName="FaCalendarTimes"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.uuid:
                return (
                    <IconSuspense
                        iconName="FaU"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.sequence:
                return (
                    <IconSuspense
                        iconName="FaSortNumericUp"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.email:
                return (
                    <IconSuspense
                        iconName="FaEnvelope"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.enum:
                return (
                    <IconSuspense
                        iconName="FaE"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.password:
                return (
                    <IconSuspense
                        iconName="FaAsterisk"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.array:
                return (
                    <IconSuspense
                        iconName="FaList"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.json:
                return (
                    <IconSuspense
                        iconName="FaJ"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.media:
                return (
                    <IconSuspense
                        iconName="FaPhotoFilm"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            case FieldType.relation:
                return (
                    <IconSuspense
                        iconName="FaLink"
                        size={ICON_SIZE}
                        className={styles.fieldTypeIcon}
                        style={iconStyle}
                    />
                )
            default:
                return (
                    <IconSuspense
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
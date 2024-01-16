import {CSSProperties} from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from 'antd'
import {CloseOutlined} from '@ant-design/icons'

import {NamedColumn} from 'src/types/bi'
import FieldTypeIcon from 'src/components/app/FieldTypeIcon'
import FieldName from 'src/components/app/FieldName'
import styles from './FieldWidget.module.css'

interface FieldWidgetProps {
    style?: CSSProperties
    field: NamedColumn
    isDatasetField: boolean
    canEdit: boolean
    onRemove: () => void
}

export default function FieldWidget({style, field, isDatasetField, canEdit, onRemove}: FieldWidgetProps) {
    const {t} = useTranslation()
    const isFormula = field.custom && ((field.source && field.aggregate) || field.formula)

    return (
        <div
            className={styles.fieldWidget}
            style={{
                backgroundColor: isFormula ? 'rgb(230, 244, 255)' : 'rgb(246, 255, 237)',
                borderColor: isFormula ? 'rgb(145, 202, 255)' : 'rgb(183, 235, 143)',
                ...(style ?? {})
            }}
        >
            <span title={field.name}>
                <FieldTypeIcon
                    fieldType={field.type}
                    color={isFormula ? '#007bff' : '#28a745'}
                />
                &nbsp;&nbsp;
                <FieldName
                    name={field.name}
                    tag={field.custom ? (isDatasetField ? 'dataset' : undefined) : 'lock'}
                />
                {canEdit && (
                    <Button
                        className={styles.fieldWidget_removeBtn}
                        type="text"
                        size="small"
                        title={t('Remove')}
                        onClick={onRemove}
                    >
                        <CloseOutlined/>
                    </Button>
                )}
            </span>
        </div>
    )
}
import React, {CSSProperties, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from 'antd'
import {CloseOutlined, SortAscendingOutlined, SortDescendingOutlined} from '@ant-design/icons'

import {NamedColumn} from 'src/types/bi'
import FieldTypeIcon from 'src/components/app/FieldTypeIcon'
import FieldName from 'src/components/app/FieldName'
import styles from './FieldWidget.module.css'

interface FieldWidgetProps {
    style?: CSSProperties
    field: NamedColumn
    isDatasetField: boolean
    isSortField?: boolean
    canEdit: boolean
    onChange: (oldValue: string, newValue: string) => void
    onRemove: () => void
}

const BTN_SIZE = 30
const BTN_SPACE = 2

export default function FieldWidget({style, field, isDatasetField, isSortField, canEdit, onChange, onRemove}: FieldWidgetProps) {
    const {t} = useTranslation()
    const isFormula = field.custom && ((field.source && field.aggregate) || field.formula)
    const [desc, setDesc] = useState<boolean>(field.name.endsWith(':desc'))
    const fieldName = field.name.includes(':') ? field.name.substring(0, field.name.indexOf(':')) : field.name

    function toggleSort() {
        const newDesc = !desc
        const newValue = `${fieldName}:${newDesc ? 'desc' : 'asc'}`
        setDesc(newDesc)
        onChange(field.name, newValue)
    }

    return (
        <div
            className={styles.fieldWidget}
            style={{
                backgroundColor: isFormula ? 'rgb(230, 244, 255)' : 'rgb(246, 255, 237)',
                borderColor: isFormula ? 'rgb(145, 202, 255)' : 'rgb(183, 235, 143)',
                ...(style ?? {})
            }}
        >
            <span title={fieldName}>
                <FieldTypeIcon
                    fieldType={field.type}
                    color={isFormula ? '#007bff' : '#28a745'}
                />
                &nbsp;&nbsp;
                <FieldName
                    name={fieldName}
                    tag={field.custom ? (isDatasetField ? 'dataset' : undefined) : 'lock'}
                />

                {canEdit && (
                    <>
                        {isSortField && (
                            <Button
                                className={styles.fieldWidget_sortBtn}
                                // type="text"
                                size="small"
                                title={desc ? t('Sort Descending') : t('Sort Ascending')}
                                onClick={toggleSort}
                            >
                                {desc ? <SortAscendingOutlined/> : <SortDescendingOutlined/>}
                            </Button>
                        )}

                        <Button
                            className={styles.fieldWidget_removeBtn}
                            style={{right: isSortField ? (BTN_SIZE + BTN_SPACE*2) : BTN_SPACE}}
                            // type="text"
                            size="small"
                            title={t('Remove')}
                            onClick={onRemove}
                        >
                            <CloseOutlined/>
                        </Button>
                    </>
                )}
            </span>
        </div>
    )
}
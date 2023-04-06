import React, {FC, useState} from 'react'
import {FilterValueFieldProps} from './index'
import {useTranslation} from 'react-i18next'
import {Checkbox, DatePicker, Form, Input, Select, Space, TimePicker} from 'antd'
import {allTemporalPeriods, isTemporal, temporalPeriodTitles, timeTemporalPeriods} from '../../../util/bi'
import {FieldType, QueryOp, TemporalPeriod} from '../../../types'
import styles from '../DashFilters.module.css'

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

const TemporalFilterValueField: FC<FilterValueFieldProps> = ({namePrefix, type, op}) => {
    if (namePrefix.length === 0)
        throw new Error('Illegal argument')

    if (!isTemporal(type))
        throw new Error('Illegal argument')

    const fieldName = namePrefix[namePrefix.length - 1]
    const {t} = useTranslation()
    const [isManualInput, setManualInput] = useState(false)
    const [period, setPeriod] = useState(TemporalPeriod.ARBITRARY)
    const [isManualInputLeft, setManualInputLeft] = useState(false)
    const [isManualInputRight, setManualInputRight] = useState(false)

    function handlePeriodSelect(newPeriod: TemporalPeriod) {
        setPeriod(newPeriod)
    }

    const renderDefaultContent = () => (
        <Space>
            <FormItem
                className={styles.formItem}
                name={[fieldName, 'value']}
                rules={[{required: true, message: ''}]}
            >
                {isManualInput ? (
                    <Input placeholder={t('Value')}/>
                ) : (
                    type === FieldType.time ? (
                        <TimePicker placeholder={t('Value')}/>
                    ) : (
                        <DatePicker
                            placeholder={t('Value')}
                            showTime={type === FieldType.datetime || type === FieldType.timestamp}
                        />
                    )
                )}
            </FormItem>

            <Checkbox
                style={{marginTop: 24}}
                onChange={evt => setManualInput(evt.target.checked)}
            >
                {t('Manual input')}
            </Checkbox>
        </Space>
    )

    const renderBetweenContent = () => (
        <Space>
            <FormItem
                className={styles.formItem}
                name={[fieldName, 'extra', 'period']}
                label={t('Period')}
            >
                <Select
                    options={(type === FieldType.time ? timeTemporalPeriods : allTemporalPeriods).map(k => ({value: k, label: temporalPeriodTitles[k]}))}
                    onSelect={handlePeriodSelect}
                />
            </FormItem>
        </Space>
    )

    switch (op) {
        case QueryOp.$null:
        case QueryOp.$notNull:
            return null
        case QueryOp.$eq:
        case QueryOp.$ne:
        case QueryOp.$gt:
        case QueryOp.$gte:
        case QueryOp.$lt:
        case QueryOp.$lte:
            return renderDefaultContent()
        case QueryOp.$between:
            return renderBetweenContent()
        default:
            return <span className="red">{t('Unsupported operator')}</span>
    }
}

export default TemporalFilterValueField
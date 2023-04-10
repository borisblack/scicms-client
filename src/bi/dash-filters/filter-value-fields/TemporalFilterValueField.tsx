import React, {FC, useState} from 'react'
import {FilterValueFieldProps} from './index'
import {useTranslation} from 'react-i18next'
import {DatePicker, Form, Input, Select, Space, Switch, TimePicker} from 'antd'
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
    const [isChoice, setChoice] = useState(true)
    const [period, setPeriod] = useState(TemporalPeriod.ARBITRARY)
    const [isChoiceLeft, setChoiceLeft] = useState(false)
    const [isChoiceRight, setChoiceRight] = useState(false)

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
                {isChoice ? (
                    type === FieldType.time ? (
                        <TimePicker placeholder={t('Value')}/>
                    ) : (
                        <DatePicker
                            placeholder={t('Value')}
                            showTime={type === FieldType.datetime || type === FieldType.timestamp}
                        />
                    )
                ) : (
                    <Input placeholder={t('Value')}/>
                )}
            </FormItem>

            <Switch
                checkedChildren={t('choice')}
                unCheckedChildren={t('input')}
                checked={isChoice}
                onChange={setChoice}
            />
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

            {period === TemporalPeriod.ARBITRARY && (
                <>
                    <FormItem
                        className={styles.formItem}
                        name={[fieldName, 'extra', 'left']}
                        rules={[{required: true, message: ''}]}
                    >
                        {isChoiceLeft ? (
                            type === FieldType.time ? (
                                <TimePicker placeholder={t('Begin')}/>
                            ) : (
                                <DatePicker
                                    placeholder={t('Begin')}
                                    showTime={type === FieldType.datetime || type === FieldType.timestamp}
                                />
                            )
                        ) : (
                            <Input placeholder={t('Begin')}/>
                        )}
                    </FormItem>

                    <Switch
                        checkedChildren={t('choice')}
                        unCheckedChildren={t('input')}
                        checked={isChoiceLeft}
                        onChange={setChoiceLeft}
                    />

                    <FormItem
                        className={styles.formItem}
                        name={[fieldName, 'extra', 'right']}
                        rules={[{required: true, message: ''}]}
                    >
                        {isChoiceRight ? (
                            type === FieldType.time ? (
                                <TimePicker placeholder={t('End')}/>
                            ) : (
                                <DatePicker
                                    placeholder={t('End')}
                                    showTime={type === FieldType.datetime || type === FieldType.timestamp}
                                />
                            )
                        ) : (
                            <Input placeholder={t('End')}/>
                        )}

                    </FormItem>

                    <Switch
                        checkedChildren={t('choice')}
                        unCheckedChildren={t('input')}
                        checked={isChoiceRight}
                        onChange={setChoiceRight}
                    />
                </>
            )}
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
import React, {FC, useState} from 'react'
import {FilterValueFieldProps} from './index'
import {useTranslation} from 'react-i18next'
import {DatePicker, Form, Input, Select, Space, Switch, TimePicker} from 'antd'
import {Dayjs} from 'dayjs'
import {allTemporalPeriods, isTemporal, temporalPeriodTitles, timeTemporalPeriods} from '../../../util/bi'
import {FieldType, QueryOp, TemporalPeriod} from '../../../types'
import styles from '../DashFilters.module.css'

const INPUT_WIDTH = 180
const BETWEEN_INPUT_WIDTH = 120
const {Item: FormItem} = Form

const TemporalFilterValueField: FC<FilterValueFieldProps> = ({form, namePrefix, type, op}) => {
    if (namePrefix.length === 0)
        throw new Error('Illegal argument')

    if (!isTemporal(type))
        throw new Error('Illegal argument')

    const fieldName = namePrefix[namePrefix.length - 1]
    const {t} = useTranslation()
    const [isChoice, setChoice] = useState(true)
    const [period, setPeriod] = useState(TemporalPeriod.ARBITRARY)
    const [isChoiceLeft, setChoiceLeft] = useState(true)
    const [isChoiceRight, setChoiceRight] = useState(true)

    function handlePeriodSelect(newPeriod: TemporalPeriod) {
        setPeriod(newPeriod)
    }

    function handleValueChange(value: Dayjs | null, dateString?: string) {
        form.setFieldValue([...namePrefix, 'value'], dateString)
    }

    function handleLeftValueChange(leftValue: any) {
        const rightValue = form.getFieldValue([...namePrefix, 'extra', 'right'])
        form.setFieldValue([...namePrefix, 'value'], [leftValue, rightValue])
    }

    function handleRightValueChange(rightValue: any) {
        const leftValue = form.getFieldValue([...namePrefix, 'extra', 'left'])
        form.setFieldValue([...namePrefix, 'value'], [leftValue, rightValue])
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
                        <TimePicker
                            style={{width: INPUT_WIDTH}}
                            placeholder={t('Value')}
                            onChange={handleValueChange}
                        />
                    ) : (
                        <DatePicker
                            style={{width: INPUT_WIDTH}}
                            placeholder={t('Value')}
                            showTime={type === FieldType.datetime || type === FieldType.timestamp}
                            onChange={handleValueChange}
                        />
                    )
                ) : (
                    <Input style={{width: INPUT_WIDTH}} placeholder={t('Value')}/>
                )}
            </FormItem>

            <Switch
                className={styles.switch}
                checkedChildren={t('CHOICE')}
                unCheckedChildren={t('INPUT')}
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
            >
                <Select
                    style={{width: 180}}
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
                                <TimePicker
                                    style={{width: BETWEEN_INPUT_WIDTH}} placeholder={t('Begin')}
                                    onChange={handleLeftValueChange}
                                />
                            ) : (
                                <DatePicker
                                    style={{width: BETWEEN_INPUT_WIDTH}}
                                    placeholder={t('Begin')}
                                    showTime={type === FieldType.datetime || type === FieldType.timestamp}
                                    onChange={handleLeftValueChange}
                                />
                            )
                        ) : (
                            <Input
                                style={{width: BETWEEN_INPUT_WIDTH}} placeholder={t('Begin')}
                                onChange={evt => handleLeftValueChange(evt.target.value)}
                            />
                        )}
                    </FormItem>

                    <Switch
                        className={styles.switch}
                        checkedChildren={t('CHOICE')}
                        unCheckedChildren={t('INPUT')}
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
                                <TimePicker
                                    style={{width: BETWEEN_INPUT_WIDTH}} placeholder={t('End')}
                                    onChange={handleRightValueChange}
                                />
                            ) : (
                                <DatePicker
                                    style={{width: BETWEEN_INPUT_WIDTH}}
                                    placeholder={t('End')}
                                    showTime={type === FieldType.datetime || type === FieldType.timestamp}
                                    onChange={handleRightValueChange}
                                />
                            )
                        ) : (
                            <Input
                                style={{width: BETWEEN_INPUT_WIDTH}} placeholder={t('End')}
                                onChange={evt => handleLeftValueChange(evt.target.value)}
                            />
                        )}

                    </FormItem>

                    <Switch
                        className={styles.switch}
                        checkedChildren={t('CHOICE')}
                        unCheckedChildren={t('INPUT')}
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
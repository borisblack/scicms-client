import React, {FC, useState} from 'react'
import {FilterValueFieldProps} from './index'
import {useTranslation} from 'react-i18next'
import {DatePicker, Form, Input, Select, Space, Switch, TimePicker} from 'antd'
import {allTemporalPeriods, isTemporal, temporalPeriodTitles, timeTemporalPeriods} from '../../../util/bi'
import {FieldType, QueryOp, TemporalPeriod} from '../../../types'
import styles from '../DashFilters.module.css'
import {FunctionOutlined} from '@ant-design/icons'

const INPUT_WIDTH = 180
const BETWEEN_INPUT_WIDTH = 140
const {Item: FormItem} = Form

const TemporalFilterValueField: FC<FilterValueFieldProps> = ({form, namePrefix, type, op}) => {
    if (namePrefix.length === 0)
        throw new Error('Illegal argument')

    if (!isTemporal(type))
        throw new Error('Illegal argument')

    const fieldName = namePrefix[namePrefix.length - 1]
    const {t} = useTranslation()
    const [isManual, setManual] = useState(form.getFieldValue([...namePrefix, 'extra', 'isManual']))
    const [period, setPeriod] = useState(TemporalPeriod.ARBITRARY)
    const [isManualLeft, setManualLeft] = useState(form.getFieldValue([...namePrefix, 'extra', 'isManualLeft']))
    const [isManualRight, setManualRight] = useState(form.getFieldValue([...namePrefix, 'extra', 'isManualRight']))

    function handlePeriodSelect(newPeriod: TemporalPeriod) {
        setPeriod(newPeriod)
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
                {isManual ? (
                    <Input style={{width: INPUT_WIDTH}} placeholder={t('Value')}/>
                ) : (
                    type === FieldType.time ? (
                        <TimePicker
                            style={{width: INPUT_WIDTH}}
                            placeholder={t('Value')}
                        />
                    ) : (
                        <DatePicker
                            style={{width: INPUT_WIDTH}}
                            placeholder={t('Value')}
                            showTime={type === FieldType.datetime || type === FieldType.timestamp}
                        />
                    )
                )}
            </FormItem>
            <FormItem
                className={styles.formItem}
                name={[fieldName, 'extra', 'isManual']}
                valuePropName="checked"
            >
                <Switch
                    className={styles.switch}
                    title={t('Edit manually')}
                    checkedChildren={<FunctionOutlined/>}
                    unCheckedChildren={<FunctionOutlined/>}
                    onChange={setManual}
                />
            </FormItem>
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
                        {isManualLeft ? (
                            <Input
                                style={{width: BETWEEN_INPUT_WIDTH}} placeholder={t('Begin')}
                                onChange={evt => handleLeftValueChange(evt.target.value)}
                            />
                        ) : (
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
                        )}
                    </FormItem>
                    <FormItem
                        className={styles.formItem}
                        name={[fieldName, 'extra', 'isManualLeft']}
                        valuePropName="checked"
                    >
                        <Switch
                            className={styles.switch}
                            title={t('Edit manually')}
                            checkedChildren={<FunctionOutlined/>}
                            unCheckedChildren={<FunctionOutlined/>}
                            onChange={setManualLeft}
                        />
                    </FormItem>

                    <FormItem
                        className={styles.formItem}
                        name={[fieldName, 'extra', 'right']}
                        rules={[{required: true, message: ''}]}
                    >
                        {isManualRight ? (
                            <Input
                                style={{width: BETWEEN_INPUT_WIDTH}} placeholder={t('End')}
                                onChange={evt => handleLeftValueChange(evt.target.value)}
                            />
                        ) : (
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
                        )}

                    </FormItem>
                    <FormItem
                        className={styles.formItem}
                        name={[fieldName, 'extra', 'isManualRight']}
                        valuePropName="checked"
                    >
                        <Switch
                            className={styles.switch}
                            title={t('Edit manually')}
                            checkedChildren={<FunctionOutlined/>}
                            unCheckedChildren={<FunctionOutlined/>}
                            onChange={setManualRight}
                        />
                    </FormItem>
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
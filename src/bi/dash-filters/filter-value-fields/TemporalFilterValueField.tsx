import React, {FC, useEffect, useState} from 'react'
import {DatePicker, Form, Input, Select, Space, Switch, TimePicker} from 'antd'
import {FunctionOutlined} from '@ant-design/icons'
import {useTranslation} from 'react-i18next'
import {FilterValueFieldProps} from './index'
import {allTemporalPeriods, isTemporal, temporalPeriodTitles, timeTemporalPeriods} from '../../../util/bi'
import {FieldType, QueryOp, TemporalPeriod} from '../../../types'
import appConfig from '../../../config'
import styles from '../DashFilters.module.css'
import {getInfo} from '../../../extensions/functions'

const INPUT_WIDTH = 180
const BETWEEN_INPUT_WIDTH = 140
const {Item: FormItem} = Form
const {momentDisplayDateFormatString, momentDisplayTimeFormatString, momentDisplayDateTimeFormatString} = appConfig.dateTime

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

    useEffect(() => {
        form.setFieldValue([...namePrefix, 'extra', 'period'], TemporalPeriod.ARBITRARY)
        setPeriod(TemporalPeriod.ARBITRARY)
    }, [op])


    function handleManualChange(newManual: boolean) {
        setManual(newManual)
        form.setFieldValue([...namePrefix, 'value'], null)
    }

    function handleManualLeftChange(newManualLeft: boolean) {
        setManualLeft(newManualLeft)
        form.setFieldValue([...namePrefix, 'extra', 'left'], null)
        form.setFieldValue([...namePrefix, 'value'], null)
    }

    function handleManualRightChange(newManualRight: boolean) {
        setManualRight(newManualRight)
        form.setFieldValue([...namePrefix, 'extra', 'right'], null)
        form.setFieldValue([...namePrefix, 'value'], null)
    }

    const renderDefaultContent = () => (
        <Space>
            <FormItem
                className={styles.formItem}
                name={[fieldName, 'value']}
                rules={[{required: true, message: ''}]}
            >
                {isManual ? (
                    <Input
                        style={{width: INPUT_WIDTH}} placeholder={t('Value')}
                        title={getCustomFunctionsInfo()}
                    />
                ) : (
                    type === FieldType.time ? (
                        <TimePicker
                            style={{width: INPUT_WIDTH}}
                            placeholder={t('Value')}
                            format={momentDisplayTimeFormatString}
                        />
                    ) : (
                        <DatePicker
                            style={{width: INPUT_WIDTH}}
                            placeholder={t('Value')}
                            format={type === FieldType.date ? momentDisplayDateFormatString : momentDisplayDateTimeFormatString}
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
                    onChange={handleManualChange}
                />
            </FormItem>
        </Space>
    )

    const getCustomFunctionsInfo = () =>
        getInfo().map(info => `${info.id}() - ${t(info.description ?? 'No description')}`).join('\n')

    const renderBetweenContent = () => (
        <Space>
            <FormItem
                className={styles.formItem}
                name={[fieldName, 'extra', 'period']}
            >
                <Select
                    style={{width: 180}}
                    options={(type === FieldType.time ? timeTemporalPeriods : allTemporalPeriods).map(k => ({value: k, label: temporalPeriodTitles[k]}))}
                    onSelect={setPeriod}
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
                                title={getCustomFunctionsInfo()}
                            />
                        ) : (
                            type === FieldType.time ? (
                                <TimePicker
                                    style={{width: BETWEEN_INPUT_WIDTH}}
                                    placeholder={t('Begin')}
                                    format={momentDisplayTimeFormatString}
                                />
                            ) : (
                                <DatePicker
                                    style={{width: BETWEEN_INPUT_WIDTH}}
                                    placeholder={t('Begin')}
                                    format={type === FieldType.date ? momentDisplayDateFormatString : momentDisplayDateTimeFormatString}
                                    showTime={type === FieldType.datetime || type === FieldType.timestamp}
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
                            onChange={handleManualLeftChange}
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
                                title={getCustomFunctionsInfo()}
                            />
                        ) : (
                            type === FieldType.time ? (
                                <TimePicker
                                    style={{width: BETWEEN_INPUT_WIDTH}}
                                    placeholder={t('End')}
                                    format={momentDisplayTimeFormatString}
                                />
                            ) : (
                                <DatePicker
                                    style={{width: BETWEEN_INPUT_WIDTH}}
                                    placeholder={t('End')}
                                    format={type === FieldType.date ? momentDisplayDateFormatString : momentDisplayDateTimeFormatString}
                                    showTime={type === FieldType.datetime || type === FieldType.timestamp}
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
                            onChange={handleManualRightChange}
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
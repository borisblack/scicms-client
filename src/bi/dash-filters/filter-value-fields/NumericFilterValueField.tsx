import React, {FC} from 'react'
import {FilterValueFieldProps} from './index'
import {useTranslation} from 'react-i18next'
import {Form, Input, InputNumber, Space} from 'antd'
import styles from '../DashFilters.module.css'
import {isNumeric} from '../../../util/bi'
import {QueryOp} from '../../../types'
import {regExpRule} from '../../../util/form'

const {Item: FormItem} = Form

const NumericFilterValueField: FC<FilterValueFieldProps> = ({form, namePrefix, type, op}) => {
    if (namePrefix.length === 0)
        throw new Error('Illegal argument')

    if (!isNumeric(type))
        throw new Error('Illegal argument')

    const fieldName = namePrefix[namePrefix.length - 1]
    const {t} = useTranslation()

    function handleLeftValueChange(leftValue: number | null) {
        const rightValue = form.getFieldValue([...namePrefix, 'extra', 'right']) ?? 0
        form.setFieldValue([...namePrefix, 'value'], [leftValue ?? 0, rightValue])
    }

    function handleRightValueChange(rightValue: number | null) {
        const leftValue = form.getFieldValue([...namePrefix, 'extra', 'left']) ?? 0
        form.setFieldValue([...namePrefix, 'value'], [leftValue ?? 0, rightValue])
    }

    const renderBetweenContent = () => (
        <Space>
            <FormItem
                className={styles.formItem}
                name={[fieldName, 'extra', 'left']}
                rules={[{required: true, message: ''}]}
            >
                <InputNumber placeholder={t('Left value')} onChange={handleLeftValueChange}/>
            </FormItem>

            <FormItem
                className={styles.formItem}
                name={[fieldName, 'extra', 'right']}
                rules={[{required: true, message: ''}]}
            >
                <InputNumber placeholder={t('Right value')} onChange={handleRightValueChange}/>
            </FormItem>
        </Space>
    )

    const renderListContent = () => (
        <FormItem
            className={styles.formItem}
            name={[fieldName, 'value']}
            rules={[
                {required: true, message: ''},
                regExpRule(/^(\d+(\.\d+)?)(,\s*\d+(\.\d+)?)*$/, 'String must contain only comma-separated values')
            ]}
        >
            <Input placeholder={t('Comma separated values')}/>
        </FormItem>
    )

    const renderDefaultContent = () => (
        <FormItem
            className={styles.formItem}
            name={[fieldName, 'value']}
            rules={[{required: true, message: ''}]}
        >
            <InputNumber placeholder={t('Value')}/>
        </FormItem>
    )

    switch (op) {
        case QueryOp.$null:
        case QueryOp.$notNull:
            return null
        case QueryOp.$between:
            return renderBetweenContent()
        case QueryOp.$in:
        case QueryOp.$notIn:
            return renderListContent()
        default:
            return renderDefaultContent()
    }
}

export default NumericFilterValueField
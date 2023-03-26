import React, {FC} from 'react'
import {FilterValueFieldProps} from './index'
import {useTranslation} from 'react-i18next'
import {Form, Input} from 'antd'
import styles from '../DashFilters.module.css'
import {isBool} from '../../../util/dataset'
import {QueryOp} from '../../../types'

const {Item: FormItem} = Form

const BoolFilterValueField: FC<FilterValueFieldProps> = ({namePrefix, type, op}) => {
    if (namePrefix.length === 0)
        throw new Error('Illegal argument')

    if (!isBool(type))
        throw new Error('Illegal argument')

    const fieldName = namePrefix[namePrefix.length - 1]
    const {t} = useTranslation()

    if (op === QueryOp.$null || op === QueryOp.$notNull)
        return null

    return (
        <FormItem
            className={styles.formItem}
            name={[fieldName, 'value']}
            rules={[{required: true, message: ''}]}
        >
            <Input placeholder={t('Value')}/>
        </FormItem>
    )
}

export default BoolFilterValueField
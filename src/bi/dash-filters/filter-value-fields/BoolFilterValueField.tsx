import React, {FC} from 'react'
import {FilterValueFieldProps} from './index'
import {useTranslation} from 'react-i18next'
import {Checkbox, Form} from 'antd'
import {isBool} from 'src/bi/util'
import {QueryOp} from 'src/types/bi'
import styles from '../DashFilters.module.css'

const {Item: FormItem} = Form

const BoolFilterValueField: FC<FilterValueFieldProps> = ({namePrefix, column, op}) => {
    if (namePrefix.length === 0)
        throw new Error('Illegal argument')

    if (!isBool(column.type))
        throw new Error('Illegal argument')

    const fieldName = namePrefix[namePrefix.length - 1]
    const {t} = useTranslation()

    const renderDefaultContent = () => (
        <FormItem
            className={styles.formItem}
            name={[fieldName, 'value']}
            valuePropName="checked"
        >
            <Checkbox style={{marginTop: 24}}>{t('Value')}</Checkbox>
        </FormItem>
    )

    switch (op) {
        case QueryOp.$null:
        case QueryOp.$notNull:
            return null
        case QueryOp.$eq:
        case QueryOp.$ne:
            return renderDefaultContent()
        default:
            return <span className="red">{t('Unsupported operator')}</span>
    }
}

export default BoolFilterValueField
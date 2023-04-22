import React, {FC} from 'react'
import {DashOptFieldProps} from './index'
import {useTranslation} from 'react-i18next'
import {Checkbox, Form} from 'antd'
import {DashOptionType} from '../index'
import styles from './DashOptField.module.css'

const {Item: FormItem} = Form

const BooleanDashOptField: FC<DashOptFieldProps> = ({dashOpt, initialValue}) => {
    if (dashOpt.type !== DashOptionType.boolean)
        throw new Error('Illegal argument')

    const {t} = useTranslation()

    return (
        <FormItem
            className={styles.formItem}
            name={['optValues', dashOpt.name]}
            valuePropName="checked"
            initialValue={initialValue == null ? dashOpt.defaultValue : initialValue}
        >
            <Checkbox style={{marginTop: 24}}>{t(dashOpt.label)}</Checkbox>
        </FormItem>
    )
}

export default BooleanDashOptField
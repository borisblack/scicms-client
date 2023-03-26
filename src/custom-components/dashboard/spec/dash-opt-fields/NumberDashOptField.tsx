import React, {FC, useMemo} from 'react'
import {DashOptFieldProps} from './index'
import {useTranslation} from 'react-i18next'
import {Form, InputNumber} from 'antd'
import {DashOptType} from '../../../../dashboard/dashes'
import {Rule} from 'rc-field-form/lib/interface'
import styles from './DashOptField.module.css'

const {Item: FormItem} = Form

const NumberDashOptField: FC<DashOptFieldProps> = ({dashOpt, initialValue}) => {
    if (dashOpt.type !== DashOptType.number)
        throw new Error('Illegal argument')

    const {min, max} = dashOpt
    const {t} = useTranslation()

    const rules: Rule[] = useMemo(() => {
        const rules: Rule[] = [{required: dashOpt.required, message: t('Required field')}]
        if (min != null)
            rules.push({type: 'number', min})

        if (max != null)
            rules.push({type: 'number', max})

        return rules
    }, [dashOpt.required, max, min, t])

    return (
        <FormItem
            className={styles.formItem}
            name={['optValues', dashOpt.name]}
            label={t(dashOpt.label)}
            initialValue={initialValue == null ? dashOpt.defaultValue : initialValue}
            rules={rules}
        >
            <InputNumber style={{width: '50%'}} min={min} max={max}/>
        </FormItem>
    )
}

export default NumberDashOptField
import React, {FC} from 'react'
import {DashOptFieldProps} from './index'
import {useTranslation} from 'react-i18next'
import {Form, InputNumber} from 'antd'
import {DashOptType} from '../../../../dashboard/dashes'
import styles from './DashOptField.module.css'

const {Item: FormItem} = Form

const NumberDashOptField: FC<DashOptFieldProps> = ({dashOpt, availableColumns, initialValue}) => {
    if (dashOpt.type !== DashOptType.number)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()

    return (
        <FormItem
            className={styles.formItem}
            name={['optValues', dashOpt.name]}
            label={t(dashOpt.label)}
            initialValue={initialValue}
            rules={[{required: dashOpt.required, message: t('Required field')}]}
        >
            <InputNumber style={{width: '50%'}}/>
        </FormItem>
    )
}

export default NumberDashOptField
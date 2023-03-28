import React, {FC} from 'react'
import {DashOptFieldProps} from './index'
import {useTranslation} from 'react-i18next'
import {Form, Input, Select} from 'antd'
import {DashOptionType} from '../../../../bi'
import styles from './DashOptField.module.css'

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

const StringDashOptField: FC<DashOptFieldProps> = ({dashOpt, availableColumns, initialValue}) => {
    if (dashOpt.type !== DashOptionType.string)
        throw new Error('Illegal argument')

    const {t} = useTranslation()

    return (
        <FormItem
            className={styles.formItem}
            name={['optValues', dashOpt.name]}
            label={t(dashOpt.label)}
            initialValue={initialValue == null ? dashOpt.defaultValue : initialValue}
            rules={[{required: dashOpt.required, message: t('Required field')}]}
        >
            {dashOpt.fromDataset || dashOpt.enumSet ? (
                <Select allowClear>
                    {(dashOpt.enumSet ?? availableColumns).map(e => <SelectOption key={e} value={e}>{e}</SelectOption>)}
                </Select>
            ) : (
                <Input/>
            )}
        </FormItem>
    )
}

export default StringDashOptField
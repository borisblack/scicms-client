import React, {FC} from 'react'
import {DashOptFieldProps} from './index'
import {useTranslation} from 'react-i18next'
import {Form, Input, Select} from 'antd'
import {DashOptType} from '../../../../dashboard/dashes'
import styles from './DashOptField.module.css'

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

const StringDashOptField: FC<DashOptFieldProps> = ({dataset, dash, dashOpt}) => {
    if (dashOpt.type !== DashOptType.string)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()

    return (
        <FormItem
            className={styles.formItem}
            name={['props', dashOpt.name]}
            label={t(dashOpt.label)}
            initialValue={dash.optValues ? dash.optValues[dashOpt.name] : undefined}
            rules={[{required: dashOpt.required, message: t('Required field')}]}
        >
            {dashOpt.fromDataset || dashOpt.enumSet ? (
                <Select>
                    {dashOpt.fromDataset
                        ? Object.keys(dataset.spec.columns).map(c => <SelectOption key={c} value={c}>{c}</SelectOption>)
                        : (dashOpt.enumSet as any[]).map(e => <SelectOption key={e} value={e}>{e}</SelectOption>)
                    }
                </Select>
            ) : (
                <Input/>
            )}
        </FormItem>
    )
}

export default StringDashOptField
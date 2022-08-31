import {AttributeFieldProps} from '.'
import styles from './AttributeField.module.css'
import moment from 'moment/moment'
import {DatePicker, Form} from 'antd'
import appConfig from '../../../config'
import {useTranslation} from 'react-i18next'
import {AttrType} from '../../../types'
import {FC} from 'react'

const FormItem = Form.Item

const DateAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value}) => {
    if (attribute.type !== AttrType.date)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={attribute.displayName}
            initialValue={value ? moment(value) : null}
            rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
        >
            <DatePicker format={appConfig.dateTime.momentDateFormatString} disabled={isDisabled}/>
        </FormItem>
    )
}

export default DateAttributeField
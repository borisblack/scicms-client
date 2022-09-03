import {FC} from 'react'
import {useTranslation} from 'react-i18next'
import moment from 'moment-timezone'
import {DatePicker, Form} from 'antd'

import appConfig from '../../../config'
import {AttrType} from '../../../types'
import {AttributeFieldProps} from '.'
import styles from './AttributeField.module.css'
import {UTC} from '../../../config/constants'

const FormItem = Form.Item
const {momentDisplayDateFormatString} = appConfig.dateTime

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
            initialValue={value ? moment.tz(value, UTC) : null}
            rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
        >
            <DatePicker format={momentDisplayDateFormatString} disabled={isDisabled}/>
        </FormItem>
    )
}

export default DateAttributeField
import {FC} from 'react'
import moment from 'moment/moment'
import {DatePicker, Form} from 'antd'
import {useTranslation} from 'react-i18next'

import {AttributeFieldProps} from '.'
import appConfig from '../../../config'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'

const FormItem = Form.Item

const DateTimeAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value, canEdit}) => {
    if (attribute.type !== AttrType.datetime && attribute.type !== AttrType.timestamp)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly || !canEdit

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={attribute.displayName}
            initialValue={value ? moment(value) : null}
            rules={[{required: attribute.required, message: t('Required field')}]}
        >
            <DatePicker showTime format={appConfig.dateTime.momentDateTimeFormatString} disabled={isDisabled}/>
        </FormItem>
    )
}

export default DateTimeAttributeField
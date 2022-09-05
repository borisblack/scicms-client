import {FC} from 'react'
import {Checkbox, DatePicker, Form} from 'antd'
import {useTranslation} from 'react-i18next'
import moment, {Moment} from 'moment-timezone'

import {AttributeFieldProps} from '.'
import appConfig from '../../../config'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'
import {UTC} from '../../../config/constants'

const FormItem = Form.Item
const {momentDisplayDateTimeFormatString} = appConfig.dateTime

const DateTimeAttributeField: FC<AttributeFieldProps> = ({form, attrName, attribute, value}) => {
    if (attribute.type !== AttrType.datetime && attribute.type !== AttrType.timestamp)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly

    function getValueFromEvent(evt: Moment) {
        form.setFieldValue(`${attrName}.changed`, true)
        return evt
    }

    return (
        <>
            <FormItem
                className={styles.formItem}
                name={attrName}
                label={t(attribute.displayName)}
                initialValue={value ? moment.tz(value, UTC) : null}
                getValueFromEvent={getValueFromEvent}
                rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
            >
                <DatePicker showTime showSecond={false} format={momentDisplayDateTimeFormatString} disabled={isDisabled}/>
            </FormItem>
            <FormItem name={`${attrName}.changed`} valuePropName="checked" hidden>
                <Checkbox/>
            </FormItem>
        </>
    )
}

export default DateTimeAttributeField
import {FC, useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {Checkbox, Form, TimePicker} from 'antd'
import moment, {Moment} from 'moment-timezone'

import {AttributeFieldProps} from '.'
import appConfig from '../../../config'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'
import {MOMENT_ISO_TIME_FORMAT_STRING, UTC} from '../../../config/constants'

const FormItem = Form.Item
const {momentDisplayTimeFormatString} = appConfig.dateTime

const TimeAttributeField: FC<AttributeFieldProps> = ({form, attrName, attribute, value}) => {
    if (attribute.type !== AttrType.time)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly

    function getValueFromEvent(evt: Moment) {
        form.setFieldValue(`${attrName}.changed`, true)
        return evt
    }

    const parseValue = useCallback((val: string | null | undefined) => val == null ? null : moment.tz(val, MOMENT_ISO_TIME_FORMAT_STRING, UTC), [])

    return (
        <>
            <FormItem
                className={styles.formItem}
                name={attrName}
                label={t(attribute.displayName)}
                hidden={attribute.fieldHidden}
                initialValue={parseValue(value) ?? parseValue(attribute.defaultValue)}
                rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
                getValueFromEvent={getValueFromEvent}
            >
                <TimePicker format={momentDisplayTimeFormatString} showSecond={false} disabled={isDisabled}/>
            </FormItem>
            <FormItem name={`${attrName}.changed`} valuePropName="checked" hidden>
                <Checkbox/>
            </FormItem>
        </>
    )
}

export default TimeAttributeField
import {FC, useCallback, useMemo} from 'react'
import {Checkbox, DatePicker, Form} from 'antd'
import {useTranslation} from 'react-i18next'
import dayjs, {Dayjs} from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import {AttributeFieldProps} from '.'
import appConfig from '../../../config'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'
import {UTC} from '../../../config/constants'

dayjs.extend(timezone)

const FormItem = Form.Item
const {momentDisplayDateTimeFormatString} = appConfig.dateTime

const DateTimeAttributeField: FC<AttributeFieldProps> = ({pageKey, form, attrName, attribute, value}) => {
    if (attribute.type !== AttrType.datetime && attribute.type !== AttrType.timestamp)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = useMemo(() => attribute.keyed || attribute.readOnly, [attribute.keyed, attribute.readOnly])
    const additionalProps = useMemo((): any => {
        const additionalProps: any = {}
        if (isDisabled)
            additionalProps.disabled = true

        return additionalProps
    }, [isDisabled])

    function getValueFromEvent(evt: Dayjs) {
        form.setFieldValue(`${attrName}.changed`, true)
        return evt
    }

    const parseValue = useCallback((val: string | null | undefined) => val == null ? null : dayjs.tz(val, UTC), [])

    return (
        <>
            <FormItem
                className={styles.formItem}
                name={attrName}
                label={t(attribute.displayName)}
                hidden={attribute.fieldHidden}
                initialValue={parseValue(value) ?? parseValue(attribute.defaultValue)}
                getValueFromEvent={getValueFromEvent}
                rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
            >
                <DatePicker id={`${pageKey}#${attrName}`} showTime showSecond={false} format={momentDisplayDateTimeFormatString} {...additionalProps}/>
            </FormItem>
            <FormItem name={`${attrName}.changed`} valuePropName="checked" hidden>
                <Checkbox id={`${pageKey}#${attrName}.changed`}/>
            </FormItem>
        </>
    )
}

export default DateTimeAttributeField
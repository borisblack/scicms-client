import {FC, useCallback, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Checkbox, Form, TimePicker} from 'antd'
import dayjs, {Dayjs} from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import {AttributeFieldProps} from '.'
import appConfig from '../../../config'
import {FieldType} from '../../../types'
import styles from './AttributeField.module.css'
import {MOMENT_ISO_TIME_FORMAT_STRING, UTC} from '../../../config/constants'

dayjs.extend(timezone)

const FormItem = Form.Item
const {momentDisplayTimeFormatString} = appConfig.dateTime

const TimeAttributeField: FC<AttributeFieldProps> = ({pageKey, form, attrName, attribute, value}) => {
    if (attribute.type !== FieldType.time)
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

    const parseValue = useCallback((val: string | null | undefined) => val == null ? null : dayjs.tz(val, MOMENT_ISO_TIME_FORMAT_STRING, UTC), [])

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
                <TimePicker
                    id={`${pageKey}#${attrName}`}
                    style={{width: '100%'}}
                    format={momentDisplayTimeFormatString}
                    showSecond={false}
                    {...additionalProps}
                />
            </FormItem>
            <FormItem name={`${attrName}.changed`} valuePropName="checked" hidden>
                <Checkbox id={`${pageKey}#${attrName}.changed`}/>
            </FormItem>
        </>
    )
}

export default TimeAttributeField
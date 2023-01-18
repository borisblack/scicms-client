import {FC, useCallback, useMemo} from 'react'
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

const DateAttributeField: FC<AttributeFieldProps> = ({pageKey, attrName, attribute, value}) => {
    if (attribute.type !== AttrType.date)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = useMemo(() => attribute.keyed || attribute.readOnly, [attribute.keyed, attribute.readOnly])
    const additionalProps = useMemo((): any => {
        const additionalProps: any = {}
        if (isDisabled)
            additionalProps.disabled = true

        return additionalProps
    }, [isDisabled])

    const parseValue = useCallback((val: string | null | undefined) => val == null ? null : moment.tz(val, UTC), [])

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={t(attribute.displayName)}
            hidden={attribute.fieldHidden}
            initialValue={parseValue(value) ?? parseValue(attribute.defaultValue)}
            rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
        >
            <DatePicker id={`${pageKey}#${attrName}`} format={momentDisplayDateFormatString} {...additionalProps}/>
        </FormItem>
    )
}

export default DateAttributeField
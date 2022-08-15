import {AttributeFieldProps} from '.'
import styles from '../AttributeInputWrapper.module.css'
import moment from 'moment/moment'
import {Form, TimePicker} from 'antd'
import appConfig from '../../../config'
import {useTranslation} from 'react-i18next'
import {AttrType} from '../../../types'
import {FC} from 'react'

const FormItem = Form.Item

const TimeAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value, canEdit}) => {
    if (attribute.type !== AttrType.time)
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
            <TimePicker format={appConfig.dateTime.momentTimeFormatString} disabled={isDisabled}/>
        </FormItem>
    )
}

export default TimeAttributeField
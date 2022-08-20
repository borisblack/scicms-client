import {FC} from 'react'
import {useTranslation} from 'react-i18next'
import moment from 'moment/moment'
import {Form, TimePicker} from 'antd'

import {AttributeFieldProps} from '.'
import appConfig from '../../../config'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'

const FormItem = Form.Item

const TimeAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value}) => {
    if (attribute.type !== AttrType.time)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly

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
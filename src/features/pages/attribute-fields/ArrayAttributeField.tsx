import _ from 'lodash'
import {FC, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Form, Input} from 'antd'

import {AttributeFieldProps} from '.'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'
import appConfig from '../../../config'

const FormItem = Form.Item
const {TextArea} = Input

const ArrayAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value}) => {
    if (attribute.type !== AttrType.array)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly
    
    const initialValue = useMemo(() => {
        if (!value)
            return null
        
        if (!_.isArray(value))
            throw new Error('Illegal attribute')
        
        const arr = value.map(it => {
            if (_.isObject(it))
                return JSON.stringify(it)
            
            return it
        })
        
        return arr.join('\n')
    }, [value])

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={t(attribute.displayName)}
            hidden={attribute.fieldHidden}
            initialValue={initialValue}
            rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
        >
            <TextArea style={{maxWidth: attribute.fieldWidth}} disabled={isDisabled} rows={appConfig.ui.textArea.rows}/>
        </FormItem>
    )
}

export default ArrayAttributeField
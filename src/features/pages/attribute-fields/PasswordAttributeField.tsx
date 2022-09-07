import {Form, Input} from 'antd'
import {useTranslation} from 'react-i18next'

import {AttributeFieldProps} from '.'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'
import {FC} from 'react'

const FormItem = Form.Item
const {Password} = Input

const PasswordAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value}) => {
    if (attribute.type !== AttrType.password)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly

    return (
        <>
            <FormItem
                className={styles.formItem}
                name={attrName}
                label={t(attribute.displayName)}
                hidden={attribute.fieldHidden}
                initialValue={value}
                // hasFeedback
                rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
            >
                <Password style={{maxWidth: attribute.fieldWidth}} maxLength={attribute.length} disabled={isDisabled}/>
            </FormItem>
            {attribute.confirm && (
                <Form.Item
                    name={`${attrName}.confirm`}
                    label={t('Confirm')}
                    hidden={attribute.fieldHidden}
                    initialValue={value}
                    dependencies={[attrName]}
                    // hasFeedback
                    rules={[
                        {
                            required: true,
                            message: t('Please confirm password'),
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue(attrName) === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error(t('Passwords do not match')))
                            },
                        }),
                    ]}
                >
                    <Password style={{maxWidth: attribute.fieldWidth}} maxLength={attribute.length} disabled={isDisabled}/>
                </Form.Item>
            )}
        </>
    )
}

export default PasswordAttributeField
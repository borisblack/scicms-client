import {Form, Input} from 'antd'
import {useTranslation} from 'react-i18next'

import {AttributeFieldProps} from '.'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'
import {FC, useMemo} from 'react'

const FormItem = Form.Item
const {Password} = Input

const PasswordAttributeField: FC<AttributeFieldProps> = ({pageKey, attrName, attribute, value}) => {
    if (attribute.type !== AttrType.password)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = useMemo(() => attribute.keyed || attribute.readOnly, [attribute.keyed, attribute.readOnly])
    const additionalProps = useMemo((): any => {
        const additionalProps: any = {}
        if (isDisabled)
            additionalProps.disabled = true

        return additionalProps
    }, [isDisabled])

    return (
        <>
            <FormItem
                className={styles.formItem}
                name={attrName}
                label={t(attribute.displayName)}
                hidden={attribute.fieldHidden}
                initialValue={value ?? attribute.defaultValue}
                // hasFeedback
                rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
            >
                <Password
                    id={`${pageKey}#${attrName}`}
                    style={{maxWidth: attribute.fieldWidth}}
                    maxLength={attribute.length}
                    {...additionalProps}
                />
            </FormItem>
            {attribute.confirm && (
                <Form.Item
                    name={`${attrName}.confirm`}
                    label={t('Confirm')}
                    hidden={attribute.fieldHidden}
                    initialValue={value ?? attribute.defaultValue}
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
                    <Password
                        id={`${pageKey}#${attrName}.confirm`}
                        style={{maxWidth: attribute.fieldWidth}}
                        maxLength={attribute.length}
                        {...additionalProps}
                    />
                </Form.Item>
            )}
        </>
    )
}

export default PasswordAttributeField
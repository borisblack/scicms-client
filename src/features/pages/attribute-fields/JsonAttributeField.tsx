import {AttributeFieldProps} from '.'
import styles from './AttributeField.module.css'
import {Form, Input} from 'antd'
import {useTranslation} from 'react-i18next'
import {FieldType} from '../../../types'
import {FC, useCallback, useMemo} from 'react'
import appConfig from '../../../config'

const FormItem = Form.Item
const {TextArea} = Input

const JsonAttributeField: FC<AttributeFieldProps> = ({pageKey, attrName, attribute, value}) => {
    if (attribute.type !== FieldType.json && attribute.type !== FieldType.array)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = useMemo(() => attribute.keyed || attribute.readOnly, [attribute.keyed, attribute.readOnly])
    const additionalProps = useMemo((): any => {
        const additionalProps: any = {}
        if (isDisabled)
            additionalProps.disabled = true

        return additionalProps
    }, [isDisabled])

    const parseValue = useCallback((val: any) => val == null ? null : JSON.stringify(val), [])

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={t(attribute.displayName)}
            hidden={attribute.fieldHidden}
            initialValue={parseValue(value) ?? attribute.defaultValue}
            rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
        >
            <TextArea
                id={`${pageKey}#${attrName}`}
                rows={appConfig.ui.textArea.rows}
                {...additionalProps}
            />
        </FormItem>
    )
}

export default JsonAttributeField
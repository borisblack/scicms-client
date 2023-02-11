import _ from 'lodash'
import {FC, useCallback, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Form, Input} from 'antd'

import {AttributeFieldProps} from '.'
import {FieldType} from '../../../types'
import styles from './AttributeField.module.css'
import appConfig from '../../../config'

const FormItem = Form.Item
const {TextArea} = Input

const ArrayAttributeField: FC<AttributeFieldProps> = ({pageKey, attrName, attribute, value}) => {
    if (attribute.type !== FieldType.array)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = useMemo(() => attribute.keyed || attribute.readOnly, [attribute.keyed, attribute.readOnly])
    const additionalProps = useMemo((): any => {
        const additionalProps: any = {}
        if (isDisabled)
            additionalProps.disabled = true

        return additionalProps
    }, [isDisabled])

    const parseValue = useCallback((val: any) => {
        if (val == null)
            return null

        if (!_.isArray(val))
            throw new Error('Illegal attribute')

        const arr = val.map(it => {
            if (_.isObject(it))
                return JSON.stringify(it)

            return it
        })

        return arr.join('\n')
    }, [])

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={t(attribute.displayName)}
            hidden={attribute.fieldHidden}
            initialValue={parseValue(value) ?? (attribute.defaultValue ? parseValue(JSON.parse(attribute.defaultValue)) : null)}
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

export default ArrayAttributeField
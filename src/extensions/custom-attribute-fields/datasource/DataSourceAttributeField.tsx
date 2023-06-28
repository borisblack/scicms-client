import {FC, useMemo} from 'react'
import {Form, Select} from 'antd'

import {useTranslation} from 'react-i18next'
import {DATA_SOURCE_ATTR_NAME} from '../../../config/constants'
import {CustomAttributeFieldRenderContext} from '../index'
import styles from '../CustomAttributeField.module.css'
import {FieldType} from '../../../types'

const FormItem = Form.Item
const {Option: SelectOption} = Select

const DataSourceAttributeField: FC<CustomAttributeFieldRenderContext> = ({coreConfig, attrName, attribute, value}) => {
    if (attribute.type !== FieldType.string || attrName !== DATA_SOURCE_ATTR_NAME)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = useMemo(() => attribute.readOnly, [attribute.readOnly])
    const additionalProps = useMemo((): any => {
        const additionalProps: any = {}
        if (isDisabled)
            additionalProps.disabled = true

        return additionalProps
    }, [isDisabled])

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={t(attribute.displayName)}
            hidden={attribute.fieldHidden}
            initialValue={value ?? attribute.defaultValue}
            rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
        >
            <Select allowClear {...additionalProps}>
                {coreConfig.data.dataSources.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
            </Select>
        </FormItem>
    )
}

export default DataSourceAttributeField
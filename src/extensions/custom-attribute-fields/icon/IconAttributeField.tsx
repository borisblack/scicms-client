import {FC, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Form, Input, Modal, Tooltip} from 'antd'
import {CloseCircleOutlined} from '@ant-design/icons'
import {FieldType} from 'src/types'
import {ICON_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldRenderContext} from '..'
import styles from '../CustomAttributeField.module.css'
import Icon from 'src/components/icon/Icon'
import Icons from 'src/components/icons/Icons'
import {generateKey} from 'src/util/mdi'

const FormItem = Form.Item
const {Search} = Input

const SUFFIX_BUTTON_WIDTH = 24
const ICONS_MODAL_WIDTH = 1100
const ICONS_COMPONENT_HEIGHT = 600

const IconAttributeField: FC<CustomAttributeFieldRenderContext> = ({data: dataWrapper, form, attrName, attribute, value, onChange}) => {
    if (attrName !== ICON_ATTR_NAME || attribute.type !== FieldType.string)
        throw new Error('Illegal attribute')

    const uniqueKey = generateKey(dataWrapper)
    const {t} = useTranslation()
    const [currentValue, setCurrentValue] = useState(value)
    const [isIconsModalVisible, setIconsModalVisible] = useState<boolean>(false)
    const isDisabled = useMemo(() => attribute.keyed || attribute.readOnly, [attribute.keyed, attribute.readOnly])
    const additionalProps = useMemo((): any => {
        const additionalProps: any = {}
        if (isDisabled)
            additionalProps.disabled = true

        return additionalProps
    }, [isDisabled])

    function handleClear() {
        setCurrentValue(null)
        form.setFieldValue(attrName, null)
    }

    function handleIconSelect(iconName: string) {
        setCurrentValue(iconName)
        form.setFieldValue(attrName, iconName)

        setIconsModalVisible(false)
    }

    return (
        <>
            <FormItem
                className={styles.formItem}
                name={attrName}
                label={<span>{t(attribute.displayName)}&nbsp;<Icon iconName={currentValue}/></span>}
                hidden={attribute.fieldHidden}
                initialValue={value ?? attribute.defaultValue}
                rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
            >
                <Search
                    id={`${uniqueKey}#${attrName}`}
                    readOnly
                    onSearch={() => setIconsModalVisible(true)}
                    addonAfter={currentValue && [
                        <Tooltip key="clear" title={t('Clear')}>
                            <Button
                                type="link"
                                style={{width: SUFFIX_BUTTON_WIDTH}}
                                icon={<CloseCircleOutlined/>}
                                onClick={handleClear}
                            />
                        </Tooltip>
                    ]}
                    {...additionalProps}
                />
            </FormItem>

            <Modal
                title={t(attribute.displayName)}
                open={isIconsModalVisible}
                destroyOnClose
                width={ICONS_MODAL_WIDTH}
                footer={null}
                onCancel={() => setIconsModalVisible(false)}
            >
                <Icons height={ICONS_COMPONENT_HEIGHT} onSelect={handleIconSelect}/>
            </Modal>
        </>
    )
}

export default IconAttributeField
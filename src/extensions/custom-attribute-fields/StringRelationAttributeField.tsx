import {Button, Form, Input, message, Modal, Tooltip} from 'antd'
import {FC, useMemo, useState} from 'react'

import {FieldType, ItemData} from '../../types'
import SearchDataGridWrapper from '../../features/nav-tabs/SearchDataGridWrapper'
import {useTranslation} from 'react-i18next'
import {CloseCircleOutlined, FolderOpenOutlined} from '@ant-design/icons'
import QueryManager from '../../services/query'
import {CustomAttributeFieldRenderContext} from './index'
import styles from './CustomAttributeField.module.css'

const SUFFIX_BUTTON_WIDTH = 24
const RELATION_MODAL_WIDTH = 800

const {Item: FormItem} = Form
const {Search} = Input

interface Props extends CustomAttributeFieldRenderContext {
    target: string
    forceVisible?: boolean
}

const StringRelationAttributeField: FC<Props> = ({uniqueKey, items: itemMap, form, item, attrName, attribute, target, value, forceVisible, onItemView}) => {
    if (attribute.type !== FieldType.string)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [isSearchModalVisible, setSearchModalVisible] = useState<boolean>(false)
    const queryManager = useMemo(() => new QueryManager(itemMap), [itemMap])
    const isDisabled = useMemo(() => attribute.readOnly, [attribute.readOnly])
    const additionalProps = useMemo((): any => {
        const additionalProps: any = {}
        if (isDisabled)
            additionalProps.disabled = true

        return additionalProps
    }, [isDisabled])

    const [currentValue, setCurrentValue] = useState(value)
    const targetItem = itemMap[target]

    function handleRelationSelect(itemData: ItemData) {
        const selectedValue = itemData[targetItem.titleAttribute]
        setCurrentValue(selectedValue)
        form.setFieldValue(attrName, selectedValue)

        setSearchModalVisible(false)
    }

    async function openRelation() {
        if (!currentValue)
            return

        setLoading(true)
        try {
            const targetTitleAttrName = targetItem.titleAttribute
            if (targetTitleAttrName.includes('.'))
                return Promise.reject('Title attribute must belong to item')

            const found = await queryManager.findAllBy(targetItem, {[targetItem.titleAttribute]: {eq: currentValue}})
            if (found.length !== 1)
                return Promise.reject(`Illegal state. Found ${found.length} records`)

            onItemView(targetItem, found[0].id)
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    function handleClear() {
        setCurrentValue(null)
        form.setFieldValue(attrName, null)
    }

    return (
        <>
            <FormItem
                className={styles.formItem}
                name={attrName}
                label={t(attribute.displayName)}
                hidden={attribute.fieldHidden && !forceVisible}
                initialValue={value ?? attribute.defaultValue}
                rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
            >
                <Search
                    id={`${uniqueKey}#${attrName}`}
                    readOnly
                    onSearch={() => setSearchModalVisible(true)}
                    addonAfter={currentValue && [
                        <Tooltip key="open" title={t('Open')}>
                            <Button
                                type="link"
                                style={{marginLeft: 4, width: SUFFIX_BUTTON_WIDTH}}
                                icon={<FolderOpenOutlined/>}
                                loading={loading}
                                onClick={openRelation}
                            />
                        </Tooltip>,
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
                open={isSearchModalVisible}
                destroyOnClose
                width={RELATION_MODAL_WIDTH}
                footer={null}
                onCancel={() => setSearchModalVisible(false)}
            >
                <SearchDataGridWrapper
                    items={itemMap}
                    item={targetItem}
                    onSelect={itemData => handleRelationSelect(itemData)}
                />
            </Modal>
        </>
    )
}

export default StringRelationAttributeField
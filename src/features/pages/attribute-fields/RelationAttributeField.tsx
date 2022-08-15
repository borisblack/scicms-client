import {Form, Input, Modal} from 'antd'
import {FC, useMemo, useState} from 'react'

import {AttrType, Item, ItemData, RelType} from '../../../types'
import ItemService from '../../../services/item'
import SearchDataGridWrapper from '../SearchDataGridWrapper'
import styles from '../AttributeInputWrapper.module.css'
import {useTranslation} from 'react-i18next'
import {AttributeFieldProps} from '.'

const FormItem = Form.Item
const {Search} = Input

const RelationAttributeField: FC<AttributeFieldProps> = ({form, attrName, attribute, value, canEdit}) => {
    if (attribute.type !== AttrType.relation || attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany)
        throw new Error('Illegal attribute')

    const {target} = attribute
    if (!target)
        throw new Error('Target is undefined')

    const {t} = useTranslation()
    const [isRelationModalVisible, setRelationModalVisible] = useState<boolean>(false)
    const isDisabled = attribute.keyed || attribute.readOnly || !canEdit

    const itemService = useMemo(() => ItemService.getInstance(), [])
    const targetItem = itemService.getByName(target)

    function handleRelationSelect(targetItem: Item, itemData: ItemData) {
        form.setFieldValue(attrName, itemData[targetItem.titleAttribute])
        form.setFieldValue(`${attrName}.id`, itemData.id)
        setRelationModalVisible(false)
    }

    return (
        <>
            <FormItem
                className={styles.formItem}
                name={attrName}
                label={attribute.displayName}
                initialValue={value?.data ? value.data[targetItem.titleAttribute] : null}
                rules={[{required: attribute.required, message: t('Required field')}]}
            >
                <Search
                    style={{maxWidth: attribute.fieldWidth}}
                    readOnly
                    disabled={isDisabled}
                    onSearch={() => setRelationModalVisible(true)}
                />
            </FormItem>
            <FormItem hidden name={`${attrName}.id`} initialValue={value?.data ? value.data.id : null}>
                <Input/>
            </FormItem>
            <Modal
                title={`${t('Select')} ${attribute.displayName}`}
                visible={isRelationModalVisible}
                destroyOnClose
                width={800}
                footer={null}
                onCancel={() => setRelationModalVisible(false)}
            >
                <SearchDataGridWrapper item={targetItem} onSelect={itemData => handleRelationSelect(targetItem, itemData)}/>
            </Modal>
        </>
    )
}

export default RelationAttributeField
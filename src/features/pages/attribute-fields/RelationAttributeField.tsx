import {Button, Form, Input, Modal, Tooltip} from 'antd'
import {FC, useMemo, useState} from 'react'

import {AttrType, ItemData, Lifecycle, Permission, RelType} from '../../../types'
import ItemService from '../../../services/item'
import SearchDataGridWrapper from './SearchDataGridWrapper'
import styles from './AttributeField.module.css'
import {useTranslation} from 'react-i18next'
import {AttributeFieldProps} from '.'
import {CloseCircleOutlined, FolderOpenOutlined} from '@ant-design/icons'
import {DEFAULT_LIFECYCLE_ID} from '../../../services/lifecycle'
import {DEFAULT_PERMISSION_ID} from '../../../services/permission'
import {FiltersInput} from '../../../services/query'

const SUFFIX_BUTTON_WIDTH = 24
const RELATION_MODAL_WIDTH = 800
const STATE_ATTR_NAME = 'state'
const LIFECYCLE_ATTR_NAME = 'lifecycle'
const PERMISSION_ATTR_NAME = 'permission'

const {Item: FormItem} = Form
const {Search} = Input

const RelationAttributeField: FC<AttributeFieldProps> = ({form, item, attrName, attribute, value, onItemView}) => {
    if (attribute.type !== AttrType.relation || attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany)
        throw new Error('Illegal attribute')

    const {target} = attribute
    if (!target)
        throw new Error('Target is undefined')

    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [isRelationModalVisible, setRelationModalVisible] = useState<boolean>(false)
    const isDisabled = attribute.keyed || attribute.readOnly
    const [currentId, setCurrentId] = useState(value?.data?.id)
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const targetItem = itemService.getByName(target)

    const extraFiltersInput: FiltersInput<unknown> = useMemo(() => {
        if (attrName === LIFECYCLE_ATTR_NAME) {
            const allowedLifecycleIds = [...item.allowedLifecycles.data.map(it => it.id), DEFAULT_LIFECYCLE_ID]
            return {
                id: {
                    in: allowedLifecycleIds
                }
            } as FiltersInput<Lifecycle>
        }

        if (attrName === PERMISSION_ATTR_NAME) {
            const allowedPermissionIds = [...item.allowedPermissions.data.map(it => it.id), DEFAULT_PERMISSION_ID]
            return {
                id: {
                    in: allowedPermissionIds
                }
            } as FiltersInput<Permission>
        }

        return {} as FiltersInput<unknown>
    }, [item, attrName])

    function handleRelationSelect(itemData: ItemData) {
        setCurrentId(itemData.id)
        form.setFieldValue(attrName, itemData[targetItem.titleAttribute])
        form.setFieldValue(`${attrName}.id`, itemData.id)
        if (attrName === LIFECYCLE_ATTR_NAME)
            form.setFieldValue(STATE_ATTR_NAME, (itemData as Lifecycle).startState)

        setRelationModalVisible(false)
    }

    async function openRelation() {
        if (!currentId)
            return

        setLoading(true)
        try {
            onItemView(targetItem, currentId)
        } finally {
            setLoading(false)
        }

    }

    function handleClear() {
        setCurrentId(null)
        form.setFieldValue(attrName, null)
        form.setFieldValue(`${attrName}.id`, null)
        if (attrName === LIFECYCLE_ATTR_NAME)
            form.setFieldValue(STATE_ATTR_NAME, null)
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
                    style={{maxWidth: attribute.fieldWidth ? attribute.fieldWidth + (currentId ? (SUFFIX_BUTTON_WIDTH * 2 + 4) : 0) : undefined}}
                    readOnly
                    disabled={isDisabled}
                    onSearch={() => setRelationModalVisible(true)}
                    addonAfter={currentId && [
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
                />
            </FormItem>
            <FormItem hidden name={`${attrName}.id`} initialValue={value?.data ? value.data.id : null}>
                <Input/>
            </FormItem>
            <Modal
                title={`${t('Select')} ${attribute.displayName}`}
                visible={isRelationModalVisible}
                destroyOnClose
                width={RELATION_MODAL_WIDTH}
                footer={null}
                onCancel={() => setRelationModalVisible(false)}
            >
                <SearchDataGridWrapper
                    item={targetItem}
                    extraFiltersInput={extraFiltersInput}
                    onSelect={itemData => handleRelationSelect(itemData)}
                />
            </Modal>
        </>
    )
}

export default RelationAttributeField
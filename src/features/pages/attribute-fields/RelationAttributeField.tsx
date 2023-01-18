import {Button, Form, Input, Modal, Tooltip} from 'antd'
import {FC, useMemo, useState} from 'react'

import {AttrType, ItemData, Lifecycle, Permission, RelType} from '../../../types'
import ItemService from '../../../services/item'
import SearchDataGridWrapper from '../SearchDataGridWrapper'
import {useTranslation} from 'react-i18next'
import {AttributeFieldProps} from '.'
import {CloseCircleOutlined, FolderOpenOutlined} from '@ant-design/icons'
import {DEFAULT_LIFECYCLE_ID} from '../../../services/lifecycle'
import {DEFAULT_PERMISSION_ID} from '../../../services/permission'
import {FiltersInput} from '../../../services/query'
import styles from './AttributeField.module.css'
import {LIFECYCLE_ATTR_NAME, PERMISSION_ATTR_NAME, STATE_ATTR_NAME} from '../../../config/constants'

const SUFFIX_BUTTON_WIDTH = 24
const RELATION_MODAL_WIDTH = 800

const {Item: FormItem} = Form
const {Search} = Input

const RelationAttributeField: FC<AttributeFieldProps> = ({pageKey, form, item, attrName, attribute, value, onItemView}) => {
    if (attribute.type !== AttrType.relation || attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany)
        throw new Error('Illegal attribute')

    const {target} = attribute
    if (!target)
        throw new Error('Target is undefined')

    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [isRelationModalVisible, setRelationModalVisible] = useState<boolean>(false)
    const isDisabled = useMemo(() => attribute.keyed || attribute.readOnly, [attribute.keyed, attribute.readOnly])
    const additionalProps = useMemo((): any => {
        const additionalProps: any = {}
        if (isDisabled)
            additionalProps.disabled = true

        return additionalProps
    }, [isDisabled])

    const [currentId, setCurrentId] = useState(value?.data?.id)
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const targetItem = itemService.getByName(target)
    const initialData = useMemo(() => value?.data ?? attribute.defaultValue, [attribute.defaultValue, value?.data])

    const extraFiltersInput: FiltersInput<ItemData> = useMemo(() => {
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

        return {} as FiltersInput<ItemData>
    }, [item, attrName])

    function handleRelationSelect(itemData: ItemData) {
        setCurrentId(itemData.id)
        form.setFieldValue(attrName, itemData[targetItem.titleAttribute])
        form.setFieldValue(`${attrName}.id`, itemData.id)

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
                label={t(attribute.displayName)}
                hidden={attribute.fieldHidden}
                initialValue={initialData ? (initialData[targetItem.titleAttribute] ?? initialData.id) : null}
                rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
            >
                <Search
                    id={`${pageKey}#${attrName}`}
                    style={{maxWidth: attribute.fieldWidth ? attribute.fieldWidth + (currentId ? (SUFFIX_BUTTON_WIDTH * 2 + 4) : 0) : undefined}}
                    readOnly
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
                    {...additionalProps}
                />
            </FormItem>
            <FormItem hidden name={`${attrName}.id`} initialValue={value?.data ? value.data.id : null}>
                <Input id={`${pageKey}#${attrName}.id`}/>
            </FormItem>
            <Modal
                title={t(attribute.displayName)}
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
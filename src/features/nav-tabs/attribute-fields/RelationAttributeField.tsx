import {Button, Form, Input, Modal, Tooltip} from 'antd'
import {FC, useMemo, useState} from 'react'

import {FieldType, ItemData, Lifecycle, Permission, RelType} from '../../../types'
import SearchDataGridWrapper from '../SearchDataGridWrapper'
import {useTranslation} from 'react-i18next'
import {AttributeFieldProps} from '.'
import {CloseCircleOutlined, FolderOpenOutlined} from '@ant-design/icons'
import {DEFAULT_LIFECYCLE_ID} from '../../../services/lifecycle'
import {BI_PERMISSION_ID, DEFAULT_PERMISSION_ID, SECURITY_PERMISSION_ID} from '../../../services/permission'
import {ItemFiltersInput} from '../../../services/query'
import styles from './AttributeField.module.css'
import {
    DASHBOARD_ITEM_NAME,
    DATASET_ITEM_NAME,
    GROUP_ITEM_NAME,
    GROUP_MEMBER_ITEM_NAME,
    GROUP_ROLE_ITEM_NAME,
    LIFECYCLE_ATTR_NAME,
    PERMISSION_ATTR_NAME,
    ROLE_ITEM_NAME,
    STATE_ATTR_NAME,
    USER_ITEM_NAME
} from '../../../config/constants'

const SUFFIX_BUTTON_WIDTH = 24
const RELATION_MODAL_WIDTH = 800

const {Item: FormItem} = Form
const {Search} = Input

const securityItemNames = new Set([
    // ACCESS_ITEM_NAME,
    // ALLOWED_PERMISSION_ITEM_NAME,
    GROUP_ITEM_NAME,
    GROUP_MEMBER_ITEM_NAME,
    GROUP_ROLE_ITEM_NAME,
    // IDENTITY_ITEM_NAME,
    // PERMISSION_ITEM_NAME,
    ROLE_ITEM_NAME,
    USER_ITEM_NAME
])
const biItemNames = new Set([DASHBOARD_ITEM_NAME, DATASET_ITEM_NAME])

const isSecurityItem = (itemName: string) => securityItemNames.has(itemName)

const isBiItem = (itemName: string) => biItemNames.has(itemName)

function getDefaultPermission(itemName: string): string {
    if (isSecurityItem(itemName))
        return SECURITY_PERMISSION_ID

    if (isBiItem(itemName))
        return BI_PERMISSION_ID

    return DEFAULT_PERMISSION_ID
}

const RelationAttributeField: FC<AttributeFieldProps> = ({uniqueKey, items: itemMap, form, item, attrName, attribute, value, canAdmin, onItemView}) => {
    if (attribute.type !== FieldType.relation || attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany)
        throw new Error('Illegal attribute')

    const {target} = attribute
    if (!target)
        throw new Error('Target is undefined')

    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [isRelationModalVisible, setRelationModalVisible] = useState<boolean>(false)
    const isDisabled = useMemo(() => attribute.keyed || attribute.readOnly || ((attrName === LIFECYCLE_ATTR_NAME || attrName === PERMISSION_ATTR_NAME) && !canAdmin), [attrName, attribute.keyed, attribute.readOnly, canAdmin])
    const additionalProps = useMemo((): any => {
        const additionalProps: any = {}
        if (isDisabled)
            additionalProps.disabled = true

        return additionalProps
    }, [isDisabled])

    const [currentId, setCurrentId] = useState(value?.data?.id)
    const targetItem = itemMap[target]
    const initialData = useMemo(() => value?.data ?? attribute.defaultValue, [attribute.defaultValue, value?.data])

    const extraFiltersInput: ItemFiltersInput<ItemData> = useMemo(() => {
        if (attrName === LIFECYCLE_ATTR_NAME) {
            const allowedLifecycleIds = [...item.allowedLifecycles.data.map(al => al.target.data.id), DEFAULT_LIFECYCLE_ID]
            return {
                id: {
                    in: allowedLifecycleIds
                }
            } as ItemFiltersInput<Lifecycle>
        }

        if (attrName === PERMISSION_ATTR_NAME) {
            const allowedPermissionIds = [...item.allowedPermissions.data.map(ap => ap.target.data.id), getDefaultPermission(item.name)]
            return {
                id: {
                    in: allowedPermissionIds
                }
            } as ItemFiltersInput<Permission>
        }

        return {} as ItemFiltersInput<ItemData>
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
                    id={`${uniqueKey}#${attrName}`}
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
                <Input id={`${uniqueKey}#${attrName}.id`}/>
            </FormItem>
            <Modal
                title={t(attribute.displayName)}
                open={isRelationModalVisible}
                destroyOnClose
                width={RELATION_MODAL_WIDTH}
                footer={null}
                onCancel={() => setRelationModalVisible(false)}
            >
                <SearchDataGridWrapper
                    items={itemMap}
                    item={targetItem}
                    extraFiltersInput={extraFiltersInput}
                    onSelect={itemData => handleRelationSelect(itemData)}
                />
            </Modal>
        </>
    )
}

export default RelationAttributeField
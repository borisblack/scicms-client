import {useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Checkbox, DatePicker, FormInstance, Input, InputNumber, Modal, TimePicker} from 'antd'
import moment from 'moment'

import {Attribute, AttrType, Item, ItemData} from '../../types'
import ItemService from '../../services/item'
import FormItem from 'antd/es/form/FormItem'
import styles from './AttributeInputWrapper.module.css'
import appConfig from '../../config'
import './AttributeInputWrapper.css'
import SearchDataGridWrapper from './SearchDataGridWrapper'

interface Props {
    form: FormInstance
    item: Item
    attrName: string
    attribute: Attribute
    value: any
    canEdit: boolean
}

const MAJOR_REV_ATTR_NAME = 'majorRev'
const STATE_ATTR_NAME = 'state'
const CREATED_AT_ATTR_NAME = 'createdAt'
const CREATED_BY_ATTR_NAME = 'createdBy'
const UPDATED_AT_ATTR_NAME = 'updatedAt'
const UPDATED_BY_ATTR_NAME = 'updatedBy'
const LOCKED_BY_ATTR_NAME = 'lockedBy'

const {Password, Search, TextArea} = Input

export default function AttributeInputWrapper({form, item, attrName, attribute, value, canEdit}: Props) {
    const {t} = useTranslation()
    const [isRelationModalVisible, setRelationModalVisible] = useState<boolean>(false)
    const itemService = useMemo(() => ItemService.getInstance(), [])

    function isEnabled() {
        if (attrName === MAJOR_REV_ATTR_NAME && !item.manualVersioning)
            return false

        if (attrName === STATE_ATTR_NAME)
            return false

        // if (attrName === CREATED_AT_ATTR_NAME || attrName === CREATED_BY_ATTR_NAME
        //     || attrName === UPDATED_AT_ATTR_NAME || attrName === UPDATED_BY_ATTR_NAME
        //     || attrName === LOCKED_BY_ATTR_NAME)
        //     return false

        return !attribute.keyed && canEdit
    }

    function handleRelationSearch(targetItem: Item) {
        setRelationModalVisible(true)
    }

    function handleRelationOk() {
        // TODO: Process selected row
        setRelationModalVisible(false)
    }

    function handleRelationSelect(targetItem: Item, itemData: ItemData) {
        form.setFieldValue(attrName, itemData[targetItem.titleAttribute])
        setRelationModalVisible(false)
    }

    switch (attribute.type) {
        case AttrType.string:
        case AttrType.sequence:
        case AttrType.email:
        case AttrType.uuid:
            return (
                <FormItem
                    className={styles.formItem}
                    name={attrName}
                    label={attribute.displayName}
                    initialValue={value}
                    rules={[{required: attribute.required, message: t('Required field')}]}
                >
                    <Input style={{maxWidth: attribute.fieldWidth}} maxLength={attribute.length} disabled={!isEnabled()}/>
                </FormItem>
            )
        case AttrType.password:
            return (
                <FormItem
                    className={styles.formItem}
                    name={attrName}
                    label={attribute.displayName}
                    initialValue={value}
                    rules={[{required: attribute.required, message: t('Required field')}]}
                >
                    <Password style={{maxWidth: attribute.fieldWidth}} maxLength={attribute.length} disabled={!isEnabled()}/>
                </FormItem>
            )
        case AttrType.bool:
            return (
                <FormItem
                    className={styles.formItem}
                    name={attrName}
                    valuePropName="checked"
                    initialValue={value}
                >
                    <Checkbox disabled={!isEnabled()}>{attribute.displayName}</Checkbox>
                </FormItem>
            )
        case AttrType.text:
            return (
                <FormItem
                    className={styles.formItem}
                    name={attrName}
                    label={attribute.displayName}
                    initialValue={value}
                    rules={[{required: attribute.required, message: t('Required field')}]}
                >
                    <TextArea style={{maxWidth: attribute.fieldWidth}} disabled={!isEnabled()} rows={4}/>
                </FormItem>
            )
        case AttrType.json:
        case AttrType.array:
            return (
                <FormItem
                    className={styles.formItem}
                    name={attrName}
                    label={attribute.displayName}
                    initialValue={value ? JSON.stringify(value) : null}
                    rules={[{required: attribute.required, message: t('Required field')}]}
                >
                    <TextArea style={{maxWidth: attribute.fieldWidth}} disabled={!isEnabled()} rows={4}/>
                </FormItem>
            )
        case AttrType.int:
        case AttrType.long:
        case AttrType.float:
        case AttrType.double:
        case AttrType.decimal:
            return (
                <FormItem
                    className={styles.formItem}
                    name={attrName}
                    label={attribute.displayName}
                    initialValue={value}
                    rules={[{required: attribute.required, message: t('Required field')}]}
                >
                    <InputNumber
                        style={{maxWidth: attribute.fieldWidth}}
                        min={attribute.minRange}
                        max={attribute.maxRange}
                        disabled={!isEnabled()}
                    />
                </FormItem>
            )
        case AttrType.date:
            return (
                <FormItem
                    className={styles.formItem}
                    name={attrName}
                    label={attribute.displayName}
                    initialValue={value ? moment(value) : null}
                    rules={[{required: attribute.required, message: t('Required field')}]}
                >
                    <DatePicker format={appConfig.dateTime.momentDateFormatString} disabled={!isEnabled()}/>
                </FormItem>
            )
        case AttrType.time:
            return (
                <FormItem
                    className={styles.formItem}
                    name={attrName}
                    label={attribute.displayName}
                    initialValue={value ? moment(value) : null}
                    rules={[{required: attribute.required, message: t('Required field')}]}
                >
                    <TimePicker format={appConfig.dateTime.momentTimeFormatString} disabled={!isEnabled()}/>
                </FormItem>
            )
        case AttrType.datetime:
            return (
                <FormItem
                    className={styles.formItem}
                    name={attrName}
                    label={attribute.displayName}
                    initialValue={value ? moment(value) : null}
                    rules={[{required: attribute.required, message: t('Required field')}]}
                >
                    <DatePicker showTime format={appConfig.dateTime.momentDateTimeFormatString} disabled={!isEnabled()}/>
                </FormItem>
            )
        case AttrType.relation:
            const {target} = attribute
            if (!target)
                throw new Error('Target is undefined')

            const targetItem = itemService.getByName(target)
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
                            disabled={!isEnabled()}
                            onSearch={() => handleRelationSearch(targetItem)}
                        />
                    </FormItem>
                    <Modal
                        title={`${t('Select')} ${attribute.displayName}`}
                        visible={isRelationModalVisible}
                        destroyOnClose
                        width={800}
                        onOk={handleRelationOk}
                        onCancel={() => setRelationModalVisible(false)}
                    >
                        <SearchDataGridWrapper item={targetItem} onSelect={itemData => handleRelationSelect(targetItem, itemData)}/>
                    </Modal>
                </>
            )
        default:
            return null
    }
}
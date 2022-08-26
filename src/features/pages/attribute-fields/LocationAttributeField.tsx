import {Button, Form, Input, InputNumber, Modal} from 'antd'
import {FC, useMemo, useState} from 'react'

import {AttrType, ItemData, Lifecycle, Location, Permission} from '../../../types'
import ItemService from '../../../services/item'
import {useTranslation} from 'react-i18next'
import {AttributeFieldProps} from '.'
import {DEFAULT_LIFECYCLE_ID} from '../../../services/lifecycle'
import {DEFAULT_PERMISSION_ID} from '../../../services/permission'
import {FiltersInput} from '../../../services/query'
import LocationForm from './LocationForm'
import styles from './AttributeField.module.css'
import {EditOutlined} from '@ant-design/icons'

const OPEN_BUTTON_WIDTH = 24
const LOCATION_MODAL_WIDTH = 200
const STATE_ATTR_NAME = 'state'
const LIFECYCLE_ATTR_NAME = 'lifecycle'
const PERMISSION_ATTR_NAME = 'permission'

const {Item: FormItem} = Form
const {Group: InputGroup} = Input

const LocationAttributeField: FC<AttributeFieldProps> = ({form, item, attrName, attribute, value, onView}) => {
    if (attribute.type !== AttrType.location)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [isLocationModalVisible, setLocationModalVisible] = useState<boolean>(false)
    const isDisabled = attribute.keyed || attribute.readOnly
    const [currentId, setCurrentId] = useState(value?.data?.id)
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const locationItem = itemService.getLocation()
    const locationData = value?.data as Location
    const [locationForm] = Form.useForm()

    const extraFiltersInput: FiltersInput<unknown> = useMemo(() => {
        if (attrName === LIFECYCLE_ATTR_NAME) {
            const allowedLifecycleIds = [...item.allowedLifecycles.data.map(it => it.id), DEFAULT_LIFECYCLE_ID]
            return {
                id: { in: allowedLifecycleIds }
            } as FiltersInput<Lifecycle>
        }

        if (attrName === PERMISSION_ATTR_NAME) {
            const allowedPermissionIds = [...item.allowedPermissions.data.map(it => it.id), DEFAULT_PERMISSION_ID]
            return {
                id: { in: allowedPermissionIds }
            } as FiltersInput<Permission>
        }

        return {} as FiltersInput<unknown>
    }, [item, attrName])

    function handleRelationSelect(itemData: ItemData) {
        setCurrentId(itemData.id)
        form.setFieldValue(attrName, itemData[locationItem.titleAttribute])
        form.setFieldValue(`${attrName}.id`, itemData.id)
        if (attrName === LIFECYCLE_ATTR_NAME)
            form.setFieldValue(STATE_ATTR_NAME, (itemData as Lifecycle).startState)

        setLocationModalVisible(false)
    }

    async function openRelation() {
        if (!currentId)
            return

        setLoading(true)
        try {
            onView(locationItem, currentId)
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

    function handleLocationFormFinish(values: any) {
        console.log(values)
    }

    const label = (
        <span>
            {attribute.displayName}
            &nbsp;&nbsp;
            <Button type="link" icon={<EditOutlined/>} title={t('Edit')} onClick={() => setLocationModalVisible(true)}/>
        </span>
    )

    return (
        <>
            <FormItem
                className={styles.formItem}
                name={attrName}
                label={label}
                initialValue={locationData?.id}
                rules={[{required: attribute.required}]}
            >
                <InputGroup compact>
                    <FormItem name={[attrName, 'latitude']} noStyle initialValue={locationData?.latitude}>
                        <InputNumber
                            style={{width: '25%'}}
                            placeholder={t('Latitude')}
                            min={-90}
                            max={90}
                            disabled
                        />
                    </FormItem>
                    <FormItem name={[attrName, 'longitude']} noStyle initialValue={locationData?.longitude}>
                        <InputNumber
                            style={{width: '25%'}}
                            placeholder={t('Longitude')}
                            min={-180}
                            max={180}
                            disabled
                        />
                    </FormItem>
                    <FormItem name={[attrName, 'label']} noStyle initialValue={locationData?.displayName}>
                        <InputNumber
                            style={{width: '50%'}}
                            placeholder={t('Label')}
                            min={-180}
                            max={180}
                            disabled
                        />
                    </FormItem>
                </InputGroup>
            </FormItem>
            <Modal
                title={attribute.displayName}
                visible={isLocationModalVisible}
                destroyOnClose
                onOk={() => {}}
                onCancel={() => setLocationModalVisible(false)}
            >
                <Form form={locationForm} size="small" layout="vertical" onFinish={handleLocationFormFinish}>
                    <LocationForm data={locationData} />
                </Form>
            </Modal>
        </>
    )
}

export default LocationAttributeField
import {FC} from 'react'
import {useTranslation} from 'react-i18next'
import {Form, FormInstance, FormRule, Input, InputNumber} from 'antd'
import util from 'util'

import {AttrType, Location} from '../../../types'
import {AttributeFieldProps} from '.'
import styles from './AttributeField.module.css'

const {Item: FormItem} = Form
const {Group: InputGroup} = Input

const LocationAttributeField: FC<AttributeFieldProps> = ({form, item, attrName, attribute, value, onItemView}) => {
    if (attribute.type !== AttrType.location)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const locationData = value?.data as Location

    const latitudeRule = ({ getFieldValue }: FormInstance): FormRule => ({
        validator(_, value) {
            const longitude = getFieldValue([attrName, 'longitude'])
            const label = getFieldValue([attrName, 'label'])
            const resolve = value || (!longitude && !label)

            return resolve ? Promise.resolve() : Promise.reject(new Error(util.format(t('Field %s is required'), t('Latitude'))))
        }})

    const longitudeRule = ({ getFieldValue }: FormInstance): FormRule => ({
        validator(_, value) {
            const latitude = getFieldValue([attrName, 'latitude'])
            const label = getFieldValue([attrName, 'label'])
            const resolve = value || (!latitude && !label)

            return resolve ? Promise.resolve() : Promise.reject(new Error(util.format(t('Field %s is required'), t('Longitude'))))
        }})

    const labelRule = ({ getFieldValue }: FormInstance): FormRule => ({
        validator(_, value) {
            const latitude = getFieldValue([attrName, 'latitude'])
            const longitude = getFieldValue([attrName, 'longitude'])
            const resolve = value || (!latitude && !longitude)

            return resolve ? Promise.resolve() : Promise.reject(new Error(util.format(t('Field %s is required'), t('Label'))))
        }})

    const validateNestedFields = () => form.validateFields([[attrName, 'latitude'], [attrName, 'longitude'], [attrName, 'label']])

    return (
        <>
            <FormItem
                className={styles.formItem}
                name={attrName}
                label={t(attribute.displayName)}
                hidden={attribute.fieldHidden}
                rules={[{required: attribute.required && !attribute.readOnly}]}
            >
                <InputGroup compact>
                    <FormItem
                        name={[attrName, 'latitude']}
                        noStyle
                        initialValue={locationData?.latitude}
                        rules={[latitudeRule as FormRule]}
                    >
                        <InputNumber
                            style={{width: '25%'}}
                            placeholder={t('Latitude')}
                            min={-90}
                            max={90}
                            onChange={validateNestedFields}
                        />
                    </FormItem>
                    <FormItem
                        name={[attrName, 'longitude']}
                        noStyle
                        initialValue={locationData?.longitude}
                        rules={[longitudeRule as FormRule]}
                    >
                        <InputNumber
                            style={{width: '25%'}}
                            placeholder={t('Longitude')}
                            min={-180}
                            max={180}
                            onChange={validateNestedFields}
                        />
                    </FormItem>
                    <FormItem
                        name={[attrName, 'label']}
                        noStyle
                        initialValue={locationData?.label}
                        rules={[labelRule as FormRule]}
                    >
                        <Input
                            style={{width: '50%'}}
                            placeholder={t('Label')}
                            onChange={validateNestedFields}
                        />
                    </FormItem>
                </InputGroup>
            </FormItem>
        </>
    )
}

export default LocationAttributeField
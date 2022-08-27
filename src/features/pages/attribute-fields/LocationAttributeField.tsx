import {FC} from 'react'
import {useTranslation} from 'react-i18next'
import {Form, Input, InputNumber} from 'antd'

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

    return (
        <>
            <FormItem
                className={styles.formItem}
                name={attrName}
                label={attribute.displayName}
                initialValue={locationData?.id}
                rules={[{required: attribute.required}]}
            >
                <InputGroup compact>
                    <FormItem
                        name={[attrName, 'latitude']}
                        noStyle
                        initialValue={locationData?.latitude}
                        rules={[{required: attribute.required}]}
                    >
                        <InputNumber
                            style={{width: '25%'}}
                            placeholder={t('Latitude')}
                            min={-90}
                            max={90}
                        />
                    </FormItem>
                    <FormItem
                        name={[attrName, 'longitude']}
                        noStyle
                        initialValue={locationData?.longitude}
                        rules={[{required: attribute.required}]}
                    >
                        <InputNumber
                            style={{width: '25%'}}
                            placeholder={t('Longitude')}
                            min={-180}
                            max={180}
                        />
                    </FormItem>
                    <FormItem
                        name={[attrName, 'label']}
                        noStyle
                        initialValue={locationData?.label}
                        rules={[{required: attribute.required}]}
                    >
                        <Input style={{width: '50%'}} placeholder={t('Label')}/>
                    </FormItem>
                </InputGroup>
            </FormItem>
        </>
    )
}

export default LocationAttributeField
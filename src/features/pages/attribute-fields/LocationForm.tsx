import {Col, Form, Input, InputNumber, Row} from 'antd'
import {useTranslation} from 'react-i18next'
import {Location} from '../../../types'
import styles from './AttributeField.module.css'

interface Props {
    data?: Location
}

const {Item: FormItem} = Form

export default function LocationForm({data}: Props) {
    const {t} = useTranslation()

    return (
        <>
            <FormItem hidden name="id" initialValue={data?.id}>
                <Input/>
            </FormItem>
            <Row gutter={16}>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name="latitude"
                        label={t('Latitude')}
                        initialValue={data?.latitude}
                        rules={[{required: true}]}
                    >
                        <InputNumber style={{width: '100%'}} min={-90} max={90}/>
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name="longitude"
                        label={t('Longitude')}
                        initialValue={data?.longitude}
                        rules={[{required: true}]}
                    >
                        <InputNumber style={{width: '100%'}} min={-180} max={180}/>
                    </FormItem>
                </Col>
                <Col span={24}>
                    <FormItem
                        className={styles.formItem}
                        name="displayName"
                        label={t('Label')}
                        initialValue={data?.displayName}
                    >
                        <Input style={{width: '100%'}}/>
                    </FormItem>
                </Col>
            </Row>
        </>
    )
}
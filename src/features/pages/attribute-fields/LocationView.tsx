import {Col, Form, Input, InputNumber, Row} from 'antd'
import {useTranslation} from 'react-i18next'
import {Location} from '../../../types'
import styles from './AttributeField.module.css'

interface Props {
    attrName: string
    data?: Location
}

const {Item: FormItem} = Form

export default function LocationView({attrName, data}: Props) {
    const {t} = useTranslation()

    return (
        <>
            <FormItem hidden name={[attrName, 'modal', 'id']} initialValue={data?.id}>
                <Input/>
            </FormItem>
            <Row gutter={16}>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name={[attrName, 'modal', 'latitude']}
                        label={t('Latitude')}
                        rules={[{required: true}]}
                    >
                        <InputNumber style={{width: '100%'}} min={-90} max={90}/>
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name={[attrName, 'modal', 'longitude']}
                        label={t('Longitude')}
                        rules={[{required: true}]}
                    >
                        <InputNumber style={{width: '100%'}} min={-180} max={180}/>
                    </FormItem>
                </Col>
            </Row>
        </>
    )
}
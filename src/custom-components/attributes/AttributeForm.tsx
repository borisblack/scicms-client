import {Col, Form, FormInstance, Input, Row, Select} from 'antd'
import styles from './Attributes.module.css'
import {useTranslation} from 'react-i18next'
import {NamedAttribute} from '../../util/datagrid'
import {AttrType} from '../../types'

interface Props {
    form: FormInstance
    attribute: NamedAttribute | null
    onFormFinish: (values: any) => void
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

export default function AttributeForm({form, attribute}: Props) {
    const {t} = useTranslation()

    return (
        <Form form={form} size="small" layout="vertical">
            <Row gutter={16}>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name="name"
                        label={t('Name')}
                        initialValue={attribute?.name}
                        rules={[{required: true, message: t('Required field')}]}
                    >
                        <Input style={{maxWidth: 300}} maxLength={50}/>
                    </FormItem>

                    <FormItem
                        className={styles.formItem}
                        name="type"
                        label={t('Type')}
                        initialValue={attribute?.type}
                        rules={[{required: true, message: t('Required field')}]}
                    >
                        <Select style={{maxWidth: 200}}>
                            {Object.keys(AttrType).map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                        </Select>
                    </FormItem>

                    <FormItem
                        className={styles.formItem}
                        name="columnName"
                        label={t('Column Name')}
                        initialValue={attribute?.columnName}
                    >
                        <Input style={{maxWidth: 300}} maxLength={50}/>
                    </FormItem>

                    <FormItem
                        className={styles.formItem}
                        name="displayName"
                        label={t('Display Name')}
                        initialValue={attribute?.displayName}
                        rules={[{required: true, message: t('Required field')}]}
                    >
                        <Input style={{maxWidth: 300}} maxLength={50}/>
                    </FormItem>

                    <FormItem
                        className={styles.formItem}
                        name="description"
                        label={t('Description')}
                        initialValue={attribute?.description}
                    >
                        <Input maxLength={250}/>
                    </FormItem>
                </Col>
            </Row>
        </Form>
    )
}
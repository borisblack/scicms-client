import {useTranslation} from 'react-i18next'
import {Col, Form, Input, Row, Select} from 'antd'
import {DefaultOptionType} from 'rc-select/lib/Select'

import {IText} from 'src/types/bi'
import {requiredFieldRule} from 'src/util/form'
import styles from './TextForm.module.css'

interface TextFormProps {
    text: IText
    canEdit: boolean
}

export interface TextFormValues extends IText {}

const {TextArea} = Input
const {Item: FormItem} = Form

const levelOptions: DefaultOptionType[] = [1, 2, 3, 4 ,5].map(level => ({label: `H${level}`, value: level}))

export default function TextForm({text, canEdit}: TextFormProps) {
    const form = Form.useFormInstance()
    const {t} = useTranslation()
    // const prevText = usePrevious(text)

    // Uncomment when using one form for multiple items
    // useEffect(() => {
    //     if (prevText?.id !== text.id)
    //         form.resetFields()
    // }, [text])

    return (
        <Row gutter={10}>
            <FormItem name="id" hidden>
                <Input/>
            </FormItem>

            <Col span={24}>
                <FormItem
                    className={styles.formItem}
                    name="content"
                    label={t('Content')}
                    rules={[requiredFieldRule()]}
                >
                    <TextArea/>
                </FormItem>
            </Col>
            <Col span={8}>
                <FormItem
                    className={styles.formItem}
                    name="level"
                    label={t('Header')}
                >
                    <Select allowClear options={levelOptions}/>
                </FormItem>
            </Col>
        </Row>
    )
}
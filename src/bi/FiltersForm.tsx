import {Form, FormInstance} from 'antd'

interface Props {
    form: FormInstance
    onFormFinish: (values: any) => void
}

export default function FiltersFom({form, onFormFinish}: Props) {
    return (
        <Form
            form={form}
            size="small"
            layout="vertical"
            onFinish={onFormFinish}
        >
        </Form>
    )
}
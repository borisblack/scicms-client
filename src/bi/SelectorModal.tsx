import _ from 'lodash'
import {useTranslation} from 'react-i18next'
import {Button, Drawer, Form, Space} from 'antd'

import {Dataset, IDash, ISelector} from '../types/bi'
import SelectorForm, {SelectorFormValues} from './SelectorForm'

interface SelectorFormModalProps {
    selector: ISelector
    datasetMap: Record<string, Dataset>
    dashes: IDash[]
    open: boolean
    canEdit: boolean
    onChange: (selector: ISelector) => void
    onClose: () => void
}

export default function SelectorModal({selector, datasetMap, dashes, canEdit, open, onChange, onClose}: SelectorFormModalProps) {
    const {t} = useTranslation()
    const [form] = Form.useForm()

    function handleFormFinish(values: SelectorFormValues) {
        onChange({...values})
        onClose()
    }

    function cancelEdit() {
        form.resetFields()
        onClose()
    }

    return (
        <Drawer
            className="no-drag"
            title={t('Selector')}
            open={open}
            destroyOnClose
            // width="70%"
            // onOk={() => form.submit()}
            extra={
                <Space>
                    <Button onClick={cancelEdit}>{t('Cancel')}</Button>
                    <Button disabled={!canEdit} type="primary" onClick={() => form.submit()}>OK</Button>
                </Space>
            }
            onClose={onClose}
        >
            <Form
                form={form}
                size="small"
                layout="vertical"
                disabled={!canEdit}
                initialValues={selector}
                onFinish={handleFormFinish}
            >
                <SelectorForm
                    selector={selector}
                    datasetMap={datasetMap}
                    dashes={dashes}
                    canEdit={canEdit}
                />
            </Form>
        </Drawer>
    )
}
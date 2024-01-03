import React from 'react'
import {useTranslation} from 'react-i18next'
import {Form, Modal} from 'antd'

import {JoinedTable, Table} from 'src/types/bi'
import JoinedTableForm from './JoinedTableForm'

interface JoinedTableModalProps {
    mainTable: Table
    joinedTable: JoinedTable
    open: boolean
    canEdit: boolean
    onChange: (joinedTable: Required<JoinedTable>) => void
    onClose: () => void
}

interface JoinsFormValues extends Required<JoinedTable>{}

export default function JoinedTableModal({mainTable, joinedTable, open, canEdit, onChange, onClose}: JoinedTableModalProps) {
    const {t} = useTranslation()
    const [form] = Form.useForm()

    function handleFormFinish(values: JoinsFormValues) {
        if (!canEdit)
            return

        onChange({...joinedTable, ...values})
        onClose()
    }

    return (
        <Modal
            title={t('Join')}
            open={open}
            destroyOnClose
            width={800}
            okButtonProps={{disabled: !canEdit}}
            onOk={() => form.submit()}
            onCancel={onClose}
        >
            <Form
                form={form}
                layout="vertical"
                size="small"
                disabled={!canEdit}
                initialValues={joinedTable}
                onFinish={handleFormFinish}
            >
                <JoinedTableForm mainTable={mainTable} joinedTable={joinedTable}/>
            </Form>
        </Modal>
    )
}
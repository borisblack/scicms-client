import React from 'react'
import {Button, Drawer, Form, Space} from 'antd'

import {fromFormQueryBlock, generateQueryBlock} from './util'
import DashForm, {DashFormValues} from './DashForm'
import {Dashboard, Dataset, IDash} from '../types/bi'
import {useTranslation} from 'react-i18next'

interface DashFormModalProps {
    dash: IDash
    datasetMap: Record<string, Dataset>
    dashboards: Dashboard[]
    open: boolean
    canEdit: boolean
    onChange: (dash: IDash) => void
    onClose: () => void
}

const mapDashValues = (dash: IDash, values: DashFormValues, dataset?: Dataset): IDash => ({
    ...dash,
    name: values.name,
    dataset: values.dataset,
    type: values.type,
    unit: values.unit,
    isAggregate: values.isAggregate,
    aggregateType: values.aggregateType,
    aggregateField: values.aggregateField,
    groupField: values.groupField,
    sortField: values.sortField,
    optValues: values.optValues,
    relatedDashboardId: values.relatedDashboardId,
    refreshIntervalSeconds: values.refreshIntervalSeconds,
    defaultFilters: dataset == null ? generateQueryBlock() : fromFormQueryBlock(dataset, values.defaultFilters)
})

export default function DashModal({dash, datasetMap, dashboards, canEdit, open, onChange, onClose}: DashFormModalProps) {
    const {t} = useTranslation()
    const [form] = Form.useForm()

    function handleFormFinish(values: DashFormValues) {
        const dataset = values.dataset ? datasetMap[values.dataset] : null
        if (dataset == null)
            return

        onChange(mapDashValues(dash, values, dataset))
        onClose()
    }

    function cancelEdit() {
        form.resetFields()
        onClose()
    }

    return (
        <Drawer
            className="no-drag"
            title={dash.name}
            open={open}
            destroyOnClose
            width="70%"
            // onOk={() => dashForm.submit()}
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
                onFinish={handleFormFinish}
            >
                <DashForm
                    dash={dash}
                    datasetMap={datasetMap}
                    dashboards={dashboards}
                    canEdit={canEdit}
                />
            </Form>
        </Drawer>
    )
}
import {Form, FormInstance} from 'antd'
import {toFormQueryBlock} from '../util/bi'
import DashFilters from './dash-filters/DashFilters'
import React from 'react'
import {Dataset, QueryBlock} from '../types'

interface Props {
    form: FormInstance
    dataset: Dataset,
    defaultFilters?: QueryBlock
    onFormFinish: (values: FiltersFormValues) => void
}

export interface FiltersFormValues {
    filters: QueryBlock
}

export default function FiltersFom({form, dataset, defaultFilters, onFormFinish}: Props) {
    return (
        <Form
            form={form}
            size="small"
            layout="vertical"
            onFinish={onFormFinish}
        >
            <DashFilters
                form={form}
                namePrefix={['filters']}
                dataset={dataset}
                initialBlock={toFormQueryBlock(dataset, defaultFilters)}
            />
        </Form>
    )
}
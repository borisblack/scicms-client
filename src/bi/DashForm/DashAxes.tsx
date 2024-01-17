import React, {useEffect, useMemo} from 'react'
import {Form, Select} from 'antd'
import {useTranslation} from 'react-i18next'

import {Dash, getDash} from 'src/extensions/dashes'
import {Dataset, IDash} from 'src/types/bi'
import DashAxisArea from './DashAxisArea'
import {requiredFieldRule} from 'src/util/form'
import './DashAxes.css'
import styles from './DashAxes.module.css'

interface DashAxesProps {
    dataset: Dataset
    dash: IDash
    formFieldName: string
    canEdit: boolean
}

export default function DashAxes({dataset, dash, formFieldName, canEdit}: DashAxesProps) {
    const dashHandler: Dash | undefined = useMemo(() => getDash(dash.type), [dash.type])
    if (dashHandler == null)
        throw new Error('Illegal argument')

    const {t} = useTranslation()
    const values = (dash as Record<string, any>)[formFieldName] ?? {}

    return (
        <div className={`dash-axes ${styles.dashAxes}`}>
            {dashHandler.axes.map(axis => {
                const rawValue = values[axis.name]
                const initialValue = rawValue ? (Array.isArray(rawValue) ? rawValue : [rawValue]) : undefined

                return (
                    <div key={axis.name}>
                        <Form.Item
                            className={styles.formItem}
                            // hidden
                            name={[formFieldName, axis.name]}
                            label={t(axis.label)}
                            initialValue={initialValue}
                            rules={axis.required ? [requiredFieldRule()] : []}
                        >
                            <Select
                                style={{display: 'none'}}
                                allowClear
                                mode="multiple"
                                options={[]}
                            />
                        </Form.Item>

                        <DashAxisArea
                            dataset={dataset}
                            dash={dash}
                            namePath={[formFieldName, axis.name]}
                            cardinality={axis.cardinality}
                            canEdit={canEdit}
                        />
                    </div>
                )
            })}

            <Form.Item
                className={styles.formItem}
                // hidden
                name="sortField"
                label={t('Sort Fields')}
                initialValue={dash.sortField ? (Array.isArray(dash.sortField) ? dash.sortField : [dash.sortField]) : undefined}
            >
                <Select
                    style={{display: 'none'}}
                    allowClear
                    mode="multiple"
                    options={[]}
                />
            </Form.Item>

            <DashAxisArea
                dataset={dataset}
                dash={dash}
                namePath="sortField"
                cardinality={-1}
                canEdit={canEdit}
            />
        </div>
    )
}
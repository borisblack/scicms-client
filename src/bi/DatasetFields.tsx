import _ from 'lodash'
import {ChangeEvent, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Input, Space} from 'antd'
import {PlusOutlined} from '@ant-design/icons'

import {Dataset} from '../types/bi'
import FieldItem from './FieldItem'
import styles from './DatasetFields.module.css'

interface DatasetFieldsProps {
    dataset: Dataset
    canEdit: boolean
}

const DEBOUNCE_WAIT_INTERVAL = 500

export default function DatasetFields({dataset, canEdit}: DatasetFieldsProps) {
    const {t} = useTranslation()
    const [q, setQ] = useState<string>()

    const handleFilter = _.debounce(async (e: ChangeEvent<HTMLInputElement>) => {
        setQ(e.target.value)
    }, DEBOUNCE_WAIT_INTERVAL)

    return (
        <div>
            <Space className={styles.filterInput} size={4}>
                <Input
                    allowClear
                    placeholder={t('Field name')} size="small"
                    onChange={handleFilter}
                />
                <Button icon={<PlusOutlined/>} title={t('Add')}/>
            </Space>
            <div className={styles.datasetFields}>
                {Object.keys(dataset.spec.columns)
                    .filter(fieldName => !q || fieldName.toLowerCase().includes(q.toLowerCase()))
                    .sort()
                    .map(fieldName => {
                        const field = dataset.spec.columns[fieldName]
                        return (
                            <FieldItem
                                key={fieldName}
                                field={{...field, name: fieldName}}
                                canEdit={canEdit}
                            />
                        )
                    })
                }
            </div>
        </div>
    )
}
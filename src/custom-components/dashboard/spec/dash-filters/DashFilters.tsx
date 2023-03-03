import {Button, FormInstance, Space, Tooltip} from 'antd'
import {Column, DashFiltersBlock, Dataset, IDash, QueryOp, QueryPredicate} from '../../../../types'
import {useCallback, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {defaultDashFiltersBlock} from '../../../../util/dashboard'

interface Props {
    dataset: Dataset
    dash: IDash
    form: FormInstance
}

const allOps: QueryOp[] = Object.keys(QueryOp) as QueryOp[]
const groupFilterKeys = new Set<string>([QueryPredicate.$and, QueryPredicate.$or, QueryPredicate.$not])

export default function DashFilters({dataset, dash, form}: Props) {
    const {t} = useTranslation()
    const allColumns: {[name: string]: Column} = useMemo(() => dataset.spec.columns ?? {}, [dataset.spec.columns])
    const initialColumnOps = useCallback((): {[name: string]: QueryOp[]} => {
        const res: {[name: string]: QueryOp[]} = {}
        const columnNames = Object.keys(allColumns).sort()
        for (const col of columnNames) {
            res[col] = [...allOps]
        }
        return res
    }, [allColumns])
    const [availableColumnOps, setAvailableColumnOps] = useState<{[name: string]: QueryOp[]}>(initialColumnOps())
    const [filters, setFilters] = useState<DashFiltersBlock>(dash.defaultFilters ?? {...defaultDashFiltersBlock})

    const handleFilterAdd = useCallback(() => {}, [])

    const handleBlockAdd = useCallback(() => {}, [])

    return (
        <>
            <Space>
                <Tooltip title={t('Add Filter')}>
                    <Button onClick={handleFilterAdd}>+</Button>
                </Tooltip>
                <Tooltip title={t('Add Block')}>
                    <Button onClick={handleBlockAdd}>{'+ { }'}</Button>
                </Tooltip>
            </Space>
            {filters.filters.map(filter => {
                const {columnName, op} = filter
                return (
                    <div key={`${columnName}#${op}`}>{`${columnName}#${op}`}</div>
                )
            })}
        </>
    )
}
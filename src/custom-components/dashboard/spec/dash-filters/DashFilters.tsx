import {Button, FormInstance} from 'antd'
import {Dataset, DatasetFiltersInput, IDash, QueryOp, QueryPredicate} from '../../../../types'
import {useCallback, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {PlusOutlined} from '@ant-design/icons'

interface Props {
    dataset: Dataset
    dash: IDash
    form: FormInstance
}

const allOps: QueryOp[] = Object.keys(QueryOp) as QueryOp[]
const groupFilterKeys = new Set<string>([QueryPredicate.$and, QueryPredicate.$or, QueryPredicate.$not])

export default function DashFilters({dataset, dash, form}: Props) {
    const {t} = useTranslation()
    const allColumns: string[] = useMemo(() => Object.keys(dataset.spec.columns), [dataset.spec.columns])
    const initialColumnOps = useCallback((): {[name: string]: QueryOp[]} => {
        const res: {[name: string]: QueryOp[]} = {}
        for (const col of allColumns) {
            res[col] = [...allOps]
        }
        return res
    }, [allColumns])
    const [availableColumnOps, setAvailableColumnOps] = useState<{[name: string]: QueryOp[]}>(initialColumnOps())
    const [filters, setFilters] = useState<DatasetFiltersInput<any>>(dash.defaultFilters ?? {})

    return (
        <>
            <Button icon={<PlusOutlined/>}/>
            {Object.keys(filters).filter(k => !groupFilterKeys.has(k)).map(k => {
                const filter = filters[k]
                return (
                    <div key={k}></div>
                )
            })}
        </>
    )
}